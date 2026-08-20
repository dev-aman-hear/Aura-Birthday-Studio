/**
 * Birthday Studio - Published Project Repository
 * Remote Supabase Storage & Postgres Gateway with Public Asset Resolution,
 * Permanent Link Support (expires_at = null), and Local Offline Cache Fallback.
 */

import { dbService } from './IndexedDBService.js';
import { Publication } from '../models/Publication.js';
import { assetRepository } from './AssetRepository.js';
import { supabaseService } from './supabaseClient.js';

export const MAX_LINK_DURATION_DAYS = 365;
export const VALID_LINK_DURATIONS = [1, 3, 5, 7, 30, 'permanent'];
export const DEFAULT_LINK_DURATION_DAYS = null; // null = permanent link (never expires)

export class PublishedProjectRepository {
  /**
   * Enforces backend/data-layer validation for link expiration (null = permanent)
   */
  static validateDurationDays(days) {
    if (days === 'permanent' || days === null || days === undefined || days === 0 || days === 'never' || days === '') {
      return null;
    }
    const parsed = parseInt(days, 10);
    if (isNaN(parsed) || parsed < 1) return null;
    return parsed;
  }

  /**
   * Helper: Convert a blob or data URL to a raw Blob object
   */
  static async resolveBlobFromAsset(asset) {
    if (!asset) return null;

    // 1. Try fetching from IndexedDB blob store if storageKey exists
    if (asset.storageKey) {
      try {
        const record = await dbService.get('blobs', asset.storageKey);
        if (record && record.blob) return record.blob;
      } catch (e) {}
    }

    // 2. Try fetching from renderUrl or thumbnail if it's a blob: or data: URL
    const localUrl = asset.renderUrl || asset.thumbnail || asset.url;
    if (localUrl && (localUrl.startsWith('blob:') || localUrl.startsWith('data:'))) {
      try {
        const res = await fetch(localUrl);
        if (res.ok) return await res.blob();
      } catch (e) {}
    }

    return null;
  }

  /**
   * Publish a project creator draft into an immutable snapshot payload
   * Uploads required local assets to Supabase Storage and records snapshot in Supabase Postgres
   */
  static async publishProject(project, durationDays = DEFAULT_LINK_DURATION_DAYS) {
    if (!project) throw new Error('Cannot publish null project');

    const validDays = this.validateDurationDays(durationDays);
    const cryptoToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const pubId = `pub_${cryptoToken}`;
    const now = Date.now();
    const expiresAt = validDays ? now + (validDays * 24 * 60 * 60 * 1000) : null;

    console.log(`[PublishedProjectRepository] Initiating publication for project ${project.id}. Generated pubId: ${pubId}`);

    // Create immutable snapshot copy of creator project
    const snapshotData = JSON.parse(JSON.stringify(project));

    // Bundle and upload relevant project assets to Supabase Storage
    try {
      const allAssets = await assetRepository.getAllAssets();
      const relevantAssetIds = new Set(project.assetIds || []);

      // Scan scenes and slots for asset references
      (project.scenes || []).forEach(s => {
        (s.assetIds || []).forEach(id => relevantAssetIds.add(id));
        if (s.slots) {
          Object.values(s.slots).forEach(val => {
            if (Array.isArray(val)) val.forEach(id => relevantAssetIds.add(id));
            else if (typeof val === 'string') relevantAssetIds.add(val);
          });
        }
        if (s.elements) {
          s.elements.forEach(el => {
            if (el.assetId) relevantAssetIds.add(el.assetId);
          });
        }
      });

      // Background music asset
      if (project.settings?.bgMusicAssetId) {
        relevantAssetIds.add(project.settings.bgMusicAssetId);
      }

      const snapshotAssets = [];
      for (const asset of allAssets) {
        if (relevantAssetIds.has(asset.id)) {
          const clonedAsset = JSON.parse(JSON.stringify(asset));

          // Check if media is stored locally (blob in IndexedDB or temporary blob URL)
          const blob = await this.resolveBlobFromAsset(asset);
          if (blob && supabaseService.isConfigured()) {
            try {
              const publicUrl = await supabaseService.uploadPublishedAsset(pubId, asset.id, blob, asset.name);
              if (publicUrl) {
                clonedAsset.url = publicUrl;
                clonedAsset.renderUrl = publicUrl;
                clonedAsset.thumbnail = publicUrl;
                delete clonedAsset.storageKey;
                delete clonedAsset.thumbnailStorageKey;
              }
            } catch (upErr) {
              console.warn('[PublishedProjectRepository] Asset upload failed for asset:', asset.id, upErr);
            }
          } else {
            // If already a remote URL (like Unsplash, preset CDN, or Supabase), preserve it
            if (!clonedAsset.renderUrl && clonedAsset.url) {
              clonedAsset.renderUrl = clonedAsset.url;
            }
          }

          snapshotAssets.push(clonedAsset);
        }
      }

      snapshotData.assets = snapshotAssets;

      // Also ensure background music asset in settings is pointing to remote URL if available
      if (project.settings?.bgMusicAssetId) {
        const musicAsset = snapshotAssets.find(a => a.id === project.settings.bgMusicAssetId);
        if (musicAsset && musicAsset.renderUrl) {
          snapshotData.settings = snapshotData.settings || {};
          snapshotData.settings.bgMusicUrl = musicAsset.renderUrl;
        }
      }
    } catch (e) {
      console.warn('[PublishedProjectRepository] Snapshot asset bundling warning:', e);
    }

    const publication = new Publication({
      id: pubId,
      projectId: project.id,
      creatorId: project.creatorId,
      publishedAt: now,
      expiresAt: expiresAt,
      durationDays: validDays,
      status: 'active',
      isPublic: true,
      snapshot: snapshotData
    });

    // 1. Remote Supabase persistence (Authoritative)
    if (supabaseService.isConfigured()) {
      try {
        await supabaseService.savePublication({
          id: pubId,
          project_id: project.id,
          project_data: snapshotData,
          created_at: new Date(now).toISOString(),
          updated_at: new Date(now).toISOString(),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          is_public: true
        });
        console.log(`[PublishedProjectRepository] Authoritative Supabase record successfully written for ${pubId}`);
      } catch (remoteErr) {
        console.error('[PublishedProjectRepository] Remote Supabase publication save failed:', remoteErr);
        // Save to local cache so work is not lost
        try {
          await dbService.put('published_projects', publication.toJSON());
        } catch (e) {}
        throw remoteErr;
      }
    } else {
      console.warn('[PublishedProjectRepository] Supabase not configured. Saved to local IndexedDB only.');
    }

    // 2. Local IndexedDB cache for creator offline access & dashboard
    try {
      await dbService.put('published_projects', publication.toJSON());
    } catch (dbErr) {
      console.warn('[PublishedProjectRepository] Local cache save warning:', dbErr);
    }

    // Link publication ID to creator project
    project.publicationId = pubId;

    return publication;
  }

  /**
   * STEP 1: Metadata Pre-Flight Gate
   * Fetches ONLY publication metadata WITHOUT loading heavy snapshot assets/scenes
   * Returns:
   *   { exists: true, id: string, status: string, isExpired: boolean, isPublic: boolean, expiresAt: number|null, publishedAt: number }
   *   OR { exists: false, status: 'not_found' }
   *   OR { error: 'network'|'permission'|'database', message: string }
   */
  static async getPublicationMetadata(pubId) {
    if (!pubId) return null;

    console.log(`[PublishedProjectRepository] Fetching publication metadata for ID: "${pubId}"`);

    // 1. Query Supabase Postgres first if configured
    if (supabaseService.isConfigured()) {
      try {
        const remoteMeta = await supabaseService.getPublicationMetadata(pubId);
        if (remoteMeta) {
          const publishedAt = remoteMeta.created_at ? new Date(remoteMeta.created_at).getTime() : Date.now();
          const expiresAt = remoteMeta.expires_at ? new Date(remoteMeta.expires_at).getTime() : null;
          const isExpired = expiresAt !== null && typeof expiresAt === 'number' && !isNaN(expiresAt) && Date.now() >= expiresAt;
          const isPublic = remoteMeta.is_public !== false;

          return {
            exists: true,
            id: remoteMeta.id,
            projectId: remoteMeta.project_id || '',
            publishedAt: publishedAt,
            expiresAt: expiresAt,
            durationDays: expiresAt ? Math.ceil((expiresAt - publishedAt) / (1000 * 60 * 60 * 24)) : null,
            status: isExpired ? 'expired' : 'active',
            isExpired: isExpired,
            isPublic: isPublic
          };
        } else {
          // Explicit null from Supabase: record was not found in remote DB
          // Check local IndexedDB in case creator is testing offline
          const raw = await dbService.get('published_projects', pubId);
          if (raw) {
            const pub = Publication.fromJSON(raw);
            return {
              exists: true,
              id: pub.id,
              projectId: pub.projectId,
              publishedAt: pub.publishedAt,
              expiresAt: pub.expiresAt,
              durationDays: pub.durationDays,
              status: pub.isExpired() ? 'expired' : pub.status,
              isExpired: pub.isExpired(),
              isPublic: pub.isPublic !== false
            };
          }
          return { exists: false, status: 'not_found' };
        }
      } catch (remoteErr) {
        console.error('[PublishedProjectRepository] Supabase metadata query error:', remoteErr);
        // If it's a real network or permission error, propagate error object so view displays right screen
        return {
          exists: false,
          error: remoteErr.type || 'network',
          message: remoteErr.message || 'Unable to connect to celebration database.'
        };
      }
    }

    // 2. Fallback to Local IndexedDB when Supabase is not configured (offline / legacy local tests)
    const raw = await dbService.get('published_projects', pubId);
    if (!raw) {
      return { exists: false, status: 'not_found' };
    }

    const pub = Publication.fromJSON(raw);
    if (pub.isExpired() && pub.status === 'active') {
      pub.status = 'expired';
      try {
        await dbService.put('published_projects', pub.toJSON());
      } catch (e) {}
    }

    return {
      exists: true,
      id: pub.id,
      projectId: pub.projectId,
      publishedAt: pub.publishedAt,
      expiresAt: pub.expiresAt,
      durationDays: pub.durationDays,
      status: pub.status,
      isExpired: pub.isExpired(),
      isPublic: pub.isPublic !== false
    };
  }

  /**
   * STEP 2: Fetch Immutable Published Snapshot payload
   * Invoked ONLY after metadata pre-flight check confirms publication is ACTIVE
   */
  static async getPublishedSnapshot(pubId) {
    if (!pubId) return null;

    console.log(`[PublishedProjectRepository] Fetching snapshot payload for ID: "${pubId}"`);

    // 1. Query Supabase Postgres first if configured
    if (supabaseService.isConfigured()) {
      try {
        const remoteRecord = await supabaseService.getPublication(pubId);
        if (remoteRecord) {
          const pub = Publication.fromJSON(remoteRecord);
          if (pub.isExpired() || pub.isPublic === false) {
            return null;
          }
          // Cache locally in IndexedDB
          try {
            await dbService.put('published_projects', pub.toJSON());
          } catch (e) {}
          return pub;
        } else {
          // If remote is null, check local fallback
          const raw = await dbService.get('published_projects', pubId);
          if (raw) {
            const pub = Publication.fromJSON(raw);
            if (pub.isExpired()) return null;
            return pub;
          }
          return null;
        }
      } catch (remoteErr) {
        console.error('[PublishedProjectRepository] Supabase snapshot fetch error:', remoteErr);
        throw remoteErr;
      }
    }

    // 2. Fallback to Local IndexedDB
    const raw = await dbService.get('published_projects', pubId);
    if (!raw) return null;

    const pub = Publication.fromJSON(raw);
    if (pub.isExpired()) {
      return null;
    }
    return pub;
  }

  /**
   * Universal Republish / Reset Expiration Window for an existing publication
   */
  static async setPublicationDuration(pubId, durationDays = DEFAULT_LINK_DURATION_DAYS) {
    if (!pubId) throw new Error('Publication ID required to set duration');

    const validDays = this.validateDurationDays(durationDays);
    const now = Date.now();
    const expiresAt = validDays ? now + (validDays * 24 * 60 * 60 * 1000) : null;

    // 1. Update Supabase if configured
    if (supabaseService.isConfigured()) {
      try {
        const remote = await supabaseService.getPublication(pubId);
        if (remote) {
          remote.expires_at = expiresAt ? new Date(expiresAt).toISOString() : null;
          remote.updated_at = new Date(now).toISOString();
          await supabaseService.savePublication(remote);
        }
      } catch (err) {
        console.warn('[PublishedProjectRepository] Remote setPublicationDuration error:', err);
      }
    }

    // 2. Update local IndexedDB
    const raw = await dbService.get('published_projects', pubId);
    if (raw) {
      const pub = Publication.fromJSON(raw);
      pub.publishedAt = now;
      pub.expiresAt = expiresAt;
      pub.durationDays = validDays;
      pub.status = 'active';
      await dbService.put('published_projects', pub.toJSON());
      return pub;
    }

    return null;
  }

  /**
   * Alias for setPublicationDuration to satisfy republish contracts
   */
  static async republishPublication(pubId, durationDays = DEFAULT_LINK_DURATION_DAYS) {
    return await this.setPublicationDuration(pubId, durationDays);
  }

  /**
   * Republish an expired or existing project creation draft with a new publication record
   */
  static async republishProject(project, durationDays = DEFAULT_LINK_DURATION_DAYS) {
    const existingPub = await this.getLatestPublicationForProject(project.id);
    if (existingPub) {
      existingPub.status = 'expired';
      try {
        await dbService.put('published_projects', existingPub.toJSON());
      } catch (e) {}
    }
    return await this.publishProject(project, durationDays);
  }

  /**
   * Retrieve latest publication record for a project
   */
  static async getLatestPublicationForProject(projectId) {
    if (!projectId) return null;
    const all = await dbService.getAll('published_projects');
    const matches = all.filter(p => p.projectId === projectId);
    if (matches.length === 0) return null;
    matches.sort((a, b) => b.publishedAt - a.publishedAt);
    return Publication.fromJSON(matches[0]);
  }

  /**
   * Synchronize existing active publication snapshot when creator modifies project style/content
   */
  static async syncPublicationSnapshot(projectId, updatedProject) {
    if (!projectId || !updatedProject) return null;
    const pub = await this.getLatestPublicationForProject(projectId);
    if (!pub || pub.status !== 'active') return null;

    pub.snapshot = JSON.parse(JSON.stringify(updatedProject));

    // Update remote Supabase if configured
    if (supabaseService.isConfigured()) {
      try {
        await supabaseService.savePublication({
          id: pub.id,
          project_id: projectId,
          project_data: pub.snapshot,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[PublishedProjectRepository] Remote syncPublicationSnapshot error:', err);
      }
    }

    await dbService.put('published_projects', pub.toJSON());
    return pub;
  }

  /**
   * Backward-compatible helper method that delegates to universal setPublicationDuration
   */
  static async extendExpiration(pubId, durationMs = 7 * 24 * 60 * 60 * 1000) {
    const days = Math.round(durationMs / (24 * 60 * 60 * 1000));
    return await this.setPublicationDuration(pubId, days);
  }

  /**
   * Delete a publication record (Does NOT delete creator draft project)
   */
  static async deletePublication(pubId) {
    if (!pubId) return;
    await dbService.delete('published_projects', pubId);
  }
}

export const publishedProjectRepository = PublishedProjectRepository;


/**
 * Birthday Studio - Published Project Repository
 * Handles Publication Snapshots, Strict 7-Day Maximum Expiration & Universal Republish System
 */

import { dbService } from './IndexedDBService.js';
import { Publication } from '../models/Publication.js';
import { assetRepository } from './AssetRepository.js';

export const MAX_LINK_DURATION_DAYS = 7;
export const VALID_LINK_DURATIONS = [1, 3, 5, 7];
export const DEFAULT_LINK_DURATION_DAYS = 3;

export class PublishedProjectRepository {
  /**
   * Enforces backend/data-layer validation for link expiration (Strict 7-Day Maximum)
   */
  static validateDurationDays(days) {
    const parsed = parseInt(days, 10);
    if (isNaN(parsed) || parsed < 1) return DEFAULT_LINK_DURATION_DAYS;
    if (parsed > MAX_LINK_DURATION_DAYS) {
      console.warn(`[PublishedProjectRepository] Duration ${parsed} exceeds maximum 7 days. Clamping to 7 days.`);
      return MAX_LINK_DURATION_DAYS;
    }
    return VALID_LINK_DURATIONS.includes(parsed) ? parsed : Math.min(parsed, MAX_LINK_DURATION_DAYS);
  }

  /**
   * Publish a project creator draft into an immutable snapshot payload with a user-selected duration
   */
  static async publishProject(project, durationDays = DEFAULT_LINK_DURATION_DAYS) {
    if (!project) throw new Error('Cannot publish null project');

    const validDays = this.validateDurationDays(durationDays);
    const cryptoToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const pubId = `pub_${cryptoToken}`;
    const now = Date.now();
    const expiresAt = now + (validDays * 24 * 60 * 60 * 1000);

    // Create immutable snapshot copy of creator project
    const snapshotData = JSON.parse(JSON.stringify(project));

    // Bundle relevant project assets with resolved URLs directly into the snapshot
    try {
      const allAssets = await assetRepository.getAllAssets();
      const relevantAssetIds = new Set(project.assetIds || []);
      (project.scenes || []).forEach(s => {
        (s.assetIds || []).forEach(id => relevantAssetIds.add(id));
        if (s.slots) {
          Object.values(s.slots).forEach(val => {
            if (Array.isArray(val)) val.forEach(id => relevantAssetIds.add(id));
            else if (typeof val === 'string') relevantAssetIds.add(val);
          });
        }
      });

      const snapshotAssets = [];
      for (const asset of allAssets) {
        if (relevantAssetIds.has(asset.id)) {
          const clonedAsset = JSON.parse(JSON.stringify(asset));
          try {
            clonedAsset.renderUrl = await assetRepository.getRenderableUrl(asset);
          } catch (e) {}
          snapshotAssets.push(clonedAsset);
        }
      }
      snapshotData.assets = snapshotAssets;
    } catch (e) {
      console.warn('Snapshot asset bundling skipped:', e);
    }

    const publication = new Publication({
      id: pubId,
      projectId: project.id,
      creatorId: project.creatorId,
      publishedAt: now,
      expiresAt: expiresAt,
      durationDays: validDays,
      status: 'active',
      snapshot: snapshotData
    });

    await dbService.put('published_projects', publication.toJSON());

    // Link publication ID to creator project
    project.publicationId = pubId;

    return publication;
  }

  /**
   * STEP 1: Metadata Pre-Flight Gate
   * Fetches ONLY publication metadata WITHOUT loading snapshot assets/scenes
   */
  static async getPublicationMetadata(pubId) {
    if (!pubId) return null;
    const raw = await dbService.get('published_projects', pubId);
    if (!raw) return null;

    const pub = Publication.fromJSON(raw);
    if (pub.isExpired() && pub.status === 'active') {
      pub.status = 'expired';
      await dbService.put('published_projects', pub.toJSON());
    }

    return {
      id: pub.id,
      projectId: pub.projectId,
      publishedAt: pub.publishedAt,
      expiresAt: pub.expiresAt,
      durationDays: pub.durationDays || Math.ceil((pub.expiresAt - pub.publishedAt) / (1000 * 60 * 60 * 24)),
      status: pub.status,
      isExpired: pub.isExpired()
    };
  }

  /**
   * STEP 2: Fetch Immutable Published Snapshot payload
   * Invoked ONLY after metadata pre-flight check confirms publication is ACTIVE
   */
  static async getPublishedSnapshot(pubId) {
    if (!pubId) return null;
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
   * CRITICAL: Establishes a NEW expiration window starting from NOW (does NOT extend from old remaining time).
   */
  static async setPublicationDuration(pubId, durationDays = DEFAULT_LINK_DURATION_DAYS) {
    if (!pubId) throw new Error('Publication ID required to set duration');
    const raw = await dbService.get('published_projects', pubId);
    if (!raw) throw new Error('Publication not found');

    const validDays = this.validateDurationDays(durationDays);
    const pub = Publication.fromJSON(raw);
    const now = Date.now();

    // Reset window from NOW
    pub.publishedAt = now;
    pub.expiresAt = now + (validDays * 24 * 60 * 60 * 1000);
    pub.durationDays = validDays;
    pub.status = 'active';

    await dbService.put('published_projects', pub.toJSON());
    return pub;
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
      await dbService.put('published_projects', existingPub.toJSON());
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

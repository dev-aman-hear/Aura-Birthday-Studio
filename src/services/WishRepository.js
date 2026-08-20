/**
 * Birthday Studio - Wish Repository (Section 32, 42, 43, 62, 70 & Requirement 17)
 * Validations: Publication Active Status, Occasion Safety & Anti-Spam
 * Supports Remote Supabase Storage for Public Celebrations & Local IndexedDB Cache
 */

import { dbService } from './IndexedDBService.js';
import { Wish } from '../models/Wish.js';
import { MessageLibrary } from '../data/messages/MessageLibrary.js';
import { publishedProjectRepository } from './PublishedProjectRepository.js';
import { supabaseService } from './supabaseClient.js';

class WishRepository {
  constructor() {
    this.lastSubmissionTime = 0;
  }

  /**
   * Broadcast real-time wish updates across tabs, windows, and active views
   */
  broadcastWishSync(detail) {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('wish-wall-updated', { detail }));
        window.dispatchEvent(new CustomEvent('wish-deleted', { detail }));
      } catch (e) {}

      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('birthday_studio_wishes_channel');
          bc.postMessage(detail);
          bc.close();
        } catch (e) {}
      }

      try {
        localStorage.setItem('birthday_studio_wish_sync', JSON.stringify({ ...detail, _ts: Date.now() }));
      } catch (e) {}
    }
  }

  /**
   * Create a new wish with publication status check, occasion safety & anti-spam validation
   */
  async createWish(wishData, project) {
    if (!project) throw new Error('Project reference required');

    // 0. Requirement 17 & TEST D: Validate publication status before accepting wish
    if (project.publicationId) {
      const pubMeta = await publishedProjectRepository.getPublicationMetadata(project.publicationId);
      if (!pubMeta || pubMeta.status !== 'active' || (pubMeta.expiresAt && Date.now() >= pubMeta.expiresAt)) {
        throw new Error('This celebration has ended. New wishes can no longer be submitted.');
      }
    }

    // 1. Anti-spam: Submission cooldown (3 seconds) (Section 42)
    const now = Date.now();
    if (now - this.lastSubmissionTime < 3000) {
      throw new Error('Please wait a moment before sending another wish.');
    }

    // 2. Resilient Occasion Matching (Section 43)
    const normalizeOcc = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const normProjOcc = normalizeOcc(project.occasion || 'birthday');
    const normWishOcc = normalizeOcc(wishData.occasion || project.occasion || 'birthday');

    const isOccasionCompatible =
      !wishData.occasion ||
      normWishOcc === normProjOcc ||
      normWishOcc.includes(normProjOcc) ||
      normProjOcc.includes(normWishOcc) ||
      (normWishOcc.includes('birthday') && normProjOcc.includes('birthday')) ||
      (normWishOcc.includes('wedding') && normProjOcc.includes('wedding')) ||
      (normWishOcc.includes('anniversary') && normProjOcc.includes('anniversary')) ||
      (normWishOcc.includes('graduation') && normProjOcc.includes('graduation')) ||
      (normWishOcc.includes('celebration') && normProjOcc.includes('celebration'));

    if (!isOccasionCompatible) {
      throw new Error(`Wish occasion '${wishData.occasion}' does not match celebration occasion '${project.occasion}'.`);
    }

    // 3. Message validation (Section 32)
    const message = (wishData.message || '').trim();
    if (!message) {
      throw new Error('Please enter or select a wish message.');
    }

    const maxLen = project.wishWall?.maxMessageLength || 300;
    if (message.length > maxLen) {
      throw new Error(`Message exceeds maximum length of ${maxLen} characters.`);
    }

    // 4. Preset message occasion safety check (Section 43)
    if (wishData.messageSource === 'preset' && wishData.presetMessageId) {
      const preset = MessageLibrary.getMessageById(wishData.presetMessageId);
      if (preset && preset.occasion) {
        const normPresetOcc = normalizeOcc(preset.occasion);
        const isPresetCompatible =
          normPresetOcc === normProjOcc ||
          normPresetOcc.includes(normProjOcc) ||
          normProjOcc.includes(normPresetOcc) ||
          (normPresetOcc.includes('birthday') && normProjOcc.includes('birthday')) ||
          (normPresetOcc.includes('wedding') && normProjOcc.includes('wedding')) ||
          (normPresetOcc.includes('anniversary') && normProjOcc.includes('anniversary'));

        if (!isPresetCompatible) {
          throw new Error('Selected preset message is not valid for this occasion.');
        }
      }
    }

    // 5. Default moderation status (Section 41: default requireApproval = true)
    const initialStatus = project.wishWall?.requireApproval ? 'pending' : 'approved';

    const wish = new Wish({
      ...wishData,
      projectId: project.id,
      occasion: project.occasion,
      message,
      name: wishData.isAnonymous ? 'Anonymous' : (wishData.name || 'Friend'),
      status: initialStatus
    });

    // 1. Save to Supabase if configured
    if (supabaseService.isConfigured()) {
      try {
        await supabaseService.saveWish(wish.toJSON());
      } catch (e) {
        console.warn('[WishRepository] Remote wish save error:', e);
      }
    }

    // 2. Local cache
    await dbService.put('wishes', wish.toJSON());
    this.lastSubmissionTime = Date.now();

    // 3. Broadcast real-time creation event
    this.broadcastWishSync({
      action: 'create',
      projectId: project.id,
      wishId: wish.id,
      wish: wish.toJSON()
    });

    return wish;
  }

  async getWish(wishId) {
    if (!wishId) return null;
    const data = await dbService.get('wishes', wishId);
    return data ? new Wish(data) : null;
  }

  async getProjectWishes(projectId) {
    if (!projectId) return [];

    // 1. Fetch from Supabase if configured
    if (supabaseService.isConfigured()) {
      try {
        const remoteList = await supabaseService.getAllWishesForProject(projectId);
        if (Array.isArray(remoteList)) {
          const remoteWishes = remoteList.map(w => new Wish({
            id: w.id,
            projectId: w.project_id || w.projectId,
            occasion: w.occasion,
            name: w.name,
            isAnonymous: w.is_anonymous !== undefined ? w.is_anonymous : w.isAnonymous,
            message: w.message,
            messageSource: w.message_source || w.messageSource,
            presetMessageId: w.preset_message_id || w.presetMessageId,
            status: w.status,
            createdAt: w.created_at ? (typeof w.created_at === 'string' ? new Date(w.created_at).getTime() : w.created_at) : Date.now()
          })).sort((a, b) => b.createdAt - a.createdAt);

          // Synchronize local IndexedDB cache with remote project wishes
          try {
            const localWishes = await dbService.getByIndex('wishes', 'projectId', projectId);
            const remoteIds = new Set(remoteWishes.map(w => w.id));
            for (const lw of localWishes) {
              if (!remoteIds.has(lw.id)) {
                await dbService.delete('wishes', lw.id);
              }
            }
            for (const rw of remoteWishes) {
              await dbService.put('wishes', rw.toJSON());
            }
          } catch (syncErr) {
            console.warn('[WishRepository] Cache sync warning in getProjectWishes:', syncErr);
          }

          return remoteWishes;
        }
      } catch (e) {
        console.warn('[WishRepository] Remote getProjectWishes error, falling back to local:', e);
      }
    }

    // 2. Local fallback
    const list = await dbService.getByIndex('wishes', 'projectId', projectId);
    return list.map(w => new Wish(w)).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getApprovedWishes(projectId) {
    if (!projectId) return [];

    // 1. Fetch from Supabase if configured
    if (supabaseService.isConfigured()) {
      try {
        const remoteList = await supabaseService.getApprovedWishes(projectId);
        if (Array.isArray(remoteList)) {
          const remoteWishes = remoteList.map(w => new Wish({
            id: w.id,
            projectId: w.project_id || w.projectId,
            occasion: w.occasion,
            name: w.name,
            isAnonymous: w.is_anonymous !== undefined ? w.is_anonymous : w.isAnonymous,
            message: w.message,
            messageSource: w.message_source || w.messageSource,
            presetMessageId: w.preset_message_id || w.presetMessageId,
            status: w.status,
            createdAt: w.created_at ? (typeof w.created_at === 'string' ? new Date(w.created_at).getTime() : w.created_at) : Date.now()
          })).sort((a, b) => b.createdAt - a.createdAt);

          // Synchronize local IndexedDB cache with authoritative remote approved wishes for this project
          try {
            const localWishes = await dbService.getByIndex('wishes', 'projectId', projectId);
            const remoteIds = new Set(remoteWishes.map(w => w.id));
            for (const lw of localWishes) {
              if (lw.status === 'approved' && !remoteIds.has(lw.id)) {
                // Was deleted remotely, remove from local cache
                await dbService.delete('wishes', lw.id);
              }
            }
            for (const rw of remoteWishes) {
              await dbService.put('wishes', rw.toJSON());
            }
          } catch (syncErr) {
            console.warn('[WishRepository] Cache sync warning in getApprovedWishes:', syncErr);
          }

          return remoteWishes;
        }
      } catch (e) {
        console.warn('[WishRepository] Remote wishes fetch error, falling back to local:', e);
      }
    }

    // 2. Local fallback
    const all = await this.getProjectWishes(projectId);
    return all.filter(w => w.status === 'approved');
  }

  async getPendingWishes(projectId) {
    const all = await this.getProjectWishes(projectId);
    return all.filter(w => w.status === 'pending');
  }

  async approveWish(wishId) {
    const wish = await this.getWish(wishId);
    if (!wish) return null;
    wish.status = 'approved';
    if (supabaseService.isConfigured()) {
      try {
        await supabaseService.saveWish(wish.toJSON());
      } catch (e) {}
    }
    await dbService.put('wishes', wish.toJSON());
    this.broadcastWishSync({
      action: 'approve',
      projectId: wish.projectId,
      wishId: wish.id,
      wish: wish.toJSON()
    });
    return wish;
  }

  async rejectWish(wishId) {
    const wish = await this.getWish(wishId);
    if (!wish) return null;
    wish.status = 'rejected';
    if (supabaseService.isConfigured()) {
      try {
        await supabaseService.saveWish(wish.toJSON());
      } catch (e) {}
    }
    await dbService.put('wishes', wish.toJSON());
    this.broadcastWishSync({
      action: 'reject',
      projectId: wish.projectId,
      wishId: wish.id,
      wish: wish.toJSON()
    });
    return wish;
  }

  /**
   * Permanently delete a wish from remote Supabase, local IndexedDB, and active published snapshots
   */
  async deleteWish(wishId, projectId = null) {
    if (!wishId) return false;

    // 1. Get wish record to capture projectId if not passed
    let targetProjectId = projectId;
    try {
      const existing = await this.getWish(wishId);
      if (existing?.projectId) {
        targetProjectId = existing.projectId;
      }
    } catch (e) {}

    // 2. Delete from remote Supabase if configured
    if (supabaseService.isConfigured()) {
      try {
        await supabaseService.deleteWish(wishId);
      } catch (e) {
        console.warn('[WishRepository] Remote wish delete error:', e);
      }
    }

    // 3. Delete from local IndexedDB
    try {
      await dbService.delete('wishes', wishId);
    } catch (e) {
      console.warn('[WishRepository] Local wish delete error:', e);
    }

    // 4. If project has an active canonical publication, sync the publication snapshot
    if (targetProjectId) {
      try {
        const canonicalPub = await publishedProjectRepository.getCanonicalPublicationForProject(targetProjectId);
        if (canonicalPub && canonicalPub.snapshot) {
          await publishedProjectRepository.syncPublicationSnapshot(targetProjectId, canonicalPub.snapshot);
        }
      } catch (pubSyncErr) {
        console.warn('[WishRepository] Publication sync after wish delete warning:', pubSyncErr);
      }
    }

    // 5. Broadcast real-time deletion update across windows/tabs/components
    this.broadcastWishSync({
      action: 'delete',
      projectId: targetProjectId,
      wishId: wishId
    });

    return true;
  }

  async getWishCount(projectId) {
    const approved = await this.getApprovedWishes(projectId);
    return approved.length;
  }

  async getPendingCount(projectId) {
    const pending = await this.getPendingWishes(projectId);
    return pending.length;
  }
}

export const wishRepository = new WishRepository();


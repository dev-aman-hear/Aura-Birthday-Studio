/**
 * Birthday Studio - Publication Model
 * Represents an immutable celebration snapshot with optional expiration duration (null = permanent)
 */

export class Publication {
  constructor(data = {}) {
    // Generate unpredictable cryptographically random token
    const randomToken = Publication.generateRandomToken();
    this.id = data.id || `pub_${randomToken}`;
    this.projectId = data.projectId || data.project_id || '';

    // Published at timestamp
    if (typeof data.publishedAt === 'number') {
      this.publishedAt = data.publishedAt;
    } else if (data.created_at) {
      this.publishedAt = new Date(data.created_at).getTime();
    } else {
      this.publishedAt = Date.now();
    }

    // Expiration resolution
    // If expiresAt is explicitly null or false, it's permanent
    if (data.expiresAt === null || data.expires_at === null) {
      this.expiresAt = null;
      this.durationDays = null;
    } else if (data.expiresAt !== undefined && data.expiresAt !== null) {
      this.expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : new Date(data.expiresAt).getTime();
      this.durationDays = typeof data.durationDays === 'number' ? data.durationDays : Math.max(1, Math.round((this.expiresAt - this.publishedAt) / 86400000));
    } else if (data.expires_at !== undefined && data.expires_at !== null) {
      this.expiresAt = new Date(data.expires_at).getTime();
      this.durationDays = Math.max(1, Math.round((this.expiresAt - this.publishedAt) / 86400000));
    } else if (typeof data.durationDays === 'number' && data.durationDays > 0) {
      this.durationDays = data.durationDays;
      this.expiresAt = this.publishedAt + (this.durationDays * 24 * 60 * 60 * 1000);
    } else {
      // Default: Permanent link (expiresAt = null)
      this.expiresAt = null;
      this.durationDays = null;
    }

    this.isPublic = data.isPublic !== undefined ? data.isPublic : (data.is_public !== undefined ? data.is_public : true);
    this.status = data.status || (this.isExpired() ? 'expired' : 'active');
    this.version = data.version || 1;

    // Snapshot payload (from snapshot or project_data)
    this.snapshot = data.snapshot || data.project_data || {
      occasion: 'birthday',
      recipient: { name: 'Friend' },
      creatorDisplayName: 'Someone',
      theme: 'purple_gold',
      settings: {},
      scenes: [],
      sceneAssetReferences: [],
      publicWishWallSettings: {}
    };
  }

  static generateRandomToken() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }
    return `${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;
  }

  static fromJSON(data) {
    if (!data) return null;
    return new Publication(data);
  }

  isExpired() {
    if (this.status === 'expired') return true;
    if (this.expiresAt === null || this.expiresAt === undefined) return false; // Permanent links never expire
    return typeof this.expiresAt === 'number' && !isNaN(this.expiresAt) && Date.now() >= this.expiresAt;
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      publishedAt: this.publishedAt,
      expiresAt: this.expiresAt,
      durationDays: this.durationDays,
      isPublic: this.isPublic,
      status: this.isExpired() ? 'expired' : 'active',
      version: this.version,
      snapshot: this.snapshot
    };
  }
}


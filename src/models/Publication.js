/**
 * Birthday Studio - Publication Model
 * Represents an immutable publication snapshot with configurable expiration duration (max 7 days)
 */

export class Publication {
  constructor(data = {}) {
    // Generate unpredictable cryptographically random token
    const randomToken = Publication.generateRandomToken();
    this.id = data.id || `pub_${randomToken}`;
    this.projectId = data.projectId || '';
    this.publishedAt = typeof data.publishedAt === 'number' ? data.publishedAt : Date.now();
    this.durationDays = typeof data.durationDays === 'number' ? data.durationDays : Math.min(7, Math.max(1, Math.round(((data.expiresAt || this.publishedAt + 7 * 86400000) - this.publishedAt) / 86400000)));
    this.expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : this.publishedAt + (this.durationDays * 24 * 60 * 60 * 1000);
    this.status = data.status || (Date.now() >= this.expiresAt ? 'expired' : 'active');
    this.version = data.version || 1;

    // Snapshot payload
    this.snapshot = data.snapshot || {
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
    return this.status === 'expired' || Date.now() >= this.expiresAt;
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      publishedAt: this.publishedAt,
      expiresAt: this.expiresAt,
      durationDays: this.durationDays,
      status: this.isExpired() ? 'expired' : 'active',
      version: this.version,
      snapshot: this.snapshot
    };
  }
}

/**
 * Birthday Studio - User Model (Section 1)
 */

export class User {
  constructor(data = {}) {
    this.id = data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.username = (data.username || '').trim().toLowerCase(); // Case-normalized for uniqueness
    this.displayName = data.displayName || data.username || 'Creator';
    this.passwordHash = data.passwordHash || '';
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Birthday Studio - Wish Model
 */

export class Wish {
  constructor(data = {}) {
    this.id = data.id || `wish_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.projectId = data.projectId || '';
    this.occasion = data.occasion || 'birthday';
    this.name = data.name || 'Anonymous';
    this.isAnonymous = typeof data.isAnonymous === 'boolean' ? data.isAnonymous : false;
    this.message = data.message || '';
    this.messageSource = data.messageSource || 'custom'; // preset, custom
    this.presetMessageId = data.presetMessageId || null;
    this.status = data.status || 'pending'; // pending, approved, rejected
    this.createdAt = data.createdAt || Date.now();
  }

  getDisplayName() {
    return this.isAnonymous ? 'Anonymous' : (this.name || 'Anonymous');
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      occasion: this.occasion,
      name: this.name,
      isAnonymous: this.isAnonymous,
      message: this.message,
      messageSource: this.messageSource,
      presetMessageId: this.presetMessageId,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}

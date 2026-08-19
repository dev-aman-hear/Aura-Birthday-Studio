import { Scene } from './Scene.js';

export class Project {
  constructor(data = {}) {
    this.id = data.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.occasion = data.occasion || 'birthday'; // birthday, wedding, anniversary, graduation, etc.
    this.recipient = {
      name: data.recipient?.name || '',
      nickname: data.recipient?.nickname || '',
      age: data.recipient?.age || '',
      description: data.recipient?.description || ''
    };
    this.creator = {
      name: data.creator?.name || ''
    };
    this.relationship = data.relationship || 'Friend';
    this.birthdayDate = data.birthdayDate || new Date().toISOString().split('T')[0];
    this.birthdayTime = data.birthdayTime || '12:00';
    this.theme = data.theme || 'purple_gold';
    this.settings = {
      soundEnabled: true,
      autoAdvance: true,
      bgMusicAssetId: null,
      countdownLocked: false,
      ...data.settings
    };
    // Stores ONLY asset IDs as references (Sections 56.1)
    this.assetIds = Array.isArray(data.assetIds) ? data.assetIds : [];
    this.scenes = Array.isArray(data.scenes)
      ? data.scenes.map(s => (s instanceof Scene ? s : new Scene(s)))
      : [];
    this.wishWall = {
      enabled: true,
      allowAnonymous: true,
      allowCustomMessages: true,
      requireApproval: true,
      showCounter: true,
      displayMode: 'counter-and-wishes', // counter-and-wishes, counter-only, wishes-only
      showNewestFirst: true,
      maxDisplayedWishes: 50,
      maxMessageLength: 250,
      ...data.wishWall
    };
    this.countdown = {
      enabled: false,
      targetDate: data.birthdayDate || data.countdown?.targetDate || new Date().toISOString().split('T')[0],
      targetTime: data.birthdayTime || data.countdown?.targetTime || '00:00',
      timezone: data.countdown?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      styleId: data.countdown?.styleId || 'countdown_minimal',
      title: data.countdown?.title || 'Something Special is Coming...',
      subtitle: data.countdown?.subtitle || 'Counting down to celebration time!',
      ...data.countdown
    };
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static fromJSON(data) {
    if (!data) return null;
    return new Project(data);
  }

  toJSON() {
    return {
      id: this.id,
      occasion: this.occasion,
      recipient: this.recipient,
      creator: this.creator,
      relationship: this.relationship,
      birthdayDate: this.birthdayDate,
      birthdayTime: this.birthdayTime,
      theme: this.theme,
      settings: this.settings,
      assetIds: this.assetIds,
      scenes: this.scenes.map(s => (typeof s.toJSON === 'function' ? s.toJSON() : s)),
      wishWall: this.wishWall,
      countdown: this.countdown,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

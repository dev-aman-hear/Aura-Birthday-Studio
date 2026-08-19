/**
 * Birthday Studio - Asset Model
 * Central Universal Asset Entity with Rich Metadata & Compatibility Attributes
 */

export class Asset {
  constructor(data = {}) {
    this.id = data.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.type = data.type || 'image'; // image, video, audio, text, background, sticker, gif
    this.name = data.name || 'Untitled Asset';
    this.storageKey = data.storageKey || null; // Blob key in IndexedDB
    this.thumbnailStorageKey = data.thumbnailStorageKey || null;
    this.url = data.url || null; // Preset static URL, data URL, or external URL
    this.thumbnail = data.thumbnail || null;
    this.renderUrl = data.renderUrl || null; // In-memory Object URL for active session
    
    const meta = data.metadata || {};
    const width = meta.width || 0;
    const height = meta.height || 0;

    let computedRatio = meta.aspectRatio || '1:1';
    let ratioVal = meta.aspectRatioValue || (width > 0 && height > 0 ? width / height : 1);
    let computedOrientation = meta.orientation || 'square';

    if (width > 0 && height > 0 && !meta.aspectRatio) {
      const r = width / height;
      if (Math.abs(r - 16 / 9) < 0.05) computedRatio = '16:9';
      else if (Math.abs(r - 9 / 16) < 0.05) computedRatio = '9:16';
      else if (Math.abs(r - 4 / 3) < 0.05) computedRatio = '4:3';
      else if (Math.abs(r - 3 / 4) < 0.05) computedRatio = '3:4';
      else if (Math.abs(r - 1) < 0.05) computedRatio = '1:1';
      else computedRatio = `${width}:${height}`;

      if (width > height * 1.1) computedOrientation = 'landscape';
      else if (height > width * 1.1) computedOrientation = 'portrait';
      else computedOrientation = 'square';
    }

    const mime = meta.mimeType || '';
    const fileFmt = meta.fileFormat || (this.name.includes('.') ? this.name.split('.').pop().toLowerCase() : '');
    const hasTransparency = meta.hasTransparency !== undefined 
      ? meta.hasTransparency 
      : (['png', 'webp', 'svg', 'gif'].includes(fileFmt) || this.type === 'sticker');

    this.metadata = {
      textContent: meta.textContent || '',
      duration: meta.duration || 0, // In seconds for video/audio
      width: width,
      height: height,
      mimeType: mime,
      fileFormat: fileFmt,
      size: meta.size || 0, // In bytes
      sizeMB: meta.sizeMB || (meta.size ? +(meta.size / (1024 * 1024)).toFixed(2) : 0),
      aspectRatio: computedRatio,
      aspectRatioValue: ratioVal,
      hasTransparency: hasTransparency,
      orientation: computedOrientation,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      usedInScenes: Array.isArray(meta.usedInScenes) ? meta.usedInScenes : [],
      ...meta
    };

    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  isImage() {
    return this.type === 'image' || this.type === 'sticker' || this.type === 'gif';
  }

  isVideo() {
    return this.type === 'video';
  }

  isAudio() {
    return this.type === 'audio';
  }

  isSticker() {
    return this.type === 'sticker';
  }

  isText() {
    return this.type === 'text';
  }

  getFormattedSize() {
    const size = this.metadata.size || 0;
    if (size === 0) return '0 KB';
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFormattedDuration() {
    const dur = Math.round(this.metadata.duration || 0);
    if (dur === 0) return '';
    const m = Math.floor(dur / 60);
    const s = dur % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      storageKey: this.storageKey,
      thumbnailStorageKey: this.thumbnailStorageKey,
      url: this.url,
      thumbnail: this.thumbnail,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}


/**
 * Birthday Studio - Asset Metadata Extractor
 * Automatically extracts dimensions, aspect ratios, durations, orientation, transparency, and file formats
 */

export class AssetMetadataExtractor {
  /**
   * Extract comprehensive metadata from binary File or Blob object
   */
  static async extractFromFile(file) {
    if (!file) return {};

    const name = file.name || 'uploaded_asset';
    const size = file.size || 0;
    const mimeType = file.type || '';
    const fileFormat = name.includes('.') ? name.split('.').pop().toLowerCase() : (mimeType.split('/')[1] || '');

    const baseMeta = {
      name,
      size,
      sizeMB: +(size / (1024 * 1024)).toFixed(2),
      mimeType,
      fileFormat,
      hasTransparency: ['png', 'webp', 'svg', 'gif'].includes(fileFormat) || mimeType.includes('png') || mimeType.includes('webp') || mimeType.includes('svg'),
      width: 0,
      height: 0,
      aspectRatio: '1:1',
      aspectRatioValue: 1,
      orientation: 'square',
      duration: 0
    };

    if (mimeType.startsWith('image/')) {
      const imgMeta = await this.extractImageMetadata(file);
      return { ...baseMeta, ...imgMeta, type: 'image' };
    }

    if (mimeType.startsWith('video/')) {
      const vidMeta = await this.extractVideoMetadata(file);
      return { ...baseMeta, ...vidMeta, type: 'video' };
    }

    if (mimeType.startsWith('audio/')) {
      const audMeta = await this.extractAudioMetadata(file);
      return { ...baseMeta, ...audMeta, type: 'audio' };
    }

    return { ...baseMeta, type: 'file' };
  }

  /**
   * Extract dimensions and aspect ratio from image file or URL
   */
  static extractImageMetadata(fileOrUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      let objectUrl = null;

      const cleanup = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };

      img.onload = () => {
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;
        cleanup();

        const { ratio, ratioVal, orientation } = this.computeRatioAndOrientation(width, height);

        resolve({
          width,
          height,
          aspectRatio: ratio,
          aspectRatioValue: ratioVal,
          orientation
        });
      };

      img.onerror = () => {
        cleanup();
        resolve({
          width: 0,
          height: 0,
          aspectRatio: '1:1',
          aspectRatioValue: 1,
          orientation: 'square'
        });
      };

      if (typeof fileOrUrl === 'string') {
        img.src = fileOrUrl;
      } else {
        objectUrl = URL.createObjectURL(fileOrUrl);
        img.src = objectUrl;
      }
    });
  }

  /**
   * Extract dimensions, duration, and aspect ratio from video file or URL
   */
  static extractVideoMetadata(fileOrUrl) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      let objectUrl = null;

      const cleanup = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };

      video.onloadedmetadata = () => {
        const width = video.videoWidth || 0;
        const height = video.videoHeight || 0;
        const duration = +(video.duration || 0).toFixed(2);
        cleanup();

        const { ratio, ratioVal, orientation } = this.computeRatioAndOrientation(width, height);

        resolve({
          width,
          height,
          duration,
          aspectRatio: ratio,
          aspectRatioValue: ratioVal,
          orientation
        });
      };

      video.onerror = () => {
        cleanup();
        resolve({
          width: 0,
          height: 0,
          duration: 0,
          aspectRatio: '16:9',
          aspectRatioValue: 1.77,
          orientation: 'landscape'
        });
      };

      if (typeof fileOrUrl === 'string') {
        video.src = fileOrUrl;
      } else {
        objectUrl = URL.createObjectURL(fileOrUrl);
        video.src = objectUrl;
      }
    });
  }

  /**
   * Extract duration from audio file or URL
   */
  static extractAudioMetadata(fileOrUrl) {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      let objectUrl = null;

      const cleanup = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };

      audio.onloadedmetadata = () => {
        const duration = +(audio.duration || 0).toFixed(2);
        cleanup();
        resolve({ duration });
      };

      audio.onerror = () => {
        cleanup();
        resolve({ duration: 0 });
      };

      if (typeof fileOrUrl === 'string') {
        audio.src = fileOrUrl;
      } else {
        objectUrl = URL.createObjectURL(fileOrUrl);
        audio.src = objectUrl;
      }
    });
  }

  /**
   * Compute normalized ratio string and orientation from pixel dimensions
   */
  static computeRatioAndOrientation(width, height) {
    if (!width || !height || width <= 0 || height <= 0) {
      return { ratio: '1:1', ratioVal: 1, orientation: 'square' };
    }

    const ratioVal = +(width / height).toFixed(3);
    let ratio = `${width}:${height}`;

    if (Math.abs(ratioVal - 16 / 9) < 0.08) ratio = '16:9';
    else if (Math.abs(ratioVal - 9 / 16) < 0.08) ratio = '9:16';
    else if (Math.abs(ratioVal - 4 / 3) < 0.08) ratio = '4:3';
    else if (Math.abs(ratioVal - 3 / 4) < 0.08) ratio = '3:4';
    else if (Math.abs(ratioVal - 1) < 0.08) ratio = '1:1';
    else if (Math.abs(ratioVal - 21 / 9) < 0.08) ratio = '21:9';

    let orientation = 'square';
    if (ratioVal > 1.1) orientation = 'landscape';
    else if (ratioVal < 0.9) orientation = 'portrait';

    return { ratio, ratioVal, orientation };
  }
}

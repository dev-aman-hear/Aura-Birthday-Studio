/**
 * Birthday Studio - Media URL Manager (Phase 11 Hardening)
 * Centralized Object URL Tracking & Emergency Revocation Safety
 */

export class MediaUrlManager {
  static activeUrls = new Set();

  /**
   * Create and track a Blob Object URL
   */
  static createUrl(blob) {
    if (!blob) return '';
    try {
      const url = URL.createObjectURL(blob);
      this.activeUrls.add(url);
      return url;
    } catch (err) {
      console.error('Failed to create Object URL:', err);
      return '';
    }
  }

  /**
   * Revoke and untrack a specific Object URL
   */
  static revokeUrl(url) {
    if (!url || typeof url !== 'string') return;
    if (this.activeUrls.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        // Silent catch
      }
      this.activeUrls.delete(url);
    }
  }

  /**
   * Emergency revocation of all tracked Object URLs
   */
  static revokeAll() {
    this.activeUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        // Silent catch
      }
    });
    this.activeUrls.clear();
  }

  /**
   * Return count of active tracked Object URLs
   */
  static getActiveCount() {
    return this.activeUrls.size;
  }
}

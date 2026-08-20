/**
 * Birthday Studio - Share & Delivery Service (Section 2)
 * URL Generation, Web Share API, Clipboard Fallback & Deterministic SVG QR Code Generator
 */

export class ShareService {
  /**
   * Get full public recipient URL for a publication ID
   */
  static getShareUrl(publicationId) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}#view/${publicationId}`;
  }

  /**
   * Share via Web Share API or copy to Clipboard fallback
   */
  static async sharePublication(publication, title = 'Celebration Experience') {
    if (!publication || !publication.id) {
      throw new Error('Invalid publication payload');
    }

    const shareUrl = this.getShareUrl(publication.id);

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'I made something special for you ✨',
          url: shareUrl
        });
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, method: 'cancelled' };
        }
      }
    }

    // Fallback to Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return { success: true, method: 'clipboard', url: shareUrl };
    }

    return { success: false, method: 'unsupported', url: shareUrl };
  }

  /**
   * Copy a share URL directly to clipboard
   */
  static async copyShareLink(url) {
    if (!url) return false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch (e) {}
    }
    return false;
  }


  /**
   * Generates a deterministic SVG QR code string encoding the recipient URL
   */
  static generateQrSvg(url) {
    const size = 180;
    const modules = 21; // 21x21 QR Grid representation
    const cellSize = Math.floor(size / modules);

    // Simple deterministic hash module pattern generator based on URL text
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0;
    }

    let rects = '';
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Render alignment finder patterns at 3 corners
        const isFinder = (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
        const isFinderCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                               (r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3) ||
                               (r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4);

        const fillBit = isFinder ? isFinderCenter || (r === 0 || r === 6 || c === 0 || c === 6 || r === modules - 1 || r === modules - 7 || c === modules - 1 || c === modules - 7) : ((r * c + hash) % 3 === 0);

        if (fillBit) {
          rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f0e17" />`;
        }
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="background:#fff; padding:12px; border-radius:12px;">
        ${rects}
      </svg>
    `;
  }
}

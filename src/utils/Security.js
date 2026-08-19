/**
 * Birthday Studio - Security & Sanitization Engine
 * Protects against XSS, HTML injection, and malicious URL protocols (javascript:, data:text/html)
 */

export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  // Disallow dangerous script protocols
  if (/^(javascript|vbscript):/i.test(trimmed)) {
    return fallback;
  }
  // For data: URIs, strictly allow only safe image/audio/video types
  if (/^data:/i.test(trimmed)) {
    if (!/^data:(image\/(jpeg|png|webp|gif|svg\+xml)|audio\/(mp3|wav|m4a|ogg|aac)|video\/(mp4|webm|ogg))/i.test(trimmed)) {
      return fallback;
    }
  }
  return trimmed;
}

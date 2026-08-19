/**
 * Birthday Studio - Accessibility Utilities (Phase 8 Accessibility 2.0)
 * Focus Trapping, ARIA Management, Keyboard Navigation & Screen Reader Announcements
 */

export class Accessibility {
  /**
   * Trap focus within a modal element
   */
  static trapFocus(modalElement) {
    if (!modalElement) return () => {};

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    modalElement.addEventListener('keydown', handleKeyDown);
    return () => modalElement.removeEventListener('keydown', handleKeyDown);
  }

  /**
   * Attach Escape key to close callback
   */
  static onEscape(modalElement, onCloseCallback) {
    if (!modalElement || typeof onCloseCallback !== 'function') return () => {};

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseCallback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }

  /**
   * Announce message to screen readers via aria-live region
   */
  static announce(message, priority = 'polite') {
    let region = document.getElementById('bsAriaLiveRegion');
    if (!region) {
      region = document.createElement('div');
      region.id = 'bsAriaLiveRegion';
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.style.position = 'absolute';
      region.style.width = '1px';
      region.style.height = '1px';
      region.style.padding = '0';
      region.style.margin = '-1px';
      region.style.overflow = 'hidden';
      region.style.clip = 'rect(0, 0, 0, 0)';
      region.style.border = '0';
      document.body.appendChild(region);
    }
    region.textContent = message;
  }

  /**
   * Check if reduced motion is preferred
   */
  static prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

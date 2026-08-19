/**
 * Birthday Studio - Mobile Bottom Sheet View
 * Touch-friendly bottom drawer for mobile properties, tool panels, and settings
 */

export class MobileBottomSheetView {
  constructor(title, contentElement, onClose = (() => {})) {
    this.title = title;
    this.contentElement = contentElement;
    this.onClose = onClose;
  }

  render() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-bottom-sheet-overlay';
    overlay.id = 'mobileBottomSheetOverlay';

    overlay.innerHTML = `
      <div class="mobile-bottom-sheet-content">
        <div class="mobile-sheet-drag-handle"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <h4 style="font-size:1rem; font-weight:800; color:var(--accent-gold); margin:0;">${this.title}</h4>
          <button class="btn btn-ghost btn-icon btn-sm" id="btnCloseMobileSheet">✕</button>
        </div>
        <div id="mobileSheetContentMount"></div>
      </div>
    `;

    const mount = overlay.querySelector('#mobileSheetContentMount');
    if (this.contentElement) {
      if (typeof this.contentElement === 'string') {
        mount.innerHTML = this.contentElement;
      } else if (this.contentElement instanceof Node) {
        mount.appendChild(this.contentElement);
      }
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('#btnCloseMobileSheet')) {
        this.close(overlay);
      }
    });

    return overlay;
  }

  close(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
    this.onClose();
  }
}

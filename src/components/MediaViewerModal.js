/**
 * Birthday Studio - Interactive Media Fullscreen Viewer with Pan & Zoom
 * Ensures Photo Collages are ALWAYS displayed 100% complete without cropping.
 */

export class MediaViewerModal {
  constructor() {
    this.modal = null;
    this.img = null;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.initialTouchDist = 0;
    this.initialTouchZoom = 1.0;
    this.ensureDOM();
  }

  ensureDOM() {
    let existing = document.getElementById('media-fullscreen-modal');
    if (existing) {
      this.modal = existing;
      this.img = existing.querySelector('#media-modal-img');
      return;
    }

    const modalEl = document.createElement('div');
    modalEl.id = 'media-fullscreen-modal';
    modalEl.className = 'media-fullscreen-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-hidden', 'true');

    modalEl.innerHTML = `
      <div class="media-modal-backdrop" id="media-modal-backdrop"></div>
      <div class="media-modal-blurred-bg" id="media-modal-blurred-bg"></div>

      <div class="media-modal-toolbar">
        <div class="media-modal-zoom-controls">
          <button id="media-modal-btn-zoom-out" class="media-modal-btn" title="Zoom Out" aria-label="Zoom Out">🔍−</button>
          <span id="media-modal-zoom-label" class="media-modal-zoom-label">100%</span>
          <button id="media-modal-btn-zoom-in" class="media-modal-btn" title="Zoom In" aria-label="Zoom In">🔍+</button>
          <button id="media-modal-btn-reset" class="media-modal-btn" title="Reset View" aria-label="Reset View">↺</button>
        </div>
        <button id="media-modal-btn-close" class="media-modal-btn close-btn" title="Close Fullscreen View" aria-label="Close">✕</button>
      </div>

      <div class="media-modal-stage" id="media-modal-stage">
        <img id="media-modal-img" class="media-modal-img" src="" alt="Full Resolution Collage">
      </div>
    `;

    document.body.appendChild(modalEl);
    this.modal = modalEl;
    this.img = modalEl.querySelector('#media-modal-img');
    this.blurredBg = modalEl.querySelector('#media-modal-blurred-bg');
    this.zoomLabel = modalEl.querySelector('#media-modal-zoom-label');
    this.stage = modalEl.querySelector('#media-modal-stage');

    this.initEvents();
  }

  initEvents() {
    if (!this.modal) return;

    this.modal.querySelector('#media-modal-btn-zoom-in')?.addEventListener('click', () => this.zoomBy(0.5));
    this.modal.querySelector('#media-modal-btn-zoom-out')?.addEventListener('click', () => this.zoomBy(-0.5));
    this.modal.querySelector('#media-modal-btn-reset')?.addEventListener('click', () => this.resetTransform());
    this.modal.querySelector('#media-modal-btn-close')?.addEventListener('click', () => this.close());
    this.modal.querySelector('#media-modal-backdrop')?.addEventListener('click', () => this.close());

    window.addEventListener('keydown', (e) => {
      if (this.modal && this.modal.classList.contains('active') && e.key === 'Escape') {
        this.close();
      }
    });

    if (!this.stage) return;

    this.stage.addEventListener('wheel', (e) => {
      if (!this.modal.classList.contains('active')) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      this.zoomBy(delta);
    }, { passive: false });

    this.stage.addEventListener('dblclick', (e) => {
      if (!this.modal.classList.contains('active')) return;
      e.preventDefault();
      this.setZoom(this.zoom > 1.2 ? 1.0 : 2.0);
    });

    this.stage.addEventListener('mousedown', (e) => {
      if (!this.modal.classList.contains('active') || this.zoom <= 1.0) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.stage.classList.add('grabbing');
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.stage) this.stage.classList.remove('grabbing');
      }
    });

    // Touch events for mobile
    this.stage.addEventListener('touchstart', (e) => {
      if (!this.modal.classList.contains('active')) return;
      if (e.touches.length === 2) {
        this.initialTouchDist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        this.initialTouchZoom = this.zoom;
      } else if (e.touches.length === 1 && this.zoom > 1.0) {
        this.isDragging = true;
        this.startX = e.touches[0].pageX - this.panX;
        this.startY = e.touches[0].pageY - this.panY;
      }
    }, { passive: true });

    this.stage.addEventListener('touchmove', (e) => {
      if (!this.modal.classList.contains('active')) return;
      if (e.touches.length === 2 && this.initialTouchDist > 0) {
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const scale = dist / this.initialTouchDist;
        this.setZoom(this.initialTouchZoom * scale);
      } else if (e.touches.length === 1 && this.isDragging && this.zoom > 1.0) {
        this.panX = e.touches[0].pageX - this.startX;
        this.panY = e.touches[0].pageY - this.startY;
        this.updateTransform();
      }
    }, { passive: true });

    this.stage.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) this.initialTouchDist = 0;
      if (e.touches.length === 0) this.isDragging = false;
    });
  }

  open(url) {
    this.ensureDOM();
    if (!this.modal || !this.img || !url) return;

    this.img.src = url;
    if (this.blurredBg) {
      this.blurredBg.style.backgroundImage = `url('${url}')`;
    }

    this.resetTransform();
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    this.resetTransform();
  }

  zoomBy(amount) {
    this.setZoom(this.zoom + amount);
  }

  setZoom(targetZoom) {
    this.zoom = Math.max(1.0, Math.min(4.0, targetZoom));
    if (this.zoom === 1.0) {
      this.panX = 0;
      this.panY = 0;
    }
    this.updateTransform();
  }

  resetTransform() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
  }

  updateTransform() {
    if (!this.img) return;
    this.img.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    if (this.zoomLabel) {
      this.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }
}

// Global Singleton Instance & Window Binding
export const mediaViewer = new MediaViewerModal();
if (typeof window !== 'undefined') {
  window.mediaViewer = mediaViewer;
  document.addEventListener('click', (e) => {
    const collageWrapper = e.target.closest('.media-collage-wrapper');
    if (collageWrapper) {
      const img = collageWrapper.querySelector('.media-collage-fg') || collageWrapper.querySelector('img');
      if (img && img.src) {
        mediaViewer.open(img.src);
      }
    }
  });
}

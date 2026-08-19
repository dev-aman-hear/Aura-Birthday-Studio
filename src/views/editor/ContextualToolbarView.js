/**
 * Birthday Studio - Streamlined Contextual Toolbar View
 * Single compact, adaptive canvas toolbar showing only essential actions:
 * 🎨 Style | ⏱ Timing | 💌 Wishes (on Wish Wall) | ▶ Preview | 📱 Mobile | 💻 Desktop
 * Element tools dynamically adapt when an element is selected.
 */

export class ContextualToolbarView {
  constructor(options = {}) {
    this.selectedElement = options.selectedElement || null;
    this.scene = options.scene || null;
    this.currentRatio = options.currentRatio || 'ratio-widescreen';
    this.viewMode = options.viewMode || (this.currentRatio === 'ratio-widescreen' ? 'desktop' : 'mobile');
    this.onAction = options.onAction || (() => {});
  }

  renderViewModeToggle() {
    const isMobile = this.viewMode === 'mobile' || this.currentRatio === 'ratio-story';
    return `
      <div class="floating-divider"></div>
      <div class="floating-view-mode-toggle" id="toolbarViewModeToggle">
        <button class="view-mode-pill ${isMobile ? 'active' : ''}" data-action="setModeMobile" title="Switch to Mobile View (9:16)" type="button">
          <span>📱</span> <span>Mobile</span>
        </button>
        <button class="view-mode-pill ${!isMobile ? 'active' : ''}" data-action="setModeDesktop" title="Switch to Desktop View (16:9)" type="button">
          <span>💻</span> <span>Desktop</span>
        </button>
      </div>
    `;
  }

  render() {
    const toolbar = document.createElement('div');
    toolbar.className = 'floating-context-toolbar';
    toolbar.id = 'floatingContextToolbar';

    const viewToggleHtml = this.renderViewModeToggle();
    const isWishWallScene = this.scene && (this.scene.template === 'wish_wall' || this.scene.template === 'wish-wall');

    if (!this.selectedElement) {
      // Scene Level Tools: Style, Timing, Wish Wall Setup (if applicable), Preview, Mobile, Desktop
      toolbar.innerHTML = `
        <button class="floating-tool-btn primary-tool" data-action="style" title="Change Visual Style">
          <span>🎨</span> <span>Style</span>
        </button>
        <div class="floating-divider"></div>
        ${isWishWallScene ? `
          <button class="floating-tool-btn primary-tool" data-action="openModeration" title="Manage & Moderate Wish Wall Messages" style="color:var(--accent-gold, #ffd700);">
            <span>💌</span> <span>Wish Studio</span>
          </button>
          <div class="floating-divider"></div>
        ` : ''}
        <button class="floating-tool-btn" data-action="timing" title="Scene Timing & Duration">
          <span>⏱️</span> <span>Timing</span>
        </button>
        <div class="floating-divider"></div>
        <button class="floating-tool-btn" data-action="previewExperience" title="Preview Scene Experience">
          <span>▶️</span> <span>Preview</span>
        </button>
        ${viewToggleHtml}
      `;
    } else {
      const type = (this.selectedElement.type || 'text').toLowerCase();

      if (type === 'text') {
        toolbar.innerHTML = `
          <button class="floating-tool-btn primary-tool" data-action="editText" title="Edit text inline (Double-click or press Enter)">
            <span>✍️</span> <span>Edit</span>
          </button>
          <button class="floating-tool-btn" data-action="font" title="Typography & Font Settings">
            <span>🔤</span> <span>Font</span>
          </button>
          <button class="floating-tool-btn" data-action="fontSize" title="Text Size">
            <span>📏</span> <span>Size</span>
          </button>
          <button class="floating-tool-btn" data-action="fontColor" title="Text Color">
            <span>🎨</span> <span>Color</span>
          </button>
          <button class="floating-tool-btn" data-action="timing" title="Text Animation">
            <span>✨</span> <span>Anim</span>
          </button>
          ${viewToggleHtml}
        `;
      } else if (type === 'image' || type === 'photo') {
        toolbar.innerHTML = `
          <button class="floating-tool-btn primary-tool" data-action="replaceMedia" title="Replace Photo">
            <span>🖼️</span> <span>Replace</span>
          </button>
          <button class="floating-tool-btn" data-action="style" title="Corner Radius & Style">
            <span>📐</span> <span>Style</span>
          </button>
          <button class="floating-tool-btn" data-action="timing" title="Photo Pan & Zoom Animation">
            <span>✨</span> <span>Anim</span>
          </button>
          ${viewToggleHtml}
        `;
      } else if (type === 'video') {
        toolbar.innerHTML = `
          <button class="floating-tool-btn primary-tool" data-action="replaceMedia" title="Replace Video">
            <span>🎬</span> <span>Replace</span>
          </button>
          <button class="floating-tool-btn" data-action="style" title="Video Style & Border">
            <span>📐</span> <span>Style</span>
          </button>
          <button class="floating-tool-btn" data-action="timing" title="Video Timing">
            <span>✨</span> <span>Anim</span>
          </button>
          ${viewToggleHtml}
        `;
      } else if (type === 'countdown') {
        toolbar.innerHTML = `
          <button class="floating-tool-btn primary-tool" data-action="countdown" title="Configure Countdown Target">
            <span>⏳</span> <span>Target</span>
          </button>
          <button class="floating-tool-btn" data-action="style" title="Countdown Style">
            <span>🎨</span> <span>Style</span>
          </button>
          <button class="floating-tool-btn" data-action="timing" title="Animation & Timing">
            <span>✨</span> <span>Anim</span>
          </button>
          ${viewToggleHtml}
        `;
      } else {
        toolbar.innerHTML = `
          <button class="floating-tool-btn primary-tool" data-action="style" title="Inspect & Style">
            <span>🎨</span> <span>Style</span>
          </button>
          <button class="floating-tool-btn" data-action="timing" title="Animation & Timing">
            <span>✨</span> <span>Anim</span>
          </button>
          ${viewToggleHtml}
        `;
      }
    }

    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      this.onAction(action);
    });

    return toolbar;
  }
}

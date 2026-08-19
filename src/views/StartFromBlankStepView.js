/**
 * Birthday Studio - Start From Blank Step View
 * Creative Onboarding Workspace with 1:1 Visual Quality Matching the Style Selection Studio
 */

export class StartFromBlankStepView {
  constructor(options = {}) {
    this.selectedMode = options.selectedMode || 'empty_canvas'; // 'empty_canvas' | 'structure'
    this.onSelectMode = options.onSelectMode || (() => {});
    this.onProceed = options.onProceed || (() => {});
  }

  render() {
    const container = document.createElement('div');
    container.className = 'start-from-blank-workspace animate-fade';
    container.id = 'startFromBlankRoot';

    container.innerHTML = `
      <div class="start-from-blank-content-wrapper">
        <!-- Main Header Section -->
        <div class="sfb-header-hero">
          <h1 class="sfb-main-title">Start From Blank</h1>
          <p class="sfb-main-tagline">Create your celebration your way</p>
          <div class="sfb-section-pill">
            <span class="sfb-pill-spark">✨</span>
            <span>Choose how you want to begin</span>
          </div>
        </div>

        <!-- Two-Column Creative Starting Cards -->
        <div class="sfb-cards-grid" role="radiogroup" aria-label="Choose starting option">
          <!-- CARD 1: Empty Canvas -->
          <div 
            class="sfb-option-card ${this.selectedMode === 'empty_canvas' ? 'selected' : ''}" 
            data-mode="empty_canvas"
            role="radio"
            aria-checked="${this.selectedMode === 'empty_canvas'}"
            tabindex="0"
            aria-label="Empty Canvas - Start completely from scratch with full creative freedom"
          >
            <div class="sfb-card-top-row">
              <span class="sfb-card-icon sfb-icon-sparkle">✦</span>
              <div class="sfb-card-top-badges">
                <span class="sfb-badge-tag sfb-badge-freedom">Maximum Freedom</span>
                <span class="sfb-check-indicator">${this.selectedMode === 'empty_canvas' ? '✓' : ''}</span>
              </div>
            </div>

            <div class="sfb-card-info">
              <h2 class="sfb-card-title">EMPTY CANVAS</h2>
              <p class="sfb-card-desc">
                Start completely from scratch. Create your own scenes, layout, text, media, animations and visual style.
              </p>
            </div>

            <!-- Mini Visual Blueprint Preview (Empty Canvas) -->
            <div class="sfb-mini-preview-frame sfb-empty-preview">
              <div class="sfb-canvas-blueprint">
                <div class="sfb-blueprint-grid"></div>
                <div class="sfb-empty-center-target">
                  <div class="sfb-empty-plus-icon">+</div>
                  <span class="sfb-empty-label">Empty Canvas</span>
                </div>
              </div>
            </div>

            <div class="sfb-card-features">
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-purple">✓</span>
                <span>No predefined content</span>
              </div>
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-purple">✓</span>
                <span>Full creative control</span>
              </div>
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-purple">✓</span>
                <span>Add elements manually</span>
              </div>
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-purple">✓</span>
                <span>Best for custom designs</span>
              </div>
            </div>

            <div class="sfb-card-action-bar">
              <button class="btn btn-primary sfb-action-btn sfb-btn-primary" data-action-mode="empty_canvas">
                <span>Start Blank</span>
                <span class="sfb-btn-arrow">→</span>
              </button>
            </div>
          </div>

          <!-- CARD 2: Start With Structure -->
          <div 
            class="sfb-option-card ${this.selectedMode === 'structure' ? 'selected' : ''}" 
            data-mode="structure"
            role="radio"
            aria-checked="${this.selectedMode === 'structure'}"
            tabindex="0"
            aria-label="Start With Structure - Begin with a simple editable structure and customize it"
          >
            <div class="sfb-card-top-row">
              <span class="sfb-card-icon sfb-icon-star">✨</span>
              <div class="sfb-card-top-badges">
                <span class="sfb-badge-tag sfb-badge-structure">Faster Setup</span>
                <span class="sfb-check-indicator">${this.selectedMode === 'structure' ? '✓' : ''}</span>
              </div>
            </div>

            <div class="sfb-card-info">
              <h2 class="sfb-card-title">START WITH A STRUCTURE</h2>
              <p class="sfb-card-desc">
                Begin with a simple celebration structure and customize it to make it your own.
              </p>
            </div>

            <!-- Mini Visual Blueprint Preview (Structured Layout) -->
            <div class="sfb-mini-preview-frame sfb-structure-preview">
              <div class="sfb-canvas-blueprint sfb-structure-blueprint">
                <div class="sfb-mock-title-bar">
                  <span class="sfb-mock-text-pill">TITLE</span>
                </div>
                <div class="sfb-mock-media-area">
                  <span class="sfb-mock-media-icon">🖼️</span>
                  <span class="sfb-mock-media-label">IMAGE AREA</span>
                </div>
                <div class="sfb-mock-message-bar">
                  <span class="sfb-mock-text-pill sfb-pill-sub">MESSAGE</span>
                </div>
              </div>
            </div>

            <div class="sfb-card-features">
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-amber">✓</span>
                <span>Starter scenes included</span>
              </div>
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-amber">✓</span>
                <span>Basic structured layout</span>
              </div>
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-amber">✓</span>
                <span>Editable text & media slots</span>
              </div>
              <div class="sfb-feature-item">
                <span class="sfb-feature-check sfb-check-amber">✓</span>
                <span>Custom visual style</span>
              </div>
            </div>

            <div class="sfb-card-action-bar">
              <button class="btn btn-secondary sfb-action-btn sfb-btn-secondary" data-action-mode="structure">
                <span>Use Structure</span>
                <span class="sfb-btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Customization Panel: 9 Square Tiles Matching Screenshot -->
        <div class="sfb-customization-showcase">
          <div class="sfb-customization-header">
            <span class="sfb-spark-icon">🪄</span>
            <span class="sfb-cust-title">WHAT YOU CAN CUSTOMIZE</span>
          </div>
          <div class="sfb-custom-tiles-grid">
            <div class="sfb-tile" title="Edit headings, subheadings, and personalized messages">
              <span class="sfb-tile-icon sfb-t-pink">T</span>
              <span class="sfb-tile-label">Text</span>
            </div>
            <div class="sfb-tile" title="Upload photos and high-resolution images">
              <span class="sfb-tile-icon">🖼️</span>
              <span class="sfb-tile-label">Images</span>
            </div>
            <div class="sfb-tile" title="Add MP4/WebM video showcases">
              <span class="sfb-tile-icon">🎥</span>
              <span class="sfb-tile-label">Videos</span>
            </div>
            <div class="sfb-tile" title="Set background celebration music and audio tracks">
              <span class="sfb-tile-icon">🎵</span>
              <span class="sfb-tile-label">Music</span>
            </div>
            <div class="sfb-tile" title="Add, remove, reorder, and duplicate scenes">
              <span class="sfb-tile-icon">🎬</span>
              <span class="sfb-tile-label">Scenes</span>
            </div>
            <div class="sfb-tile" title="Cinematic text reveals, slides, and zooms">
              <span class="sfb-tile-icon sfb-t-gold">★</span>
              <span class="sfb-tile-label">Animations</span>
            </div>
            <div class="sfb-tile" title="Color palettes and background gradients">
              <span class="sfb-tile-icon">🎨</span>
              <span class="sfb-tile-label">Colors</span>
            </div>
            <div class="sfb-tile" title="Curated Google fonts and typographic pairings">
              <span class="sfb-tile-icon sfb-t-purple">A<sub style="font-size:0.65rem;">A</sub></span>
              <span class="sfb-tile-label">Typography</span>
            </div>
            <div class="sfb-tile" title="Transitions like Pop, Fade, Blur, and Slide">
              <span class="sfb-tile-icon">📑</span>
              <span class="sfb-tile-label">Transitions</span>
            </div>
          </div>
        </div>

        <!-- Connected 5-Step Workflow Timeline -->
        <div class="sfb-workflow-timeline">
          <!-- Step 1 (Active) -->
          <div class="sfb-timeline-step sfb-tl-active">
            <div class="sfb-step-circle active">1</div>
            <span class="sfb-step-text active">Choose starting point</span>
          </div>
          <div class="sfb-timeline-line active"></div>

          <!-- Step 2 -->
          <div class="sfb-timeline-step">
            <div class="sfb-step-circle">2</div>
            <span class="sfb-step-text">Build scenes</span>
          </div>
          <div class="sfb-timeline-line dashed"></div>

          <!-- Step 3 -->
          <div class="sfb-timeline-step">
            <div class="sfb-step-circle">3</div>
            <span class="sfb-step-text">Add media</span>
          </div>
          <div class="sfb-timeline-line dashed"></div>

          <!-- Step 4 -->
          <div class="sfb-timeline-step">
            <div class="sfb-step-circle">4</div>
            <span class="sfb-step-text">Customize style</span>
          </div>
          <div class="sfb-timeline-line dashed"></div>

          <!-- Step 5 -->
          <div class="sfb-timeline-step">
            <div class="sfb-step-circle">5</div>
            <span class="sfb-step-text">Preview & publish</span>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(container);
    return container;
  }

  attachEvents(root) {
    // 1. Card Selection via Click or Action Button
    root.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action-mode]');
      if (actionBtn) {
        const mode = actionBtn.dataset.actionMode;
        this.selectMode(root, mode);
        this.onProceed(mode);
        return;
      }

      const card = e.target.closest('.sfb-option-card');
      if (card && card.dataset.mode) {
        const mode = card.dataset.mode;
        this.selectMode(root, mode);
      }
    });

    // 2. Keyboard Accessibility (Enter, Space, Tab)
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.sfb-option-card');
        if (card && card.dataset.mode) {
          e.preventDefault();
          const mode = card.dataset.mode;
          this.selectMode(root, mode);
          this.onProceed(mode);
        }
      }
    });
  }

  selectMode(root, mode) {
    this.selectedMode = mode;
    root.querySelectorAll('.sfb-option-card').forEach(card => {
      const isTarget = card.dataset.mode === mode;
      card.classList.toggle('selected', isTarget);
      card.setAttribute('aria-checked', isTarget ? 'true' : 'false');
      
      const checkIndicator = card.querySelector('.sfb-check-indicator');
      if (checkIndicator) {
        checkIndicator.textContent = isTarget ? '✓' : '';
      }
    });
    this.onSelectMode(this.selectedMode);
  }
}

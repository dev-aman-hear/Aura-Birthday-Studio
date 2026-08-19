/**
 * Birthday Studio - Universal Style Selection & Real-Time Live Preview View (Section 5 & 6)
 * Provides Split-Pane View: 10 Universal Generic Themes + Real-Time Live Interactive Scene Sandbox
 */

import { StyleRegistry } from '../data/styles/StyleRegistry.js';
import { UniversalSceneRenderer } from '../templates/UniversalSceneRenderer.js';

export class StyleSelectionView {
  constructor(options = {}) {
    this.selectedStyleId = options.selectedStyleId || 'style_luxury';
    this.onSelectStyle = options.onSelectStyle || (() => {});
    this.occasion = options.occasion || 'birthday';
    this.recipient = options.recipient || { name: 'Recipient Name', description: 'Wishing you a wonderful celebration full of joy!' };
    this.project = options.project ? JSON.parse(JSON.stringify(options.project)) : null;
    
    // Viewport device mode: inherit from options / project, defaulting to desktop
    this.deviceMode = options.deviceMode || options.viewMode || this.project?.settings?.viewMode || 'desktop';
    this.currentSceneIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.sampleAssets = options.sampleAssets || [
      { id: 'asset_1', type: 'image', renderUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80' },
      { id: 'asset_2', type: 'image', renderUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80' },
      { id: 'asset_3', type: 'image', renderUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80' }
    ];

    this.initSampleScenes();
  }

  /**
   * Initializes demo celebration scenes for preview if no custom project scenes provided
   */
  initSampleScenes() {
    if (this.project?.scenes && this.project.scenes.length > 0) {
      this.scenes = JSON.parse(JSON.stringify(this.project.scenes));
      return;
    }

    const recipName = this.recipient?.name || 'Recipient Name';

    this.scenes = [
      {
        id: 'preview_scene_1',
        name: 'Opening Spotlight',
        template: 'hero',
        transition: 'pop',
        duration: 4,
        settings: {
          badgeText: '👑',
          titleText: recipName.toUpperCase(),
          subtitleText: 'Get ready for a visual celebration',
          scriptNote: 'made just for you.'
        }
      },
      {
        id: 'preview_scene_2',
        name: 'Cherished Memories',
        template: 'photo_gallery',
        transition: 'pop',
        duration: 4,
        settings: {
          titleText: 'Moments to Remember',
          subtitleText: 'Celebrating all the laughter and memories we share.'
        }
      },
      {
        id: 'preview_scene_3',
        name: 'Heartfelt Wish',
        template: 'final_wish',
        transition: 'blur',
        duration: 4,
        settings: {
          titleText: 'May All Your Dreams Come True!',
          subtitleText: this.recipient?.description || 'Here is to a wonderful year ahead filled with happiness.'
        }
      }
    ];
  }

  render() {
    const container = document.createElement('div');
    container.className = 'style-selection-full-page-view animate-fade';

    const styles = StyleRegistry.getAllStyles();
    const activeStyle = StyleRegistry.getStyleById(this.selectedStyleId);
    const canvasRatioClass = this.deviceMode === 'mobile' ? 'ratio-story' : 'ratio-widescreen';

    container.innerHTML = `
      <div class="style-selection-split-layout">
        <!-- LEFT PANEL: Style Selector Library (30-35%) -->
        <aside class="style-picker-column" aria-label="Visual Style Library">
          <div class="style-picker-header-box">
            <h2 class="style-picker-title">2. Choose Visual Style</h2>
            <p class="style-picker-subtitle">
              Select a design theme. Styles control typography, palettes, motion, and effects without altering your content.
            </p>
          </div>

          <div class="style-cards-grid-scroll" id="styleCardsContainer" role="listbox" aria-label="Available Visual Styles">
            ${styles.map(style => {
              const isSelected = style.id === this.selectedStyleId;
              return `
                <div class="style-card-rich ${isSelected ? 'selected' : ''}" data-style-id="${style.id}" role="option" aria-selected="${isSelected}" tabindex="0" aria-label="Select ${style.name} style">
                  <div class="style-card-top-row">
                    <span class="style-card-icon-art">${style.icon}</span>
                    <div class="style-card-top-badges">
                      <span class="style-card-mood-pill">${style.mood}</span>
                      ${isSelected ? `<span class="style-card-check-bubble">✓</span>` : ''}
                    </div>
                  </div>

                  <div class="style-card-info">
                    <h3 class="style-card-name">${style.name}</h3>
                    <p class="style-card-desc">${style.description}</p>
                  </div>

                  <div class="style-card-bottom-row">
                    <div class="palette-dots-group" title="Theme Palette">
                      <span class="palette-dot" style="background:${style.colors.bg};"></span>
                      <span class="palette-dot" style="background:${style.colors.accent};"></span>
                      <span class="palette-dot" style="background:${style.colors.text};"></span>
                    </div>
                    <div class="style-card-actions">
                      <button class="btn btn-card-preview-action" data-style-id="${style.id}">
                        👁 Preview
                      </button>
                      ${isSelected ? `<span class="style-card-selected-badge">Selected</span>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </aside>

        <!-- RIGHT PANEL: Live Style Preview Workspace (65-70%) -->
        <section class="style-preview-column" aria-label="Live Style Preview Workspace">
          <!-- Preview Header & Device Switcher & Controls Bar -->
          <div class="style-preview-control-bar">
            <div class="preview-header-left">
              <div class="preview-live-badge">
                <span class="live-pulse-dot"></span>
                <span>Live Style Preview</span>
              </div>
            </div>

            <!-- Device Mode Switcher (Preserves Style & Scene Data) -->
            <div class="preview-device-switch" role="group" aria-label="Preview Viewport Mode">
              <button class="btn-device-toggle ${this.deviceMode === 'desktop' ? 'active' : ''}" id="btnDeviceDesktop" data-mode="desktop" title="Desktop Widescreen View (16:9)">
                <span>💻</span> <span>Desktop</span>
              </button>
              <button class="btn-device-toggle ${this.deviceMode === 'mobile' ? 'active' : ''}" id="btnDeviceMobile" data-mode="mobile" title="Mobile Portrait View (9:16)">
                <span>📱</span> <span>Mobile</span>
              </button>
            </div>

            <!-- Playback & Scene Stepper Controls -->
            <div class="preview-playback-controls">
              <button class="btn btn-preview-ctrl" id="btnPreviewPrevScene" title="Previous Scene">◀</button>
              <button class="btn btn-preview-play" id="btnPreviewPlayPause" title="Play / Pause Auto-Preview">
                ${this.isPlaying ? '⏸' : '▶'}
              </button>
              <button class="btn btn-preview-ctrl" id="btnPreviewNextScene" title="Next Scene">▶</button>
              <button class="btn btn-preview-ctrl" id="btnPreviewReplay" title="Replay Preview">🔄</button>
              <span class="preview-scene-indicator" id="lblPreviewSceneIndicator">
                Scene ${this.currentSceneIndex + 1} / ${this.scenes.length}
              </span>
            </div>

            <!-- Fullscreen Toggle Button -->
            <button class="btn btn-preview-ctrl btn-fullscreen-toggle" id="btnPreviewFullscreen" title="Toggle Fullscreen">
              ⛶
            </button>
          </div>

          <!-- Large Dynamic Scene Stage Simulator Frame (Isolated Canvas) -->
          <div class="live-preview-stage-container" id="livePreviewStageWrapper">
            <div class="canvas-viewport-frame ${canvasRatioClass}" id="livePreviewDeviceFrame">
              <div class="story-canvas-viewport" id="livePreviewViewport">
                <!-- Live Scene HTML dynamically mounted here -->
              </div>
            </div>
          </div>

          <!-- Dynamic Theme Meta Information Banner -->
          <div class="preview-style-meta-tag" id="previewStyleMetaBanner">
            <div class="meta-banner-left">
              <span class="meta-label">Active Theme:</span>
              <span class="meta-style-pill" id="lblActiveStyleName">${activeStyle.name}</span>
              <span class="meta-mood-badge" id="lblActiveStyleMood">(${activeStyle.mood})</span>
            </div>
            <div class="meta-banner-center">
              <span class="meta-label">Transition:</span>
              <strong class="meta-transition-name" id="lblActiveStyleTransition">${activeStyle.transition}</strong>
            </div>
            <div class="meta-banner-right">
              <button class="btn btn-change-transition" id="btnChangeTransition">
                🔄 Change Transition
              </button>
            </div>
          </div>
        </section>
      </div>
    `;

    this.attachEvents(container);
    this.updateLivePreview(container);

    return container;
  }


  /**
   * Renders the current scene with the selected style inside the live preview viewport
   */
  updateLivePreview(root) {
    const viewport = root.querySelector('#livePreviewViewport');
    if (!viewport) return;

    const activeScene = this.scenes[this.currentSceneIndex] || this.scenes[0];
    const activeStyle = StyleRegistry.getStyleById(this.selectedStyleId);

    // Build unified preview state
    const sampleProject = this.project ? JSON.parse(JSON.stringify(this.project)) : {
      id: 'preview_sample_project',
      occasion: this.occasion,
      theme: activeStyle.id,
      settings: { styleConfig: activeStyle, viewMode: this.deviceMode },
      recipient: this.recipient,
      creator: { name: 'Someone Special' },
      scenes: this.scenes
    };
    sampleProject.theme = activeStyle.id;
    sampleProject.settings = sampleProject.settings || {};
    sampleProject.settings.styleConfig = activeStyle;
    sampleProject.settings.viewMode = this.deviceMode;

    // Update frame ratio class to match active device mode
    const frame = root.querySelector('#livePreviewDeviceFrame');
    if (frame) {
      const ratioClass = this.deviceMode === 'mobile' ? 'ratio-story' : 'ratio-widescreen';
      frame.className = `canvas-viewport-frame ${ratioClass}`;
    }

    // Render using UniversalSceneRenderer with the exact active style, isPreview, and viewMode
    const renderedHtml = UniversalSceneRenderer.renderScene(
      activeScene,
      sampleProject,
      this.sampleAssets,
      {
        styleId: activeStyle.id,
        isPreview: true,
        viewMode: this.deviceMode
      }
    );

    viewport.innerHTML = renderedHtml;

    // Update scene counter indicator
    const lblIndicator = root.querySelector('#lblPreviewSceneIndicator');
    if (lblIndicator) {
      lblIndicator.textContent = `Scene ${this.currentSceneIndex + 1} / ${this.scenes.length}`;
    }

    // Update theme meta banner
    const lblName = root.querySelector('#lblActiveStyleName');
    if (lblName) lblName.textContent = activeStyle.name;

    const lblMood = root.querySelector('#lblActiveStyleMood');
    if (lblMood) lblMood.textContent = `(${activeStyle.mood})`;

    const lblTransition = root.querySelector('#lblActiveStyleTransition');
    if (lblTransition) lblTransition.textContent = activeStyle.transition;
  }


  /**
   * Playback Loop: Advances through scenes every 3.5s
   */
  startPlayback(root) {
    this.isPlaying = true;
    const playBtn = root.querySelector('#btnPreviewPlayPause');
    if (playBtn) playBtn.textContent = '⏸️';

    if (this.playTimer) clearInterval(this.playTimer);

    this.playTimer = setInterval(() => {
      this.currentSceneIndex = (this.currentSceneIndex + 1) % this.scenes.length;
      this.updateLivePreview(root);
    }, 3500);
  }

  stopPlayback(root) {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    const playBtn = root.querySelector('#btnPreviewPlayPause');
    if (playBtn) playBtn.textContent = '▶️';
  }

  togglePlayback(root) {
    if (this.isPlaying) {
      this.stopPlayback(root);
    } else {
      this.startPlayback(root);
    }
  }

  attachEvents(root) {
    // 1. Select Style on Card Click or Preview Button Click (Preserves Viewport Mode)
    root.addEventListener('click', (e) => {
      const card = e.target.closest('.style-card-rich') || e.target.closest('[data-style-id]');
      if (card && card.dataset.styleId) {
        const newStyleId = card.dataset.styleId;
        this.selectedStyleId = newStyleId;

        root.querySelectorAll('.style-card-rich').forEach(c => {
          const isTarget = c.dataset.styleId === newStyleId;
          c.classList.toggle('selected', isTarget);
          c.setAttribute('aria-selected', isTarget);

          // Update check bubble in top right
          const topBadges = c.querySelector('.style-card-top-badges');
          if (topBadges) {
            let check = topBadges.querySelector('.style-card-check-bubble');
            if (isTarget && !check) {
              const span = document.createElement('span');
              span.className = 'style-card-check-bubble';
              span.textContent = '✓';
              topBadges.appendChild(span);
            } else if (!isTarget && check) {
              check.remove();
            }
          }

          // Update bottom row actions
          const actionsBox = c.querySelector('.style-card-actions');
          if (actionsBox) {
            let selBadge = actionsBox.querySelector('.style-card-selected-badge');
            if (isTarget && !selBadge) {
              const badge = document.createElement('span');
              badge.className = 'style-card-selected-badge';
              badge.textContent = 'Selected';
              actionsBox.appendChild(badge);
            } else if (!isTarget && selBadge) {
              selBadge.remove();
            }
          }
        });

        this.updateLivePreview(root);
        this.onSelectStyle(this.selectedStyleId);
        return;
      }

      // 2. Device Mode Toggles (Desktop vs Mobile, Preserves Selected Style)
      const btnDevice = e.target.closest('.btn-device-toggle');
      if (btnDevice) {
        const mode = btnDevice.dataset.mode;
        this.deviceMode = mode;

        root.querySelectorAll('.btn-device-toggle').forEach(b => b.classList.toggle('active', b === btnDevice));
        this.updateLivePreview(root);
        return;
      }

      // 3. Play / Pause Preview
      if (e.target.closest('#btnPreviewPlayPause')) {
        this.togglePlayback(root);
        return;
      }

      // 4. Previous Scene
      if (e.target.closest('#btnPreviewPrevScene')) {
        this.stopPlayback(root);
        this.currentSceneIndex = (this.currentSceneIndex - 1 + this.scenes.length) % this.scenes.length;
        this.updateLivePreview(root);
        return;
      }

      // 5. Next Scene
      if (e.target.closest('#btnPreviewNextScene')) {
        this.stopPlayback(root);
        this.currentSceneIndex = (this.currentSceneIndex + 1) % this.scenes.length;
        this.updateLivePreview(root);
        return;
      }

      // 6. Replay
      if (e.target.closest('#btnPreviewReplay')) {
        this.currentSceneIndex = 0;
        this.updateLivePreview(root);
        this.startPlayback(root);
        return;
      }

      // 7. Fullscreen Stage Toggle
      if (e.target.closest('#btnPreviewFullscreen')) {
        const stage = root.querySelector('#livePreviewStageWrapper');
        if (stage) {
          if (!document.fullscreenElement) {
            stage.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
        return;
      }

      // 8. Change Transition
      if (e.target.closest('#btnChangeTransition')) {
        const transitions = ['POP', 'FADE', 'BLUR', 'SLIDE'];
        const activeStyle = StyleRegistry.getStyleById(this.selectedStyleId);
        const curTrans = (activeStyle.transition || 'pop').toUpperCase();
        const nextIdx = (transitions.indexOf(curTrans) + 1) % transitions.length;
        const nextTrans = transitions[nextIdx];
        activeStyle.transition = nextTrans.toLowerCase();
        
        const lbl = root.querySelector('#lblActiveStyleTransition');
        if (lbl) lbl.textContent = nextTrans;
        this.updateLivePreview(root);
        return;
      }
    });
  }


  destroy() {
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  }
}


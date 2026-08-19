/**
 * Birthday Studio - Preview Player View
 * Full Project & Single Scene Interactive Player Modal with Special Animation Engine Support
 */

import { TemplateRegistry } from '../templates/TemplateRegistry.js';
import { assetRepository } from '../services/AssetRepository.js';
import { ConfettiEngine } from '../utils/Confetti.js';
import { WishSubmissionModal } from './WishSubmissionModal.js';
import { specialAnimationEngine } from '../animations/SpecialAnimationEngine.js';

export class PreviewPlayerView {
  constructor(project, initialSceneId = null) {
    this.project = JSON.parse(JSON.stringify(project || {}));
    this.scenes = (this.project?.scenes || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    this.currentIndex = initialSceneId ? this.scenes.findIndex(s => s.id === initialSceneId) : 0;
    if (this.currentIndex === -1) this.currentIndex = 0;
    this.timer = null;
    this.bgAudio = null;
    this.sceneStartTime = null;
    this.currentSceneDurationMs = 0;
    this.remainingSceneDurationMs = 0;
    this.isPausedForModal = false;
  }

  async render() {
    const modal = document.createElement('div');
    modal.className = 'preview-player-overlay';
    modal.id = 'previewPlayerOverlay';

    const recipName = this.project?.recipient?.name || 'Celebration';

    modal.innerHTML = `
      <div class="player-container">
        <canvas class="confetti-canvas" id="playerConfettiCanvas"></canvas>

        <div class="player-header-bar">
          <div class="player-title">✨ ${recipName}'s Celebration Experience</div>
          <button class="btn-player-close" id="btnClosePlayer">✕ Exit Preview</button>
        </div>

        <div class="player-stage-viewport" id="playerStageViewport">
          <!-- Active scene HTML rendered here -->
        </div>

        <div class="player-controls-bar">
          <button class="btn-player-nav" id="btnPlayerPrev">◀ Prev</button>
          <div class="player-dots">
            ${this.scenes.map((s, i) => `
              <span class="player-dot ${i === this.currentIndex ? 'active' : ''}" data-idx="${i}"></span>
            `).join('')}
          </div>
          <button class="btn-player-nav" id="btnPlayerNext">Next ▶</button>
        </div>
      </div>
    `;

    this.attachEvents(modal);
    try {
      await this.renderCurrentScene(modal);
    } catch (e) {
      console.warn('Initial scene render error:', e);
    }
    this.startAutoAdvance(modal);
    this.playBackgroundMusic();
    return modal;
  }

  async renderCurrentScene(modal) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    specialAnimationEngine.cleanup();

    const stage = modal.querySelector('#playerStageViewport');
    if (!stage) return;

    if (!this.scenes || this.scenes.length === 0) {
      stage.innerHTML = `
        <div style="text-align:center; padding:50px 24px; color:var(--text-muted);">
          <div style="font-size:3.5rem; margin-bottom:12px;">🎬</div>
          <h3 style="font-size:1.3rem; font-weight:800; color:var(--text);">No Scenes in Celebration</h3>
          <p style="font-size:0.9rem; max-width:380px; margin:8px auto 0 auto;">
            This celebration draft does not have any scenes yet. Open it in the editor to add scenes!
          </p>
        </div>
      `;
      return;
    }

    const currentScene = this.scenes[this.currentIndex];
    if (!currentScene) return;

    try {
      const rawAssets = await assetRepository.getAssets(currentScene.assetIds || []);
      const assetList = (rawAssets || []).filter(Boolean);
      for (const a of assetList) {
        if (a) {
          try {
            a.renderUrl = await assetRepository.getRenderableUrl(a);
          } catch (err) {
            console.warn('Asset renderUrl resolution failed:', err);
          }
        }
      }

      const sceneHtml = TemplateRegistry.renderScene(currentScene, this.project, assetList, { isPreview: true });
      stage.innerHTML = `
        <div class="canvas-viewport-frame ratio-widescreen" style="width:100%; height:100%; max-width:100%; max-height:100%; border-radius:12px; overflow:hidden; background:#000; display:flex; align-items:center; justify-content:center;">
          <div class="story-canvas-viewport" style="width:100%; height:100%; position:relative; overflow:hidden;">
            ${typeof sceneHtml === 'string' ? sceneHtml : ''}
          </div>
        </div>
      `;
      if (sceneHtml instanceof Node) {
        const vp = stage.querySelector('.story-canvas-viewport');
        if (vp) vp.appendChild(sceneHtml);
      }

    } catch (renderErr) {
      console.error('Error rendering scene in preview:', renderErr);
      stage.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-muted);">
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--text);">${currentScene.name || 'Celebration Scene'}</h3>
          <p style="margin-top:8px; font-size:0.9rem;">${currentScene.message || currentScene.description || ''}</p>
        </div>
      `;
    }

    // Confetti effect on reveal or wish-wall templates
    const canvas = modal.querySelector('#playerConfettiCanvas');
    if (canvas && (currentScene.template === 'reveal' || currentScene.template === 'final_wish')) {
      try { ConfettiEngine.launch(canvas); } catch (e) {}
    }

    // Special Animation Scene Engine Initialization
    if (currentScene.template && currentScene.template.startsWith('special_')) {
      const area = stage.querySelector('.story-canvas-viewport') || stage;
      specialAnimationEngine.initScene(area, currentScene, this.project, (opts) => {
        if (opts && opts.replay) {
          this.currentIndex = 0;
          this.renderCurrentScene(modal);
          this.updateDots(modal);
        } else if (this.currentIndex < this.scenes.length - 1) {
          this.currentIndex++;
          this.renderCurrentScene(modal);
          this.updateDots(modal);
        }
      });
    }

    // Attach leave wish modal trigger if present in Wish Wall scene
    const btnWishModal = stage.querySelector('#btnOpenLeaveWishModal');
    if (btnWishModal) {
      btnWishModal.addEventListener('click', () => {
        this.pauseForModal();
        const subModal = new WishSubmissionModal(
          this.project,
          () => {
            this.renderCurrentScene(modal);
          },
          () => {
            this.resumeFromModal(modal);
          }
        );
        document.body.appendChild(subModal.render());
      });
    }

    // Replay button
    const btnReplay = stage.querySelector('#btnReplayExperience');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        this.currentIndex = 0;
        this.renderCurrentScene(modal);
        this.updateDots(modal);
        this.startAutoAdvance(modal);
      });
    }
  }

  pauseForModal() {
    if (this.isPausedForModal) return;
    this.isPausedForModal = true;
    const elapsed = Date.now() - (this.sceneStartTime || Date.now());
    this.remainingSceneDurationMs = Math.max(1000, this.currentSceneDurationMs - elapsed);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resumeFromModal(modal) {
    if (!this.isPausedForModal) return;
    this.isPausedForModal = false;
    this.sceneStartTime = Date.now();
    this.currentSceneDurationMs = this.remainingSceneDurationMs;

    const currentScene = this.scenes[this.currentIndex];
    const isSpecial = currentScene?.template && currentScene.template.startsWith('special_');
    if (isSpecial) return;

    this.timer = setTimeout(() => {
      if (this.currentIndex < this.scenes.length - 1) {
        this.currentIndex++;
        this.renderCurrentScene(modal);
        this.updateDots(modal);
        this.startAutoAdvance(modal);
      }
    }, this.remainingSceneDurationMs);
  }

  startAutoAdvance(modal) {
    if (this.timer) clearTimeout(this.timer);
    if (!this.scenes || this.scenes.length <= 1) return;

    const currentScene = this.scenes[this.currentIndex];
    const isSpecial = currentScene?.template && currentScene.template.startsWith('special_');
    if (isSpecial) return;

    this.currentSceneDurationMs = (currentScene?.duration || 6) * 1000;
    this.sceneStartTime = Date.now();
    this.remainingSceneDurationMs = this.currentSceneDurationMs;

    this.timer = setTimeout(() => {
      if (this.currentIndex < this.scenes.length - 1) {
        this.currentIndex++;
        this.renderCurrentScene(modal);
        this.updateDots(modal);
        this.startAutoAdvance(modal);
      }
    }, this.currentSceneDurationMs);
  }

  attachEvents(modal) {
    modal.querySelector('#btnClosePlayer')?.addEventListener('click', () => {
      this.close(modal);
    });

    modal.querySelector('#btnPlayerPrev')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.renderCurrentScene(modal);
        this.updateDots(modal);
        this.startAutoAdvance(modal);
      }
    });

    modal.querySelector('#btnPlayerNext')?.addEventListener('click', () => {
      if (this.currentIndex < this.scenes.length - 1) {
        this.currentIndex++;
        this.renderCurrentScene(modal);
        this.updateDots(modal);
        this.startAutoAdvance(modal);
      }
    });

    modal.querySelectorAll('.player-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < this.scenes.length) {
          this.currentIndex = idx;
          this.renderCurrentScene(modal);
          this.updateDots(modal);
          this.startAutoAdvance(modal);
        }
      });
    });

    // Close on Escape key
    this.keydownHandler = (e) => {
      if (e.key === 'Escape') {
        this.close(modal);
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  updateDots(modal) {
    modal.querySelectorAll('.player-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  playBackgroundMusic() {
    if (this.project?.music?.url) {
      try {
        this.bgAudio = new Audio(this.project.music.url);
        this.bgAudio.loop = true;
        this.bgAudio.volume = 0.5;
        this.bgAudio.play().catch(() => {});
      } catch (e) {}
    }
  }

  close(modal) {
    if (this.timer) clearTimeout(this.timer);
    if (this.bgAudio) {
      try {
        this.bgAudio.pause();
        this.bgAudio = null;
      } catch (e) {}
    }
    specialAnimationEngine.cleanup();
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    modal.remove();
  }
}

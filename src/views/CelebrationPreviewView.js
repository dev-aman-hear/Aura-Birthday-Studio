/**
 * Birthday Studio - Celebration Preview View
 * Read-Only Interactive Draft Previewer with Viewport Mode Consistency,
 * Pixel-Perfect Canvas Coordinate Framing, Asset Resolution, and Clean Edit Mode Return.
 */

import { UniversalSceneRenderer } from '../templates/UniversalSceneRenderer.js';
import { assetRepository } from '../services/AssetRepository.js';
import { ConfettiEngine } from '../utils/Confetti.js';
import { WishSubmissionModal } from './WishSubmissionModal.js';
import { Accessibility } from '../utils/Accessibility.js';
import { specialAnimationEngine } from '../animations/SpecialAnimationEngine.js';
import { wishRepository } from '../services/WishRepository.js';

export class CelebrationPreviewView {
  constructor(options = {}, onContinueEditArg = null, onPublishArg = null) {
    // Support both new options-object signature and legacy (project, onContinueEdit, onPublish) signature
    if (options && (options.scenes || options.id)) {
      this.project = JSON.parse(JSON.stringify(options));
      this.onContinueEdit = onContinueEditArg || (() => {});
      this.onPublish = onPublishArg || (() => {});
      this.initialSceneId = null;
      this.editorViewMode = 'desktop';
      this.editorCanvasRatio = 'ratio-widescreen';
      this.allAssets = [];
    } else {
      this.project = JSON.parse(JSON.stringify(options.project || {}));
      this.onContinueEdit = options.onContinueEdit || (() => {});
      this.onPublish = options.onPublish || (() => {});
      this.initialSceneId = options.initialSceneId || null;
      this.editorViewMode = options.viewMode || 'desktop';
      this.editorCanvasRatio = options.canvasRatio || (this.editorViewMode === 'desktop' ? 'ratio-widescreen' : 'ratio-story');
      this.allAssets = options.allAssets || [];
    }

    this.scenes = (this.project.scenes || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Set initial scene index based on what was selected in edit mode
    this.currentSceneIdx = 0;
    if (this.initialSceneId && this.scenes.length > 0) {
      const idx = this.scenes.findIndex(s => s.id === this.initialSceneId);
      if (idx !== -1) this.currentSceneIdx = idx;
    }

    // Preview-specific viewport mode defaults to matching the active editor mode
    this.previewViewMode = this.editorViewMode;
    this.previewRatio = this.editorCanvasRatio;

    this.isPlaying = true;
    this.timer = null;
    this.bgAudio = null;
    this.keyupHandler = null;
    this._isReplaying = false;
    this.wishes = [];
  }

  async render() {
    try {
      this.wishes = await wishRepository.getApprovedWishes(this.project?.id);
    } catch (e) {
      this.wishes = [];
    }

    const overlay = document.createElement('div');
    overlay.className = 'draft-preview-overlay animate-fade';
    overlay.id = 'draftPreviewRoot';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="player-container" style="width: 96vw; max-width: 1100px; height: 92vh; max-height: 850px; display: flex; flex-direction: column; background: #0c0a17; border: 1px solid var(--border, rgba(255,255,255,0.15)); border-radius: var(--radius-lg, 16px); overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.8); position: relative;">
        <canvas class="confetti-canvas" id="previewConfettiCanvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:99;"></canvas>

        <!-- 1. Top Header Bar with 'Back to Edit' -->
        <div class="player-header-bar" style="height: 54px; padding: 0 16px; background: var(--surface, #141124); border-bottom: 1px solid var(--border, rgba(255,255,255,0.1)); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 20;">
          <!-- Left: Back to Edit -->
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="btn btn-secondary btn-sm" id="btnPreviewBackToEdit" style="display:inline-flex; align-items:center; gap:6px; font-weight:800; padding:6px 12px; background:var(--surface-elevated, #201b38); border:1px solid rgba(255,255,255,0.2);">
              <span>← Back to Edit</span>
            </button>
            <span class="pub-status-badge active" style="background:rgba(127,90,240,0.2); color:#7f5af0; border:1px solid rgba(127,90,240,0.3); font-size:0.75rem; padding:3px 8px; font-weight:700;">
              👁️ Preview Mode (Read-Only)
            </span>
          </div>

          <!-- Center: Viewport Switcher (Preview Only) -->
          <div class="preview-viewport-toggle" style="display:flex; align-items:center; gap:4px; background:rgba(0,0,0,0.4); padding:3px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <button class="btn btn-xs ${this.previewViewMode === 'desktop' ? 'btn-primary' : 'btn-ghost'}" id="btnPreviewToggleDesktop" style="padding:3px 8px; font-size:0.72rem; font-weight:700;">
              🖥️ Desktop (16:9)
            </button>
            <button class="btn btn-xs ${this.previewViewMode === 'mobile' ? 'btn-primary' : 'btn-ghost'}" id="btnPreviewToggleMobile" style="padding:3px 8px; font-size:0.72rem; font-weight:700;">
              📱 Mobile (9:16)
            </button>
          </div>

          <!-- Right: Publish & Close -->
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-primary btn-sm" id="btnPreviewPublishNow" style="font-weight:800; padding:6px 14px;">
              🚀 Publish
            </button>
            <button class="btn btn-ghost btn-icon btn-sm" id="btnPreviewExit" title="Close Preview" style="font-size:1.1rem;">
              ✕
            </button>
          </div>
        </div>

        <!-- 2. Centered Preview Stage with Canvas Viewport Frame -->
        <div class="player-stage-viewport" id="previewStageViewport" style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #17142b 0%, #080710 100%); position: relative; overflow: hidden; padding: 16px;">
          <!-- Populated by renderCurrentScene -->
        </div>

        <!-- 3. Bottom Playback Controls Bar -->
        <div class="player-controls-bar" style="height: 56px; padding: 0 16px; background: var(--surface, #141124); border-top: 1px solid var(--border, rgba(255,255,255,0.1)); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 20;">
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-ghost btn-compact btn-icon" id="btnPrevScene" ${this.currentSceneIdx === 0 ? 'disabled' : ''} title="Previous Scene">
              ⏮️
            </button>
            <button class="btn btn-primary btn-compact" id="btnTogglePlay" style="min-width:80px; font-weight:700; font-size:0.8rem;">
              ${this.isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button class="btn btn-ghost btn-compact btn-icon" id="btnNextScene" ${this.currentSceneIdx >= this.scenes.length - 1 ? 'disabled' : ''} title="Next Scene">
              ⏭️
            </button>
            <button class="btn btn-ghost btn-compact btn-icon" id="btnReplayExperience" data-action="replay" title="Restart from Beginning">
              🔄
            </button>
          </div>

          <!-- Scene Pagination Indicator -->
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-dots" style="display:flex; gap:6px; align-items:center;">
              ${this.scenes.map((s, i) => `
                <span class="player-dot ${i === this.currentSceneIdx ? 'active' : ''}" data-idx="${i}" style="width:8px; height:8px; border-radius:50%; background:${i === this.currentSceneIdx ? 'var(--accent, #7f5af0)' : 'rgba(255,255,255,0.2)'}; cursor:pointer; transition:all 0.2s ease; ${i === this.currentSceneIdx ? 'transform:scale(1.4); background:#7f5af0;' : ''}"></span>
              `).join('')}
            </div>
            <span id="previewSceneCounter" style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">
              Scene ${this.scenes.length > 0 ? this.currentSceneIdx + 1 : 0} of ${this.scenes.length}
            </span>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(overlay);
    await this.renderCurrentScene(overlay);
    this.startAutoPlay(overlay);
    this.playBackgroundMusic();

    Accessibility.trapFocus(overlay);
    return overlay;
  }

  async renderCurrentScene(overlay) {
    const stage = overlay.querySelector('#previewStageViewport');
    if (!stage) return;

    if (!this.scenes || this.scenes.length === 0) {
      stage.innerHTML = `
        <div style="text-align:center; padding:50px 24px; color:var(--text-muted);">
          <div style="font-size:3rem; margin-bottom:10px;">🎬</div>
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--text);">No Scenes to Preview</h3>
          <p style="font-size:0.85rem; margin-top:4px;">Add scenes to your celebration sequence in edit mode.</p>
        </div>
      `;
      return;
    }

    const currentScene = this.scenes[this.currentSceneIdx] || this.scenes[0];
    if (!currentScene) return;

    // Load and resolve assets for the current scene with render URLs
    const sceneAssets = [];
    if (currentScene.assetIds && currentScene.assetIds.length > 0) {
      for (const id of currentScene.assetIds) {
        const asset = (this.allAssets || []).find(a => a.id === id) || await assetRepository.getAsset(id);
        if (asset) {
          try {
            asset.renderUrl = await assetRepository.getRenderableUrl(asset);
          } catch (err) {
            console.warn('Asset render url resolution skipped in preview:', err);
          }
          sceneAssets.push(asset);
        }
      }
    }

    // Render using UniversalSceneRenderer with the exact active style, background, elements, and positions
    const sceneHtml = UniversalSceneRenderer.renderScene(currentScene, this.project, sceneAssets, {
      isPreview: true,
      viewMode: this.previewViewMode,
      wishes: this.wishes
    });

    // Wrap in standard Canvas Viewport Frame matching the exact scale, aspect ratio, and centering of StoryCanvasView
    stage.innerHTML = `
      <div class="canvas-viewport-frame ${this.previewRatio}" id="previewViewportFrame" style="box-shadow:0 16px 48px rgba(0,0,0,0.7); border-radius:12px; overflow:hidden; background:#000; display:flex; align-items:center; justify-content:center; max-width:100%; max-height:100%; width:${this.previewRatio === 'ratio-story' ? 'auto' : '100%'}; height:100%;">
        <div class="story-canvas-viewport" style="width:100%; height:100%; position:relative; overflow:hidden;">
          ${sceneHtml}
        </div>
      </div>
    `;

    // Confetti effect on reveal or wish-wall templates
    const canvas = overlay.querySelector('#previewConfettiCanvas');
    if (canvas && (currentScene.template === 'reveal' || currentScene.template === 'final_wish')) {
      try { ConfettiEngine.launch(canvas); } catch (e) {}
    }

    // Special Animation Scene Engine Initialization
    if (currentScene && currentScene.template && currentScene.template.startsWith('special_')) {
      const viewport = stage.querySelector('.story-canvas-viewport') || stage;
      if (viewport) {
        specialAnimationEngine.initScene(viewport, currentScene, this.project, (opts) => {
          if (opts && opts.replay) {
            this.replayCelebration(overlay);
          } else if (this.currentSceneIdx < this.scenes.length - 1) {
            this.currentSceneIdx++;
            this.renderCurrentScene(overlay);
            this.updateControls(overlay);
            this.startAutoPlay(overlay);
          }
        });
      }
    }

    // Wish Reaction Pills interactive click
    stage.addEventListener('click', (e) => {
      const reactionPill = e.target.closest('.wish-reaction-pill');
      if (reactionPill && !reactionPill.classList.contains('btn-add-reaction')) {
        const countSpan = reactionPill.querySelector('.reaction-count');
        if (countSpan) {
          const currentCount = parseInt(countSpan.textContent, 10) || 0;
          const isReacted = reactionPill.classList.toggle('is-reacted');
          countSpan.textContent = isReacted ? currentCount + 1 : Math.max(0, currentCount - 1);
          reactionPill.style.transform = 'scale(1.3)';
          setTimeout(() => { reactionPill.style.transform = ''; }, 200);
        }
      }
    });

    // Wish Modal trigger on Wish Wall scene in preview
    const btnWishModal = stage.querySelector('#btnOpenLeaveWishModal');
    if (btnWishModal) {
      btnWishModal.addEventListener('click', () => {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        const subModal = new WishSubmissionModal(
          this.project,
          async (newWish) => {
            try {
              this.wishes = await wishRepository.getApprovedWishes(this.project?.id);
            } catch (e) {}
            this.renderCurrentScene(overlay);
          },
          () => {
            if (this.isPlaying) {
              this.startAutoPlay(overlay);
            }
          }
        );
        document.body.appendChild(subModal.render());
      });
    }
  }

  async replayCelebration(overlay) {
    if (this._isReplaying) return;
    this._isReplaying = true;
    setTimeout(() => { this._isReplaying = false; }, 300);

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.isPlaying = true;
    this.currentSceneIdx = 0;

    if (this.bgAudio) {
      try {
        this.bgAudio.currentTime = 0;
        this.bgAudio.play().catch(() => {});
      } catch (e) {}
    } else {
      this.playBackgroundMusic();
    }

    await this.renderCurrentScene(overlay);
    this.updateControls(overlay);
    this.startAutoPlay(overlay);
  }

  startAutoPlay(overlay) {
    if (this.timer) clearTimeout(this.timer);
    if (!this.isPlaying || !this.scenes || this.scenes.length <= 1) return;

    const currentScene = this.scenes[this.currentSceneIdx];
    const isSpecial = currentScene?.template && currentScene.template.startsWith('special_');
    if (isSpecial) return;

    const durationMs = Math.max(2, currentScene?.duration || 6) * 1000;

    this.timer = setTimeout(async () => {
      if (this.currentSceneIdx < this.scenes.length - 1) {
        this.currentSceneIdx++;
        await this.renderCurrentScene(overlay);
        this.updateControls(overlay);
        this.startAutoPlay(overlay);
      } else {
        this.isPlaying = false;
        this.updateControls(overlay);
      }
    }, durationMs);
  }

  updateControls(overlay) {
    const btnPlay = overlay.querySelector('#btnTogglePlay');
    if (btnPlay) {
      btnPlay.innerHTML = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
    }

    const btnPrev = overlay.querySelector('#btnPrevScene');
    if (btnPrev) {
      btnPrev.disabled = this.currentSceneIdx === 0;
    }

    const btnNext = overlay.querySelector('#btnNextScene');
    if (btnNext) {
      btnNext.disabled = this.currentSceneIdx >= this.scenes.length - 1;
    }

    const counter = overlay.querySelector('#previewSceneCounter');
    if (counter) {
      counter.textContent = `Scene ${this.scenes.length > 0 ? this.currentSceneIdx + 1 : 0} of ${this.scenes.length}`;
    }

    const dots = overlay.querySelectorAll('.player-dot');
    dots.forEach((dot, idx) => {
      const active = idx === this.currentSceneIdx;
      dot.classList.toggle('active', active);
      dot.style.background = active ? 'var(--accent, #7f5af0)' : 'rgba(255,255,255,0.2)';
      dot.style.transform = active ? 'scale(1.4)' : 'scale(1)';
    });
  }

  async playBackgroundMusic() {
    if (this.project?.settings?.bgMusicAssetId) {
      try {
        const musicAsset = (this.allAssets || []).find(a => a.id === this.project.settings.bgMusicAssetId) || await assetRepository.getAsset(this.project.settings.bgMusicAssetId);
        if (musicAsset) {
          const url = await assetRepository.getRenderableUrl(musicAsset);
          if (url) {
            this.bgAudio = new Audio(url);
            this.bgAudio.loop = true;
            this.bgAudio.volume = 0.5;
            this.bgAudio.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Background music playback skipped in preview:', err);
      }
    }
  }

  attachEvents(overlay) {
    const handleWishSync = async (detail) => {
      if (!detail || !this.project?.id) return;
      if (detail.projectId && detail.projectId !== this.project.id) return;

      if (detail.action === 'delete' && detail.wishId) {
        this.wishes = this.wishes.filter(w => w.id !== detail.wishId);
      } else {
        this.wishes = await wishRepository.getApprovedWishes(this.project.id);
      }
      const cur = this.scenes[this.currentSceneIdx];
      if (cur && (cur.template === 'wish_wall' || cur.template === 'wish-wall')) {
        this.renderCurrentScene(overlay);
      }
    };

    const onWishSync = (e) => handleWishSync(e.detail);
    window.addEventListener('wish-wall-updated', onWishSync);
    window.addEventListener('wish-deleted', onWishSync);

    const closePreview = () => {
      window.removeEventListener('wish-wall-updated', onWishSync);
      window.removeEventListener('wish-deleted', onWishSync);
      if (this.timer) clearTimeout(this.timer);
      if (this.bgAudio) {
        this.bgAudio.pause();
        this.bgAudio = null;
      }
      specialAnimationEngine.cleanup();
      if (this.keyupHandler) {
        window.removeEventListener('keyup', this.keyupHandler);
        this.keyupHandler = null;
      }
      overlay.remove();
      if (this.onContinueEdit) {
        const selectedId = this.scenes[this.currentSceneIdx]?.id || this.initialSceneId;
        this.onContinueEdit(selectedId);
      }
    };

    // Close on Escape key
    this.keyupHandler = (e) => {
      if (e.key === 'Escape') closePreview();
    };
    window.addEventListener('keyup', this.keyupHandler);

    overlay.addEventListener('click', async (e) => {
      // 1. Return to Edit Mode
      if (e.target.closest('#btnPreviewBackToEdit') || e.target.closest('#btnPreviewExit') || e.target === overlay) {
        closePreview();
        return;
      }

      // 2. Publish Celebration from Preview
      if (e.target.closest('#btnPreviewPublishNow')) {
        if (this.timer) clearTimeout(this.timer);
        if (this.bgAudio) this.bgAudio.pause();
        overlay.remove();
        if (this.onPublish) this.onPublish(this.project);
        return;
      }

      // 3. Viewport Mode Switchers (Desktop vs Mobile Preview)
      if (e.target.closest('#btnPreviewToggleDesktop')) {
        this.previewViewMode = 'desktop';
        this.previewRatio = 'ratio-widescreen';
        overlay.querySelector('#btnPreviewToggleDesktop').className = 'btn btn-xs btn-primary';
        overlay.querySelector('#btnPreviewToggleMobile').className = 'btn btn-xs btn-ghost';
        await this.renderCurrentScene(overlay);
        return;
      }

      if (e.target.closest('#btnPreviewToggleMobile')) {
        this.previewViewMode = 'mobile';
        this.previewRatio = 'ratio-story';
        overlay.querySelector('#btnPreviewToggleMobile').className = 'btn btn-xs btn-primary';
        overlay.querySelector('#btnPreviewToggleDesktop').className = 'btn btn-xs btn-ghost';
        await this.renderCurrentScene(overlay);
        return;
      }

      // 4. Play / Pause Toggle
      if (e.target.closest('#btnTogglePlay')) {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
          this.startAutoPlay(overlay);
        } else if (this.timer) {
          clearTimeout(this.timer);
        }
        this.updateControls(overlay);
        return;
      }

      // 5. Prev Scene
      if (e.target.closest('#btnPrevScene') && this.currentSceneIdx > 0) {
        this.currentSceneIdx--;
        await this.renderCurrentScene(overlay);
        this.updateControls(overlay);
        if (this.isPlaying) this.startAutoPlay(overlay);
        return;
      }

      // 6. Next Scene
      if (e.target.closest('#btnNextScene') && this.currentSceneIdx < this.scenes.length - 1) {
        this.currentSceneIdx++;
        await this.renderCurrentScene(overlay);
        this.updateControls(overlay);
        if (this.isPlaying) this.startAutoPlay(overlay);
        return;
      }

      // 7. Replay Button (from bottom controls bar OR in-scene finale replay button)
      const btnReplay = e.target.closest('#btnReplayExperience') ||
                        e.target.closest('.replay-experience-btn') ||
                        e.target.closest('[data-action="replay"]');
      if (btnReplay) {
        await this.replayCelebration(overlay);
        return;
      }

      // 8. Pagination Dots
      const dot = e.target.closest('.player-dot');
      if (dot) {
        this.currentSceneIdx = parseInt(dot.dataset.idx, 10);
        await this.renderCurrentScene(overlay);
        this.updateControls(overlay);
        if (this.isPlaying) this.startAutoPlay(overlay);
        return;
      }
    });
  }
}

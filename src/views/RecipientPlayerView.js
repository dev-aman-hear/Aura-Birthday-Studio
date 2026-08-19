/**
 * Birthday Studio - Recipient Player View
 * Fullscreen Interactive Recipient Experience with Canvas Viewport Framing,
 * Compact & Dynamic Floating Controls (Mute/Unmute Audio, Previous & Next Scene, Fullscreen),
 * State-Aware Lifecycle Timing (Scene Pause on Modal Open & Exact Remaining Time Resume),
 * Multi-Scene Navigation, Asset Resolution, and Error Boundaries.
 */

import { publishedProjectRepository } from '../services/PublishedProjectRepository.js';
import { assetRepository } from '../services/AssetRepository.js';
import { wishRepository } from '../services/WishRepository.js';
import { ExpiredProjectView } from './ExpiredProjectView.js';
import { CountdownPlayerView } from './CountdownPlayerView.js';
import { CountdownService } from '../services/CountdownService.js';
import { TemplateRegistry } from '../templates/TemplateRegistry.js';
import { ConfettiEngine } from '../utils/Confetti.js';
import { specialAnimationEngine } from '../animations/SpecialAnimationEngine.js';
import { WishSubmissionModal } from './WishSubmissionModal.js';

export class RecipientPlayerView {
  constructor(publicationId) {
    this.publicationId = publicationId;
    this.publicationMeta = null;
    this.publication = null;
    this.project = null;
    this.scenes = [];
    this.allAssets = [];
    this.currentSceneIndex = 0;
    this.isPlaying = true;
    this.sceneTimer = null;
    this.sceneStartTime = null;
    this.currentSceneDurationMs = 0;
    this.remainingSceneDurationMs = 0;
    this.isPausedForModal = false;
    this.isMuted = false;
    this.bgAudio = null;
    this.wishes = [];
    this.hasWelcomed = false;
    this.hasUnlockedCountdown = false;
    this.keydownHandler = null;
    this.fullscreenChangeHandler = null;
    this._isReplaying = false;
  }

  async render() {
    // STEP 1: Metadata Pre-Flight Check
    this.publicationMeta = await publishedProjectRepository.getPublicationMetadata(this.publicationId);

    // STEP 2: Security Gate - Validate publication active state & 7-day expiration
    if (!this.publicationMeta || this.publicationMeta.status !== 'active' || Date.now() >= this.publicationMeta.expiresAt) {
      const expiredView = new ExpiredProjectView(this.publicationMeta);
      return expiredView.render();
    }

    // STEP 3: Load Immutable Published Snapshot Payload
    this.publication = await publishedProjectRepository.getPublishedSnapshot(this.publicationId);
    if (!this.publication || !this.publication.snapshot) {
      const expiredView = new ExpiredProjectView(this.publicationMeta);
      return expiredView.render();
    }

    this.project = this.publication.snapshot;
    this.scenes = [...(this.project.scenes || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Ensure at least 1 scene is present
    if (this.scenes.length === 0) {
      this.scenes = [{
        id: 'scene_default_hero',
        name: 'Celebration Opening',
        template: 'hero',
        order: 0,
        duration: 6,
        elements: []
      }];
    }

    // STEP 4: Resolve Assets & Wishes
    const rawAssets = this.project.assets || (await assetRepository.getAllAssets()) || [];
    this.allAssets = Array.isArray(rawAssets) ? rawAssets : [];
    
    // Resolve render URLs for all assets
    for (const a of this.allAssets) {
      if (a && !a.renderUrl) {
        try {
          a.renderUrl = await assetRepository.getRenderableUrl(a);
        } catch (e) {
          console.warn('Asset render url resolution failed:', e);
        }
      }
    }

    try {
      this.wishes = await wishRepository.getApprovedWishes(this.project.id);
    } catch (e) {
      this.wishes = [];
    }

    // STEP 5: Optional Timezone-Aware Countdown Gate
    if (this.project.countdown?.enabled && !this.hasUnlockedCountdown) {
      const remaining = CountdownService.calculateRemaining(
        this.project.countdown.targetDate,
        this.project.countdown.targetTime,
        this.project.countdown.timezone
      );

      if (!remaining.isExpired && remaining.totalMs > 0) {
        const countdownView = new CountdownPlayerView({
          project: this.project,
          countdown: this.project.countdown,
          onComplete: () => {
            this.hasUnlockedCountdown = true;
            this.reRenderPlayer();
          }
        });
        return countdownView.render();
      }
    }

    // STEP 6: Render Unified Standalone Viewport with Stage & Welcome Overlay
    return this.renderPlayerViewport();
  }

  async reRenderPlayer() {
    const appRoot = document.getElementById('appRoot') || document.body;
    appRoot.innerHTML = '';
    const newElem = await this.render();
    appRoot.appendChild(newElem);
  }

  renderPlayerViewport() {
    const root = document.createElement('div');
    root.className = 'recipient-standalone-viewport animate-fade';
    root.id = 'recipientStandaloneRoot';

    const recipName = this.project?.recipient?.name || 'Someone Special';
    const occasion = this.project?.occasion || 'Birthday';
    const activeScene = this.scenes[this.currentSceneIndex] || this.scenes[0];

    root.innerHTML = `
      <!-- Confetti Canvas Overlay -->
      <canvas class="confetti-canvas" id="playerConfettiCanvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:999;"></canvas>

      <!-- Main Full-Bleed Stage Viewport Area (Zero Padding, Full Viewport) -->
      <div class="recipient-scene-render-area" id="recSceneArea">
        <div class="canvas-viewport-frame ratio-widescreen" id="recCanvasFrame">
          <div class="story-canvas-viewport">
            <!-- Rendered by renderSceneContent -->
          </div>
        </div>
      </div>

      <!-- Top Compact Floating Action Bar (Top-Right: Mute/Unmute & Fullscreen) -->
      <div class="recipient-top-controls" id="recTopControls">
        <button class="recipient-compact-btn" id="btnRecToggleAudio" title="Mute / Unmute Audio" aria-label="Toggle Audio Mute">
          <!-- Unmuted Icon -->
          <svg class="audio-icon-unmuted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <!-- Muted Icon -->
          <svg class="audio-icon-muted" style="display:none;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        </button>

        <button class="recipient-compact-btn recipient-fullscreen-btn" id="btnRecFullscreen" title="Toggle Fullscreen (F)" aria-label="Toggle Fullscreen">
          <svg class="fs-icon-enter" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg class="fs-icon-exit" style="display:none;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
      </div>

      <!-- Compact Dynamic Floating Left Control: Previous Scene (‹) -->
      <button class="recipient-compact-btn recipient-floating-nav nav-prev" id="btnRecNavPrev" title="Previous Scene (←)" aria-label="Previous Scene">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Compact Dynamic Floating Right Control: Next Scene (›) -->
      <button class="recipient-compact-btn recipient-floating-nav nav-next" id="btnRecNavNext" title="Next Scene (→)" aria-label="Next Scene">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Welcome Overlay Screen (Dismissed on Start) -->
      ${!this.hasWelcomed ? this.renderWelcomeOverlayHtml(recipName, occasion) : ''}
    `;

    // Render initial scene content into stage
    this.renderSceneContent(root, activeScene);
    this.updateControls(root);
    this.attachEvents(root);

    // If already welcomed (e.g. countdown completed or replay), start autoplay immediately
    if (this.hasWelcomed) {
      this.playScene(this.currentSceneIndex);
      this.startBackgroundMusic();
    }

    return root;
  }

  renderWelcomeOverlayHtml(recipientName, occasion) {
    const creatorName = this.project?.creatorDisplayName || this.project?.creator?.name || 'Someone Special';
    const occ = (occasion || 'birthday').toLowerCase();

    let titleText = `Happy Birthday, ${recipientName}! 🎂`;
    if (occ === 'wedding') titleText = `Happy Wedding, ${recipientName}! 💍`;
    else if (occ === 'anniversary') titleText = `Happy Anniversary, ${recipientName}! ❤️`;
    else if (occ === 'graduation') titleText = `Congratulations, ${recipientName}! 🎓`;
    else if (occ === 'congratulations') titleText = `Congratulations, ${recipientName}! 🎉`;
    else if (occ === 'babyshower' || occ === 'baby_shower') titleText = `Welcome Baby & ${recipientName}! 🍼`;
    else titleText = `Happy ${this.project?.occasion || 'Celebration'}, ${recipientName}! ✨`;

    return `
      <div class="recipient-welcome-overlay" id="recWelcomeOverlay">
        <div class="recipient-welcome-card animate-pop">
          <div style="font-size:0.8rem; font-weight:800; color:var(--accent-gold, #f6c90e); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;">
            ✨ A SPECIAL CELEBRATION EXPERIENCE ✨
          </div>

          <h1 style="font-size:2.2rem; font-weight:900; line-height:1.2; margin-bottom:12px; color:#ffffff;" id="welcomeRecipTitle">
            ${titleText}
          </h1>

          <p style="font-size:1rem; color:var(--text-muted, #94a1b2); margin-bottom:28px; line-height:1.5;">
            A personal celebration story crafted especially for you by <strong style="color:#ffffff;">${creatorName}</strong>.
          </p>

          <button class="btn btn-primary btn-lg" id="btnStartCelebration" style="min-height:52px; min-width:220px; font-size:1.1rem; font-weight:800; box-shadow:0 8px 32px rgba(127,90,240,0.5); cursor:pointer;">
            Begin Celebration ✨
          </button>
        </div>
      </div>
    `;
  }

  renderSceneContent(root, scene) {
    const area = root.querySelector('#recSceneArea .story-canvas-viewport') || root.querySelector('#recSceneArea');
    if (!area || !scene) return;

    try {
      // Gather relevant assets for this scene
      const sceneAssets = [];
      if (scene.assetIds && scene.assetIds.length > 0) {
        for (const id of scene.assetIds) {
          const a = (this.allAssets || []).find(item => item.id === id);
          if (a) sceneAssets.push(a);
        }
      } else {
        sceneAssets.push(...this.allAssets);
      }

      const sceneContent = TemplateRegistry.renderScene(scene, this.project, sceneAssets, {
        wishes: this.wishes,
        isPreview: false,
        isRecipientView: true
      });

      if (typeof sceneContent === 'string') {
        area.innerHTML = sceneContent;
      } else if (sceneContent instanceof Node) {
        area.innerHTML = '';
        area.appendChild(sceneContent);
      } else {
        area.innerHTML = `<div style="padding:40px; text-align:center;"><h2>${scene.name || 'Celebration'}</h2><p>${scene.description || ''}</p></div>`;
      }
    } catch (renderErr) {
      console.error('[RecipientPlayer] Error rendering scene:', renderErr);
      area.innerHTML = `
        <div class="recipient-scene-error-card">
          <div style="font-size:2.5rem; margin-bottom:8px;">⚠️</div>
          <h3 style="font-size:1.2rem; font-weight:800; color:#fff;">Unable to load this scene</h3>
          <p style="color:var(--text-muted, #94a1b2); font-size:0.85rem; margin-top:4px;">We ran into an issue displaying this memory card.</p>
          <div style="margin-top:16px; display:flex; justify-content:center; gap:8px;">
            <button class="btn btn-secondary btn-sm" id="btnRetryScene">🔄 Try Again</button>
            <button class="btn btn-primary btn-sm" id="btnReturnFirstScene">⏮️ Return to Beginning</button>
          </div>
        </div>
      `;

      area.querySelector('#btnRetryScene')?.addEventListener('click', () => {
        this.playScene(this.currentSceneIndex);
      });
      area.querySelector('#btnReturnFirstScene')?.addEventListener('click', () => {
        this.playScene(0);
      });
    }

    // Confetti effect on reveal or finale scenes
    if (scene.template === 'final_wish' || scene.template === 'reveal') {
      const canvas = root.querySelector('#playerConfettiCanvas');
      if (canvas) {
        try { ConfettiEngine.launch(canvas); } catch (e) {}
      }
    }

    // Special Animation Scene Engine Initialization
    if (scene.template && scene.template.startsWith('special_')) {
      specialAnimationEngine.initScene(area, scene, this.project, (opts) => {
        if (opts && opts.replay) {
          this.replayCelebration();
        } else if (this.currentSceneIndex < this.scenes.length - 1) {
          this.playScene(this.currentSceneIndex + 1);
        }
      });
    }
  }

  playScene(index) {
    if (!this.scenes || this.scenes.length === 0) return;
    if (index < 0 || index >= this.scenes.length) return;

    this.currentSceneIndex = index;
    if (this.sceneTimer) {
      clearTimeout(this.sceneTimer);
      this.sceneTimer = null;
    }

    const root = document.getElementById('recipientStandaloneRoot');
    if (root) {
      this.renderSceneContent(root, this.scenes[index]);
      this.updateControls(root);
    }

    const durationSec = Math.max(2, this.scenes[index].duration || 6);
    this.currentSceneDurationMs = durationSec * 1000;
    this.remainingSceneDurationMs = this.currentSceneDurationMs;
    this.sceneStartTime = Date.now();
    this.isPausedForModal = false;

    // Set auto-advance timer if playback is active and not an interactive special scene
    const isSpecial = this.scenes[index].template && this.scenes[index].template.startsWith('special_');
    if (this.isPlaying && !isSpecial) {
      this.sceneTimer = setTimeout(() => {
        if (this.currentSceneIndex < this.scenes.length - 1) {
          this.playScene(this.currentSceneIndex + 1);
        } else {
          this.isPlaying = false;
          if (root) this.updateControls(root);
        }
      }, this.currentSceneDurationMs);
    }
  }

  pauseForModal() {
    if (this.isPausedForModal) return;
    this.isPausedForModal = true;

    // Calculate exact remaining time
    const elapsed = Date.now() - (this.sceneStartTime || Date.now());
    this.remainingSceneDurationMs = Math.max(1000, this.currentSceneDurationMs - elapsed);

    // Stop active timer
    if (this.sceneTimer) {
      clearTimeout(this.sceneTimer);
      this.sceneTimer = null;
    }
  }

  resumeFromModal() {
    if (!this.isPausedForModal) return;
    this.isPausedForModal = false;

    this.sceneStartTime = Date.now();
    this.currentSceneDurationMs = this.remainingSceneDurationMs;

    const activeScene = this.scenes[this.currentSceneIndex];
    const isSpecial = activeScene?.template && activeScene.template.startsWith('special_');
    const root = document.getElementById('recipientStandaloneRoot');

    if (this.isPlaying && !isSpecial) {
      this.sceneTimer = setTimeout(() => {
        if (this.currentSceneIndex < this.scenes.length - 1) {
          this.playScene(this.currentSceneIndex + 1);
        } else {
          this.isPlaying = false;
          if (root) this.updateControls(root);
        }
      }, this.remainingSceneDurationMs);
    }
  }

  replayCelebration() {
    if (this._isReplaying) return;
    this._isReplaying = true;
    setTimeout(() => { this._isReplaying = false; }, 300);

    if (this.sceneTimer) {
      clearTimeout(this.sceneTimer);
      this.sceneTimer = null;
    }

    this.isPlaying = true;
    this.currentSceneIndex = 0;

    if (this.bgAudio) {
      try {
        this.bgAudio.currentTime = 0;
        this.bgAudio.play().catch(() => {});
      } catch (e) {}
    } else {
      this.startBackgroundMusic();
    }

    const canvas = document.getElementById('playerConfettiCanvas');
    if (canvas && (this.scenes[0]?.template === 'hero' || this.scenes[0]?.template === 'reveal')) {
      try { ConfettiEngine.launch(canvas); } catch (e) {}
    }

    this.playScene(0);
  }

  updateControls(root) {
    const targetRoot = root || document.getElementById('recipientStandaloneRoot') || document;
    const currentScene = this.scenes[this.currentSceneIndex] || {};

    // Check if the current scene is a cinematic outro / finale that contains an in-scene replay button
    const hasInSceneReplay =
      currentScene.template === 'special_emotional_finale' ||
      currentScene.template === 'final_wish' ||
      (currentScene.template && (currentScene.template.includes('finale') || currentScene.template.includes('outro'))) ||
      !!targetRoot.querySelector('#btn-watch-again') ||
      !!targetRoot.querySelector('#btnReplayExperience') ||
      !!targetRoot.querySelector('.scene10-replay-btn') ||
      !!targetRoot.querySelector('.replay-experience-btn') ||
      !!targetRoot.querySelector('[data-action="replay"]');

    // 1. Previous Scene Button: Hide on First Scene OR on Cinematic Outro with Replay Button
    const btnPrev = targetRoot.querySelector('#btnRecNavPrev');
    if (btnPrev) {
      const isFirst = this.currentSceneIndex <= 0;
      const shouldHidePrev = isFirst || hasInSceneReplay;
      btnPrev.disabled = shouldHidePrev;
      btnPrev.classList.toggle('is-hidden', shouldHidePrev);
      btnPrev.setAttribute('aria-hidden', shouldHidePrev ? 'true' : 'false');
    }

    // 2. Next Scene Button (Dynamic Boundary Check)
    const btnNext = targetRoot.querySelector('#btnRecNavNext');
    if (btnNext) {
      const isLast = this.currentSceneIndex >= (this.scenes.length - 1);
      btnNext.disabled = isLast;
      btnNext.classList.toggle('is-hidden', isLast);
      btnNext.setAttribute('aria-hidden', isLast ? 'true' : 'false');
    }

    // 3. Audio Mute State Icon
    const btnAudio = targetRoot.querySelector('#btnRecToggleAudio');
    if (btnAudio) {
      const unmutedIcon = btnAudio.querySelector('.audio-icon-unmuted');
      const mutedIcon = btnAudio.querySelector('.audio-icon-muted');
      if (unmutedIcon) unmutedIcon.style.display = this.isMuted ? 'none' : 'block';
      if (mutedIcon) mutedIcon.style.display = this.isMuted ? 'block' : 'none';
      btnAudio.title = this.isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)';
      btnAudio.setAttribute('aria-label', this.isMuted ? 'Unmute Audio' : 'Mute Audio');
    }

    // 4. Fullscreen State Icon
    const btnFull = targetRoot.querySelector('#btnRecFullscreen');
    if (btnFull) {
      const isFs = !!document.fullscreenElement;
      const enterIcon = btnFull.querySelector('.fs-icon-enter');
      const exitIcon = btnFull.querySelector('.fs-icon-exit');
      if (enterIcon) enterIcon.style.display = isFs ? 'none' : 'block';
      if (exitIcon) exitIcon.style.display = isFs ? 'block' : 'none';
      btnFull.title = isFs ? 'Exit Fullscreen (F)' : 'Toggle Fullscreen (F)';
      btnFull.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Toggle Fullscreen');
    }
  }

  async startBackgroundMusic() {
    if (this.bgAudio || !this.project?.settings?.bgMusicAssetId) return;

    try {
      const musicAsset = (this.allAssets || []).find(a => a.id === this.project.settings.bgMusicAssetId);
      if (musicAsset) {
        const url = musicAsset.renderUrl || await assetRepository.getRenderableUrl(musicAsset);
        if (url) {
          this.bgAudio = new Audio(url);
          this.bgAudio.loop = true;
          this.bgAudio.muted = this.isMuted;
          this.bgAudio.volume = this.isMuted ? 0 : 0.5;
          this.bgAudio.play().catch(err => {
            console.warn('[RecipientPlayer] Autoplay blocked by browser:', err);
          });
        }
      }
    } catch (err) {
      console.warn('[RecipientPlayer] Background audio error:', err);
    }
  }

  attachEvents(root) {
    // 1. Begin Celebration Action (Dismisses Overlay)
    const btnStart = root.querySelector('#btnStartCelebration');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.hasWelcomed = true;
        const overlay = root.querySelector('#recWelcomeOverlay');
        if (overlay) {
          overlay.classList.add('dismissed');
          setTimeout(() => overlay.remove(), 450);
        }

        // Launch Celebration
        const canvas = root.querySelector('#playerConfettiCanvas');
        if (canvas) {
          try { ConfettiEngine.launch(canvas); } catch (e) {}
        }

        this.startBackgroundMusic();
        this.playScene(0);
      });
    }

    // 2. Click Actions (In-scene buttons, Floating Nav, Audio Toggle, Fullscreen)
    root.addEventListener('click', (e) => {
      // If modal is open, prevent scene navigation
      if (this.isPausedForModal) return;

      // Dynamic Left Navigation: Previous Scene
      const btnPrev = e.target.closest('#btnRecNavPrev') || e.target.closest('.nav-prev');
      if (btnPrev && this.currentSceneIndex > 0) {
        this.playScene(this.currentSceneIndex - 1);
        return;
      }

      // Dynamic Right Navigation: Next Scene
      const btnNext = e.target.closest('#btnRecNavNext') || e.target.closest('.nav-next');
      if (btnNext && this.currentSceneIndex < this.scenes.length - 1) {
        this.playScene(this.currentSceneIndex + 1);
        return;
      }

      // Audio Mute/Unmute Action
      const btnAudio = e.target.closest('#btnRecToggleAudio');
      if (btnAudio) {
        this.isMuted = !this.isMuted;
        if (this.bgAudio) {
          this.bgAudio.muted = this.isMuted;
          this.bgAudio.volume = this.isMuted ? 0 : 0.5;
        }
        this.updateControls(root);
        return;
      }

      // Fullscreen Toggle Action
      const btnFull = e.target.closest('#btnRecFullscreen') || e.target.closest('.recipient-fullscreen-btn');
      if (btnFull) {
        try {
          if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen();
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }
        } catch (fsErr) {
          console.warn('[RecipientPlayer] Fullscreen toggle error:', fsErr);
        }
        return;
      }

      // Wish Reaction Pills interactive click
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
        return;
      }

      // Leave Wish Button inside scene (Wish Wall Scene)
      const btnLeaveWish = e.target.closest('#btnOpenLeaveWishModal') || e.target.closest('.leave-wish-trigger-btn') || e.target.closest('.wish-wall-cta-btn');
      if (btnLeaveWish) {
        // 1. Immediately pause the scene timer & progression
        this.pauseForModal();

        // 2. Open redesigned modal with callbacks
        const subModal = new WishSubmissionModal(
          this.project,
          async (newWish) => {
            if (newWish && newWish.status === 'approved') {
              this.wishes.unshift(newWish);
            }
            // Dynamically refresh scene content so new wish appears live on the wall
            const standaloneRoot = document.getElementById('recipientStandaloneRoot');
            if (standaloneRoot && this.scenes[this.currentSceneIndex]) {
              this.renderSceneContent(standaloneRoot, this.scenes[this.currentSceneIndex]);
            }
          },
          () => {
            // 3. Resume scene playback with exact remaining time when modal closes
            this.resumeFromModal();
          }
        );
        document.body.appendChild(subModal.render());
        return;
      }

      // Replay Action (from in-scene finale replay button)
      const btnReplay = e.target.closest('#btnReplayExperience') ||
                        e.target.closest('#btn-watch-again') ||
                        e.target.closest('.replay-experience-btn') ||
                        e.target.closest('[data-action="replay"]');
      if (btnReplay) {
        this.replayCelebration();
        return;
      }
    });

    // 3. Fullscreen Change Event for Dynamic Icon Toggle
    this.fullscreenChangeHandler = () => {
      this.updateControls(root);
    };
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);

    // 4. Keyboard Shortcuts (Left/Right Arrows, Spacebar, M for Mute, F for Fullscreen)
    this.keydownHandler = (e) => {
      if (this.isPausedForModal) return;

      if (e.key === 'ArrowRight' && this.currentSceneIndex < this.scenes.length - 1) {
        this.playScene(this.currentSceneIndex + 1);
      } else if (e.key === 'ArrowLeft' && this.currentSceneIndex > 0) {
        const currentScene = this.scenes[this.currentSceneIndex] || {};
        const isOutro = currentScene.template === 'special_emotional_finale' || currentScene.template === 'final_wish';
        if (!isOutro) {
          this.playScene(this.currentSceneIndex - 1);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          this.isMuted = !this.isMuted;
          if (this.bgAudio) {
            this.bgAudio.muted = this.isMuted;
            this.bgAudio.volume = this.isMuted ? 0 : 0.5;
          }
          this.updateControls(root);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
          this.isPlaying = !this.isPlaying;
          if (this.isPlaying) this.playScene(this.currentSceneIndex);
          else if (this.sceneTimer) clearTimeout(this.sceneTimer);
        }
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }
}

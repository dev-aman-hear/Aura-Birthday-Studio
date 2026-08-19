/**
 * Birthday Studio - Dedicated Wish Wall Preview Modal
 * Full-featured interactive previewer for Wish Wall scenes & public link experience.
 * Supports Desktop (16:9) vs Mobile (9:16) viewport modes, live theme switching,
 * sample volume simulations, interactive reactions, and guest submission testing.
 */

import { renderWishWallSceneTemplate, WishWallSceneTemplate } from '../templates/WishWallSceneTemplate.js';
import { wishRepository } from '../services/WishRepository.js';
import { WishSubmissionModal } from './WishSubmissionModal.js';
import { Toast } from '../utils/Toast.js';

export class WishWallPreviewModal {
  constructor(options = {}) {
    this.project = JSON.parse(JSON.stringify(options.project || {}));
    this.scene = options.scene ? JSON.parse(JSON.stringify(options.scene)) : (this.project.scenes?.find(s => s.template === 'wish_wall' || s.template === 'wish-wall') || {
      id: 'sc_wish_wall_preview',
      name: 'Wish Wall',
      template: 'wish_wall',
      settings: {}
    });

    this.onClose = options.onClose || (() => {});
    this.onPublish = options.onPublish || (() => {});
    this.onOpenModeration = options.onOpenModeration || (() => {});

    this.viewMode = options.viewMode || 'desktop'; // 'desktop' | 'mobile'
    this.currentTheme = this.scene.settings?.wallTheme || this.project.wishWall?.theme || 'glassmorphic';
    this.currentLayout = this.scene.settings?.wallLayout || this.project.wishWall?.layout || 'grid';
    const hasSampleWishes = this.scene.settings?.includeSampleWishes === true || this.project.wishWall?.includeSampleWishes === true;
    this.sampleVolume = hasSampleWishes ? 'standard' : 'empty'; // 'standard' (4), 'crowded' (12), 'empty' (0), 'live'
    this.liveWishes = [];
    this.testWishes = [];
  }

  async loadLiveWishes() {
    if (this.project.id) {
      try {
        this.liveWishes = await wishRepository.getApprovedWishes(this.project.id);
      } catch (e) {
        this.liveWishes = [];
      }
    }
  }

  getResolvedWishes() {
    if (this.sampleVolume === 'empty') {
      return [];
    }

    if (this.sampleVolume === 'live') {
      return [...this.testWishes, ...this.liveWishes];
    }

    if (Array.isArray(this.scene.settings?.sampleWishes) && this.scene.settings.sampleWishes.length > 0) {
      return [...this.testWishes, ...this.scene.settings.sampleWishes];
    }

    const recipientName = this.project.recipient?.name || 'Someone Special';
    const occasion = this.project.occasion || 'birthday';
    const occUpper = occasion.charAt(0).toUpperCase() + occasion.slice(1);

    const baseSamples = [
      {
        id: 'sample_1',
        name: 'Grandma & Grandpa',
        relationship: 'Family',
        isAnonymous: false,
        isPinned: true,
        message: `Dearest ${recipientName}, you bring so much sunshine and pride to our lives every single day. Wishing you endless blessings, good health, and wonderful happiness! ❤️✨`,
        reactions: { '❤️': 18, '🙏': 12, '🎉': 8 },
        createdAt: Date.now() - 1000 * 60 * 45
      },
      {
        id: 'sample_2',
        name: 'The Office Squad',
        relationship: 'Colleagues',
        isAnonymous: false,
        isPinned: false,
        message: `Happy ${occUpper}! Thanks for always being the most positive and inspiring teammate. Hope you enjoy the celebration! 🥂🎉🎈`,
        reactions: { '🎉': 15, '🥂': 9 },
        createdAt: Date.now() - 1000 * 60 * 120
      },
      {
        id: 'sample_3',
        name: 'Secret Well-Wisher',
        relationship: 'Friend',
        isAnonymous: true,
        isPinned: false,
        message: `Keep dreaming big and shining bright! May every wish you make today come true. 🌟🎂`,
        reactions: { '🌟': 14, '🎂': 10 },
        createdAt: Date.now() - 1000 * 60 * 240
      },
      {
        id: 'sample_4',
        name: 'Best Friends',
        relationship: 'Friends',
        isAnonymous: false,
        isPinned: false,
        message: `To another incredible year of late-night talks, spontaneous road trips, and endless laughter! Cheers to you! 🥳💖✨`,
        reactions: { '❤️': 22, '🎉': 16, '✨': 11 },
        createdAt: Date.now() - 1000 * 60 * 360
      }
    ];

    if (this.sampleVolume === 'crowded') {
      const extraSamples = [
        {
          id: 'sample_5',
          name: 'Family Member',
          relationship: 'Family',
          isAnonymous: false,
          isPinned: false,
          message: `Wishing you another year of grand adventures, great achievements, and peaceful days! 🎂`,
          reactions: { '🎂': 6, '👏': 4 },
          createdAt: Date.now() - 1000 * 60 * 480
        },
        {
          id: 'sample_6',
          name: 'Close Friend',
          relationship: 'Friends',
          isAnonymous: false,
          isPinned: false,
          message: `Can't believe how time flies! Celebrating you today and always. Love you so much! 💕`,
          reactions: { '❤️': 19 },
          createdAt: Date.now() - 1000 * 60 * 600
        },
        {
          id: 'sample_7',
          name: 'Friendly Neighbors',
          relationship: 'Neighbors',
          isAnonymous: false,
          isPinned: false,
          message: `Have the happiest celebration ever! Sending lots of love from our family to yours. 🎈🎊`,
          reactions: { '🎉': 7, '✨': 5 },
          createdAt: Date.now() - 1000 * 60 * 720
        },
        {
          id: 'sample_8',
          name: 'Mentor',
          relationship: 'Mentor',
          isAnonymous: false,
          isPinned: false,
          message: `A very Happy ${occUpper}! May your future be filled with wisdom, success, and continuous discovery. 🌟`,
          reactions: { '🌟': 8, '👏': 6 },
          createdAt: Date.now() - 1000 * 60 * 900
        }
      ];
      return [...this.testWishes, ...baseSamples, ...extraSamples];
    }

    return [...this.testWishes, ...baseSamples];
  }

  async render() {
    await this.loadLiveWishes();

    const overlay = document.createElement('div');
    overlay.className = 'draft-preview-overlay wish-wall-preview-modal-overlay animate-fade';
    overlay.id = 'wishWallPreviewRoot';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const recipientName = this.project.recipient?.name || 'Someone Special';

    overlay.innerHTML = `
      <div class="player-container wish-wall-preview-container" style="width: 96vw; max-width: 1140px; height: 92vh; max-height: 880px; display: flex; flex-direction: column; background: #0c0a17; border: 1px solid var(--border, rgba(255,255,255,0.15)); border-radius: var(--radius-lg, 18px); overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.85); position: relative;">
        
        <!-- 1. Top Preview Navigation Bar -->
        <div class="player-header-bar" style="height: 56px; padding: 0 18px; background: var(--surface, #141124); border-bottom: 1px solid var(--border, rgba(255,255,255,0.1)); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 20;">
          
          <!-- Left: Back to Edit -->
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="btn btn-secondary btn-sm" id="btnPreviewWallBack" style="display:inline-flex; align-items:center; gap:6px; font-weight:800; padding:6px 12px; background:var(--surface-elevated, #201b38); border:1px solid rgba(255,255,255,0.2);">
              <span>← Back to Edit</span>
            </button>
            <span class="pub-status-badge active" style="background:rgba(127,90,240,0.2); color:#a29bfe; border:1px solid rgba(127,90,240,0.4); font-size:0.75rem; padding:3px 10px; font-weight:800; border-radius:12px;">
              💌 Wish Wall Preview (Interactive)
            </span>
          </div>

          <!-- Center: Interactive Viewport Mode Toggle -->
          <div class="preview-viewport-toggle" style="display:flex; align-items:center; gap:4px; background:rgba(0,0,0,0.4); padding:3px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <button class="btn btn-xs ${this.viewMode === 'desktop' ? 'btn-primary' : 'btn-ghost'}" id="btnToggleWallDesktop" style="padding:4px 10px; font-size:0.75rem; font-weight:700;">
              🖥️ Desktop View
            </button>
            <button class="btn btn-xs ${this.viewMode === 'mobile' ? 'btn-primary' : 'btn-ghost'}" id="btnToggleWallMobile" style="padding:4px 10px; font-size:0.75rem; font-weight:700;">
              📱 Mobile (9:16)
            </button>
          </div>

          <!-- Right: Action Buttons -->
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-ghost btn-sm" id="btnPreviewOpenMod" title="Open Creator Moderation Studio" style="font-weight:700; font-size:0.8rem;">
              ⚙️ Moderation
            </button>
            <button class="btn btn-primary btn-sm" id="btnPreviewWallPublish" style="font-weight:800; padding:6px 14px;">
              🚀 Publish & Share
            </button>
            <button class="btn btn-ghost btn-icon btn-sm" id="btnPreviewWallExit" title="Close Preview" style="font-size:1.1rem;">
              ✕
            </button>
          </div>
        </div>

        <!-- 2. Interactive Testing Controls Strip (Theme, Layout, Sample Volume) -->
        <div style="padding: 8px 18px; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: 0.78rem;">
          
          <!-- Theme Preview Pill Selector -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--text-muted, rgba(255,255,255,0.6)); font-weight:700;">🎨 Theme:</span>
            <select class="form-input" id="selPreviewWallTheme" style="padding:3px 8px; font-size:0.75rem; border-radius:6px; background:#1c1830; color:#fff; border:1px solid rgba(255,255,255,0.15);">
              <option value="glassmorphic" ${this.currentTheme === 'glassmorphic' ? 'selected' : ''}>🪟 Frosted Glassmorphism</option>
              <option value="sticky-notes" ${this.currentTheme === 'sticky-notes' ? 'selected' : ''}>📌 Sticky Notes Pinboard</option>
              <option value="midnight-gold" ${this.currentTheme === 'midnight-gold' ? 'selected' : ''}>👑 Midnight & Gold</option>
              <option value="festive-neon" ${this.currentTheme === 'festive-neon' ? 'selected' : ''}>🎆 Festive Neon Glow</option>
              <option value="clean-minimal" ${this.currentTheme === 'clean-minimal' ? 'selected' : ''}>📄 Clean Minimal</option>
            </select>
          </div>

          <!-- Layout Preview Selector -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--text-muted, rgba(255,255,255,0.6)); font-weight:700;">📐 Layout:</span>
            <select class="form-input" id="selPreviewWallLayout" style="padding:3px 8px; font-size:0.75rem; border-radius:6px; background:#1c1830; color:#fff; border:1px solid rgba(255,255,255,0.15);">
              <option value="grid" ${this.currentLayout === 'grid' ? 'selected' : ''}>Responsive Grid</option>
              <option value="masonry" ${this.currentLayout === 'masonry' ? 'selected' : ''}>Masonry Flow</option>
              <option value="pinboard" ${this.currentLayout === 'pinboard' ? 'selected' : ''}>Angled Pinboard</option>
              <option value="spotlight" ${this.currentLayout === 'spotlight' ? 'selected' : ''}>Spotlight List</option>
            </select>
          </div>

          <!-- Sample Volume Testing Pills -->
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="color:var(--text-muted, rgba(255,255,255,0.6)); font-weight:700;">🧪 Data Preview:</span>
            <button class="btn btn-xs ${this.sampleVolume === 'standard' ? 'btn-primary' : 'btn-ghost'}" id="btnSampleVolStandard" style="padding:2px 8px; font-size:0.72rem;">
              4 Wishes
            </button>
            <button class="btn btn-xs ${this.sampleVolume === 'crowded' ? 'btn-primary' : 'btn-ghost'}" id="btnSampleVolCrowded" style="padding:2px 8px; font-size:0.72rem;">
              12 Wishes
            </button>
            <button class="btn btn-xs ${this.sampleVolume === 'empty' ? 'btn-primary' : 'btn-ghost'}" id="btnSampleVolEmpty" style="padding:2px 8px; font-size:0.72rem;">
              0 (Empty)
            </button>
            <button class="btn btn-xs ${this.sampleVolume === 'live' ? 'btn-primary' : 'btn-ghost'}" id="btnSampleVolLive" style="padding:2px 8px; font-size:0.72rem;">
              Live Data (${this.liveWishes.length})
            </button>
          </div>
        </div>

        <!-- 3. Centered Stage Frame (Responsive Desktop / Smartphone Frame) -->
        <div class="player-stage-viewport" id="previewWallStageViewport" style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #151226 0%, #080710 100%); position: relative; overflow: hidden; padding: 18px;">
          <!-- Populated by renderStageContent -->
        </div>
      </div>
    `;

    this.renderStageContent(overlay);
    this.attachEvents(overlay);
    return overlay;
  }

  renderStageContent(overlay) {
    const stage = overlay.querySelector('#previewWallStageViewport');
    if (!stage) return;

    stage.innerHTML = '';

    const isMobile = this.viewMode === 'mobile';
    const resolvedWishes = this.getResolvedWishes();

    // Clone scene and apply currently selected preview settings
    const scenePreviewCopy = JSON.parse(JSON.stringify(this.scene));
    scenePreviewCopy.settings = {
      ...(scenePreviewCopy.settings || {}),
      wallTheme: this.currentTheme,
      wallLayout: this.currentLayout
    };

    const projectPreviewCopy = JSON.parse(JSON.stringify(this.project));
    projectPreviewCopy.wishWall = {
      ...(projectPreviewCopy.wishWall || {}),
      theme: this.currentTheme,
      layout: this.currentLayout
    };

    // Render Wish Wall Scene Template HTML
    const wallHtml = renderWishWallSceneTemplate(scenePreviewCopy, projectPreviewCopy, [], {
      wishes: resolvedWishes,
      isPreview: true
    });

    const frame = document.createElement('div');
    frame.className = `canvas-viewport-frame ${isMobile ? 'ratio-story' : 'ratio-widescreen'}`;
    frame.id = 'previewWallCanvasFrame';
    frame.style.width = isMobile ? '380px' : '100%';
    frame.style.maxWidth = isMobile ? '380px' : '1000px';
    frame.style.height = isMobile ? '680px' : '100%';
    frame.style.maxHeight = isMobile ? '680px' : '620px';
    frame.style.borderRadius = isMobile ? '32px' : '16px';
    frame.style.border = isMobile ? '8px solid #232038' : '1px solid rgba(255,255,255,0.12)';
    frame.style.boxShadow = isMobile ? '0 16px 50px rgba(0,0,0,0.8), 0 0 20px rgba(127,90,240,0.2)' : '0 12px 40px rgba(0,0,0,0.6)';
    frame.style.overflow = 'hidden';
    frame.style.display = 'flex';
    frame.style.position = 'relative';

    frame.innerHTML = wallHtml;
    stage.appendChild(frame);

    // Attach interactive reaction and submission listeners within preview stage
    frame.addEventListener('click', (e) => {
      // 1. Reaction Pills click
      const reactionPill = e.target.closest('.wish-reaction-pill');
      if (reactionPill && !reactionPill.classList.contains('btn-add-reaction')) {
        const countSpan = reactionPill.querySelector('.reaction-count');
        if (countSpan) {
          const currentCount = parseInt(countSpan.textContent, 10) || 0;
          const isReacted = reactionPill.classList.toggle('is-reacted');
          countSpan.textContent = isReacted ? currentCount + 1 : Math.max(0, currentCount - 1);
          reactionPill.style.transform = 'scale(1.35)';
          setTimeout(() => { reactionPill.style.transform = ''; }, 200);
        }
        return;
      }

      // 2. Add New Reaction button on card
      const btnAddReaction = e.target.closest('.btn-add-reaction');
      if (btnAddReaction) {
        const bar = btnAddReaction.closest('.wish-reactions-bar');
        if (bar) {
          const newPill = document.createElement('button');
          newPill.className = 'wish-reaction-pill is-reacted';
          newPill.title = 'You reacted with ❤️';
          newPill.innerHTML = `<span>❤️</span><span class="reaction-count">1</span>`;
          bar.insertBefore(newPill, btnAddReaction);
          Toast.show('❤️ Reaction added!', 'info');
        }
        return;
      }

      // 3. "Leave a Wish" Button in Preview (Simulates guest submission live!)
      const btnLeaveWish = e.target.closest('#btnOpenLeaveWishModal');
      if (btnLeaveWish) {
        const subModal = new WishSubmissionModal(this.project, (newWish) => {
          if (newWish) {
            this.testWishes.unshift(newWish);
            this.renderStageContent(overlay);
            Toast.show('💌 Test wish posted to preview wall!', 'success');
          }
        });
        document.body.appendChild(subModal.render());
        return;
      }
    });
  }

  attachEvents(overlay) {
    const rerenderStage = () => {
      this.renderStageContent(overlay);
    };

    // Close Actions
    const closePreview = () => {
      overlay.remove();
      if (typeof this.onClose === 'function') this.onClose();
    };

    overlay.querySelector('#btnPreviewWallBack')?.addEventListener('click', closePreview);
    overlay.querySelector('#btnPreviewWallExit')?.addEventListener('click', closePreview);

    // Publish & Share action
    overlay.querySelector('#btnPreviewWallPublish')?.addEventListener('click', () => {
      closePreview();
      if (typeof this.onPublish === 'function') this.onPublish();
    });

    // Moderation shortcut
    overlay.querySelector('#btnPreviewOpenMod')?.addEventListener('click', () => {
      closePreview();
      if (typeof this.onOpenModeration === 'function') this.onOpenModeration();
    });

    // Viewport Mode Switchers
    overlay.querySelector('#btnToggleWallDesktop')?.addEventListener('click', () => {
      this.viewMode = 'desktop';
      overlay.querySelector('#btnToggleWallDesktop')?.classList.replace('btn-ghost', 'btn-primary');
      overlay.querySelector('#btnToggleWallMobile')?.classList.replace('btn-primary', 'btn-ghost');
      rerenderStage();
    });

    overlay.querySelector('#btnToggleWallMobile')?.addEventListener('click', () => {
      this.viewMode = 'mobile';
      overlay.querySelector('#btnToggleWallMobile')?.classList.replace('btn-ghost', 'btn-primary');
      overlay.querySelector('#btnToggleWallDesktop')?.classList.replace('btn-primary', 'btn-ghost');
      rerenderStage();
    });

    // Theme selector
    overlay.querySelector('#selPreviewWallTheme')?.addEventListener('change', (e) => {
      this.currentTheme = e.target.value;
      rerenderStage();
    });

    // Layout selector
    overlay.querySelector('#selPreviewWallLayout')?.addEventListener('change', (e) => {
      this.currentLayout = e.target.value;
      rerenderStage();
    });

    // Data Volume Test Buttons
    const volBtns = [
      { id: '#btnSampleVolStandard', vol: 'standard' },
      { id: '#btnSampleVolCrowded', vol: 'crowded' },
      { id: '#btnSampleVolEmpty', vol: 'empty' },
      { id: '#btnSampleVolLive', vol: 'live' }
    ];

    volBtns.forEach(({ id, vol }) => {
      overlay.querySelector(id)?.addEventListener('click', () => {
        this.sampleVolume = vol;
        volBtns.forEach(b => {
          const btnElem = overlay.querySelector(b.id);
          if (btnElem) {
            btnElem.className = `btn btn-xs ${b.vol === vol ? 'btn-primary' : 'btn-ghost'}`;
          }
        });
        rerenderStage();
      });
    });

    // Escape key to close
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', handleKey);
        closePreview();
      }
    };
    window.addEventListener('keydown', handleKey);
  }
}

import { TemplateRegistry } from '../templates/TemplateRegistry.js';
import { assetRepository } from '../services/AssetRepository.js';
import { SelectionManager } from '../services/SelectionManager.js';
import { specialAnimationEngine } from '../animations/SpecialAnimationEngine.js';
import { wishRepository } from '../services/WishRepository.js';

export class StoryCanvasView {
  constructor(options = {}) {
    this.project = options.project;
    this.scene = options.scene;
    this.activeSceneId = options.activeSceneId || options.scene?.id || null;
    this.allAssets = options.allAssets || [];
    this.onOpenAddSceneModal = options.onOpenAddSceneModal || (() => {});
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectElement = options.onSelectElement || (() => {});
    this.onOpenAssetPicker = options.onOpenAssetPicker || (() => {});
    this.onEditTextAction = options.onEditTextAction || (() => {});
    this.onNextSceneRequested = options.onNextSceneRequested || (() => {});
    this.hideHeader = options.hideHeader || false;
    this.selectionManager = null;
  }

  updateCanvasGoldenButton() {
    const btn = document.getElementById('canvasGoldenBtnPreview');
    const textSpan = document.getElementById('canvasGoldenBtnText');
    if (!btn || !this.scene) return;

    const s = this.scene.settings || {};
    const btnText = s.nextButtonText || 'Next Scene ✨';
    const btnTheme = s.nextButtonTheme || 'royal-gold';
    const btnCustomColor = s.nextButtonCustomColor || '';

    if (textSpan) textSpan.textContent = btnText;
    btn.className = `recipient-golden-next-btn theme-${btnTheme}`;
    if (btnTheme === 'custom' && btnCustomColor) {
      btn.style.background = btnCustomColor;
      btn.style.borderColor = btnCustomColor;
      btn.style.color = '#ffffff';
    } else {
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }
  }

  async updateCanvasContent() {
    if (!this.scene) return;
    if (this.scene.id) this.activeSceneId = this.scene.id;
    const assignedAssets = [];
    if (this.scene.assetIds && this.scene.assetIds.length > 0) {
      for (const id of this.scene.assetIds) {
        const asset = this.allAssets.find(a => a.id === id) || await assetRepository.getAsset(id);
        if (asset) {
          asset.renderUrl = await assetRepository.getRenderableUrl(asset);
          assignedAssets.push(asset);
        }
      }
    }

    let liveWishes = [];
    if (this.scene.template === 'wish_wall' || this.scene.template === 'wish-wall') {
      try {
        liveWishes = await wishRepository.getApprovedWishes(this.project?.id);
      } catch (e) {}
    }

    const sceneContent = TemplateRegistry.renderTemplate(this.scene, assignedAssets, this.project, {
      wishes: liveWishes
    });
    const viewport = document.getElementById('canvasViewportBody');
    if (viewport) {
      if (typeof sceneContent === 'string') {
        viewport.innerHTML = sceneContent;
      } else if (sceneContent instanceof Node) {
        viewport.innerHTML = '';
        viewport.appendChild(sceneContent);
      }

      if (this.scene.template && this.scene.template.startsWith('special_')) {
        specialAnimationEngine.initScene(viewport, this.scene, this.project);
      }

      if (this.selectionManager) {
        this.selectionManager.setScene(this.scene, viewport);
        if (this.selectionManager.selectedElementId) {
          this.selectionManager.renderSelectionOverlay();
        }
      }

      this.updateCanvasGoldenButton();
    }
  }

  async render() {
    const canvasBox = document.createElement('main');
    canvasBox.className = `story-canvas-container ${this.hideHeader ? 'no-header' : ''}`;
    canvasBox.id = 'storyCanvasRoot';

    if (!this.scene) {
      canvasBox.innerHTML = `
        <div class="empty-canvas-state text-center" style="padding:50px 24px; color:var(--text-muted);">
          <div style="font-size:3.5rem; margin-bottom:12px;">🎬</div>
          <h3 style="font-size:1.3rem; font-weight:800; color:var(--text);">No Scene Selected</h3>
          <p style="font-size:0.9rem; max-width:400px; margin:8px auto 20px auto;">
            Your project story sequence is currently empty. Add a scene to start editing!
          </p>
          <button class="btn btn-primary btn-lg" id="btnEmptyCanvasAddScene" style="min-height:44px; font-weight:800;">
            ➕ Add First Scene
          </button>
        </div>
      `;

      canvasBox.querySelector('#btnEmptyCanvasAddScene')?.addEventListener('click', () => {
        this.onOpenAddSceneModal();
      });

      return canvasBox;
    }

    // Resolve assets
    const assignedAssets = [];
    if (this.scene.assetIds && this.scene.assetIds.length > 0) {
      for (const id of this.scene.assetIds) {
        const asset = this.allAssets.find(a => a.id === id) || await assetRepository.getAsset(id);
        if (asset) {
          asset.renderUrl = await assetRepository.getRenderableUrl(asset);
          assignedAssets.push(asset);
        }
      }
    }

    let liveWishes = [];
    if (this.scene.template === 'wish_wall' || this.scene.template === 'wish-wall') {
      try {
        liveWishes = await wishRepository.getApprovedWishes(this.project?.id);
      } catch (e) {}
    }

    const sceneContent = TemplateRegistry.renderTemplate(this.scene, assignedAssets, this.project, {
      wishes: liveWishes
    });

    const headerHtml = this.hideHeader ? '' : `
      <div class="story-canvas-header" style="padding:10px 16px; background:var(--surface-elevated); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-weight:700; font-size:0.85rem; color:var(--accent-gold);">
            ✨ Story Canvas • ${this.scene.name} (${this.scene.duration}s)
          </span>
          <span style="font-size:0.75rem; color:var(--text-muted); background:var(--surface); padding:2px 8px; border-radius:12px; border:1px solid var(--border);">
            Interactive Canvas
          </span>
        </div>

        <!-- Quick Elements Toolbar -->
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="btn btn-secondary btn-xs" id="btnAddCanvasText" title="Add New Text Element">🔤 Add Text</button>
          <button class="btn btn-secondary btn-xs" id="btnAddCanvasShape" title="Add Decorative Element">🎨 Add Shape</button>
          <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">
            Template: ${this.scene.template}
          </span>
        </div>
      </div>
    `;

    const settings = this.scene.settings || {};
    const btnText = settings.nextButtonText || 'Next Scene ✨';
    const btnTheme = settings.nextButtonTheme || 'royal-gold';
    const btnCustomColor = settings.nextButtonCustomColor || '';
    const customStyle = (btnTheme === 'custom' && btnCustomColor) ? `style="background: ${btnCustomColor}; border-color: ${btnCustomColor}; color: #ffffff;"` : '';

    canvasBox.innerHTML = `
      ${headerHtml}
      <div class="story-canvas-viewport" id="canvasViewportBody" style="flex:1; width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;"></div>
      <div class="canvas-golden-btn-preview-container" id="canvasGoldenBtnContainer">
        <button class="recipient-golden-next-btn theme-${btnTheme}" id="canvasGoldenBtnPreview" type="button" aria-label="Next Scene Preview" title="Golden Next Button Preview (Click to advance)" ${customStyle}>
          <span class="golden-btn-text" id="canvasGoldenBtnText">${btnText}</span>
          <svg class="golden-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;

    const viewport = canvasBox.querySelector('#canvasViewportBody');
    if (typeof sceneContent === 'string') {
      viewport.innerHTML = sceneContent;
    } else if (sceneContent instanceof Node) {
      viewport.appendChild(sceneContent);
    }

    if (this.scene.template && this.scene.template.startsWith('special_')) {
      specialAnimationEngine.initScene(viewport, this.scene, this.project);
    }

    this.selectionManager = new SelectionManager({
      canvasViewport: viewport,
      scene: this.scene,
      activeSceneId: this.activeSceneId || this.scene?.id,
      onProjectModified: () => this.onProjectModified(),
      onOpenAssetPicker: (el) => this.onOpenAssetPicker(el),
      onSelectElement: (id, sceneId) => {
        this.onSelectElement(id, sceneId || this.activeSceneId || this.scene?.id);
      },
      onEditTextAction: (id, sceneId) => {
        this.onEditTextAction(id, sceneId || this.activeSceneId || this.scene?.id);
      }
    });
    this.selectionManager.setScene(this.scene, viewport);

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.selectionManager && this.selectionManager.selectedElementId) {
          this.selectionManager.renderSelectionOverlay();
        }
      });
      this.resizeObserver.observe(viewport);
    }

    viewport.addEventListener('click', (e) => {
      // Handle Wish Wall Reaction Pill Clicks
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

      if (e.target.closest('#canvasSelectionOverlay')) return;
      const textElem = e.target.closest('[data-text-id], [data-element-id], [data-image-id], [data-slot-id], [data-collage-id]');
      if (textElem) {
        const id = textElem.dataset.elementId || textElem.dataset.textId || textElem.dataset.imageId || textElem.dataset.slotId || textElem.dataset.collageId;
        const currentSceneId = this.activeSceneId || this.scene?.id;
        this.selectionManager.selectElement(id, currentSceneId);
      } else {
        this.selectionManager.clearSelection();
        this.onSelectElement(null, this.activeSceneId || this.scene?.id);
      }
    });

    // Clicking anywhere in canvas container outside viewport or overlay clears element selection safely
    canvasBox.addEventListener('click', (e) => {
      if (e.target.closest('#canvasViewportBody') || e.target.closest('#canvasSelectionOverlay') || e.target.closest('button')) return;
      this.selectionManager.clearSelection();
      this.onSelectElement(null, this.activeSceneId || this.scene?.id);
    });

    canvasBox.querySelector('#btnAddCanvasText')?.addEventListener('click', () => {
      if (this.selectionManager) this.selectionManager.addNewTextElement();
    });

    canvasBox.querySelector('#btnAddCanvasShape')?.addEventListener('click', () => {
      if (this.selectionManager) this.selectionManager.addNewShapeElement();
    });

    canvasBox.querySelector('#canvasGoldenBtnPreview')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onNextSceneRequested();
    });

    return canvasBox;
  }
}

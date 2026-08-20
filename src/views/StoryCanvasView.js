import { TemplateRegistry } from '../templates/TemplateRegistry.js';
import { assetRepository } from '../services/AssetRepository.js';
import { SelectionManager } from '../services/SelectionManager.js';
import { specialAnimationEngine } from '../animations/SpecialAnimationEngine.js';
import { wishRepository } from '../services/WishRepository.js';

export class StoryCanvasView {
  constructor(options = {}) {
    this.project = options.project;
    this.scene = options.scene;
    this.allAssets = options.allAssets || [];
    this.onOpenAddSceneModal = options.onOpenAddSceneModal || (() => {});
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectElement = options.onSelectElement || (() => {});
    this.onOpenAssetPicker = options.onOpenAssetPicker || (() => {});
    this.hideHeader = options.hideHeader || false;
    this.selectionManager = null;
  }

  async updateCanvasContent() {
    if (!this.scene) return;
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

    canvasBox.innerHTML = `
      ${headerHtml}
      <div class="story-canvas-viewport" id="canvasViewportBody" style="flex:1; width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;"></div>
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
      onProjectModified: () => this.onProjectModified(),
      onOpenAssetPicker: (el) => this.onOpenAssetPicker(el),
      onSelectElement: (id) => {
        const sel = document.getElementById('edSelTextElement');
        if (sel) {
          sel.value = id;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        this.onSelectElement(id);
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
      const textElem = e.target.closest('[data-text-id], [data-element-id]');
      if (textElem) {
        const id = textElem.dataset.textId || textElem.dataset.elementId;
        this.selectionManager.selectElement(id);
      } else {
        this.selectionManager.clearSelection();
        this.onSelectElement(null);
      }
    });

    canvasBox.querySelector('#btnAddCanvasText')?.addEventListener('click', () => {
      if (this.selectionManager) this.selectionManager.addNewTextElement();
    });

    canvasBox.querySelector('#btnAddCanvasShape')?.addEventListener('click', () => {
      if (this.selectionManager) this.selectionManager.addNewShapeElement();
    });

    return canvasBox;
  }
}

/**
 * Birthday Studio - Modern Visual Story Editor Layout
 * Canva/Story-inspired workspace with space-efficient canvas, collapsible sidebars,
 * contextual floating toolbar, mobile-first bottom sheets, and focus mode.
 * View Mode (Desktop/Mobile preview) is editor-level persistent state preserved across scene navigation.
 * Preserves element selection and guarantees single-source-of-truth active scene outline across Scene Navigators.
 */

import { SceneRailView } from './SceneRailView.js';
import { SmartInspectorView } from './SmartInspectorView.js';
import { ContextualToolbarView } from './ContextualToolbarView.js';
import { UniversalAddMenuView } from './UniversalAddMenuView.js';
import { MobileBottomSheetView } from './MobileBottomSheetView.js';
import { TimingPanelView } from './TimingPanelView.js';
import { StoryCanvasView } from '../StoryCanvasView.js';
import { SceneTemplatePickerView } from '../SceneTemplatePickerView.js';
import { AssetPickerModal } from '../AssetPickerModal.js';
import { projectRepository } from '../../services/ProjectRepository.js';
import { Toast } from '../../utils/Toast.js';

export class ModernEditorLayout {
  constructor(options = {}) {
    this.project = options.project || {};
    this.selectedSceneId = options.selectedSceneId || (this.project.scenes?.[0]?.id || null);
    this.allAssets = options.allAssets || [];
    this.user = options.user || null;
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectSceneCallback = options.onSelectScene || (() => {});
    this.onSelectElementCallback = options.onSelectElement || (() => {});
    this.onNavAction = options.onNavAction || (() => {});
    this.onViewModeChange = options.onViewModeChange || (() => {});

    this.selectedElementId = options.selectedElementId || null;
    this.viewMode = options.viewMode || localStorage.getItem('birthday_studio_view_mode') || 'desktop';
    this.canvasRatio = options.canvasRatio || localStorage.getItem('birthday_studio_canvas_ratio') || (this.viewMode === 'desktop' ? 'ratio-widescreen' : 'ratio-story');
    this.isRailCollapsed = false;
    this.isInspectorCollapsed = false;
    this.isFocusMode = false;
    this.isMobile = window.innerWidth <= 768;

    this.sceneRailView = null;
    this.mobileRailView = null;
    this.smartInspectorView = null;
    this.storyCanvasView = null;
    this.contextualToolbarView = null;
    this.workspaceGrid = null;
    this.canvasWorkspace = null;
  }

  async render() {
    const root = document.createElement('div');
    root.className = `modern-editor-root ${this.isFocusMode ? 'editor-focus-mode' : ''}`;
    root.id = 'modernEditorRoot';

    const activeScene = this.project.scenes?.find(s => s.id === this.selectedSceneId) || this.project.scenes?.[0];
    if (activeScene && !this.selectedSceneId) {
      this.selectedSceneId = activeScene.id;
    }

    const elements = activeScene?.elements || activeScene?.textElements || [];
    const selectedEl = elements.find(e => e.id === this.selectedElementId) || null;

    // 1. Workspace Grid Container
    const workspaceGrid = document.createElement('div');
    workspaceGrid.className = `modern-editor-workspace ${this.isRailCollapsed ? 'rail-collapsed' : ''} ${this.isInspectorCollapsed ? 'inspector-collapsed' : ''}`;
    workspaceGrid.id = 'modernEditorWorkspace';
    this.workspaceGrid = workspaceGrid;

    // 2. Left Scene Rail (Desktop & Tablet)
    this.sceneRailView = new SceneRailView({
      project: this.project,
      selectedSceneId: this.selectedSceneId,
      isMobile: false,
      onSelectScene: async (sceneId) => {
        await this.handleSceneChange(sceneId);
      },
      onAddScene: () => this.openAddScenePicker(),
      onProjectModified: () => {
        this.onProjectModified();
        this.refreshSceneRails();
      }
    });
    const railElem = this.sceneRailView.render();
    workspaceGrid.appendChild(railElem);

    // Left Rail Toggle Tab
    const railToggle = document.createElement('div');
    railToggle.className = 'rail-toggle-tab';
    railToggle.id = 'railToggleTab';
    railToggle.title = this.isRailCollapsed ? 'Expand Scene Rail' : 'Collapse Scene Rail';
    railToggle.innerHTML = this.isRailCollapsed ? '▶' : '◀';
    railToggle.addEventListener('click', () => {
      this.isRailCollapsed = !this.isRailCollapsed;
      workspaceGrid.classList.toggle('rail-collapsed', this.isRailCollapsed);
      railToggle.innerHTML = this.isRailCollapsed ? '▶' : '◀';
    });
    workspaceGrid.appendChild(railToggle);

    // 3. Central Interactive Canvas Workspace (Full desktop width area)
    const canvasWorkspace = document.createElement('div');
    canvasWorkspace.className = 'modern-canvas-workspace';
    canvasWorkspace.id = 'modernCanvasWorkspace';
    this.canvasWorkspace = canvasWorkspace;

    // Floating Contextual Toolbar
    this.contextualToolbarView = new ContextualToolbarView({
      selectedElement: selectedEl,
      scene: activeScene,
      currentRatio: this.canvasRatio,
      viewMode: this.viewMode,
      onAction: (action) => this.handleContextAction(action, this.getSelectedElement(activeScene), activeScene, canvasWorkspace, workspaceGrid)
    });
    const toolbarElem = this.contextualToolbarView.render();
    canvasWorkspace.appendChild(toolbarElem);

    // Canvas Viewport Frame (Centered Celebration Stage)
    const canvasFrame = document.createElement('div');
    canvasFrame.className = `canvas-viewport-frame ${this.canvasRatio}`;
    canvasFrame.id = 'canvasViewportFrame';

    this.storyCanvasView = new StoryCanvasView({
      project: this.project,
      scene: activeScene,
      allAssets: this.allAssets,
      hideHeader: true,
      onSelectElement: (elId) => {
        this.selectedElementId = elId;
        this.onSelectElementCallback(elId);
        this.updateContextualToolbar(activeScene, canvasWorkspace, workspaceGrid);
        this.updateSmartInspector(activeScene, workspaceGrid);
      },
      onOpenAssetPicker: (el) => this.openAssetPickerForElement(el),
      onOpenAddSceneModal: () => this.openAddScenePicker(),
      onProjectModified: () => {
        this.onProjectModified();
        this.storyCanvasView?.updateCanvasContent();
      }
    });

    const canvasContent = await this.storyCanvasView.render();
    canvasFrame.appendChild(canvasContent);
    canvasWorkspace.appendChild(canvasFrame);
    workspaceGrid.appendChild(canvasWorkspace);

    // 4. Right Smart Inspector
    this.smartInspectorView = new SmartInspectorView({
      project: this.project,
      scene: activeScene,
      allAssets: this.allAssets,
      selectedElementId: this.selectedElementId,
      onProjectModified: () => {
        this.onProjectModified();
        this.storyCanvasView?.updateCanvasContent();
      },
      onOpenAssetPicker: (el) => this.openAssetPickerForElement(el),
      onDeleteElement: (el) => this.deleteElement(el, activeScene),
      onOpenModeration: () => this.onNavAction('openModeration'),
      onPreviewWishWall: () => this.onNavAction('openWishWallPreview')
    });
    const inspectorElem = this.smartInspectorView.render();
    workspaceGrid.appendChild(inspectorElem);

    // Right Inspector Toggle Tab
    const inspectorToggle = document.createElement('div');
    inspectorToggle.className = 'inspector-toggle-tab';
    inspectorToggle.id = 'inspectorToggleTab';
    inspectorToggle.title = this.isInspectorCollapsed ? 'Expand Properties Inspector' : 'Collapse Inspector';
    inspectorToggle.innerHTML = this.isInspectorCollapsed ? '◀' : '▶';
    inspectorToggle.addEventListener('click', () => {
      this.isInspectorCollapsed = !this.isInspectorCollapsed;
      workspaceGrid.classList.toggle('inspector-collapsed', this.isInspectorCollapsed);
      inspectorToggle.innerHTML = this.isInspectorCollapsed ? '◀' : '▶';
    });
    workspaceGrid.appendChild(inspectorToggle);

    root.appendChild(workspaceGrid);

    // 5. Mobile Bottom Wrapper (<768px)
    const mobileBottomWrapper = document.createElement('div');
    mobileBottomWrapper.className = 'mobile-editor-bottom-wrapper';

    this.mobileRailView = new SceneRailView({
      project: this.project,
      selectedSceneId: this.selectedSceneId,
      isMobile: true,
      onSelectScene: async (sceneId) => {
        await this.handleSceneChange(sceneId);
      },
      onAddScene: () => this.openAddScenePicker(),
      onProjectModified: () => {
        this.onProjectModified();
        this.refreshSceneRails();
      }
    });
    mobileBottomWrapper.appendChild(this.mobileRailView.render());

    const mobileActionBar = document.createElement('div');
    mobileActionBar.className = 'mobile-action-bar';
    mobileActionBar.innerHTML = `
      <button class="mobile-action-btn" data-mobile-tool="add" id="btnMobileAddTool">
        <span class="mobile-action-btn-icon">➕</span>
        <span>Add</span>
      </button>
      <button class="mobile-action-btn" data-mobile-tool="media">
        <span class="mobile-action-btn-icon">🖼️</span>
        <span>Media</span>
      </button>
      <button class="mobile-action-btn" data-mobile-tool="style">
        <span class="mobile-action-btn-icon">🎨</span>
        <span>Style</span>
      </button>
      <button class="mobile-action-btn" data-mobile-tool="more">
        <span class="mobile-action-btn-icon">⋯</span>
        <span>More</span>
      </button>
    `;

    mobileActionBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mobile-tool]');
      if (btn) {
        this.handleMobileToolClick(btn.dataset.mobileTool, activeScene);
      }
    });

    mobileBottomWrapper.appendChild(mobileActionBar);
    root.appendChild(mobileBottomWrapper);

    // 6. Focus Mode Exit Button
    const focusExitPill = document.createElement('button');
    focusExitPill.className = 'focus-mode-exit-pill';
    focusExitPill.id = 'btnExitFocusMode';
    focusExitPill.innerHTML = `
      <span>🎯 Focus Mode Active</span>
      <span style="opacity:0.75; font-size:0.72rem;">(Click or press 'F' to exit)</span>
      <span style="font-size:1.1rem; margin-left:4px;">✕</span>
    `;
    focusExitPill.addEventListener('click', () => {
      this.toggleFocusMode(root);
    });
    root.appendChild(focusExitPill);

    this.bindKeyboardShortcuts(root);
    this.bindResizeListener(root);

    return root;
  }

  getSelectedElement(activeScene) {
    const elements = activeScene?.elements || activeScene?.textElements || [];
    return elements.find(e => e.id === this.selectedElementId) || null;
  }

  async handleSceneChange(sceneId) {
    if (!sceneId) return;
    this.selectedSceneId = sceneId;
    this.selectedElementId = null;
    this.onSelectSceneCallback(sceneId);
    this.onSelectElementCallback(null);

    const activeScene = this.project.scenes?.find(s => s.id === sceneId) || this.project.scenes?.[0];
    if (!activeScene) return;

    // 1. Reactive Active Outline Update across Desktop & Mobile Scene Navigators
    if (this.sceneRailView) {
      this.sceneRailView.setSelectedSceneId(sceneId);
    }
    if (this.mobileRailView) {
      this.mobileRailView.setSelectedSceneId(sceneId);
    }

    // 2. Live Canvas Update
    if (this.storyCanvasView) {
      this.storyCanvasView.scene = activeScene;
      await this.storyCanvasView.updateCanvasContent();
    }

    // 3. Contextual Toolbar & Smart Inspector Updates
    this.updateContextualToolbar(activeScene, this.canvasWorkspace, this.workspaceGrid);
    this.updateSmartInspector(activeScene, this.workspaceGrid);
  }

  refreshSceneRails() {
    const scenes = (this.project.scenes || []).sort((a, b) => a.order - b.order);
    const container = document.getElementById('railScenesContainer');
    if (container && this.sceneRailView) {
      container.innerHTML = this.sceneRailView.renderCardsHtml(scenes);
    }
    const mobileStrip = document.getElementById('mobileSceneFilmstrip');
    if (mobileStrip && this.mobileRailView) {
      mobileStrip.innerHTML = this.mobileRailView.renderMobileCardsHtml(scenes);
    }
  }

  updateContextualToolbar(activeScene, canvasWorkspace, workspaceGrid) {
    const selectedEl = this.getSelectedElement(activeScene);
    const existingToolbar = canvasWorkspace?.querySelector('#floatingContextToolbar');
    if (existingToolbar) {
      this.contextualToolbarView = new ContextualToolbarView({
        selectedElement: selectedEl,
        scene: activeScene,
        currentRatio: this.canvasRatio,
        viewMode: this.viewMode,
        onAction: (action) => this.handleContextAction(action, selectedEl, activeScene, canvasWorkspace, workspaceGrid)
      });
      const newToolbar = this.contextualToolbarView.render();
      existingToolbar.replaceWith(newToolbar);
    }
  }

  updateSmartInspector(activeScene, workspaceGrid) {
    const existingInspector = workspaceGrid?.querySelector('#modernSmartInspector') || workspaceGrid?.querySelector('.modern-smart-inspector');
    if (existingInspector) {
      this.smartInspectorView = new SmartInspectorView({
        project: this.project,
        scene: activeScene,
        allAssets: this.allAssets,
        selectedElementId: this.selectedElementId,
        onProjectModified: () => {
          this.onProjectModified();
          this.storyCanvasView?.updateCanvasContent();
        },
        onOpenAssetPicker: (el) => this.openAssetPickerForElement(el),
        onDeleteElement: (el) => this.deleteElement(el, activeScene),
        onOpenModeration: () => this.onNavAction('openModeration'),
        onPreviewWishWall: () => this.onNavAction('openWishWallPreview')
      });
      const newInspector = this.smartInspectorView.render();
      existingInspector.replaceWith(newInspector);
    }
  }

  toggleFocusMode(root) {
    this.isFocusMode = !this.isFocusMode;
    root.classList.toggle('editor-focus-mode', this.isFocusMode);
    Toast.show(this.isFocusMode ? '🎯 Focus Mode Enabled' : '🎯 Focus Mode Exited', 'info');
  }

  handleContextAction(action, selectedEl, activeScene, canvasWorkspace, workspaceGrid) {
    if (action === 'add') {
      const existing = canvasWorkspace.querySelector('#universalAddPopover');
      if (existing) {
        existing.remove();
        return;
      }
      const popover = new UniversalAddMenuView(
        (type) => this.addElementToScene(type, activeScene),
        () => {}
      );
      canvasWorkspace.appendChild(popover.render());
    } else if (action === 'style') {
      this.onNavAction('openStyle');
    } else if (action === 'openModeration' || action === 'wishes') {
      this.onNavAction('openModeration');
    } else if (action === 'countdown') {
      this.onNavAction('openCountdown');
    } else if (action === 'autoArrange') {
      this.onNavAction('autoArrange');
    } else if (action === 'previewExperience') {
      this.onNavAction('previewExperience');
    } else if (action === 'media' || action === 'replaceMedia') {
      this.openAssetPickerForElement(selectedEl);
    } else if (action === 'timing') {
      if (selectedEl) {
        const timingModal = new TimingPanelView(selectedEl, activeScene, () => {
          this.onProjectModified();
          this.storyCanvasView?.updateCanvasContent();
        });
        document.body.appendChild(timingModal.render());
      } else {
        const dur = prompt('Enter scene duration in seconds (1-30):', activeScene.duration || 6);
        if (dur && !isNaN(Number(dur))) {
          activeScene.duration = Math.max(1, Math.min(30, Number(dur)));
          this.onProjectModified();
          this.storyCanvasView?.updateCanvasContent();
          this.updateSmartInspector(activeScene, workspaceGrid);
        }
      }
    } else if (action === 'toggleRatioStory' || action === 'toggleViewMobile' || action === 'setModeMobile') {
      this.setPreviewMode('mobile');
    } else if (action === 'toggleRatioWide' || action === 'toggleViewDesktop' || action === 'setModeDesktop') {
      this.setPreviewMode('desktop');
    } else if (action === 'duplicate' && selectedEl) {
      this.duplicateElement(selectedEl, activeScene);
    } else if (action === 'delete' && selectedEl) {
      this.deleteElement(selectedEl, activeScene);
    } else if (action === 'bringForward' && selectedEl) {
      this.reorderElement(selectedEl, activeScene, 1);
    } else if (action === 'sendBackward' && selectedEl) {
      this.reorderElement(selectedEl, activeScene, -1);
    }
  }

  setPreviewMode(mode) {
    const normalizedMode = mode === 'mobile' ? 'mobile' : 'desktop';
    this.viewMode = normalizedMode;
    this.canvasRatio = normalizedMode === 'desktop' ? 'ratio-widescreen' : 'ratio-story';

    localStorage.setItem('birthday_studio_view_mode', normalizedMode);
    localStorage.setItem('birthday_studio_canvas_ratio', this.canvasRatio);

    const frame = document.getElementById('canvasViewportFrame');
    if (frame) {
      frame.className = `canvas-viewport-frame ${this.canvasRatio}`;
      frame.setAttribute('data-preview-mode', normalizedMode);
    }

    const activeScene = this.project.scenes?.find(s => s.id === this.selectedSceneId) || this.project.scenes?.[0];
    this.updateContextualToolbar(activeScene, this.canvasWorkspace, this.workspaceGrid);
    this.updateToolbarRatioButtons();

    if (this.storyCanvasView) {
      this.storyCanvasView.updateCanvasContent();
    }

    window.dispatchEvent(new Event('resize'));
    this.onViewModeChange(normalizedMode, this.canvasRatio);
    Toast.show(normalizedMode === 'mobile' ? '📱 Switched to Mobile View (9:16)' : '🖥️ Switched to Desktop View (16:9)', 'info');
  }

  updateToolbarRatioButtons() {
    const toolbar = document.getElementById('floatingContextToolbar');
    if (!toolbar) return;
    const btnMobiles = toolbar.querySelectorAll('[data-action="setModeMobile"], [data-action="toggleRatioStory"]');
    const btnDesktops = toolbar.querySelectorAll('[data-action="setModeDesktop"], [data-action="toggleRatioWide"]');
    const isMobile = this.viewMode === 'mobile' || this.canvasRatio === 'ratio-story';
    btnMobiles.forEach(b => b.classList.toggle('active', isMobile));
    btnDesktops.forEach(b => b.classList.toggle('active', !isMobile));
  }

  handleMobileToolClick(tool, activeScene) {
    if (tool === 'add') {
      const bottomSheet = new MobileBottomSheetView('Add Element', `
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
          <button class="btn btn-secondary btn-block" id="btnMobAddText">🔤 Add Text</button>
          <button class="btn btn-secondary btn-block" id="btnMobAddImage">🖼️ Add Photo</button>
          <button class="btn btn-secondary btn-block" id="btnMobAddShape">🎨 Add Shape</button>
          <button class="btn btn-secondary btn-block" id="btnMobAddVideo">🎬 Add Video</button>
        </div>
      `, (sheetElem) => {
        sheetElem.querySelector('#btnMobAddText')?.addEventListener('click', () => {
          this.addElementToScene('text', activeScene);
          sheetElem.remove();
        });
        sheetElem.querySelector('#btnMobAddImage')?.addEventListener('click', () => {
          this.addElementToScene('image', activeScene);
          sheetElem.remove();
        });
        sheetElem.querySelector('#btnMobAddShape')?.addEventListener('click', () => {
          this.addElementToScene('shape', activeScene);
          sheetElem.remove();
        });
        sheetElem.querySelector('#btnMobAddVideo')?.addEventListener('click', () => {
          this.addElementToScene('video', activeScene);
          sheetElem.remove();
        });
      });
      document.body.appendChild(bottomSheet.render());
    } else if (tool === 'media') {
      this.openAssetPickerForElement(this.getSelectedElement(activeScene));
    } else if (tool === 'style') {
      this.onNavAction('openStyle');
    } else if (tool === 'more') {
      this.onNavAction('openCmdMenu');
    }
  }

  reorderElement(el, scene, direction) {
    const elements = scene.elements || scene.textElements || [];
    const idx = elements.findIndex(e => e.id === el.id);
    if (idx === -1) return;

    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= elements.length) return;

    const [moved] = elements.splice(idx, 1);
    elements.splice(newIdx, 0, moved);

    elements.forEach((item, index) => {
      item.zIndex = (index + 1) * 2;
    });

    this.onProjectModified();
    this.storyCanvasView?.updateCanvasContent();
    Toast.show(direction > 0 ? 'Layer brought forward' : 'Layer sent backward', 'info');
  }

  addElementToScene(type, scene) {
    if (!scene) return;
    if (!scene.elements) scene.elements = [];

    const newId = `el_${type}_${Date.now()}`;
    const newElement = {
      id: newId,
      type: type,
      content: type === 'text' ? 'Double click to edit text' : '',
      x: 50,
      y: 50,
      left: 50,
      top: 50,
      width: type === 'text' ? 'auto' : 280,
      height: type === 'text' ? 'auto' : 200,
      zIndex: (scene.elements.length + 1) * 2,
      animation: 'fadeIn'
    };

    if (type === 'text') {
      newElement.fontSize = 32;
      newElement.fontFamily = "'Outfit', sans-serif";
      newElement.fontWeight = '800';
      newElement.color = '#ffffff';
      newElement.align = 'center';
    } else if (type === 'image' || type === 'photo') {
      newElement.content = this.allAssets?.[0]?.renderUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80';
      newElement.borderRadius = 16;
    } else if (type === 'shape' || type === 'sticker') {
      newElement.content = '✨';
      newElement.fontSize = 48;
      newElement.color = '#dfb15b';
    } else if (type === 'button') {
      newElement.content = 'Open Celebration 🎁';
      newElement.color = '#7f5af0';
    }

    scene.elements.push(newElement);
    this.selectedElementId = newId;
    this.onSelectElementCallback(newId);
    this.onProjectModified();
    this.storyCanvasView?.updateCanvasContent();
    this.updateContextualToolbar(scene, this.canvasWorkspace, this.workspaceGrid);
    this.updateSmartInspector(scene, this.workspaceGrid);
    Toast.show(`Added ${type} element to scene`, 'success');
  }

  duplicateElement(el, scene) {
    if (!el || !scene) return;
    const elements = scene.elements || scene.textElements || [];
    const copy = JSON.parse(JSON.stringify(el));
    copy.id = `el_${el.type}_${Date.now()}`;
    copy.x = (copy.x || 50) + 4;
    copy.y = (copy.y || 50) + 4;
    copy.zIndex = (copy.zIndex || 1) + 2;
    elements.push(copy);
    this.selectedElementId = copy.id;
    this.onSelectElementCallback(copy.id);
    this.onProjectModified();
    this.storyCanvasView?.updateCanvasContent();
    this.updateContextualToolbar(scene, this.canvasWorkspace, this.workspaceGrid);
    this.updateSmartInspector(scene, this.workspaceGrid);
    Toast.show('Element duplicated', 'info');
  }

  deleteElement(el, scene) {
    if (!el || !scene) return;
    const elements = scene.elements || scene.textElements || [];
    const idx = elements.findIndex(e => e.id === el.id);
    if (idx !== -1) {
      elements.splice(idx, 1);
      if (el.slotId && scene.slots) {
        delete scene.slots[el.slotId];
      }
      if (el.assetId && Array.isArray(scene.assetIds)) {
        const stillUsed = elements.some(e => e.assetId === el.assetId);
        if (!stillUsed) {
          scene.assetIds = scene.assetIds.filter(id => id !== el.assetId);
        }
      }
      this.selectedElementId = null;
      this.onSelectElementCallback(null);
      this.onProjectModified();
      this.storyCanvasView?.updateCanvasContent();
      this.updateContextualToolbar(scene, this.canvasWorkspace, this.workspaceGrid);
      this.updateSmartInspector(scene, this.workspaceGrid);
      Toast.show('Element deleted', 'info');
    }
  }

  openAssetPickerForElement(el) {
    const activeScene = this.project.scenes?.find(s => s.id === this.selectedSceneId) || this.project.scenes?.[0];
    const modal = new AssetPickerModal({
      project: this.project,
      allAssets: this.allAssets,
      targetScene: activeScene,
      targetSlotId: el?.slotId || null,
      onProjectModified: () => {
        this.onProjectModified();
        this.storyCanvasView?.updateCanvasContent();
        this.updateSmartInspector(activeScene, this.workspaceGrid);
      },
      onSelectAsset: (asset) => {
        if (el && asset) {
          el.assetId = asset.id;
          el.content = asset.renderUrl || asset.thumbnail || asset.url || asset.id;
          el.url = asset.renderUrl || asset.thumbnail || asset.url;
          el.src = asset.renderUrl || asset.thumbnail || asset.url;
        }
        if (activeScene && asset) {
          activeScene.assetIds = activeScene.assetIds || [];
          if (!activeScene.assetIds.includes(asset.id)) {
            activeScene.assetIds.push(asset.id);
          }
          if (el?.slotId) {
            if (!activeScene.slots) activeScene.slots = {};
            activeScene.slots[el.slotId] = asset.id;
          }
        }
        this.onProjectModified();
        this.storyCanvasView?.updateCanvasContent();
        this.updateSmartInspector(activeScene, this.workspaceGrid);
      }
    });
    document.body.appendChild(modal.render());
  }

  openAddScenePicker() {
    const picker = new SceneTemplatePickerView({
      project: this.project,
      onSceneAdded: async (newId) => {
        await projectRepository.saveProject(this.project, this.user?.id);
        this.onProjectModified();
        this.refreshSceneRails();
        await this.handleSceneChange(newId);
      }
    });
    document.body.appendChild(picker.render());
  }

  bindKeyboardShortcuts(root) {
    const keyHandler = (e) => {
      if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        this.toggleFocusMode(root);
      }
      if (e.key === 'Escape' && this.isFocusMode) {
        this.toggleFocusMode(root);
      }
    };
    window.addEventListener('keydown', keyHandler);
  }

  bindResizeListener(root) {
    let resizeTimer = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobileNow = window.innerWidth <= 768;
        if (isMobileNow !== this.isMobile) {
          this.isMobile = isMobileNow;
          this.updateContextualToolbar(this.project.scenes?.find(s => s.id === this.selectedSceneId), this.canvasWorkspace, this.workspaceGrid);
        }
      }, 150);
    };
    window.addEventListener('resize', handleResize);
  }

  refresh() {
    this.onProjectModified();
    this.refreshSceneRails();
    this.storyCanvasView?.updateCanvasContent();
  }
}

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
    this.project = options.project || { scenes: [] };
    this.activeSceneId = options.activeSceneId || options.selectedSceneId || (this.project.scenes?.[0]?.id || null);
    this.selectedElementId = options.selectedElementId || null;
    this.selectedElementSceneId = this.selectedElementId ? this.activeSceneId : null;
    this.allAssets = options.allAssets || [];
    this.user = options.user || null;
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectSceneCallback = options.onSelectScene || (() => {});
    this.onSelectElementCallback = options.onSelectElement || (() => {});
    this.onNavAction = options.onNavAction || (() => {});
    this.onViewModeChange = options.onViewModeChange || (() => {});

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

  get selectedSceneId() {
    return this.activeSceneId;
  }

  set selectedSceneId(val) {
    this.activeSceneId = val;
  }

  getActiveScene() {
    if (!this.project?.scenes?.length) return null;
    if (this.activeSceneId) {
      const found = this.project.scenes.find(s => s.id === this.activeSceneId);
      if (found) return found;
    }
    // Only on initial startup when no scene has ever been chosen
    const firstScene = this.project.scenes[0] || null;
    if (firstScene) {
      this.activeSceneId = firstScene.id;
    }
    return firstScene;
  }

  async render() {
    const root = document.createElement('div');
    root.className = `modern-editor-root ${this.isFocusMode ? 'editor-focus-mode' : ''}`;
    root.id = 'modernEditorRoot';

    const activeScene = this.getActiveScene();
    if (activeScene && !this.selectedSceneId) {
      this.selectedSceneId = activeScene.id;
    }

    const selectedEl = this.getSelectedElement(activeScene);

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
      onAction: (action) => this.handleContextAction(action, this.getSelectedElement(), this.getActiveScene(), canvasWorkspace, workspaceGrid)
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
      activeSceneId: this.activeSceneId,
      allAssets: this.allAssets,
      hideHeader: true,
      onSelectElement: (elId, sceneId) => {
        if (elId) {
          const targetSceneId = sceneId || this.activeSceneId;
          const sceneChanged = targetSceneId && targetSceneId !== this.activeSceneId;
          this.activeSceneId = targetSceneId;
          this.selectedElementId = elId;
          this.selectedElementSceneId = targetSceneId;
          if (sceneChanged) {
            this.onSelectSceneCallback(targetSceneId);
          }
        } else {
          // Deselect element: activeSceneId MUST remain untouched!
          this.selectedElementId = null;
          this.selectedElementSceneId = null;
        }
        this.onSelectElementCallback(elId);
        const currentScene = this.getActiveScene();
        this.updateContextualToolbar(currentScene, canvasWorkspace, workspaceGrid);
        this.updateSmartInspector(currentScene, workspaceGrid);
      },
      onEditTextAction: (elId, sceneId) => {
        if (elId) {
          const targetSceneId = sceneId || this.activeSceneId;
          const sceneChanged = targetSceneId && targetSceneId !== this.activeSceneId;
          this.activeSceneId = targetSceneId;
          this.selectedElementId = elId;
          this.selectedElementSceneId = targetSceneId;
          if (sceneChanged) {
            this.onSelectSceneCallback(targetSceneId);
          }
        }
        this.onSelectElementCallback(elId);
        const currentScene = this.getActiveScene();
        const currentEl = this.getSelectedElement(currentScene);
        this.handleContextAction('editText', currentEl, currentScene, canvasWorkspace, workspaceGrid);
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

    // Clicking empty canvas workspace background clears element selection while preserving activeSceneId
    canvasWorkspace.addEventListener('click', (e) => {
      if (!e.target.closest('[data-element-id]') && !e.target.closest('[data-text-id]') && !e.target.closest('[data-image-id]') && !e.target.closest('[data-slot-id]') && !e.target.closest('[data-collage-id]') && !e.target.closest('#canvasSelectionOverlay') && !e.target.closest('.canvas-contextual-toolbar')) {
        this.storyCanvasView?.selectionManager?.clearSelection();
        if (this.selectedElementId !== null) {
          this.selectedElementId = null;
          this.selectedElementSceneId = null;
          this.onSelectElementCallback(null);
          const currentScene = this.getActiveScene();
          this.updateContextualToolbar(currentScene, canvasWorkspace, workspaceGrid);
          this.updateSmartInspector(currentScene, workspaceGrid);
        }
      }
    });

    workspaceGrid.appendChild(canvasWorkspace);

    // 4. Right Smart Inspector
    this.smartInspectorView = new SmartInspectorView({
      project: this.project,
      scene: activeScene,
      activeSceneId: this.activeSceneId,
      selectedElementSceneId: this.selectedElementSceneId,
      allAssets: this.allAssets,
      selectedElementId: this.selectedElementId,
      onProjectModified: () => {
        this.onProjectModified();
        this.storyCanvasView?.updateCanvasContent();
      },
      onSelectElement: (elId, sceneId) => {
        if (elId) {
          const targetSceneId = sceneId || this.activeSceneId;
          this.activeSceneId = targetSceneId;
          this.selectedElementId = elId;
          this.selectedElementSceneId = targetSceneId;
        } else {
          this.selectedElementId = null;
          this.selectedElementSceneId = null;
        }
        this.onSelectElementCallback(elId);
        const currentScene = this.getActiveScene();
        this.updateContextualToolbar(currentScene, canvasWorkspace, workspaceGrid);
        this.updateSmartInspector(currentScene, workspaceGrid);
      },
      onOpenAssetPicker: (elOrOptions, maybeOptions) => this.openAssetPickerForElement(elOrOptions, maybeOptions),
      onDeleteElement: (el) => this.deleteElement(el, this.getActiveScene()),
      onOpenModeration: () => this.onNavAction('openModeration'),
      onPreviewWishWall: () => this.onNavAction('openWishWallPreview'),
      onQuickAddElement: (type) => this.addElementToScene(type, this.getActiveScene())
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
        this.handleMobileToolClick(btn.dataset.mobileTool, this.getActiveScene());
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
    if (!this.selectedElementId) return null;
    if (this.selectedElementSceneId && this.selectedElementSceneId !== this.activeSceneId) {
      this.selectedElementId = null;
      this.selectedElementSceneId = null;
      return null;
    }
    const scene = (this.selectedElementSceneId && this.project?.scenes?.find(s => s.id === this.selectedElementSceneId)) || activeScene || this.getActiveScene();
    if (!scene) return null;
    const elements = scene.elements || scene.textElements || [];
    return elements.find(e => e.id === this.selectedElementId) || null;
  }

  async handleSceneChange(sceneId) {
    if (!sceneId) return;
    this.activeSceneId = sceneId;
    this.selectedSceneId = sceneId;
    this.selectedElementId = null;
    this.selectedElementSceneId = null;
    this.onSelectSceneCallback(sceneId);
    this.onSelectElementCallback(null);

    const activeScene = this.getActiveScene();
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
      this.storyCanvasView.activeSceneId = sceneId;
      if (this.storyCanvasView.selectionManager) {
        this.storyCanvasView.selectionManager.clearSelection();
        this.storyCanvasView.selectionManager.setScene(activeScene, document.getElementById('canvasViewportBody'));
      }
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

  updateContextualToolbar(scene, canvasWorkspace, workspaceGrid) {
    const activeScene = scene || this.getActiveScene();
    const workspace = canvasWorkspace || this.canvasWorkspace;
    const grid = workspaceGrid || this.workspaceGrid;
    const selectedEl = this.getSelectedElement(activeScene);
    const existingToolbar = workspace?.querySelector('#floatingContextToolbar');
    if (existingToolbar) {
      this.contextualToolbarView = new ContextualToolbarView({
        selectedElement: selectedEl,
        scene: activeScene,
        currentRatio: this.canvasRatio,
        viewMode: this.viewMode,
        onAction: (action) => this.handleContextAction(action, selectedEl, activeScene, workspace, grid)
      });
      const newToolbar = this.contextualToolbarView.render();
      existingToolbar.replaceWith(newToolbar);
    }
  }

  updateSmartInspector(scene, workspaceGrid) {
    const activeScene = scene || this.getActiveScene();
    const grid = workspaceGrid || this.workspaceGrid;
    const existingInspector = grid?.querySelector('#modernSmartInspector') || grid?.querySelector('.modern-smart-inspector');
    if (existingInspector) {
      this.smartInspectorView = new SmartInspectorView({
        project: this.project,
        scene: activeScene,
        activeSceneId: this.activeSceneId,
        selectedElementSceneId: this.selectedElementSceneId,
        allAssets: this.allAssets,
        selectedElementId: this.selectedElementId,
        onProjectModified: () => {
          this.onProjectModified();
          this.storyCanvasView?.updateCanvasContent();
        },
        onSelectElement: (elId, sceneId) => {
          if (elId) {
            const targetSceneId = sceneId || this.activeSceneId;
            this.activeSceneId = targetSceneId;
            this.selectedElementId = elId;
            this.selectedElementSceneId = targetSceneId;
          } else {
            this.selectedElementId = null;
            this.selectedElementSceneId = null;
          }
          this.onSelectElementCallback(elId);
          const currentScene = this.getActiveScene();
          this.updateContextualToolbar(currentScene, this.canvasWorkspace, grid);
          this.updateSmartInspector(currentScene, grid);
        },
        onOpenAssetPicker: (elOrOptions, maybeOptions) => this.openAssetPickerForElement(elOrOptions, maybeOptions),
        onDeleteElement: (el) => this.deleteElement(el, this.getActiveScene()),
        onOpenModeration: () => this.onNavAction('openModeration'),
        onPreviewWishWall: () => this.onNavAction('openWishWallPreview'),
        onQuickAddElement: (type) => this.addElementToScene(type, this.getActiveScene())
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
    const currentScene = activeScene || this.getActiveScene();
    const currentElement = selectedEl || this.getSelectedElement(currentScene);
    const workspace = canvasWorkspace || this.canvasWorkspace;
    const grid = workspaceGrid || this.workspaceGrid;

    if (action === 'editText' || action === 'edit') {
      // 1. Ensure right-side inspector is expanded
      if (this.isInspectorCollapsed) {
        this.isInspectorCollapsed = false;
        grid?.classList.remove('inspector-collapsed');
        const inspectorToggle = document.getElementById('inspectorToggleTab');
        if (inspectorToggle) {
          inspectorToggle.title = 'Collapse Inspector';
          inspectorToggle.innerHTML = '▶';
        }
      }

      // 2. Refresh Smart Inspector for the current scene & element
      this.updateSmartInspector(currentScene, grid);

      // 3. Focus corresponding text input in inspector
      const inspInput = grid?.querySelector('#inspTextContent') ||
                        grid?.querySelector('#inspTextSceneTitle') ||
                        grid?.querySelector('#inspTextSceneContent') ||
                        grid?.querySelector('#inspStdTitle') ||
                        grid?.querySelector('#inspStdSubtitle') ||
                        grid?.querySelector('#inspWishWallTitle');
      if (inspInput) {
        inspInput.focus();
        if (inspInput.select) inspInput.select();
      }

      // 4. Trigger inline text editing on canvas if DOM element exists
      if (this.storyCanvasView?.selectionManager && currentElement) {
        const domNode = workspace?.querySelector(`[data-element-id="${currentElement.id}"], [data-text-id="${currentElement.id}"]`);
        if (domNode) {
          this.storyCanvasView.selectionManager.enableInlineTextEdit(domNode, currentElement);
        }
      }
    } else if (action === 'font' || action === 'fontSize' || action === 'fontColor') {
      if (this.isInspectorCollapsed) {
        this.isInspectorCollapsed = false;
        grid?.classList.remove('inspector-collapsed');
        const inspectorToggle = document.getElementById('inspectorToggleTab');
        if (inspectorToggle) {
          inspectorToggle.title = 'Collapse Inspector';
          inspectorToggle.innerHTML = '▶';
        }
      }
      this.updateSmartInspector(currentScene, grid);
      const targetInput = grid?.querySelector(action === 'font' ? '#inspFontFamily' : (action === 'fontSize' ? '#inspFontSize' : '#inspTextColor')) ||
                          grid?.querySelector(action === 'font' ? '#inspTextSceneFontFamily' : (action === 'fontSize' ? '#inspTextSceneFontSize' : '#inspTextSceneColor'));
      if (targetInput) {
        targetInput.focus();
      }
    } else if (action === 'add') {
      const existing = workspace?.querySelector('#universalAddPopover');
      if (existing) {
        existing.remove();
        return;
      }
      const popover = new UniversalAddMenuView(
        (type) => this.addElementToScene(type, currentScene),
        () => {}
      );
      workspace?.appendChild(popover.render());
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
      this.openAssetPickerForElement(currentElement);
    } else if (action === 'timing') {
      if (currentElement) {
        const timingModal = new TimingPanelView(currentElement, currentScene, () => {
          this.onProjectModified();
          this.storyCanvasView?.updateCanvasContent();
        });
        document.body.appendChild(timingModal.render());
      } else {
        const dur = prompt('Enter scene duration in seconds (1-30):', currentScene.duration || 6);
        if (dur && !isNaN(Number(dur))) {
          currentScene.duration = Math.max(1, Math.min(30, Number(dur)));
          this.onProjectModified();
          this.storyCanvasView?.updateCanvasContent();
          this.updateSmartInspector(currentScene, grid);
        }
      }
    } else if (action === 'toggleRatioStory' || action === 'toggleViewMobile' || action === 'setModeMobile') {
      this.setPreviewMode('mobile');
    } else if (action === 'toggleRatioWide' || action === 'toggleViewDesktop' || action === 'setModeDesktop') {
      this.setPreviewMode('desktop');
    } else if (action === 'duplicate' && currentElement) {
      this.duplicateElement(currentElement, currentScene);
    } else if (action === 'delete' && currentElement) {
      this.deleteElement(currentElement, currentScene);
    } else if (action === 'bringForward' && currentElement) {
      this.reorderElement(currentElement, currentScene, 1);
    } else if (action === 'sendBackward' && currentElement) {
      this.reorderElement(currentElement, currentScene, -1);
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

    const activeScene = this.getActiveScene();
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

  openAssetPickerForElement(elOrOptions, maybeOptions = {}) {
    let el = null;
    let options = {};
    if (elOrOptions && (elOrOptions.type === 'image' || elOrOptions.type === 'video' || elOrOptions.type === 'audio' || elOrOptions.slotId) && !elOrOptions.id) {
      options = elOrOptions;
    } else {
      el = elOrOptions;
      options = maybeOptions || {};
    }

    const activeScene = this.getActiveScene();
    const targetType = options.type || el?.type || (el?.slotId && (el.slotId.includes('video') ? 'video' : 'image')) || null;
    const targetSlotId = options.slotId || el?.slotId || null;

    const modal = new AssetPickerModal({
      project: this.project,
      allAssets: this.allAssets,
      targetScene: activeScene,
      targetSlotId: targetSlotId,
      type: targetType,
      filterTab: targetType || (options.filterTab || 'compatible'),
      onProjectModified: () => {
        this.onProjectModified();
        this.storyCanvasView?.updateCanvasContent();
        this.updateSmartInspector(activeScene, this.workspaceGrid);
      },
      onSelectAsset: (asset) => {
        if (el && typeof el.onAssetSelected === 'function') {
          el.onAssetSelected(asset);
        } else if (el && asset) {
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
          if (targetSlotId) {
            if (!activeScene.slots) activeScene.slots = {};
            activeScene.slots[targetSlotId] = asset.id;
          }
          if (activeScene.template === 'hero') {
            if (!activeScene.settings) activeScene.settings = {};
            activeScene.settings.heroPhotoAssetId = asset.id;
            activeScene.settings.photoAssetId = asset.id;
          } else if (activeScene.template === 'fullscreen_photo') {
            if (!activeScene.settings) activeScene.settings = {};
            activeScene.settings.photoAssetId = asset.id;
          } else if (activeScene.template === 'video_showcase' || activeScene.template === 'video') {
            if (!activeScene.settings) activeScene.settings = {};
            activeScene.settings.videoAssetId = asset.id;
          } else if (activeScene.template === 'photo_gallery' || activeScene.template === 'collage') {
            if (!activeScene.slots) activeScene.slots = {};
            if (options.idx !== undefined) {
              if (!Array.isArray(activeScene.slots.gallery_photos)) {
                activeScene.slots.gallery_photos = [];
              }
              activeScene.slots.gallery_photos[options.idx] = asset.id;
            }
          }
        }
        // Ensure central celebration library includes asset
        if (this.project && asset) {
          if (!Array.isArray(this.project.assets)) this.project.assets = [];
          if (!this.project.assets.some(a => a.id === asset.id)) {
            this.project.assets.push(asset);
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

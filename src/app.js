/**
 * Birthday Studio - Main Application Controller & Entry Point
 * Phase 10: Birthday Studio 3.0 Final Product & Launch Readiness
 */

import { injectSpeedInsights } from 'https://cdn.jsdelivr.net/npm/@vercel/speed-insights@1/+esm';
import { inject as injectAnalytics } from '@vercel/analytics';
import { authRepository } from './services/AuthRepository.js';
import { projectRepository } from './services/ProjectRepository.js';
import { assetRepository } from './services/AssetRepository.js';
import { publishedProjectRepository } from './services/PublishedProjectRepository.js';
import { wishRepository } from './services/WishRepository.js';
import { sceneRepository } from './services/SceneRepository.js';
import { AutoArrangeService } from './services/AutoArrangeService.js';
import { AutosaveService } from './services/AutosaveService.js';
import { UndoRedoService } from './services/UndoRedoService.js';
import { VersionHistoryService } from './services/VersionHistoryService.js';
import { DraftRecoveryService } from './services/DraftRecoveryService.js';
import { CreatorActivityService } from './services/CreatorActivityService.js';
import { KeyboardShortcutService } from './services/KeyboardShortcutService.js';

import { AuthView } from './views/AuthView.js';
import { DashboardView } from './views/DashboardView.js';
import { CelebrationWizardView } from './views/CelebrationWizardView.js';
import { TopNavView } from './views/TopNavView.js';
import { AssetLibraryView } from './views/AssetLibraryView.js';
import { StoryCanvasView } from './views/StoryCanvasView.js';
import { SceneTimelineView } from './views/SceneTimelineView.js';
import { SceneEditorView } from './views/SceneEditorView.js';
import { SceneTemplatePickerView } from './views/SceneTemplatePickerView.js';
import { ModernEditorLayout } from './views/editor/ModernEditorLayout.js';
import { PublishPreflightView } from './views/PublishPreflightView.js';
import { PublishConfirmationView } from './views/PublishConfirmationView.js';
import { VersionHistoryModal } from './views/VersionHistoryModal.js';
import { PublishSuccessView } from './views/PublishSuccessView.js';
import { WishWallView } from './views/WishWallView.js';
import { QuickActionMenu } from './views/QuickActionMenu.js';
import { CreatorSettingsView } from './views/CreatorSettingsView.js';
import { ProjectStyleModal } from './views/ProjectStyleModal.js';
import { CountdownModal } from './views/CountdownModal.js';
import { StyleRegistry } from './data/styles/StyleRegistry.js';
import { CelebrationPreviewView } from './views/CelebrationPreviewView.js';
import { WishModerationView } from './views/WishModerationView.js';
import { WishWallPreviewModal } from './views/WishWallPreviewModal.js';
import { RecipientPlayerView } from './views/RecipientPlayerView.js';
import { RecipientLoadingView } from './views/RecipientLoadingView.js';
import { RecipientErrorView } from './views/RecipientErrorView.js';
import { TestRunner } from './utils/TestRunner.js';
import { Toast } from './utils/Toast.js';
import './components/MediaViewerModal.js';

export class BirthdayStudioApp {
  constructor() {
    this.user = null;
    this.project = null;
    this.selectedSceneId = null;
    this.selectedElementId = null;
    this.allAssets = [];
    this.pendingWishCount = 0;
    this.latestPublication = null;
    this.activeWorkspaceTab = 'canvas';
    this.currentDashboardView = null;

    this.autosaveStatus = 'Saved just now';
    this.autosaveService = new AutosaveService({
      onStatusChange: (status) => {
        this.autosaveStatus = status;
        const lbl = document.getElementById('navAutosaveLabel');
        if (lbl) lbl.textContent = status;
      }
    });
    this.undoRedoService = new UndoRedoService();
  }

  async start() {
    window.addEventListener('hashchange', () => this.route());
    this.attachGlobalKeybindings();
    await this.route();
  }

  attachGlobalKeybindings() {
    KeyboardShortcutService.init({
      onQuickAction: () => this.openQuickActionMenu(),
      onSave: () => {
        VersionHistoryService.saveVersion(this.project, 'Manual Snapshot');
        Toast.show('Manual draft snapshot saved to history!', 'success');
      },
      onUndo: () => this.handleUndo(),
      onRedo: () => this.handleRedo(),
      onDuplicateScene: () => {
        const target = this.project?.scenes?.find(s => s.id === this.selectedSceneId);
        if (target) {
          const dup = sceneRepository.duplicateScene(target);
          this.project.scenes.push(dup);
          sceneRepository.normalizeOrders(this.project.scenes);
          Toast.show('Scene duplicated!', 'success');
          this.selectedSceneId = dup.id;
          this.notifyProjectModified();
          this.refreshStateAndRenderEditor();
        }
      },
      onDeleteScene: () => {
        if (this.selectedSceneId && (this.project?.scenes?.length || 0) > 1) {
          sceneRepository.deleteScene(this.project, this.selectedSceneId);
          Toast.show('Scene deleted.', 'info');
          this.selectedSceneId = this.project.scenes[0]?.id;
          this.notifyProjectModified();
          this.refreshStateAndRenderEditor();
        }
      },
      onPrevScene: () => {
        const scenes = [...(this.project?.scenes || [])].sort((a, b) => a.order - b.order);
        const idx = scenes.findIndex(s => s.id === this.selectedSceneId);
        if (idx > 0) {
          this.selectedSceneId = scenes[idx - 1].id;
          this.refreshStateAndRenderEditor();
        }
      },
      onNextScene: () => {
        const scenes = [...(this.project?.scenes || [])].sort((a, b) => a.order - b.order);
        const idx = scenes.findIndex(s => s.id === this.selectedSceneId);
        if (idx < scenes.length - 1) {
          this.selectedSceneId = scenes[idx + 1].id;
          this.refreshStateAndRenderEditor();
        }
      }
    });
  }

  openQuickActionMenu() {
    const menu = new QuickActionMenu((cmdId) => {
      if (cmdId === 'create') window.location.hash = '#wizard';
      if (cmdId === 'presets') window.location.hash = '#dashboard';
      if (cmdId === 'editor') window.location.hash = '#editor';
      if (cmdId === 'preview') this.handleNavAction('previewExperience');
      if (cmdId === 'publish') this.handleNavAction('publish');
      if (cmdId === 'settings') this.handleNavAction('openSettings');
    });
    document.body.appendChild(menu.render());
  }

  async route() {
    let rawHash = window.location.hash || '';

    // Mobile fallback: Check pathname and query params if hash is empty
    if (!rawHash) {
      const pathname = window.location.pathname || '';
      if (pathname.startsWith('/view/')) {
        rawHash = '#' + pathname.substring(1);
      } else if (pathname.startsWith('/wishwall/')) {
        rawHash = '#' + pathname.substring(1);
      } else {
        const search = new URLSearchParams(window.location.search);
        const viewId = search.get('view') || search.get('id');
        const wallId = search.get('wishwall');
        if (viewId) {
          rawHash = `#view/${viewId}`;
        } else if (wallId) {
          rawHash = `#wishwall/${wallId}`;
        } else {
          rawHash = '#dashboard';
        }
      }
    }

    // Normalize hash: handles #view/..., #/view/..., #wishwall/..., #/wishwall/..., etc.
    const cleanHash = rawHash.replace(/^#\/?/, '#');
    const hash = cleanHash;

    // 1. PUBLIC RECIPIENT ROUTE (#view/<id> or #/view/<id>)
    if (cleanHash.startsWith('#view/')) {
      const routePart = cleanHash.split('?')[0];
      const publishedId = routePart.replace(/^#view\//, '').replace(/\/$/, '').trim();

      if (!publishedId) {
        const errView = new RecipientErrorView('Invalid celebration link.');
        document.body.innerHTML = '';
        document.body.appendChild(errView.render());
        return;
      }

      // Render smooth loading screen first
      const loader = new RecipientLoadingView();
      document.body.innerHTML = '';
      document.body.appendChild(loader.render());

      try {
        const recipientView = new RecipientPlayerView(publishedId);
        const elem = await recipientView.render();
        document.body.innerHTML = '';
        document.body.appendChild(elem);
      } catch (err) {
        console.error('[App] Viewer rendering error:', err);
        const errView = new RecipientErrorView('An unexpected error occurred while loading this celebration.');
        document.body.innerHTML = '';
        document.body.appendChild(errView.render());
      }
      return;
    }

    // 2. DEDICATED WISH WALL ROUTE (#wishwall/<id> or #/wishwall/<id>)
    if (cleanHash.startsWith('#wishwall/')) {
      const routePart = cleanHash.split('?')[0];
      const publishedId = routePart.replace(/^#wishwall\//, '').replace(/\/$/, '').trim();

      if (!publishedId) {
        const errView = new RecipientErrorView('Invalid celebration link.');
        document.body.innerHTML = '';
        document.body.appendChild(errView.render());
        return;
      }

      const loader = new RecipientLoadingView('Loading Wish Wall...');
      document.body.innerHTML = '';
      document.body.appendChild(loader.render());

      try {
        const wishWallView = new WishWallView(publishedId);
        const elem = await wishWallView.render();
        document.body.innerHTML = '';
        document.body.appendChild(elem);
      } catch (err) {
        console.error('[App] WishWall rendering error:', err);
        const errView = new RecipientErrorView('An unexpected error occurred while loading the wish wall.');
        document.body.innerHTML = '';
        document.body.appendChild(errView.render());
      }
      return;
    }

    // 3. AUTOMATED TEST SUITE (#run-tests)
    if (cleanHash === '#run-tests') {
      const results = await TestRunner.runAllTests();
      document.body.innerHTML = `
        <div style="padding: 40px; background: #0f0e17; color: #fff; font-family: sans-serif; min-height: 100vh;">
          <h2>🧪 Celebration Studio 2.0 Complete Test Suite Verification</h2>
          <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
            ${results.map(r => `
              <div style="padding: 10px 14px; border-radius: 6px; background: ${r.pass ? '#1b382b' : '#421616'}; border: 1px solid ${r.pass ? '#2cb67d' : '#e63946'}; display:flex; justify-space-between;">
                <div><strong style="color: ${r.pass ? '#2cb67d' : '#ff7675'}">${r.pass ? '✅ PASS' : '❌ FAIL'}</strong>: ${r.test}</div>
                <div style="font-size: 0.8rem; color: #94a1b2;">${r.detail}</div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 20px;">
            <a href="#dashboard" style="color: #7f5af0; text-decoration: underline;">Return to Creator Dashboard</a>
          </div>
        </div>
      `;
      return;
    }

    // 4. AUTHENTICATION GATING FOR CREATOR ROUTES
    this.user = await authRepository.getCurrentUser();
    if (!this.user && cleanHash !== '#login') {
      window.location.hash = '#login';
      return;
    }

    if (cleanHash === '#login') {
      if (this.user) {
        window.location.hash = '#dashboard';
        return;
      }
      const authView = new AuthView(() => { window.location.hash = '#dashboard'; });
      const appRoot = this.getAppRoot();
      appRoot.innerHTML = '';
      appRoot.appendChild(authView.render());
      return;
    }

    if (cleanHash.startsWith('#dashboard')) {
      const urlParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : '');
      const activeTab = urlParams.get('tab') || 'my_creations';

      const existingDashboard = document.getElementById('dashboardPageRoot');
      if (this.currentDashboardView && existingDashboard && document.body.contains(existingDashboard)) {
        await this.currentDashboardView.switchTab(activeTab);
        return;
      }

      const dashView = new DashboardView({
        user: this.user,
        activeTab,
        onNavigateEditor: (projectId) => { 
          this.currentDashboardView = null;
          window.location.hash = `#editor?project=${projectId}`; 
        },
        onLogout: () => { 
          this.currentDashboardView = null;
          window.location.hash = '#login'; 
        }
      });
      this.currentDashboardView = dashView;
      const elem = await dashView.render();
      const appRoot = this.getAppRoot();
      appRoot.innerHTML = '';
      appRoot.appendChild(elem);
      return;
    }

    this.currentDashboardView = null;

    if (cleanHash.startsWith('#wizard')) {
      const urlParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : '');
      const presetId = urlParams.get('preset') || 'birthday_wisher';
      const variant = urlParams.get('variant') || '3-scene';

      const wizardView = new CelebrationWizardView({
        presetId,
        variant,
        currentUser: this.user,
        onFinish: (projectId) => { window.location.hash = `#editor?project=${projectId}`; }
      });
      const elem = wizardView.render();
      const appRoot = this.getAppRoot();
      appRoot.innerHTML = '';
      appRoot.appendChild(elem);
      return;
    }

    if (cleanHash.startsWith('#editor')) {
      const urlParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : '');
      const projectId = urlParams.get('project');
      await this.loadProject(projectId);
      await this.refreshStateAndRenderEditor();
      return;
    }

    window.location.hash = '#dashboard';
  }

  getAppRoot() {
    let root = document.getElementById('appRoot');
    if (!root) {
      root = document.createElement('div');
      root.id = 'appRoot';
      document.body.appendChild(root);
    }
    return root;
  }

  async loadProject(targetId = null) {
    const projectId = targetId || localStorage.getItem('birthday_studio_last_project_id');
    if (projectId) {
      this.project = await projectRepository.getProject(projectId);
    }

    if (!this.project) {
      const all = await projectRepository.getAllProjects(this.user?.id);
      if (all.length > 0) {
        this.project = all[0];
      } else {
        this.project = projectRepository.createDefaultProject({}, this.user?.id);
        await projectRepository.saveProject(this.project, this.user?.id);
      }
    }

    if (this.project && this.project.scenes && this.project.scenes.length > 0) {
      if (!this.selectedSceneId || !this.project.scenes.some(s => s.id === this.selectedSceneId)) {
        this.selectedSceneId = this.project.scenes[0].id;
      }
    }

    // Synchronize canonical publication state from persistent database
    if (this.project) {
      try {
        const canonicalPub = await publishedProjectRepository.getCanonicalPublicationForProject(this.project.id);
        if (canonicalPub && canonicalPub.id) {
          if (!this.project.published || this.project.publicationId !== canonicalPub.id) {
            this.project.published = true;
            this.project.publicationId = canonicalPub.id;
            await projectRepository.saveProject(this.project, this.user?.id);
          }
          this.latestPublication = canonicalPub;
        }
      } catch (e) {
        console.warn('[App] Canonical publication sync warning:', e);
      }
    }
  }

  async refreshStateAndRenderEditor() {
    if (!this.project) return;

    if (!this.editorViewMode) {
      this.editorViewMode = localStorage.getItem('birthday_studio_view_mode') || 'desktop';
    }
    if (!this.canvasRatio) {
      this.canvasRatio = localStorage.getItem('birthday_studio_canvas_ratio') || (this.editorViewMode === 'desktop' ? 'ratio-widescreen' : 'ratio-story');
    }

    this.allAssets = await assetRepository.getAllAssets();
    this.pendingWishCount = await wishRepository.getPendingCount(this.project.id);
    this.latestPublication = await publishedProjectRepository.getLatestPublicationForProject(this.project.id);

    const appRoot = this.getAppRoot();
    appRoot.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'celebration-studio-layout';

    // 1. Top Nav Bar
    const navView = new TopNavView({
      project: this.project,
      publication: this.latestPublication,
      pendingWishCount: this.pendingWishCount,
      autosaveStatus: this.autosaveStatus,
      canUndo: this.undoRedoService.canUndo(),
      canRedo: this.undoRedoService.canRedo(),
      onAction: (action) => this.handleNavAction(action)
    });
    layout.appendChild(navView.render());

    // 2. Modern Space-Efficient Story Visual Editor Layout
    const modernEditor = new ModernEditorLayout({
      project: this.project,
      selectedSceneId: this.selectedSceneId,
      selectedElementId: this.selectedElementId,
      allAssets: this.allAssets,
      user: this.user,
      canvasRatio: this.canvasRatio,
      viewMode: this.editorViewMode,
      onSelectScene: (sceneId) => {
        this.selectedSceneId = sceneId;
        this.selectedElementId = null;
      },
      onSelectElement: (elementId) => {
        this.selectedElementId = elementId;
      },
      onViewModeChange: (viewMode, canvasRatio) => {
        this.editorViewMode = viewMode;
        this.canvasRatio = canvasRatio;
        localStorage.setItem('birthday_studio_view_mode', viewMode);
        localStorage.setItem('birthday_studio_canvas_ratio', canvasRatio);
      },
      onProjectModified: () => {
        this.notifyProjectModified();
      },
      onNavAction: (action) => this.handleNavAction(action)
    });
    this.currentEditorLayout = modernEditor;
    const editorElem = await modernEditor.render();
    layout.appendChild(editorElem);

    appRoot.appendChild(layout);
  }

  notifyProjectModified() {
    this.undoRedoService.pushState(this.project);
    this.autosaveService.scheduleSave(this.project, this.user?.id);
    VersionHistoryService.saveVersion(this.project, 'Auto Snapshot');
    DraftRecoveryService.saveRecoverySnapshot(this.project);
    CreatorActivityService.logActivity('Draft Edited', this.project?.recipient?.name, '✏️');
  }

  handleUndo() {
    const prev = this.undoRedoService.undo(this.project);
    if (prev) {
      this.project = prev;
      this.autosaveService.scheduleSave(this.project, this.user?.id);
      Toast.show('Undo successful', 'info');
      this.refreshStateAndRenderEditor();
    }
  }

  handleRedo() {
    const next = this.undoRedoService.redo(this.project);
    if (next) {
      this.project = next;
      this.autosaveService.scheduleSave(this.project, this.user?.id);
      Toast.show('Redo successful', 'info');
      this.refreshStateAndRenderEditor();
    }
  }

  async handleNavAction(action) {
    if (action === 'goDashboard') { window.location.hash = '#dashboard'; return; }
    if (action === 'openCmdMenu') { this.openQuickActionMenu(); return; }
    if (action === 'undo') this.handleUndo();
    if (action === 'redo') this.handleRedo();
    if (action === 'newProject') window.location.hash = '#wizard';

    if (action === 'openVersionHistory') {
      const historyModal = new VersionHistoryModal(
        this.project,
        async (restoredProj) => {
          this.project = restoredProj;
          this.selectedSceneId = restoredProj.scenes[0]?.id;
          this.notifyProjectModified();
          await this.refreshStateAndRenderEditor();
        }
      );
      document.body.appendChild(await historyModal.render());
    }

    if (action === 'openSettings') {
      const settingsView = new CreatorSettingsView(() => this.refreshStateAndRenderEditor());
      document.body.appendChild(settingsView.render());
    }

    if (action === 'openStyle' || action === 'style') {
      const styleModal = new ProjectStyleModal(this.project, async (selectedStyleId) => {
        const style = StyleRegistry.getStyleById(selectedStyleId);
        this.project.theme = style.id;
        this.project.settings = this.project.settings || {};
        this.project.settings.styleConfig = {
          id: style.id,
          name: style.name,
          colors: style.colors,
          typography: style.typography,
          transition: style.transition,
          animation: style.animation
        };
        if (this.project.scenes) {
          this.project.scenes.forEach(s => {
            s.transition = style.transition || s.transition;
          });
        }
        await projectRepository.saveProject(this.project, this.user?.id);
        await publishedProjectRepository.syncPublicationSnapshot(this.project.id, this.project);
        this.notifyProjectModified();
        CreatorActivityService.logActivity('Celebration Style Changed', style.name, '🎨');
        Toast.show(`✨ Celebration style updated to "${style.name}"!`, 'success');
        await this.refreshStateAndRenderEditor();
      });
      document.body.appendChild(styleModal.render());
      return;
    }

    if (action === 'openCountdown' || action === 'countdown') {
      const countdownModal = new CountdownModal(this.project, async (updatedCountdown) => {
        this.project.countdown = updatedCountdown;
        await projectRepository.saveProject(this.project, this.user?.id);
        await publishedProjectRepository.syncPublicationSnapshot(this.project.id, this.project);
        this.notifyProjectModified();
        CreatorActivityService.logActivity('Countdown Updated', updatedCountdown.enabled ? 'Enabled' : 'Disabled', '⏳');
        Toast.show(`✨ Countdown timer ${updatedCountdown.enabled ? 'activated' : 'saved'}!`, 'success');
        await this.refreshStateAndRenderEditor();
      });
      document.body.appendChild(countdownModal.render());
      return;
    }

    if (action === 'autoArrange') {
      await AutoArrangeService.autoArrangeProject(this.project);
      this.notifyProjectModified();
      await this.refreshStateAndRenderEditor();
      Toast.show('Smart Auto-Arrange completed!', 'success');
    }

    if (action === 'previewExperience') {
      const previewer = new CelebrationPreviewView({
        project: this.project,
        initialSceneId: this.selectedSceneId,
        viewMode: this.editorViewMode || 'desktop',
        canvasRatio: this.canvasRatio || (this.editorViewMode === 'desktop' ? 'ratio-widescreen' : 'ratio-story'),
        allAssets: this.allAssets,
        onContinueEdit: (selectedSceneId) => {
          if (selectedSceneId) this.selectedSceneId = selectedSceneId;
          this.refreshStateAndRenderEditor();
        },
        onPublish: () => this.showPublishPreflight()
      });
      const elem = await previewer.render();
      document.body.appendChild(elem);
    }


    if (action === 'openModeration') {
      const modView = new WishModerationView(
        this.project,
        () => this.refreshStateAndRenderEditor(),
        async (updatedProj) => {
          this.project = updatedProj;
          this.notifyProjectModified();
        }
      );
      document.body.appendChild(await modView.render());
    }

    if (action === 'openWishWallPreview' || action === 'previewWishWall') {
      const activeScene = this.project.scenes?.find(s => s.id === this.selectedSceneId) || this.project.scenes?.find(s => s.template === 'wish_wall' || s.template === 'wish-wall');
      const previewModal = new WishWallPreviewModal({
        project: this.project,
        scene: activeScene,
        viewMode: this.editorViewMode || 'desktop',
        onClose: () => this.refreshStateAndRenderEditor(),
        onPublish: () => this.showPublishPreflight(),
        onOpenModeration: () => this.handleNavAction('openModeration')
      });
      document.body.appendChild(await previewModal.render());
      return;
    }

    if (action === 'toggleFocusMode') {
      const editorRoot = document.getElementById('modernEditorRoot');
      if (editorRoot && this.currentEditorLayout) {
        this.currentEditorLayout.toggleFocusMode(editorRoot);
      }
      return;
    }

    if (action === 'openShare') {
      if (this.latestPublication && !this.latestPublication.isExpired()) {
        const shareModal = new ShareCelebrationView(this.latestPublication);
        document.body.appendChild(shareModal.render());
      } else {
        Toast.show('Publish your celebration first to share it with recipient!', 'warning');
        this.showPublishPreflight();
      }
    }

    if (action === 'publish' || action === 'republish') {
      this.showPublishPreflight(action === 'republish');
    }
  }

  openQuickActionMenu() {
    const existing = document.getElementById('quickActionModalRoot');
    if (existing) existing.remove();

    const menu = new QuickActionMenu((cmdId) => {
      if (cmdId === 'create') window.location.hash = '#wizard';
      else if (cmdId === 'focus') this.handleNavAction('toggleFocusMode');
      else if (cmdId === 'style') this.handleNavAction('openStyle');
      else if (cmdId === 'countdown') this.handleNavAction('openCountdown');
      else if (cmdId === 'presets') window.location.hash = '#dashboard?tab=presets';
      else if (cmdId === 'editor') window.location.hash = `#editor?project=${this.project?.id || ''}`;
      else if (cmdId === 'preview') this.handleNavAction('previewExperience');
      else if (cmdId === 'publish') this.handleNavAction('publish');
      else if (cmdId === 'settings') this.handleNavAction('openSettings');
    });
    document.body.appendChild(menu.render());
  }

  showPublishPreflight(isRepublish = false) {
    const isUpdate = Boolean(this.project?.published || this.project?.publicationId || this.latestPublication);
    const preflight = new PublishPreflightView(
      this.project,
      async () => {
        const confirmView = new PublishConfirmationView(this.project, async (selectedDays = null) => {
          try {
            Toast.show(isUpdate ? 'Updating celebration link...' : 'Publishing celebration...', 'info');
            const pub = await publishedProjectRepository.publishProject(this.project, selectedDays);

            CreatorActivityService.logActivity(
              isUpdate ? 'Celebration Link Updated' : 'Celebration Published',
              this.project?.recipient?.name,
              '🚀'
            );
            Toast.show(isUpdate ? 'Link updated successfully!' : 'Celebration published successfully!', 'success');
            await this.refreshStateAndRenderEditor();
            this.showPublishSuccessCeremony(pub, isUpdate);
          } catch (pubErr) {
            console.error('[App] Publication failed:', pubErr);
            Toast.show(`Publication failed: ${pubErr.message || 'Check connection'}`, 'error');
          }
        });
        document.body.appendChild(confirmView.render());
      }
    );
    document.body.appendChild(preflight.render());
  }

  showPublishSuccessCeremony(pub, isUpdate = false) {
    const successView = new PublishSuccessView(pub, () => {
      window.location.hash = '#dashboard';
    }, isUpdate);
    document.body.appendChild(successView.render());
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Vercel Speed Insights safely
  try {
    if (typeof injectSpeedInsights === 'function') {
      injectSpeedInsights();
    }
  } catch (e) {
    console.debug('[Vercel Speed Insights] Init skipped:', e);
  }

  // Initialize Vercel Web Analytics safely
  try {
    if (typeof injectAnalytics === 'function') {
      injectAnalytics();
    }
  } catch (e) {
    console.debug('[Vercel Analytics] Init skipped:', e);
  }
  
  const app = new BirthdayStudioApp();
  app.start();
});

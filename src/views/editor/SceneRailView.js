/**
 * Birthday Studio - Ultra-Compact Modern Scene Rail View
 * Minimalist vertical filmstrip with thumbnails, duration, reordering, and contextual action menu.
 * Maintains single-source-of-truth active scene outline with real-time reactive synchronization.
 */

import { Toast } from '../../utils/Toast.js';
import { sceneRepository } from '../../services/SceneRepository.js';

export class SceneRailView {
  constructor(options = {}) {
    this.project = options.project || {};
    this.selectedSceneId = options.selectedSceneId || null;
    this.onSelectScene = options.onSelectScene || (() => {});
    this.onAddScene = options.onAddScene || (() => {});
    this.onProjectModified = options.onProjectModified || (() => {});
    this.isMobile = options.isMobile || false;
    this.activeMenuSceneId = null;
  }

  setSelectedSceneId(sceneId) {
    this.selectedSceneId = sceneId;
    this.updateActiveSceneOutline();
  }

  updateActiveSceneOutline() {
    // 1. Update Desktop Rail Cards
    const railRoot = document.getElementById('modernSceneRail') || document.querySelector('.modern-scene-rail');
    if (railRoot) {
      const cards = railRoot.querySelectorAll('.rail-scene-card');
      cards.forEach(card => {
        const isCurrent = card.dataset.sceneId === this.selectedSceneId;
        card.classList.toggle('active', isCurrent);
      });
    }

    // 2. Update Mobile Filmstrip Cards
    const mobileStrip = document.getElementById('mobileSceneFilmstrip') || document.querySelector('.mobile-scene-filmstrip');
    if (mobileStrip) {
      const mCards = mobileStrip.querySelectorAll('.mobile-filmstrip-card');
      mCards.forEach(card => {
        const isCurrent = card.dataset.sceneId === this.selectedSceneId;
        card.classList.toggle('active', isCurrent);
      });
    }
  }

  renderCardsHtml(scenes) {
    return scenes.map((scene, idx) => {
      const isActive = scene.id === this.selectedSceneId;
      const icon = this.getSceneIcon(scene);
      return `
        <div class="rail-scene-card ${isActive ? 'active' : ''}" data-scene-id="${scene.id}" draggable="true" title="${scene.name || `Scene ${idx + 1}`}">
          <span class="rail-scene-num">${String(idx + 1).padStart(2, '0')}</span>
          <div class="rail-scene-preview-icon">${icon}</div>
          <span class="rail-scene-duration">${scene.duration || 5}s</span>
          <button class="rail-scene-more-btn" data-scene-menu="${scene.id}" title="Scene options">⋯</button>
        </div>
      `;
    }).join('') + `
      <button class="rail-add-scene-btn" id="btnRailAddScene" title="Add New Scene">
        <span style="font-size:1.1rem; line-height:1;">➕</span>
        <span>Add</span>
      </button>
    `;
  }

  renderMobileCardsHtml(scenes) {
    return scenes.map((scene, idx) => {
      const isActive = scene.id === this.selectedSceneId;
      return `
        <div class="mobile-filmstrip-card ${isActive ? 'active' : ''}" data-scene-id="${scene.id}">
          ${String(idx + 1).padStart(2, '0')}
        </div>
      `;
    }).join('') + `
      <button class="mobile-filmstrip-card" id="btnMobileAddScene" style="border: 1px dashed var(--border);" title="Add Scene">
        ➕
      </button>
    `;
  }

  render() {
    const scenes = (this.project.scenes || []).sort((a, b) => a.order - b.order);

    if (this.isMobile) {
      return this.renderMobileFilmstrip(scenes);
    }

    return this.renderDesktopRail(scenes);
  }

  renderDesktopRail(scenes) {
    const rail = document.createElement('aside');
    rail.className = 'modern-scene-rail';
    rail.id = 'modernSceneRail';

    rail.innerHTML = `
      <div class="rail-scenes-list" id="railScenesContainer">
        ${this.renderCardsHtml(scenes)}
      </div>

      <!-- Floating Scene Context Menu -->
      <div class="rail-scene-context-menu" id="railSceneContextMenu" style="display:none; position:fixed; background:var(--surface-elevated, #1c1830); border:1px solid var(--border, rgba(255,255,255,0.15)); border-radius:var(--radius-md, 10px); box-shadow:0 12px 32px rgba(0,0,0,0.6); padding:6px; z-index:500; min-width:150px; flex-direction:column; gap:2px;">
        <button class="more-menu-item" data-scene-action="duplicate">
          <span>📋</span> <span>Duplicate</span>
        </button>
        <button class="more-menu-item" data-scene-action="rename">
          <span>✏️</span> <span>Rename</span>
        </button>
        <button class="more-menu-item" data-scene-action="timing">
          <span>⏱️</span> <span>Duration & Transition</span>
        </button>
        <div style="height:1px; background:var(--border, rgba(255,255,255,0.1)); margin:3px 0;"></div>
        <button class="more-menu-item text-danger" data-scene-action="delete" style="color:var(--danger, #ff4757);">
          <span>🗑️</span> <span>Delete Scene</span>
        </button>
      </div>
    `;

    this.attachDesktopEvents(rail, scenes);
    return rail;
  }

  renderMobileFilmstrip(scenes) {
    const strip = document.createElement('div');
    strip.className = 'mobile-scene-filmstrip';
    strip.id = 'mobileSceneFilmstrip';

    strip.innerHTML = this.renderMobileCardsHtml(scenes);

    strip.addEventListener('click', (e) => {
      const card = e.target.closest('[data-scene-id]');
      if (card) {
        const sceneId = card.dataset.sceneId;
        if (sceneId) {
          this.setSelectedSceneId(sceneId);
          this.onSelectScene(sceneId);
        }
        return;
      }

      if (e.target.closest('#btnMobileAddScene')) {
        this.onAddScene();
      }
    });

    return strip;
  }

  getSceneIcon(scene) {
    const t = (scene.template || '').toLowerCase();
    if (t.includes('hero') || t.includes('intro')) return '🌟';
    if (t.includes('photo') || t.includes('gallery')) return '🖼️';
    if (t.includes('cake') || t.includes('wish')) return '🎂';
    if (t.includes('video')) return '🎬';
    if (t.includes('countdown')) return '⏳';
    if (t.includes('message') || t.includes('card')) return '💌';
    return '✨';
  }

  attachDesktopEvents(rail, scenes) {
    const contextMenu = rail.querySelector('#railSceneContextMenu');

    // 1. Click to select scene or open scene menu
    rail.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('[data-scene-menu]');
      if (menuBtn) {
        e.stopPropagation();
        const sceneId = menuBtn.dataset.sceneMenu;
        this.activeMenuSceneId = sceneId;
        const rect = menuBtn.getBoundingClientRect();
        if (contextMenu) {
          contextMenu.style.display = 'flex';
          contextMenu.style.left = `${rect.right + 6}px`;
          contextMenu.style.top = `${rect.top}px`;
        }
        return;
      }

      const card = e.target.closest('.rail-scene-card');
      if (card) {
        const sceneId = card.dataset.sceneId;
        if (sceneId) {
          this.setSelectedSceneId(sceneId);
          this.onSelectScene(sceneId);
        }
        return;
      }

      if (e.target.closest('#btnRailAddScene')) {
        this.onAddScene();
      }
    });

    // Close context menu on outside click
    document.addEventListener('click', (e) => {
      if (!rail.contains(e.target) && contextMenu && contextMenu.style.display !== 'none') {
        contextMenu.style.display = 'none';
        this.activeMenuSceneId = null;
      }
    });

    // Context menu actions
    if (contextMenu) {
      contextMenu.addEventListener('click', (e) => {
        const item = e.target.closest('[data-scene-action]');
        if (!item || !this.activeMenuSceneId) return;

        const action = item.dataset.sceneAction;
        const sceneId = this.activeMenuSceneId;
        contextMenu.style.display = 'none';
        this.activeMenuSceneId = null;

        const targetScene = scenes.find(s => s.id === sceneId);
        if (!targetScene) return;

        if (action === 'duplicate') {
          const clone = sceneRepository.duplicateScene(this.project, sceneId);
          if (clone) {
            this.selectedSceneId = clone.id;
            this.onProjectModified();
            this.onSelectScene(clone.id);
            Toast.show('Scene duplicated', 'success');
          }
        } else if (action === 'rename') {
          const newName = prompt('Enter new scene name:', targetScene.name);
          if (newName && newName.trim()) {
            targetScene.name = newName.trim();
            this.onProjectModified();
          }
        } else if (action === 'timing') {
          this.onSelectScene(sceneId);
          const dur = prompt('Enter scene duration in seconds (1-30):', targetScene.duration || 5);
          if (dur && !isNaN(Number(dur))) {
            targetScene.duration = Math.max(1, Math.min(30, Number(dur)));
            this.onProjectModified();
          }
        } else if (action === 'delete') {
          if (this.project.scenes.length <= 1) {
            Toast.show('Cannot delete the only scene', 'warning');
            return;
          }
          if (confirm(`Delete "${targetScene.name}"?`)) {
            sceneRepository.deleteScene(this.project, sceneId);
            if (this.selectedSceneId === sceneId) {
              this.selectedSceneId = this.project.scenes[0]?.id || null;
            }
            this.onProjectModified();
            this.onSelectScene(this.selectedSceneId);
            Toast.show('Scene deleted', 'info');
          }
        }
      });
    }

    // 2. Drag and drop reordering
    let draggedId = null;
    rail.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.rail-scene-card');
      if (card) {
        draggedId = card.dataset.sceneId;
        e.dataTransfer.setData('text/plain', draggedId);
        card.style.opacity = '0.4';
      }
    });

    rail.addEventListener('dragend', (e) => {
      const card = e.target.closest('.rail-scene-card');
      if (card) card.style.opacity = '1';
    });

    rail.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    rail.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetCard = e.target.closest('.rail-scene-card');
      if (targetCard && draggedId) {
        const targetId = targetCard.dataset.sceneId;
        if (draggedId !== targetId) {
          const fromIdx = scenes.findIndex(s => s.id === draggedId);
          const toIdx = scenes.findIndex(s => s.id === targetId);
          if (fromIdx !== -1 && toIdx !== -1) {
            const [moved] = scenes.splice(fromIdx, 1);
            scenes.splice(toIdx, 0, moved);
            scenes.forEach((s, i) => { s.order = i + 1; });
            this.project.scenes = scenes;
            this.onProjectModified();
          }
        }
      }
    });
  }
}

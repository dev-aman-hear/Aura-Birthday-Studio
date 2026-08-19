/**
 * Birthday Studio - Horizontal Scene Timeline View (Section 2)
 * Horizontal Scene Strip with Duplicate, Reorder & Add Scene Controls
 */

import { sceneRepository } from '../services/SceneRepository.js';
import { Toast } from '../utils/Toast.js';

export class SceneTimelineView {
  constructor(options = {}) {
    this.project = options.project;
    this.selectedSceneId = options.selectedSceneId;
    this.onSelectScene = options.onSelectScene || (() => {});
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onOpenAddSceneModal = options.onOpenAddSceneModal || (() => {});
  }

  render() {
    const timeline = document.createElement('div');
    timeline.className = 'scene-timeline-strip-container';
    timeline.id = 'sceneTimelineRoot';

    const scenes = [...(this.project.scenes || [])].sort((a, b) => a.order - b.order);

    timeline.innerHTML = `
      <div class="timeline-scroll-strip" id="timelineScrollStrip">
        ${scenes.map((scene, idx) => {
          const isSelected = scene.id === this.selectedSceneId;
          const assetCount = (scene.assetIds || []).length;

          return `
            <div class="timeline-scene-card ${isSelected ? 'selected' : ''}" data-scene-id="${scene.id}">
              <div class="timeline-card-header">
                <span class="scene-num-badge">#${idx + 1}</span>
                <span class="scene-title-text">${scene.name}</span>
              </div>

              <div class="timeline-card-meta">
                <span>⏱️ ${scene.duration}s</span>
                <span>🖼️ ${assetCount}</span>
              </div>

              <div class="timeline-card-actions">
                ${idx > 0 ? `<button class="btn btn-ghost btn-compact btn-move-left" data-idx="${idx}" title="Move left">←</button>` : ''}
                ${idx < scenes.length - 1 ? `<button class="btn btn-ghost btn-compact btn-move-right" data-idx="${idx}" title="Move right">→</button>` : ''}
                <button class="btn btn-ghost btn-compact btn-dup-scene" data-scene-id="${scene.id}" title="Duplicate Scene (Ctrl+D)">📋</button>
                ${scenes.length > 1 ? `<button class="btn btn-ghost btn-compact btn-del-scene" data-scene-id="${scene.id}" style="color:var(--danger);" title="Delete Scene">🗑️</button>` : ''}
              </div>
            </div>
          `;
        }).join('')}

        <button class="btn btn-primary timeline-add-scene-btn" id="btnTimelineAddScene">
          ➕ Add Scene
        </button>
      </div>
    `;

    this.attachEvents(timeline, scenes);
    return timeline;
  }

  attachEvents(timeline, scenes) {
    timeline.addEventListener('click', async (e) => {
      // "+ Add Scene" button
      if (e.target.id === 'btnTimelineAddScene' || e.target.closest('#btnTimelineAddScene')) {
        this.onOpenAddSceneModal();
        return;
      }

      // Duplicate Scene (Section 2 & 5)
      const btnDup = e.target.closest('.btn-dup-scene');
      if (btnDup) {
        e.stopPropagation();
        const targetScene = scenes.find(s => s.id === btnDup.dataset.sceneId);
        if (targetScene) {
          const dupScene = sceneRepository.duplicateScene(targetScene);
          this.project.scenes.push(dupScene);
          sceneRepository.normalizeOrders(this.project.scenes);
          Toast.show('Scene duplicated!', 'success');
          this.onSelectScene(dupScene.id);
          this.onProjectModified();
        }
        return;
      }

      // Delete Scene
      const btnDel = e.target.closest('.btn-del-scene');
      if (btnDel) {
        e.stopPropagation();
        const confirmed = await Toast.confirm('Are you sure you want to delete this scene?', 'Delete Scene');
        if (confirmed) {
          sceneRepository.deleteScene(this.project, btnDel.dataset.sceneId);
          Toast.show('Scene deleted.', 'info');
          if (this.project.scenes.length > 0) {
            this.onSelectScene(this.project.scenes[0].id);
          }
          this.onProjectModified();
        }
        return;
      }

      // Move Left
      const btnLeft = e.target.closest('.btn-move-left');
      if (btnLeft) {
        e.stopPropagation();
        const idx = parseInt(btnLeft.dataset.idx, 10);
        sceneRepository.reorderScenes(this.project.scenes, idx, idx - 1);
        this.onProjectModified();
        return;
      }

      // Move Right
      const btnRight = e.target.closest('.btn-move-right');
      if (btnRight) {
        e.stopPropagation();
        const idx = parseInt(btnRight.dataset.idx, 10);
        sceneRepository.reorderScenes(this.project.scenes, idx, idx + 1);
        this.onProjectModified();
        return;
      }

      // Select Scene
      const card = e.target.closest('[data-scene-id]');
      if (card) {
        this.onSelectScene(card.dataset.sceneId);
      }
    });
  }
}

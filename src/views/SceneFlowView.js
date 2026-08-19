/**
 * Birthday Studio - Scene Flow View (Section 4 & 10)
 * Dual Timeline/Flowchart View with Rich Scene Visual Preview Thumbnails
 */

import { sceneRepository } from '../services/SceneRepository.js';
import { assetRepository } from '../services/AssetRepository.js';
import { Toast } from '../utils/Toast.js';

export class SceneFlowView {
  constructor(options = {}) {
    this.project = options.project;
    this.selectedSceneId = options.selectedSceneId;
    this.viewMode = 'timeline'; // timeline, flowchart
    this.allAssets = [];
    this.onSelectScene = options.onSelectScene || (() => {});
    this.onProjectModified = options.onProjectModified || (() => {});
  }

  render() {
    const container = document.createElement('main');
    container.className = 'scene-flow-panel';
    container.id = 'sceneFlowRoot';

    const scenes = (this.project?.scenes || []).sort((a, b) => a.order - b.order);

    container.innerHTML = `
      <div class="panel-header">
        <div class="header-left" style="display:flex; align-items:center; gap:8px;">
          <h3>Scene Flow</h3>
          <span class="pub-status-badge active" style="font-size:0.7rem;">${scenes.length} Scenes</span>
        </div>

        <div class="view-toggle-buttons" style="display:flex; gap:4px;">
          <button class="btn btn-compact ${this.viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}" id="btnViewTimeline">
            📜 Timeline
          </button>
          <button class="btn btn-compact ${this.viewMode === 'flowchart' ? 'btn-primary' : 'btn-ghost'}" id="btnViewFlowchart">
            🔀 Flowchart Graph
          </button>
        </div>
      </div>

      <div class="flow-canvas-container ${this.viewMode}" style="padding:16px; overflow-y:auto; flex:1;">
        ${this.viewMode === 'timeline' ? this.renderTimelineView(scenes) : this.renderFlowchartView(scenes)}
      </div>

      <div class="flow-footer-bar" style="padding:12px 16px; border-top:1px solid var(--border); background:var(--surface);">
        <button class="btn btn-primary btn-block" id="btnAddScene">
          ➕ Add New Scene
        </button>
      </div>
    `;

    this.attachEvents(container);
    return container;
  }

  renderTimelineView(scenes) {
    return `
      <div class="timeline-nodes-list" style="display:flex; flex-direction:column; gap:16px; align-items:center;">
        ${scenes.map((scene, idx) => {
          const isSelected = scene.id === this.selectedSceneId;
          const assetCount = scene.assetIds?.length || 0;
          const previewBadge = this.getScenePreviewBadge(scene);

          return `
            <div class="scene-node-card ${isSelected ? 'selected' : ''}" data-scene-id="${scene.id}" data-index="${idx}" style="background:var(--surface-elevated); border:1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}; border-radius:var(--radius-lg); padding:16px; width:100%; max-width:480px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:12px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="node-index">${idx + 1}</div>
                  <div>
                    <div style="font-weight:800; font-size:1rem;">${scene.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${scene.template.toUpperCase()} • ${assetCount}/10 Assets • ${scene.duration}s</div>
                  </div>
                </div>

                <div class="node-controls" style="display:flex; gap:4px;">
                  ${idx > 0 ? `<button class="btn btn-ghost btn-compact btn-move-up" data-index="${idx}" title="Move Up">▲</button>` : ''}
                  ${idx < scenes.length - 1 ? `<button class="btn btn-ghost btn-compact btn-move-down" data-index="${idx}" title="Move Down">▼</button>` : ''}
                  <button class="btn btn-ghost btn-compact btn-duplicate-scene" data-scene-id="${scene.id}" title="Duplicate">📋</button>
                  <button class="btn btn-ghost btn-compact btn-delete-scene" data-scene-id="${scene.id}" title="Delete" style="color:var(--danger);">🗑️</button>
                </div>
              </div>

              <!-- Visual Thumbnail Preview Box (Matching User Flow Diagram) -->
              <div class="scene-preview-thumbnail-box" style="background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; display:flex; align-items:center; justify-content:center; min-height:80px;">
                ${previewBadge}
              </div>
            </div>

            ${idx < scenes.length - 1 ? `
              <div class="flow-connector-arrow" style="color:var(--accent); font-weight:800; font-size:1.2rem; margin:-4px 0;">
                ↓ <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${scene.transition}</span>
              </div>
            ` : ''}
          `;
        }).join('')}
      </div>
    `;
  }

  renderFlowchartView(scenes) {
    return `
      <div class="flowchart-nodes-grid" style="display:flex; flex-direction:column; gap:16px; align-items:center;">
        ${scenes.map((scene, idx) => {
          const isSelected = scene.id === this.selectedSceneId;
          const previewBadge = this.getScenePreviewBadge(scene);

          return `
            <div class="flowchart-node-box ${isSelected ? 'selected' : ''}" data-scene-id="${scene.id}" style="background:var(--surface-elevated); padding:16px; border-radius:var(--radius-lg); border:1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}; width:100%; max-width:400px; text-align:center;">
              <div style="font-size:0.75rem; color:var(--accent); font-weight:800; text-transform:uppercase;">① Scene ${idx + 1}</div>
              <div style="font-size:1.1rem; font-weight:800; margin:4px 0;">${scene.name}</div>

              <div class="scene-preview-thumbnail-box" style="background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-md); padding:10px; margin-top:8px;">
                ${previewBadge}
              </div>
            </div>
            ${idx < scenes.length - 1 ? `<div style="color:var(--accent); font-weight:800; font-size:1.4rem;">↓</div>` : ''}
          `;
        }).join('')}
      </div>
    `;
  }

  getScenePreviewBadge(scene) {
    if (scene.template === 'hero') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">Welcome / Opening</div>
          <div style="width:50px; height:50px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">📷</div>
        </div>
      `;
    }

    if (scene.template === 'reveal') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <div style="font-size:0.75rem; color:var(--accent-pink); font-weight:700;">Birthday Reveal</div>
          <div style="font-size:1.6rem;">🎂 🎉</div>
        </div>
      `;
    }

    if (scene.template === 'photo_gallery' || scene.template === 'collage' || scene.template === 'memory_timeline') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">Memories Photo Grid</div>
          <div style="display:flex; gap:6px;">
            <span style="background:var(--surface); padding:4px 8px; border-radius:4px;">📷</span>
            <span style="background:var(--surface); padding:4px 8px; border-radius:4px;">📷</span>
            <span style="background:var(--surface); padding:4px 8px; border-radius:4px;">📷</span>
            <span style="background:var(--surface); padding:4px 8px; border-radius:4px;">📷</span>
          </div>
        </div>
      `;
    }

    if (scene.template === 'message') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">Your Personal Message</div>
          <div style="font-size:1.4rem;">💬 💌</div>
        </div>
      `;
    }

    if (scene.template === 'wish-wall') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <div style="font-size:0.75rem; color:var(--accent-gold); font-weight:700;">Dynamic Wish Wall</div>
          <div style="font-size:1.4rem;">💌 🌟</div>
        </div>
      `;
    }

    if (scene.template === 'final_wish') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">Final Wish & Replay</div>
          <div style="font-size:1.4rem;">🎂 ✨</div>
        </div>
      `;
    }

    return `<div style="font-size:1.2rem;">✨ Preview Card</div>`;
  }

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      if (e.target.id === 'btnViewTimeline') {
        this.viewMode = 'timeline';
        this.onProjectModified();
      }
      if (e.target.id === 'btnViewFlowchart') {
        this.viewMode = 'flowchart';
        this.onProjectModified();
      }

      if (e.target.id === 'btnAddScene') {
        const newScene = {
          name: `Scene ${this.project.scenes.length + 1}`,
          template: 'hero',
          order: this.project.scenes.length + 1,
          assetIds: []
        };
        this.project.scenes.push(newScene);
        this.selectedSceneId = newScene.id;
        Toast.show('New scene added!', 'success');
        this.onProjectModified();
      }

      // Reorder Up
      const btnUp = e.target.closest('.btn-move-up');
      if (btnUp) {
        const idx = parseInt(btnUp.dataset.index, 10);
        sceneRepository.reorderScenes(this.project, idx, idx - 1);
        this.onProjectModified();
        return;
      }

      // Reorder Down
      const btnDown = e.target.closest('.btn-move-down');
      if (btnDown) {
        const idx = parseInt(btnDown.dataset.index, 10);
        sceneRepository.reorderScenes(this.project, idx, idx + 1);
        this.onProjectModified();
        return;
      }

      // Duplicate
      const btnDup = e.target.closest('.btn-duplicate-scene');
      if (btnDup) {
        sceneRepository.duplicateScene(this.project, btnDup.dataset.sceneId);
        Toast.show('Scene duplicated!', 'info');
        this.onProjectModified();
        return;
      }

      // Delete
      const btnDel = e.target.closest('.btn-delete-scene');
      if (btnDel) {
        if (this.project.scenes.length <= 1) {
          Toast.show('At least one scene is required.', 'warning');
          return;
        }
        sceneRepository.deleteScene(this.project, btnDel.dataset.sceneId);
        if (this.selectedSceneId === btnDel.dataset.sceneId) {
          this.selectedSceneId = this.project.scenes[0]?.id;
        }
        Toast.show('Scene deleted', 'info');
        this.onProjectModified();
        return;
      }

      // Select scene
      const card = e.target.closest('[data-scene-id]');
      if (card) {
        this.onSelectScene(card.dataset.sceneId);
      }
    });
  }
}

/**
 * Birthday Studio - Scene Template Picker View (Section 3 & 4)
 * "+ Add Scene" Template Catalog Picker Modal
 */

import { SceneTemplateRegistry } from '../data/scenes/SceneTemplateRegistry.js';
import { sceneRepository } from '../services/SceneRepository.js';
import { SceneRequirementsModal } from './editor/SceneRequirementsModal.js';
import { Toast } from '../utils/Toast.js';
import { getOrCreateTextElements } from '../templates/TextElementHelper.js';

export class SceneTemplatePickerView {
  constructor(options = {}) {
    this.project = options.project;
    this.activeCategory = options.activeCategory || 'all';
    this.searchQuery = options.searchQuery || '';
    this.onSceneAdded = options.onSceneAdded || (() => {});
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'scenePickerModalRoot';

    const occasion = this.project?.occasion || 'birthday';
    const allTemplates = SceneTemplateRegistry.getAllTemplates();

    let filteredTemplates = allTemplates;
    if (this.activeCategory && this.activeCategory !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => (t.category || '').toLowerCase() === this.activeCategory.toLowerCase());
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        (t.name || '').toLowerCase().includes(q) || 
        (t.description || '').toLowerCase().includes(q)
      );
    }

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:850px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <div>
            <h3 style="font-size:1.2rem; font-weight:800; display:flex; align-items:center; gap:8px;">
              <span>✨ Add Scene</span>
            </h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              Choose any prebuilt scene from the scene library. Every scene is 100% customizable.
            </p>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnClosePicker">✕</button>
        </div>

        <!-- Search & Filter Controls -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px; position:relative;">
            <input type="text" id="inpSearchSceneTemplates" value="${this.searchQuery || ''}" placeholder="🔍 Search scenes by name or keyword..." style="width:100%; padding:8px 12px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text); font-size:0.85rem;" />
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-xs btn-tab-filter ${this.activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}" data-category="all" style="padding:6px 12px; font-weight:700;">All</button>
            <button class="btn btn-xs btn-tab-filter ${this.activeCategory === 'featured' ? 'btn-primary' : 'btn-ghost'}" data-category="featured" style="padding:6px 12px; font-weight:700;">Featured</button>
            <button class="btn btn-xs btn-tab-filter ${this.activeCategory === 'cinematic' ? 'btn-primary' : 'btn-ghost'}" data-category="cinematic" style="padding:6px 12px; font-weight:700;">Cinematic</button>
          </div>
        </div>

        <div class="scene-picker-scroll-container template-picker-grid scene-picker-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:14px; max-height:420px; overflow-y:auto; padding:4px; scrollbar-width:none; -ms-overflow-style:none; -webkit-overflow-scrolling:touch;">
          <!-- Start Blank Option -->
          ${(!this.searchQuery || 'blank custom'.includes(this.searchQuery.toLowerCase())) ? `
            <div class="picker-template-card" data-template-type="blank" style="background:var(--surface-elevated); border:2px dashed var(--accent); border-radius:var(--radius-lg); padding:16px; cursor:pointer; text-align:center; transition:transform var(--transition-fast);">
              <div style="font-size:2.2rem; margin-bottom:6px;">📄</div>
              <h4 style="font-size:0.95rem; font-weight:800; color:var(--accent);">Start Blank Scene</h4>
              <p style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Create a completely customizable empty canvas scene.</p>
            </div>
          ` : ''}

          ${filteredTemplates.length === 0 ? `
            <div style="grid-column:1/-1; text-align:center; padding:40px 16px; color:var(--text-muted);">
              <div style="font-size:2.5rem; margin-bottom:8px;">🔍</div>
              <h4 style="font-weight:700; color:var(--text);">No scenes found</h4>
              <p style="font-size:0.85rem; margin-top:4px;">No scenes matched your search query. Try another keyword or start with a blank scene.</p>
            </div>
          ` : filteredTemplates.map(t => `
            <div class="picker-template-card" data-template-id="${t.id}" style="background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-lg); padding:16px; cursor:pointer; transition:transform var(--transition-fast); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:1.8rem;">${t.icon || '✨'}</span>
                  <div style="display:flex; gap:4px; align-items:center;">
                    <button class="btn btn-ghost btn-xs btn-inspect-template-reqs" data-template-type="${t.template || 'hero'}" title="Inspect Asset Requirements" style="padding:1px 6px; font-size:0.7rem; border:1px solid var(--border);">
                      ℹ️ Specs
                    </button>
                  </div>
                </div>
                <h4 style="font-size:0.95rem; font-weight:800; margin-top:8px;">${t.name}</h4>
                <p style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">${t.description}</p>
              </div>

              <div style="font-size:0.75rem; color:var(--accent); font-weight:700; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
                <span>⏱️ ${t.recommendedDuration}s</span>
                <span style="background:var(--accent); color:#ffffff; padding:2px 8px; border-radius:10px;">➕ Add Scene</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEvents(modal);
    return modal;
  }

  attachEvents(modal) {
    // Search input live filtering
    const searchInput = modal.querySelector('#inpSearchSceneTemplates');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const newModal = this.render();
        modal.replaceWith(newModal);
        const newSearch = document.getElementById('inpSearchSceneTemplates');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
        }
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target.closest('#btnClosePicker')) {
        modal.remove();
        return;
      }

      // Inspect Specs Button
      const reqBtn = e.target.closest('.btn-inspect-template-reqs');
      if (reqBtn) {
        e.stopPropagation();
        const templateType = reqBtn.dataset.templateType || 'hero';
        const reqModal = new SceneRequirementsModal(templateType);
        document.body.appendChild(reqModal.render());
        return;
      }

      const tabBtn = e.target.closest('.btn-tab-filter');
      if (tabBtn) {
        this.activeCategory = tabBtn.dataset.category;
        const newModal = this.render();
        modal.replaceWith(newModal);
        return;
      }

      const card = e.target.closest('[data-template-id], [data-template-type]');
      if (card) {
        let newScene = null;
        const templateType = card.dataset.templateType || card.getAttribute('data-template-type');
        const templateId = card.dataset.templateId || card.getAttribute('data-template-id');

        if (templateType === 'blank') {
          newScene = sceneRepository.createScene({
            name: 'New Scene',
            template: 'hero',
            duration: 6
          });
        } else if (templateId) {
          const blueprint = SceneTemplateRegistry.getTemplateById(templateId);
          if (blueprint) {
            newScene = sceneRepository.createScene({
              name: blueprint.name,
              template: blueprint.template,
              duration: blueprint.recommendedDuration
            });
            if (blueprint.defaultText) {
              newScene.name = blueprint.defaultText.title || blueprint.name;
              newScene.settings = {
                ...(newScene.settings || {}),
                titleText: blueprint.defaultText.title || '',
                subtitleText: blueprint.defaultText.subtitle || '',
                badgeText: blueprint.defaultText.badge || ''
              };
            }
          }
        }

        if (newScene) {
          getOrCreateTextElements(newScene);
          if (!this.project) this.project = { scenes: [] };
          if (!Array.isArray(this.project.scenes)) {
            this.project.scenes = [];
          }
          this.project.scenes.push(newScene);
          sceneRepository.normalizeOrders(this.project.scenes);
          modal.remove();
          Toast.show(`New scene "${newScene.name}" added to timeline!`, 'success');
          this.onSceneAdded(newScene.id);
        }
      }
    });
  }
}


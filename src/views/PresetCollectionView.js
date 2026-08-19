/**
 * Birthday Studio - Preset Collection View
 * Clean library catalog for universal scene presets across categories:
 * Birthday, Birthday Memories, Anniversary, Friendship, Wedding, Celebration, Memories, Love, Universal
 */

import { PresetRegistry } from '../data/presets/PresetRegistry.js';
import { PresetPreviewView } from './PresetPreviewView.js';
import { PresetDetailView } from './PresetDetailView.js';
import { PresetPersonalizationView } from './PresetPersonalizationView.js';

export class PresetCollectionView {
  constructor(options = {}) {
    this.currentUser = options.currentUser;
    this.activeCategory = 'all';
    this.onProjectCreated = options.onProjectCreated || (() => {});
  }

  render() {
    const container = document.createElement('div');
    container.className = 'preset-collection-container';
    container.id = 'presetCollectionRoot';

    const presets = PresetRegistry.getPresetsByCategory(this.activeCategory);

    container.innerHTML = `
      <div class="preset-collection-header">
        <h2 style="font-size:1.6rem; font-weight:800; background:linear-gradient(90deg, #a29bfe, #ff7675); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">🎨 Prebuilt Collection</h2>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:4px;">
          Explore reusable cinematic celebration blueprints with fully customizable scenes and animations.
        </p>

        <div class="preset-occasion-filters margin-top-md" style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn ${this.activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}" data-cat="all">✨ All Presets</button>
          <button class="btn ${this.activeCategory === 'birthday' ? 'btn-primary' : 'btn-ghost'}" data-cat="birthday">🎂 Birthday</button>
          <button class="btn ${this.activeCategory === 'wedding' ? 'btn-primary' : 'btn-ghost'}" data-cat="wedding">💍 Wedding</button>
          <button class="btn ${this.activeCategory === 'graduation' ? 'btn-primary' : 'btn-ghost'}" data-cat="graduation">🎓 Graduation</button>
          <button class="btn ${this.activeCategory === 'congratulations' ? 'btn-primary' : 'btn-ghost'}" data-cat="congratulations">🎉 Congratulations</button>
          <button class="btn ${this.activeCategory === 'anniversary' ? 'btn-primary' : 'btn-ghost'}" data-cat="anniversary">🥂 Anniversary</button>
          <button class="btn ${this.activeCategory === 'other' ? 'btn-primary' : 'btn-ghost'}" data-cat="other">🌟 Other</button>
        </div>
      </div>

      <div class="preset-grid margin-top-md" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px; margin-top:20px;">
        ${presets.length > 0 ? presets.map(preset => {
          const defaultScenes = preset.sceneBlueprints[preset.defaultVariant] || [];
          const sceneCount = defaultScenes.length || 3;

          return `
            <div class="preset-card" data-preset-id="${preset.id}" style="background:var(--surface-elevated); border:1px solid var(--border); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition:transform 0.2s ease, box-shadow 0.2s ease;">
              <!-- PRESET PREVIEW THUMBNAIL -->
              <div class="preset-card-graphic" style="height:140px; background:linear-gradient(135deg, rgba(127,90,240,0.2) 0%, rgba(255,118,117,0.2) 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; border-bottom:1px solid var(--border);">
                <span class="preset-card-icon" style="font-size:3.2rem;">${preset.icon}</span>
                <span class="preset-scene-count-badge" style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); color:#ffd700; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:12px; border:1px solid rgba(255,215,0,0.3);">
                  ${sceneCount} Scenes
                </span>
              </div>

              <div class="preset-card-body" style="padding:16px; flex:1; display:flex; flex-direction:column; justify-space-between;">
                <div>
                  <h3 class="preset-card-title" style="font-size:1.15rem; font-weight:800; margin:0 0 6px 0; color:var(--text);">${preset.title}</h3>
                  <p class="preset-card-desc" style="font-size:0.85rem; color:var(--text-muted); line-height:1.4; margin-bottom:12px;">${preset.description}</p>
                </div>

                <div>
                  <div class="preset-tags-row" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;">
                    ${preset.tags.map(t => `<span class="preset-tag-pill" style="font-size:0.7rem; padding:2px 8px; background:var(--surface); border:1px solid var(--border); border-radius:10px; color:var(--text-muted);">${t}</span>`).join('')}
                  </div>

                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary btn-sm btn-preview-preset" style="flex:1; font-weight:700;">Preview</button>
                    <button class="btn btn-primary btn-sm btn-use-preset" style="flex:1; font-weight:700;">Use Template</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('') : `
          <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
            No presets found for this category.
          </div>
        `}
      </div>
    `;

    this.attachEvents(container);
    return container;
  }

  attachEvents(container) {
    container.addEventListener('click', (e) => {
      // Category filter tabs
      const filterBtn = e.target.closest('[data-cat]');
      if (filterBtn) {
        this.activeCategory = filterBtn.dataset.cat;
        const newRoot = this.render();
        container.replaceWith(newRoot);
        return;
      }

      // Preview preset button
      const btnPreview = e.target.closest('.btn-preview-preset');
      if (btnPreview) {
        e.stopPropagation();
        const card = btnPreview.closest('[data-preset-id]');
        if (card) {
          const preset = PresetRegistry.getPresetById(card.dataset.presetId);
          if (preset) {
            const previewModal = new PresetPreviewView({
              preset,
              onUsePreset: (p) => this.openPresetDetail(p)
            });
            document.body.appendChild(previewModal.render());
          }
        }
        return;
      }

      // Use preset button
      const btnUse = e.target.closest('.btn-use-preset');
      if (btnUse) {
        e.stopPropagation();
        const card = btnUse.closest('[data-preset-id]');
        if (card) {
          const preset = PresetRegistry.getPresetById(card.dataset.presetId);
          if (preset) {
            this.openPresetDetail(preset);
          }
        }
        return;
      }

      // Card body click
      const card = e.target.closest('[data-preset-id]');
      if (card) {
        const presetId = card.dataset.presetId;
        const preset = PresetRegistry.getPresetById(presetId);
        if (preset) {
          this.openPresetDetail(preset);
        }
      }
    });
  }

  openPresetDetail(preset) {
    const detailView = new PresetDetailView(preset, (selectedPreset, variantKey) => {
      const personalizeView = new PresetPersonalizationView(
        selectedPreset,
        variantKey,
        this.currentUser,
        (projectId) => {
          this.onProjectCreated(projectId);
        }
      );
      document.body.appendChild(personalizeView.render());
    });

    document.body.appendChild(detailView.render());
  }
}


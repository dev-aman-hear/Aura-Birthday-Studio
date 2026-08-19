/**
 * Birthday Studio - Universal Asset Picker Modal
 * Slot-Aware & Compatibility-Driven Asset Picker with Real-Time Validation Badges,
 * Intelligent Ranking (Compatible First), and Instant Upload
 */

import { assetRepository } from '../services/AssetRepository.js';
import { AssetCompatibilityValidator } from '../services/asset/AssetCompatibilityValidator.js';
import { SceneAssetDefinitionService } from '../services/asset/SceneAssetDefinitions.js';
import { Toast } from '../utils/Toast.js';
import { Accessibility } from '../utils/Accessibility.js';

export class AssetPickerModal {
  constructor(options = {}) {
    this.allAssets = options.allAssets || [];
    this.targetScene = options.targetScene || null;
    this.targetSlotId = options.targetSlotId || null;
    this.onSelectAsset = options.onSelectAsset || (() => {});
    this.searchQuery = '';
    this.filterTab = 'compatible'; // 'compatible', 'all', 'image', 'video', 'audio', 'sticker'
    this.selectedAsset = null;
  }

  async loadAssets() {
    this.allAssets = await assetRepository.getAllAssets();
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'assetPickerModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.zIndex = '999999';

    const def = this.targetScene ? SceneAssetDefinitionService.getDefinition(this.targetScene.template) : null;
    const targetSlot = def?.slots?.find(s => s.id === this.targetSlotId);

    const slotTitle = targetSlot ? `for ${targetSlot.name}` : (this.targetScene ? `for ${def?.name}` : '');

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width: 780px; width: 94vw; max-height: 88vh; padding: 20px; display: flex; flex-direction: column; background:var(--surface-elevated, #161325); border:1px solid var(--border, rgba(255,255,255,0.15));">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:12px;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
              <span>🖼️</span> <span>Select Media Asset ${slotTitle}</span>
            </h3>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px; margin-bottom:0;">
              ${targetSlot ? `${targetSlot.description} • Formats: ${(targetSlot.formats || ['Any']).join(', ').toUpperCase()}` : 'Choose from library or upload new files'}
            </p>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnCloseAssetPicker" style="font-size:1.1rem;">✕</button>
        </div>

        <!-- Controls: Search + Filters + Direct Upload Button -->
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; align-items:center;">
          <input type="text" class="form-input" id="inpAssetPickerSearch" placeholder="🔍 Search media by name, format, or tag..." style="flex:1; min-width:180px; font-size:0.82rem;" />
          
          <div class="picker-filter-tabs" style="display:flex; gap:3px;">
            <button class="btn btn-xs ${this.filterTab === 'compatible' ? 'btn-primary' : 'btn-secondary'}" data-filter="compatible" style="font-weight:700;">✨ Compatible</button>
            <button class="btn btn-xs ${this.filterTab === 'all' ? 'btn-primary' : 'btn-secondary'}" data-filter="all">All Library</button>
            <button class="btn btn-xs ${this.filterTab === 'image' ? 'btn-primary' : 'btn-secondary'}" data-filter="image">Photos</button>
            <button class="btn btn-xs ${this.filterTab === 'video' ? 'btn-primary' : 'btn-secondary'}" data-filter="video">Videos</button>
            <button class="btn btn-xs ${this.filterTab === 'audio' ? 'btn-primary' : 'btn-secondary'}" data-filter="audio">Audio</button>
          </div>

          <label class="btn btn-primary btn-sm" style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-weight:700; padding:6px 12px;">
            <span>⬆️ Upload New</span>
            <input type="file" id="inpModalAssetUpload" multiple accept="image/*,video/*,audio/*" style="display:none;" />
          </label>
        </div>

        <!-- Media Grid -->
        <div id="modalAssetGrid" style="flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px; padding:4px; min-height:240px;">
          <!-- Populated by renderAssetItems -->
        </div>

        <!-- Footer with Selection Details -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:12px; margin-top:12px;">
          <div id="pickerSelectionDetails" style="font-size:0.75rem; color:var(--text-muted);">
            Click an asset to select and assign.
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" id="btnCancelAssetPicker">Cancel</button>
          </div>
        </div>
      </div>
    `;

    this.renderAssetItems(modal);
    this.attachEvents(modal);

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }

  renderAssetItems(modal) {
    const grid = modal.querySelector('#modalAssetGrid');
    if (!grid) return;

    // Rank assets using AssetCompatibilityValidator
    const rankedList = AssetCompatibilityValidator.rankAssetsForSlot(
      this.allAssets || [],
      this.targetScene,
      this.targetSlotId
    );

    let list = rankedList;

    if (this.filterTab === 'compatible') {
      list = list.filter(item => item.isCompatible);
    } else if (this.filterTab !== 'all') {
      list = list.filter(item => (item.asset.type || '').startsWith(this.filterTab));
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(item => (item.asset.name || '').toLowerCase().includes(q) || (item.asset.metadata?.fileFormat || '').toLowerCase().includes(q));
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📷</div>
          <p style="font-size: 0.9rem; font-weight: 700;">No ${this.filterTab === 'compatible' ? 'compatible ' : ''}assets found</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">Click "Upload New" above or switch to "All Library".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => {
      const asset = item.asset;
      const val = item.validation;
      const isCompat = item.isCompatible;
      const isImg = (asset.type || '').startsWith('image') || asset.type === 'sticker';
      const isVid = (asset.type || '').startsWith('video');
      const isAud = (asset.type || '').startsWith('audio');
      const src = asset.renderUrl || asset.thumbnail || asset.url || '';
      const meta = asset.metadata || {};

      return `
        <div class="modal-asset-card ${isCompat ? 'compatible' : 'incompatible'}" data-asset-id="${asset.id}" style="background:var(--surface, #100d1e); border:1px solid ${isCompat ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 71, 87, 0.3)'}; border-radius:var(--radius-md, 8px); overflow:hidden; cursor:pointer; display:flex; flex-direction:column; position:relative; transition:all 0.15s ease;">
          <!-- Thumbnail -->
          <div style="height:100px; background:#000; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;">
            ${isImg && src ? `<img src="${src}" alt="${asset.name || ''}" style="width:100%; height:100%; object-fit:cover;" />` : ''}
            ${isVid ? `<span style="font-size:2rem;">🎬</span>` : ''}
            ${isAud ? `<span style="font-size:2rem;">🎵</span>` : ''}
            ${!src && !isVid && !isAud ? `<span style="font-size:1.8rem;">📄</span>` : ''}

            <!-- Compatibility Badge -->
            <div style="position:absolute; top:4px; right:4px; font-size:0.65rem; font-weight:800; padding:2px 6px; border-radius:4px; ${isCompat ? 'background:#2ed573; color:#000;' : 'background:#ff4757; color:#fff;'}">
              ${isCompat ? '✓ MATCH' : '✕ INCOMPATIBLE'}
            </div>

            <div style="position:absolute; bottom:4px; left:4px; font-size:0.6rem; background:rgba(0,0,0,0.75); color:#fff; padding:1px 4px; border-radius:3px; font-weight:700;">
              ${(meta.fileFormat || asset.type || '').toUpperCase()} ${meta.aspectRatio ? `• ${meta.aspectRatio}` : ''}
            </div>
          </div>

          <!-- Metadata & Status -->
          <div style="padding:8px; display:flex; flex-direction:column; gap:2px;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${asset.name}">
              ${asset.name || 'Media Asset'}
            </div>

            <div style="font-size:0.65rem; color:${isCompat ? 'var(--text-muted)' : '#ff4757'}; line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${val.reason}">
              ${val.reason}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  attachEvents(modal) {
    // Search
    modal.querySelector('#inpAssetPickerSearch')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderAssetItems(modal);
    });

    // Category Filter Buttons
    modal.addEventListener('click', (e) => {
      const btnFilter = e.target.closest('[data-filter]');
      if (btnFilter) {
        this.filterTab = btnFilter.dataset.filter;
        modal.querySelectorAll('[data-filter]').forEach(b => {
          b.className = `btn btn-xs ${b === btnFilter ? 'btn-primary' : 'btn-secondary'}`;
        });
        this.renderAssetItems(modal);
        return;
      }

      // Asset Selection
      const card = e.target.closest('[data-asset-id]');
      if (card) {
        const assetId = card.dataset.assetId;
        const selected = (this.allAssets || []).find(a => a.id === assetId);
        if (selected) {
          const val = AssetCompatibilityValidator.validate(selected, this.targetScene, this.targetSlotId);
          if (!val.compatible) {
            Toast.show(`Incompatible: ${val.reason}`, 'warning');
            return;
          }
          this.onSelectAsset(selected);
          modal.remove();
        }
        return;
      }

      // Close
      if (e.target.closest('#btnCloseAssetPicker') || e.target.closest('#btnCancelAssetPicker')) {
        modal.remove();
      }
    });

    // Direct Upload & Validation
    const inpUpload = modal.querySelector('#inpModalAssetUpload');
    if (inpUpload) {
      inpUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        let lastUploaded = null;
        for (const file of files) {
          try {
            const asset = await assetRepository.saveFileAsset(file);
            if (!this.allAssets.some(a => a.id === asset.id)) {
              this.allAssets.unshift(asset);
            }
            lastUploaded = asset;
          } catch (err) {
            console.error('Error uploading file:', err);
          }
        }

        Toast.show(`Uploaded ${files.length} asset(s)!`, 'success');
        this.renderAssetItems(modal);

        // If single file uploaded, check if immediately assignable
        if (files.length === 1 && lastUploaded) {
          const val = AssetCompatibilityValidator.validate(lastUploaded, this.targetScene, this.targetSlotId);
          if (val.compatible) {
            this.onSelectAsset(lastUploaded);
            modal.remove();
          }
        }
      });
    }
  }
}


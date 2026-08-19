/**
 * Birthday Studio - Asset Library View
 * Central Universal Asset Library with Rich Metadata Badges, Usage Tracking,
 * In-Place Media Replacement, and Full Compatibility Awareness
 */

import { assetRepository } from '../services/AssetRepository.js';
import { sceneRepository } from '../services/SceneRepository.js';
import { MediaPreviewView } from './MediaPreviewView.js';
import { Toast } from '../utils/Toast.js';
import { AssetUsageTracker } from '../services/asset/AssetUsageTracker.js';

export class AssetLibraryView {
  constructor(options = {}) {
    this.project = options.project || {};
    this.assets = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.selectedAssetIds = new Set();
    this.onUpdate = options.onUpdate || (() => {});
  }

  async loadAssets() {
    this.assets = await assetRepository.getAllAssets();
  }

  render() {
    const container = document.createElement('aside');
    container.className = 'asset-library-panel';
    container.id = 'assetLibraryRoot';

    const filtered = this.getFilteredAssets();

    container.innerHTML = `
      <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-bottom:1px solid var(--border);">
        <div>
          <h3 style="font-size:1.1rem; font-weight:800; color:var(--text); margin:0;">Global Asset Library</h3>
          <span style="font-size:0.75rem; color:var(--text-muted);">${this.assets.length} Total Assets</span>
        </div>
        <div class="header-actions" style="display:flex; gap:6px;">
          <label class="btn btn-primary btn-sm upload-btn-label" style="cursor:pointer; font-weight:700;">
            ⬆️ Upload
            <input type="file" id="assetFileInput" multiple accept="image/*,video/*,audio/*" style="display:none;" />
          </label>
          <button class="btn btn-secondary btn-sm" id="btnCreateTextCard" title="Add text note" style="font-weight:700;">
            📝 Text
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="search-bar-wrapper" style="padding:10px 14px 4px 14px;">
        <input type="text" class="form-input search-input" id="assetSearchInput" placeholder="🔍 Search by name, format, or tag..." value="${this.searchQuery}" style="width:100%; font-size:0.85rem;" />
      </div>

      <div class="category-tabs" style="display:flex; gap:4px; padding:8px 14px; overflow-x:auto;">
        <button class="btn btn-compact ${this.activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}" data-cat="all">All (${this.assets.length})</button>
        <button class="btn btn-compact ${this.activeCategory === 'image' ? 'btn-primary' : 'btn-ghost'}" data-cat="image">Photos</button>
        <button class="btn btn-compact ${this.activeCategory === 'video' ? 'btn-primary' : 'btn-ghost'}" data-cat="video">Videos</button>
        <button class="btn btn-compact ${this.activeCategory === 'audio' ? 'btn-primary' : 'btn-ghost'}" data-cat="audio">Audio</button>
        <button class="btn btn-compact ${this.activeCategory === 'sticker' ? 'btn-primary' : 'btn-ghost'}" data-cat="sticker">Stickers</button>
        <button class="btn btn-compact ${this.activeCategory === 'text' ? 'btn-primary' : 'btn-ghost'}" data-cat="text">Text</button>
      </div>

      ${this.selectedAssetIds.size > 0 ? `
        <div class="batch-bar" style="padding:8px 14px; background:var(--surface-elevated); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:700;">${this.selectedAssetIds.size} asset(s) selected</span>
          <button class="btn btn-danger btn-compact" id="btnBatchDelete">🗑️ Delete Selected</button>
        </div>
      ` : ''}

      <!-- Asset Cards Grid -->
      <div class="assets-grid-container" id="assetsGrid" style="padding:12px; display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px; overflow-y:auto; flex:1;">
        ${filtered.length > 0 ? filtered.map(asset => this.renderAssetCard(asset)).join('') : `
          <div class="empty-assets-state" style="grid-column: 1/-1; text-align:center; padding:40px 20px; color:var(--text-muted);">
            <div style="font-size:2.5rem; margin-bottom:8px;">🖼️</div>
            <p style="font-weight:700;">No assets found</p>
            <p style="font-size:0.8rem; margin-top:4px;">Upload media or clear search filters.</p>
          </div>
        `}
      </div>
    `;

    this.attachEvents(container);
    return container;
  }

  getFilteredAssets() {
    return this.assets.filter(a => {
      const isImg = a.type === 'image' || a.type === 'sticker';
      let matchCat = true;
      if (this.activeCategory !== 'all') {
        if (this.activeCategory === 'image') matchCat = isImg;
        else matchCat = a.type === this.activeCategory;
      }

      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        a.name.toLowerCase().includes(q) || 
        (a.metadata?.fileFormat || '').toLowerCase().includes(q) ||
        (a.metadata?.tags || []).some(t => t.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }

  renderAssetCard(asset) {
    const usage = AssetUsageTracker.getAssetUsage(asset.id, this.project);
    const usageCount = usage.count;
    const isSelected = this.selectedAssetIds.has(asset.id);
    const displayUrl = asset.thumbnail || asset.url || '';
    const meta = asset.metadata || {};

    const formatBadge = (meta.fileFormat || asset.type || '').toUpperCase();
    const ratioBadge = meta.aspectRatio && meta.aspectRatio !== '1:1' ? meta.aspectRatio : '';
    const sizeBadge = asset.getFormattedSize ? asset.getFormattedSize() : (meta.sizeMB ? `${meta.sizeMB} MB` : '');
    const durationBadge = asset.getFormattedDuration ? asset.getFormattedDuration() : '';

    return `
      <div class="asset-card ${isSelected ? 'selected' : ''}" data-asset-id="${asset.id}" draggable="true" style="background:var(--surface-elevated, #181528); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:var(--radius-md, 8px); overflow:hidden; display:flex; flex-direction:column; position:relative; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;">
        <!-- Thumbnail Viewport -->
        <div class="asset-thumb-box" style="height:100px; width:100%; background:#090812; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;">
          ${(asset.type === 'image' || asset.type === 'sticker') && displayUrl ? `<img src="${displayUrl}" alt="${asset.name}" class="asset-img-thumb" style="width:100%; height:100%; object-fit:cover;" loading="lazy" />` : ''}
          ${asset.type === 'video' ? `<div style="font-size:2rem;">🎬</div>` : ''}
          ${asset.type === 'audio' ? `<div style="font-size:2rem;">🎵</div>` : ''}
          ${asset.type === 'text' ? `<div style="padding:10px; font-size:0.75rem; color:var(--text); text-align:center;">💬 "${(meta.textContent || asset.name).substring(0, 30)}..."</div>` : ''}
          ${asset.type === 'background' ? `<div style="width:100%; height:100%; background:${asset.url};"></div>` : ''}

          <!-- Metadata Badges on Thumbnail -->
          <div style="position:absolute; top:4px; left:4px; display:flex; gap:3px;">
            <span style="font-size:0.6rem; font-weight:800; background:rgba(0,0,0,0.75); color:#fff; padding:1px 4px; border-radius:3px;">${formatBadge}</span>
            ${ratioBadge ? `<span style="font-size:0.6rem; font-weight:700; background:rgba(127,90,240,0.8); color:#fff; padding:1px 4px; border-radius:3px;">${ratioBadge}</span>` : ''}
            ${durationBadge ? `<span style="font-size:0.6rem; font-weight:700; background:rgba(0,0,0,0.75); color:#2ed573; padding:1px 4px; border-radius:3px;">${durationBadge}</span>` : ''}
          </div>

          ${meta.hasTransparency ? `
            <div style="position:absolute; bottom:4px; left:4px; font-size:0.58rem; background:rgba(46,213,115,0.25); color:#2ed573; border:1px solid rgba(46,213,115,0.4); padding:0px 4px; border-radius:3px; font-weight:700;">ALPHA</div>
          ` : ''}
        </div>

        <!-- Info Bar -->
        <div class="asset-info-bar" style="padding:8px; display:flex; flex-direction:column; gap:3px;">
          <span class="asset-name-label" style="font-size:0.75rem; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${asset.name}">${asset.name}</span>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.65rem; color:var(--text-muted);">${sizeBadge}</span>
            <span class="asset-usage-badge ${usageCount > 0 ? 'used' : ''}" style="font-size:0.65rem; padding:1px 5px; border-radius:4px; background:${usageCount > 0 ? 'rgba(127,90,240,0.2)' : 'rgba(255,255,255,0.06)'}; color:${usageCount > 0 ? 'var(--accent, #7f5af0)' : 'var(--text-muted)'}; font-weight:700;">
              ${usageCount > 0 ? `${usageCount} scene(s)` : 'Unused'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  attachEvents(container) {
    container.addEventListener('click', async (e) => {
      // Category tabs
      const tab = e.target.closest('[data-cat]');
      if (tab) {
        this.activeCategory = tab.dataset.cat;
        this.onUpdate();
        return;
      }

      // Tap Asset -> Open Universal Asset Action Sheet
      const card = e.target.closest('.asset-card');
      if (card) {
        const assetId = card.dataset.assetId;
        const asset = this.assets.find(a => a.id === assetId);
        if (asset) {
          this.openAssetActionSheet(asset);
        }
        return;
      }

      // Batch delete
      if (e.target.closest('#btnBatchDelete')) {
        const confirmed = await Toast.confirm(`Permanently delete ${this.selectedAssetIds.size} selected asset(s)?`, 'Batch Delete');
        if (confirmed) {
          await assetRepository.batchDeleteAssets(Array.from(this.selectedAssetIds), this.project);
          this.selectedAssetIds.clear();
          Toast.show('Selected assets deleted', 'info');
          this.onUpdate();
        }
      }

      // Create text card
      if (e.target.closest('#btnCreateTextCard')) {
        this.openTextCreationModal();
      }
    });

    // Search input
    const searchInp = container.querySelector('#assetSearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const grid = container.querySelector('#assetsGrid');
        if (grid) {
          const filtered = this.getFilteredAssets();
          grid.innerHTML = filtered.length > 0 
            ? filtered.map(asset => this.renderAssetCard(asset)).join('')
            : `<div class="empty-assets-state" style="grid-column: 1/-1; text-align:center; padding:40px 20px; color:var(--text-muted);"><p>No matching assets</p></div>`;
        }
      });
    }

    // File Upload with Automatic Metadata Extraction
    const fileInp = container.querySelector('#assetFileInput');
    if (fileInp) {
      fileInp.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        Toast.show(`Uploading ${files.length} file(s)...`, 'info');

        for (const file of files) {
          await assetRepository.saveFileAsset(file);
        }

        Toast.show('Assets uploaded & indexed with metadata!', 'success');
        this.onUpdate();
      });
    }

    // HTML5 Drag & Drop Source
    container.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.asset-card');
      if (card) {
        const assetId = card.dataset.assetId;
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'ASSET', assetId }));
      }
    });
  }

  /**
   * Rich Asset Action Sheet & Inspector
   */
  openAssetActionSheet(asset) {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.style.zIndex = '99999';

    const scenes = (this.project?.scenes || []).sort((a, b) => a.order - b.order);
    const usage = AssetUsageTracker.getAssetUsage(asset.id, this.project);

    modal.innerHTML = `
      <div class="wizard-modal text-center" style="max-width: 480px; width: 92vw; padding: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.15rem; font-weight:800; margin:0;">Asset Actions</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseSheet">✕</button>
        </div>

        <div style="font-size:0.85rem; font-weight:700; color:var(--accent-gold); margin-bottom:4px;">
          ${asset.name}
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:16px;">
          ${(asset.metadata?.fileFormat || asset.type).toUpperCase()} • ${asset.getFormattedSize ? asset.getFormattedSize() : ''} 
          ${asset.metadata?.width ? `• ${asset.metadata.width}×${asset.metadata.height}px` : ''}
          ${asset.metadata?.aspectRatio ? `(${asset.metadata.aspectRatio})` : ''}
        </div>

        <!-- Usage List Summary -->
        <div style="background:var(--surface, #100d1e); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:var(--radius-sm, 6px); padding:8px 12px; font-size:0.78rem; text-align:left; margin-bottom:16px;">
          <strong style="color:var(--text);">Current Project Usage:</strong>
          ${usage.count > 0 ? `
            <div style="color:var(--accent, #7f5af0); font-weight:600; margin-top:2px;">
              Used in ${usage.count} scene(s): ${usage.scenes.map(s => s.sceneName).join(', ')}
            </div>
          ` : `
            <div style="color:var(--text-muted); margin-top:2px;">
              Not currently placed in any scene.
            </div>
          `}
        </div>

        <!-- Actions Menu -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn btn-secondary btn-block" id="btnPreviewMediaAsset" style="justify-content:center;">
            👁️ Inspect & Full Preview
          </button>

          <!-- Universal In-Place Replacement Label -->
          <label class="btn btn-secondary btn-block" style="cursor:pointer; display:flex; justify-content:center; align-items:center; gap:6px; margin:0;">
            <span>🔄 Replace Media Globally</span>
            <input type="file" id="inpReplaceMediaGlobal" accept="image/*,video/*,audio/*" style="display:none;" />
          </label>

          <!-- Add to Scene Select -->
          <div class="form-group" style="text-align:left; margin-top:4px;">
            <label style="font-size:0.75rem; font-weight:700;">Add to Scene</label>
            <select class="form-input" id="selTargetScene">
              ${scenes.map((s, i) => `
                <option value="${s.id}">Scene ${i + 1}: ${s.name} (${s.assetIds?.length || 0}/15 assets)</option>
              `).join('')}
            </select>
          </div>

          <button class="btn btn-primary btn-block" id="btnConfirmAddToScene" style="justify-content:center; font-weight:700;">
            ➕ Place in Scene
          </button>

          <button class="btn btn-ghost btn-block btn-danger" id="btnConfirmDeleteAsset" style="justify-content:center; color:var(--danger, #ff4757); margin-top:4px;">
            🗑️ Delete Asset
          </button>
        </div>
      </div>
    `;

    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCloseSheet') || e.target === modal) {
        modal.remove();
        return;
      }

      if (e.target.closest('#btnPreviewMediaAsset')) {
        modal.remove();
        const mediaInspector = new MediaPreviewView(asset);
        document.body.appendChild(await mediaInspector.render());
        return;
      }

      if (e.target.closest('#btnConfirmAddToScene')) {
        const targetSceneId = modal.querySelector('#selTargetScene').value;
        const targetScene = this.project.scenes.find(s => s.id === targetSceneId);
        if (targetScene) {
          const res = sceneRepository.addAssetToScene(targetScene, asset.id);
          if (!res.success) {
            Toast.show(res.message, 'warning');
          } else {
            Toast.show(`Added to ${targetScene.name}`, 'success');
            modal.remove();
            this.onUpdate();
          }
        }
        return;
      }

      if (e.target.closest('#btnConfirmDeleteAsset')) {
        modal.remove();
        const deleted = await assetRepository.deleteAsset(asset.id, this.project);
        if (deleted) {
          Toast.show('Asset deleted', 'info');
          this.onUpdate();
        }
        return;
      }
    });

    // In-Place Replacement Handler
    modal.querySelector('#inpReplaceMediaGlobal')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      Toast.show('Replacing media asset globally...', 'info');
      await assetRepository.replaceAsset(asset.id, file, this.project);
      Toast.show('Asset replaced and all scenes updated!', 'success');
      modal.remove();
      this.onUpdate();
    });

    document.body.appendChild(modal);
  }

  openTextCreationModal() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.innerHTML = `
      <div class="wizard-modal" style="padding: 24px; max-width:460px; width:92vw;">
        <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:12px;">📝 Create Text Asset</h3>
        <div class="form-group">
          <label style="font-size:0.75rem;">Message Content</label>
          <textarea class="form-input" id="txtCardInput" rows="4" placeholder="Write celebration quote, wish, or memo..." required></textarea>
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:16px;">
          <button class="btn btn-secondary" id="btnCancelText">Cancel</button>
          <button class="btn btn-primary" id="btnSaveText">Save Text Asset</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCancelText') || e.target === modal) modal.remove();
      if (e.target.closest('#btnSaveText')) {
        const text = modal.querySelector('#txtCardInput').value.trim();
        if (text) {
          await assetRepository.saveAsset({
            type: 'text',
            name: `Text: ${text.substring(0, 20)}...`,
            metadata: { textContent: text }
          });
          modal.remove();
          Toast.show('Text asset saved to library!', 'success');
          this.onUpdate();
        }
      }
    });

    document.body.appendChild(modal);
  }
}


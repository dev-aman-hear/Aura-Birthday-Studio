/**
 * Birthday Studio - Media Preview & Asset Inspector
 * Comprehensive Media Asset Inspector with Metadata Table, Usage Details,
 * and In-Place Media Replacement
 */

import { assetRepository } from '../services/AssetRepository.js';
import { AssetUsageTracker } from '../services/asset/AssetUsageTracker.js';
import { Toast } from '../utils/Toast.js';
import { Accessibility } from '../utils/Accessibility.js';

export class MediaPreviewView {
  constructor(asset, project = null, onUpdate = (() => {})) {
    this.asset = asset;
    this.project = project;
    this.onUpdate = onUpdate;
    this.renderUrl = null;
    this.keyupHandler = null;
  }

  async render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'mediaPreviewModalRoot';
    modal.style.zIndex = '999999';

    if (!this.asset) return modal;

    this.renderUrl = await assetRepository.getRenderableUrl(this.asset);
    const meta = this.asset.metadata || {};
    const usage = this.project ? AssetUsageTracker.getAssetUsage(this.asset.id, this.project) : { count: 0, scenes: [] };

    let mediaContentHtml = '';
    if (this.asset.type === 'image' || this.asset.type === 'sticker') {
      mediaContentHtml = `<img src="${this.renderUrl}" style="max-width:100%; max-height:48vh; object-fit:contain; border-radius:var(--radius-md);" />`;
    } else if (this.asset.type === 'video') {
      mediaContentHtml = `<video src="${this.renderUrl}" controls autoplay style="max-width:100%; max-height:48vh; border-radius:var(--radius-md);"></video>`;
    } else if (this.asset.type === 'audio') {
      mediaContentHtml = `<audio src="${this.renderUrl}" controls autoplay style="width:100%; max-width:400px; margin:20px 0;"></audio>`;
    } else {
      mediaContentHtml = `<div style="padding:40px; color:var(--text-muted);">📄 Text / Memo Asset</div>`;
    }

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:740px; width:92vw; max-height:90vh; padding:20px; display:flex; flex-direction:column; overflow-y:auto;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:14px;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
              <span>🔍</span> <span>${this.asset.name}</span>
            </h3>
            <span style="font-size:0.72rem; color:var(--text-muted);">Asset ID: ${this.asset.id}</span>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnCloseMediaPreview" style="font-size:1.1rem;">✕</button>
        </div>

        <!-- Media Stage -->
        <div style="display:flex; justify-content:center; align-items:center; min-height:180px; max-height:50vh; background:#080710; border-radius:var(--radius-md); padding:12px; margin-bottom:14px; border:1px solid var(--border);">
          ${mediaContentHtml}
        </div>

        <!-- Comprehensive Metadata Table -->
        <div style="background:var(--surface, #120f22); border:1px solid var(--border, rgba(255,255,255,0.08)); border-radius:var(--radius-sm, 6px); padding:12px; margin-bottom:14px;">
          <h4 style="font-size:0.75rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px 0;">
            Asset Specifications & Metadata
          </h4>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; font-size:0.75rem;">
            <div>
              <span style="color:var(--text-muted); display:block;">Asset Type</span>
              <strong style="color:var(--text);">${(this.asset.type || 'IMAGE').toUpperCase()}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">File Format</span>
              <strong style="color:var(--text);">${(meta.fileFormat || 'N/A').toUpperCase()}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">File Size</span>
              <strong style="color:var(--text);">${this.asset.getFormattedSize ? this.asset.getFormattedSize() : `${meta.sizeMB || 0} MB`}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">Dimensions</span>
              <strong style="color:var(--text);">${meta.width ? `${meta.width} × ${meta.height} px` : 'N/A'}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">Aspect Ratio</span>
              <strong style="color:var(--text);">${meta.aspectRatio || '1:1'}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">Orientation</span>
              <strong style="color:var(--text); text-transform:capitalize;">${meta.orientation || 'Square'}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">Transparency</span>
              <strong style="color:${meta.hasTransparency ? '#2ed573' : 'var(--text-muted)'};">${meta.hasTransparency ? 'Supported (Alpha)' : 'Opaque'}</strong>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block;">Duration</span>
              <strong style="color:var(--text);">${this.asset.getFormattedDuration ? (this.asset.getFormattedDuration() || 'N/A') : 'N/A'}</strong>
            </div>
          </div>
        </div>

        <!-- Project Usage Information -->
        ${this.project ? `
          <div style="background:var(--surface, #120f22); border:1px solid var(--border, rgba(255,255,255,0.08)); border-radius:var(--radius-sm, 6px); padding:10px 12px; margin-bottom:14px; font-size:0.75rem;">
            <strong style="color:var(--text);">Project Usage: </strong>
            ${usage.count > 0 ? `
              <span style="color:var(--accent, #7f5af0); font-weight:700;">Used in ${usage.count} scene(s) (${usage.scenes.map(s => s.sceneName).join(', ')})</span>
            ` : `
              <span style="color:var(--text-muted);">Unused</span>
            `}
          </div>
        ` : ''}

        <!-- Footer Actions -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:12px;">
          <label class="btn btn-secondary btn-sm" style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin:0;">
            <span>🔄 Replace Media File</span>
            <input type="file" id="inpPreviewReplaceFile" accept="image/*,video/*,audio/*" style="display:none;" />
          </label>
          
          <button class="btn btn-secondary btn-sm" id="btnDismissMediaPreview">Close</button>
        </div>
      </div>
    `;

    const cleanup = () => {
      if (this.keyupHandler) {
        window.removeEventListener('keyup', this.keyupHandler);
      }
      modal.remove();
    };

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnCloseMediaPreview' || e.target.id === 'btnDismissMediaPreview' || e.target === modal) {
        cleanup();
      }
    });

    // Replace Media File from Inspector
    modal.querySelector('#inpPreviewReplaceFile')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      Toast.show('Replacing media file...', 'info');
      await assetRepository.replaceAsset(this.asset.id, file, this.project);
      Toast.show('Media replaced successfully!', 'success');
      this.onUpdate();
      cleanup();
    });

    this.keyupHandler = (e) => {
      if (e.key === 'Escape') cleanup();
    };
    window.addEventListener('keyup', this.keyupHandler);
    Accessibility.trapFocus(modal);

    return modal;
  }
}


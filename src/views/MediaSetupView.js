/**
 * Birthday Studio - Media Setup View (Section 7)
 * Media Uploader (Photos, Videos, Music) with "Skip for now" Option
 */

import { assetRepository } from '../services/AssetRepository.js';
import { Toast } from '../utils/Toast.js';

export class MediaSetupView {
  constructor(options = {}) {
    this.uploadedAssetIds = options.uploadedAssetIds || [];
    this.onUpdateMedia = options.onUpdateMedia || (() => {});
  }

  render() {
    const container = document.createElement('div');
    container.className = 'step-view-container animate-fade';

    container.innerHTML = `
      <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:4px;">3. Add Media (Optional)</h2>
      <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:20px;">
        Upload photos, videos, or music to personalize your experience. You can also skip this step now and add photos later!
      </p>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:var(--surface-elevated); padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h3 style="font-size:1rem; font-weight:700;">📸 Upload Photos / Videos</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">Select images or video clips from your device.</p>
          </div>

          <label class="btn btn-primary" style="min-height:44px;">
            ➕ Choose Files
            <input type="file" id="wizMediaInput" multiple accept="image/*,video/*" style="display:none;" />
          </label>
        </div>

        <div style="background:var(--surface-elevated); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border);">
          <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:8px;">
            Uploaded Assets (${this.uploadedAssetIds.length})
          </div>

          ${this.uploadedAssetIds.length > 0 ? `
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${this.uploadedAssetIds.map(id => `<span class="prompt-detected-badge">📄 ${id}</span>`).join('')}
            </div>
          ` : `
            <div style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">
              No custom files added yet. Using beautiful local placeholders.
            </div>
          `}
        </div>
      </div>
    `;

    this.attachEvents(container);
    return container;
  }

  attachEvents(container) {
    const fileInp = container.querySelector('#wizMediaInput');
    if (fileInp) {
      fileInp.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        Toast.show(`Uploading ${files.length} file(s)...`, 'info');

        for (const file of files) {
          let type = 'image';
          if (file.type.startsWith('video/')) type = 'video';

          const asset = await assetRepository.saveAsset({
            type,
            name: file.name,
            metadata: { size: file.size, mimeType: file.type }
          }, file);

          this.uploadedAssetIds.push(asset.id);
        }

        Toast.show('Files added to celebration!', 'success');
        this.onUpdateMedia(this.uploadedAssetIds);

        const newRoot = this.render();
        container.replaceWith(newRoot);
      });
    }
  }
}

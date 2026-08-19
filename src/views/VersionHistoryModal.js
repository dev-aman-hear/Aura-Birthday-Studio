/**
 * Birthday Studio - Draft Version History Modal (Section 4)
 * Lists saved IndexedDB draft versions with View & Restore actions
 */

import { VersionHistoryService } from '../services/VersionHistoryService.js';
import { Toast } from '../utils/Toast.js';

export class VersionHistoryModal {
  constructor(project, onRestoreVersion = (() => {})) {
    this.project = project;
    this.onRestoreVersion = onRestoreVersion;
  }

  async render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'versionHistoryModalRoot';

    const versions = await VersionHistoryService.getVersionsForProject(this.project?.id);

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:560px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800;">📜 Draft Version History</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseVersionModal">✕</button>
        </div>

        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">
          Restoring a draft version updates your working editor draft. Published links remain untouched.
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; padding-right:4px;">
          ${versions.length > 0 ? versions.map((v, i) => {
            const timeStr = new Date(v.timestamp).toLocaleString();
            return `
              <div style="background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:0.88rem;">${v.label} ${i === 0 ? '<span class="prompt-detected-badge" style="color:var(--accent);">Current</span>' : ''}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${timeStr}</div>
                </div>

                <div>
                  <button class="btn btn-secondary btn-sm btn-restore-ver" data-ver-id="${v.id}">🔄 Restore</button>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="padding:30px; text-align:center; color:var(--text-muted);">
              No previous draft versions recorded yet. Versions are saved automatically as you edit.
            </div>
          `}
        </div>
      </div>
    `;

    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCloseVersionModal')) modal.remove();

      const btnRestore = e.target.closest('.btn-restore-ver');
      if (btnRestore) {
        const confirmed = await Toast.confirm('Restore this draft version to your editor?', 'Restore Version');
        if (confirmed) {
          const restored = await VersionHistoryService.restoreVersion(btnRestore.dataset.verId);
          modal.remove();
          Toast.show('Draft version restored successfully!', 'success');
          this.onRestoreVersion(restored);
        }
      }
    });

    return modal;
  }
}

/**
 * Birthday Studio - Draft Recovery View (Section 1)
 * Displays Unsaved Recovery Snapshot Dialog with Explicit User Controls
 */

import { Accessibility } from '../utils/Accessibility.js';

export class DraftRecoveryView {
  constructor(options = {}) {
    this.recoveryRecord = options.recoveryRecord;
    this.onRestore = options.onRestore || (() => {});
    this.onKeepCurrent = options.onKeepCurrent || (() => {});
    this.onDeleteRecovery = options.onDeleteRecovery || (() => {});
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'draftRecoveryModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const recipName = this.recoveryRecord?.snapshot?.recipient?.name || 'Celebration';
    const timeStr = new Date(this.recoveryRecord?.timestamp || Date.now()).toLocaleString();

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:500px; padding:24px; text-align:center;">
        <div style="font-size:2.5rem; margin-bottom:6px;">🩹</div>
        <h3 style="font-size:1.2rem; font-weight:800;">Unsaved Recovery Draft Found</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px; margin-bottom:16px;">
          An autosaved recovery snapshot for "${recipName}" from ${timeStr} was detected.
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
          <button class="btn btn-primary btn-block" id="btnRestoreRecovery" style="min-height:44px; font-weight:800;">
            🔄 Restore Recovery Draft
          </button>
          <button class="btn btn-secondary btn-block" id="btnKeepCurrentDraft">
            📁 Keep Current Editor Draft
          </button>
          <button class="btn btn-ghost btn-block" id="btnDeleteRecovery" style="color:var(--danger);">
            🗑️ Delete Recovery Snapshot
          </button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnRestoreRecovery') {
        modal.remove();
        this.onRestore(this.recoveryRecord);
      }

      if (e.target.id === 'btnKeepCurrentDraft') {
        modal.remove();
        this.onKeepCurrent();
      }

      if (e.target.id === 'btnDeleteRecovery') {
        modal.remove();
        this.onDeleteRecovery();
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}

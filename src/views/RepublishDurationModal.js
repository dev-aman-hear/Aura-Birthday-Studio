/**
 * Birthday Studio - Republish Duration Modal
 * Explicit Expiration Selector (1, 3, 5, 7 Days) with Dynamic Expiration Calculation
 */

import { Accessibility } from '../utils/Accessibility.js';
import { MAX_LINK_DURATION_DAYS, DEFAULT_LINK_DURATION_DAYS } from '../services/PublishedProjectRepository.js';

export class RepublishDurationModal {
  constructor(publicationMeta, onConfirm = (() => {})) {
    this.publicationMeta = publicationMeta || {};
    this.onConfirm = onConfirm;
    this.selectedDays = DEFAULT_LINK_DURATION_DAYS;
  }

  getExpirationDateString(days) {
    const expireTime = Date.now() + (days * 24 * 60 * 60 * 1000);
    return new Date(expireTime).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'republishModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:480px; padding:26px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800; display:flex; align-items:center; gap:8px;">
            <span>🔄</span> <span>Republish Celebration Link</span>
          </h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseRepublishModal" aria-label="Close Modal">✕</button>
        </div>

        <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:16px;">
          Choose how long this celebration link should remain active. The expiration window will be reset starting from now.
        </p>

        <!-- Duration Dropdown -->
        <div class="form-group" style="margin-bottom:16px;">
          <label style="font-weight:700; font-size:0.84rem; color:var(--text); margin-bottom:6px; display:block;">
            Keep this link active for:
          </label>
          <select class="form-input" id="selRepublishDuration" style="width:100%; font-size:0.92rem; padding:10px 12px; border-radius:8px; background:#1b1730; color:#fff; border:1px solid rgba(124, 58, 237, 0.4); cursor:pointer;">
            <option value="1">1 Day</option>
            <option value="3" selected>3 Days (Recommended)</option>
            <option value="5">5 Days</option>
            <option value="7">7 Days (Maximum allowed)</option>
          </select>
        </div>

        <!-- Live Expiration Notice -->
        <div id="republishNoticeBox" style="background:rgba(124, 58, 237, 0.12); border:1px solid rgba(124, 58, 237, 0.3); padding:12px 14px; border-radius:8px; margin-bottom:22px;">
          <div style="font-size:0.84rem; font-weight:700; color:#c4b5fd; display:flex; align-items:center; gap:6px;">
            <span>⏳</span> <span>Link will expire after the selected duration.</span>
          </div>
          <div style="font-size:0.8rem; color:#cbd5e1; margin-top:4px;" id="lblRepublishDynamicExpireDate">
            New expiration: <strong>${this.getExpirationDateString(this.selectedDays)}</strong>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-secondary" id="btnCancelRepublish" style="padding:10px 18px;">Cancel</button>
          <button class="btn btn-primary" id="btnExecuteRepublish" style="padding:10px 22px; font-weight:800; box-shadow:0 4px 14px rgba(124,58,237,0.4);">
            🔄 Republish
          </button>
        </div>
      </div>
    `;

    this.attachEvents(modal);
    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }

  attachEvents(modal) {
    const sel = modal.querySelector('#selRepublishDuration');
    const lblDate = modal.querySelector('#lblRepublishDynamicExpireDate');

    if (sel && lblDate) {
      sel.addEventListener('change', (e) => {
        const days = Math.min(MAX_LINK_DURATION_DAYS, Math.max(1, parseInt(e.target.value, 10) || 3));
        this.selectedDays = days;
        lblDate.innerHTML = `New expiration: <strong>${this.getExpirationDateString(days)}</strong>`;
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target.closest('#btnCloseRepublishModal') || e.target.closest('#btnCancelRepublish')) {
        modal.remove();
        return;
      }

      if (e.target.closest('#btnExecuteRepublish')) {
        const days = this.selectedDays;
        modal.remove();
        this.onConfirm(days);
      }
    });
  }
}

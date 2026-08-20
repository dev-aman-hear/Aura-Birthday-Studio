/**
 * Birthday Studio - Publish Confirmation View
 * Pre-Publication Summary Modal with Link Expiration Duration Selector (Permanent or 1, 3, 5, 7 Days)
 */

import { Accessibility } from '../utils/Accessibility.js';
import { MAX_LINK_DURATION_DAYS, DEFAULT_LINK_DURATION_DAYS } from '../services/PublishedProjectRepository.js';
import { supabaseService } from '../services/supabaseClient.js';

export class PublishConfirmationView {
  constructor(project, onConfirmPublish = (() => {})) {
    this.project = project;
    this.onConfirmPublish = onConfirmPublish;
    this.selectedDays = DEFAULT_LINK_DURATION_DAYS; // null by default (permanent)
  }

  getExpirationDateString(days) {
    if (!days || days === 'permanent') {
      return 'Never (Permanent Link)';
    }
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
    modal.id = 'publishConfirmationModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const recipName = this.project?.recipient?.name || 'Someone Special';
    const occasion = (this.project?.occasion || 'birthday').toUpperCase();
    const sceneCount = this.project?.scenes?.length || 0;
    const mediaCount = this.project?.assetIds?.length || 0;
    const totalDuration = (this.project?.scenes || []).reduce((acc, s) => acc + (s.duration || 6), 0);
    const isConfigured = supabaseService.isConfigured();

    const isPublished = Boolean(this.project?.published || this.project?.publicationId);

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:520px; padding:26px; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px;">
            <span>🚀</span> <span>${isPublished ? 'Update Celebration Link' : 'Publish Celebration'}</span>
          </h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseConfirmModal" aria-label="Close Modal">✕</button>
        </div>

        ${!isConfigured ? `
          <div style="background:rgba(230,57,70,0.15); border:1px solid #e63946; padding:10px 14px; border-radius:8px; margin-bottom:16px; font-size:0.82rem; color:#ff7675; line-height:1.4;">
            ⚠️ <strong>Cloud Storage Not Connected</strong>: Supabase URL and Anon Key are not yet configured. The link will only work on this browser. To generate global links for other phones and devices, configure Supabase in Creator Settings.
          </div>
        ` : `
          <div style="background:rgba(44,182,125,0.12); border:1px solid #2cb67d; padding:10px 14px; border-radius:8px; margin-bottom:16px; font-size:0.82rem; color:#2cb67d; line-height:1.4;">
            🟢 <strong>Cloud Storage Connected</strong>: Your celebration will be saved to Supabase and accessible on any device, phone, or browser.
          </div>
        `}

        <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:16px;">
          ${isPublished 
            ? 'Your public celebration link will remain unchanged. Updating will refresh the live celebration with your latest edits and photos.' 
            : 'Review your celebration details and choose how long the public recipient link should remain active.'}
        </p>

        <!-- Project Summary Cards -->
        <div style="display:flex; flex-direction:column; gap:8px; background:var(--surface-elevated, #161328); padding:14px 16px; border-radius:var(--radius-md, 10px); border:1px solid var(--border, rgba(255,255,255,0.1)); margin-bottom:18px; font-size:0.86rem;">
          <div>👤 <strong>Recipient:</strong> ${recipName}</div>
          <div>🎉 <strong>Occasion:</strong> ${occasion}</div>
          <div>🎬 <strong>Scenes:</strong> ${sceneCount} scenes (${totalDuration}s total duration)</div>
          <div>📷 <strong>Media Assets:</strong> ${mediaCount} memory files attached</div>
          ${isPublished && this.project?.publicationId ? `
            <div style="color:var(--accent-gold, #ffd700); font-size:0.8rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px; margin-top:2px;">
              🔗 <strong>Existing Link:</strong> #view/${this.project.publicationId}
            </div>
          ` : ''}
        </div>

        <!-- Duration Selection Dropdown -->
        <div class="form-group" style="margin-bottom:18px;">
          <label style="font-weight:700; font-size:0.84rem; color:var(--text); margin-bottom:6px; display:block;">
            How long should this link remain active?
          </label>
          
          <select class="form-input" id="selPublishDuration" style="width:100%; font-size:0.92rem; padding:10px 12px; border-radius:8px; background:#1b1730; color:#fff; border:1px solid rgba(124, 58, 237, 0.4); cursor:pointer;">
            <option value="permanent" selected>✨ Permanent Link (Never expires - Recommended)</option>
            <option value="7">7 Days</option>
            <option value="5">5 Days</option>
            <option value="3">3 Days</option>
            <option value="1">1 Day</option>
          </select>
        </div>

        <!-- Dynamic Live Expiration Date Display -->
        <div id="publishExpirationNotice" style="background:rgba(124, 58, 237, 0.12); border:1px solid rgba(124, 58, 237, 0.3); padding:12px 14px; border-radius:8px; margin-bottom:22px;">
          <div style="font-size:0.84rem; font-weight:700; color:#c4b5fd; display:flex; align-items:center; gap:6px;" id="lblDynamicExpireHeader">
            <span>✨</span> <span>Permanent Celebration Link</span>
          </div>
          <div style="font-size:0.8rem; color:#cbd5e1; margin-top:4px;" id="lblDynamicExpireDate">
            Link status: <strong>Never expires (Publicly accessible from any device)</strong>
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-secondary" id="btnCancelConfirm" style="padding:10px 18px;">Cancel</button>
          <button class="btn btn-primary" id="btnExecutePublish" style="padding:10px 22px; font-weight:800; box-shadow:0 4px 14px rgba(124,58,237,0.4);">
            🚀 ${isPublished ? 'Update Link' : 'Publish'}
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
    const sel = modal.querySelector('#selPublishDuration');
    const lblHeader = modal.querySelector('#lblDynamicExpireHeader');
    const lblDate = modal.querySelector('#lblDynamicExpireDate');

    if (sel && lblDate) {
      sel.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'permanent') {
          this.selectedDays = null;
          if (lblHeader) lblHeader.innerHTML = `<span>✨</span> <span>Permanent Celebration Link</span>`;
          lblDate.innerHTML = `Link status: <strong>Never expires (Publicly accessible from any device)</strong>`;
        } else {
          const days = Math.min(MAX_LINK_DURATION_DAYS, Math.max(1, parseInt(val, 10) || 3));
          this.selectedDays = days;
          if (lblHeader) lblHeader.innerHTML = `<span>⏳</span> <span>Link will expire after the selected duration.</span>`;
          lblDate.innerHTML = `New expiration: <strong>${this.getExpirationDateString(days)}</strong>`;
        }
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target.closest('#btnCloseConfirmModal') || e.target.closest('#btnCancelConfirm')) {
        modal.remove();
        return;
      }

      if (e.target.closest('#btnExecutePublish')) {
        const days = this.selectedDays;
        modal.remove();
        this.onConfirmPublish(days);
      }
    });
  }
}


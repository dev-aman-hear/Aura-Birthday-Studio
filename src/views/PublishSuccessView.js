/**
 * Birthday Studio - Publish Success View Ceremony Screen
 * Live Publication Confirmation, Share Handoff & Expiration Notice
 */

import { ShareService } from '../services/ShareService.js';
import { Accessibility } from '../utils/Accessibility.js';
import { Toast } from '../utils/Toast.js';

export class PublishSuccessView {
  constructor(publication, onReturnDashboard = (() => {}), isUpdate = false) {
    this.publication = publication;
    this.onReturnDashboard = onReturnDashboard;
    this.isUpdate = isUpdate;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'publishSuccessModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    if (!this.publication) return modal;

    const recipName = this.publication?.snapshot?.recipient?.name || 'Someone Special';
    const shareUrl = ShareService.getShareUrl(this.publication.id);
    const qrSvgHtml = ShareService.generateQrSvg(shareUrl);
    const isPermanent = !this.publication.expiresAt;
    const expireDateStr = isPermanent ? 'Never (Permanent)' : new Date(this.publication.expiresAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const durationDays = this.publication.durationDays || (this.publication.expiresAt ? Math.max(1, Math.round((this.publication.expiresAt - this.publication.publishedAt) / (24 * 60 * 60 * 1000))) : null);

    const statusText = this.isUpdate
      ? `Link updated for <strong>${recipName}</strong> • Live celebration reflects all your latest changes. The public link remains unchanged.`
      : isPermanent
        ? `Created for <strong>${recipName}</strong> • ✨ <strong>Permanent Link (Never expires)</strong>`
        : `Created for <strong>${recipName}</strong> • Active for <strong>${durationDays} Day${durationDays === 1 ? '' : 's'}</strong> (Expires: ${expireDateStr})`;

    modal.innerHTML = `
      <div class="wizard-modal text-center" style="max-width:540px; padding:28px; position:relative;">
        <button class="btn btn-ghost btn-icon" id="btnCloseSuccessModal" aria-label="Close modal" style="position:absolute; top:16px; right:16px; font-size:1.1rem; width:36px; height:36px;">✕</button>
        <div style="font-size:3rem; margin-bottom:4px;">${this.isUpdate ? '✨' : '🎉'}</div>
        <h2 style="font-size:1.6rem; font-weight:900;">${this.isUpdate ? 'Celebration Link Updated!' : 'Your Celebration is Live!'}</h2>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">
          ${statusText}
        </p>

        <div style="display:flex; justify-content:center; margin:16px 0;">
          ${qrSvgHtml}
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label style="font-size:0.75rem;">Shareable Recipient Link</label>
          <input type="text" class="form-input" id="pubSuccessUrlInp" value="${shareUrl}" readonly style="text-align:center; font-size:0.8rem;" />
        </div>

        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-primary" id="btnSuccessShare" style="min-height:44px; font-weight:800;">🔗 Share Experience</button>
          <button class="btn btn-secondary" id="btnSuccessCopy" style="min-height:44px;">📋 Copy Link</button>
          <a href="${shareUrl}" target="_blank" class="btn btn-success" style="min-height:44px;">👁️ Open View</a>
          <button class="btn btn-secondary" id="btnSuccessContinueEdit" style="min-height:44px;">✏️ Keep Editing</button>
          <button class="btn btn-ghost" id="btnSuccessDashboard" style="min-height:44px;">🏠 Dashboard</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCloseSuccessModal') || e.target.closest('#btnSuccessContinueEdit') || e.target === modal) {
        modal.remove();
        return;
      }

      if (e.target.closest('#btnSuccessShare')) {
        const res = await ShareService.sharePublication(this.publication, `${recipName}'s Celebration`);
        if (res.success) Toast.show('Celebration shared!', 'success');
        else if (res.method === 'cancelled') Toast.show('Share cancelled', 'info');
        else Toast.show('Link copied to clipboard!', 'info');
        return;
      }

      if (e.target.closest('#btnSuccessCopy')) {
        const inp = modal.querySelector('#pubSuccessUrlInp');
        if (inp) {
          inp.select();
          await navigator.clipboard.writeText(shareUrl);
          Toast.show('Link copied to clipboard!', 'success');
        }
        return;
      }

      if (e.target.closest('#btnSuccessDashboard')) {
        modal.remove();
        this.onReturnDashboard();
        return;
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}


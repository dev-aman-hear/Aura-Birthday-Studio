/**
 * Birthday Studio - Share & Delivery Center View (Section 2)
 * Share URL, Encoded SVG QR Code & Web Share API Modal
 */

import { ShareService } from '../services/ShareService.js';
import { Accessibility } from '../utils/Accessibility.js';
import { Toast } from '../utils/Toast.js';

export class ShareCelebrationView {
  constructor(publication) {
    this.publication = publication;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'shareModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    if (!this.publication) return modal;

    const shareUrl = ShareService.getShareUrl(this.publication.id);
    const qrSvgHtml = ShareService.generateQrSvg(shareUrl);
    const recipName = this.publication.snapshot?.recipient?.name || 'Someone Special';
    const expiresDate = new Date(this.publication.expiresAt).toLocaleDateString();

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:540px; padding:24px; text-align:center;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800;">🚀 Share & Delivery Center</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseShareModal" aria-label="Close Share Modal">✕</button>
        </div>

        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
          Sharing live publication for <strong>${recipName}</strong> • Expires on ${expiresDate}
        </p>

        <div style="display:flex; justify-content:center; margin-bottom:16px;">
          ${qrSvgHtml}
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <input type="text" class="form-input" id="inpShareUrl" value="${shareUrl}" readonly style="text-align:center; font-size:0.8rem;" />
        </div>

        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-primary" id="btnShareNative" style="min-height:44px; font-weight:700;">🔗 Share Experience</button>
          <button class="btn btn-secondary" id="btnCopyShareUrl" style="min-height:44px;">📋 Copy Link</button>
          <a href="${shareUrl}" target="_blank" class="btn btn-success" style="min-height:44px;">👁️ Open View</a>
        </div>
      </div>
    `;

    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCloseShareModal')) modal.remove();

      if (e.target.closest('#btnShareNative')) {
        const res = await ShareService.sharePublication(this.publication, `${recipName}'s Celebration`);
        if (res.success) {
          Toast.show('Celebration shared!', 'success');
        } else if (res.method === 'cancelled') {
          Toast.show('Share cancelled', 'info');
        } else {
          Toast.show('Link copied to clipboard!', 'info');
        }
      }

      if (e.target.closest('#btnCopyShareUrl')) {
        const inp = modal.querySelector('#inpShareUrl');
        if (inp) {
          inp.select();
          await navigator.clipboard.writeText(shareUrl);
          Toast.show('Link copied to clipboard!', 'success');
        }
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}

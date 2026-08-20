/**
 * Birthday Studio - Publish Progress Modal View
 * Real-time deterministic publishing progress tracking, asset upload monitor,
 * failure recovery/retry, and celebration share handoff.
 */

import { publishedProjectRepository } from '../services/PublishedProjectRepository.js';
import { ShareService } from '../services/ShareService.js';
import { Accessibility } from '../utils/Accessibility.js';
import { Toast } from '../utils/Toast.js';
import { escapeHTML } from '../utils/Security.js';

export class PublishProgressModal {
  constructor(options = {}) {
    this.project = options.project || {};
    this.durationDays = options.durationDays !== undefined ? options.durationDays : null;
    this.isUpdate = Boolean(options.isUpdate || this.project?.published || this.project?.publicationId);
    this.onComplete = options.onComplete || (() => {});
    this.onReturnDashboard = options.onReturnDashboard || (() => {});
    this.onClose = options.onClose || (() => {});

    // State: 'publishing' | 'complete' | 'error'
    this.state = 'publishing';
    this.currentPercent = 0;
    this.currentPhase = 'preparing'; // 'preparing' | 'assets' | 'saving' | 'generating' | 'published'
    this.statusMessage = this.isUpdate ? 'Updating celebration link...' : 'Preparing celebration...';
    this.detailMessage = 'Checking scenes, elements, and configurations';
    this.publication = null;
    this.errorMessage = null;

    this.root = null;
    this.isPublishingInProgress = false;
  }

  getPhaseStatus(targetPhase) {
    const phaseOrder = ['preparing', 'assets', 'saving', 'generating', 'published'];
    const currentIdx = phaseOrder.indexOf(this.currentPhase);
    const targetIdx = phaseOrder.indexOf(targetPhase);

    if (this.state === 'complete' || currentIdx > targetIdx) {
      return 'completed';
    }
    if (currentIdx === targetIdx && this.state === 'publishing') {
      return 'active';
    }
    return 'pending';
  }

  renderPhaseItem(phaseKey, label) {
    const status = this.getPhaseStatus(phaseKey);

    let iconHtml = '';
    let statusClass = '';
    let textColor = 'var(--text-muted, rgba(255,255,255,0.5))';

    if (status === 'completed') {
      iconHtml = `<span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(44,182,125,0.2); color:#2cb67d; font-size:0.75rem; font-weight:900;">✓</span>`;
      textColor = 'var(--text, #ffffff)';
      statusClass = 'phase-completed';
    } else if (status === 'active') {
      iconHtml = `<span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(127,90,240,0.25); color:#a78bfa; font-size:0.75rem; animation: pulse 1.5s infinite;">●</span>`;
      textColor = 'var(--accent-purple, #c4b5fd)';
      statusClass = 'phase-active font-bold';
    } else {
      iconHtml = `<span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.3); font-size:0.75rem;">○</span>`;
      textColor = 'var(--text-muted, rgba(255,255,255,0.4))';
      statusClass = 'phase-pending';
    }

    return `
      <div class="publish-phase-item ${statusClass}" data-phase="${phaseKey}" style="display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); transition:all 0.25s ease;">
        <div style="flex-shrink:0;">${iconHtml}</div>
        <div style="flex:1; font-size:0.86rem; color:${textColor}; font-weight:${status === 'active' ? '700' : '500'};">
          ${label}
        </div>
      </div>
    `;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'publishProgressModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    this.root = modal;

    this.renderModalContent();
    this.attachEvents();

    // Start publishing immediately
    this.startPublishing();

    Accessibility.trapFocus(modal);
    return modal;
  }

  renderModalContent() {
    if (!this.root) return;

    const recipName = this.project?.recipient?.name || 'Someone Special';

    if (this.state === 'publishing') {
      const title = this.isUpdate ? 'Updating your celebration' : 'Publishing your celebration';

      this.root.innerHTML = `
        <div class="wizard-modal" style="max-width:500px; padding:28px; box-sizing:border-box; background:var(--surface, #131127); border:1px solid var(--border, rgba(255,255,255,0.12)); border-radius:16px; box-shadow:0 24px 60px rgba(0,0,0,0.7); position:relative;">
          
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.6rem;">🚀</span>
              <div>
                <h3 style="font-size:1.18rem; font-weight:800; color:var(--text, #fff); margin:0;">${escapeHTML(title)}</h3>
                <p style="font-size:0.8rem; color:var(--text-muted, #94a3b8); margin:2px 0 0 0;">For ${escapeHTML(recipName)}</p>
              </div>
            </div>
            <span class="pub-progress-percent-badge" id="lblProgressPercent" style="font-size:1rem; font-weight:900; color:var(--accent-purple, #c4b5fd); background:rgba(127,90,240,0.15); padding:4px 12px; border-radius:20px; border:1px solid rgba(127,90,240,0.3);">
              ${this.currentPercent}%
            </span>
          </div>

          <!-- Progress Bar -->
          <div style="margin-bottom:20px;">
            <div class="progress-bar-container" style="height:10px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden; position:relative;">
              <div id="publishProgressBarFill" style="height:100%; width:${this.currentPercent}%; border-radius:999px; background:linear-gradient(90deg, #7f5af0, #2cb67d); transition:width 0.35s cubic-bezier(0.4, 0, 0.2, 1); box-shadow:0 0 12px rgba(127,90,240,0.5);"></div>
            </div>
          </div>

          <!-- Phase Checklist -->
          <div class="publish-phases-list" id="publishPhasesList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
            ${this.renderPhaseItem('preparing', 'Preparing celebration project')}
            ${this.renderPhaseItem('assets', 'Processing photos, music & assets')}
            ${this.renderPhaseItem('saving', 'Saving publication database')}
            ${this.renderPhaseItem('generating', 'Generating shareable link')}
          </div>

          <!-- Status & Detail Subtext -->
          <div style="background:rgba(0,0,0,0.25); border-radius:10px; padding:12px 14px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
            <div id="lblStatusMessage" style="font-size:0.86rem; font-weight:700; color:#e2e8f0; margin-bottom:3px;">
              ${escapeHTML(this.statusMessage)}
            </div>
            <div id="lblDetailMessage" style="font-size:0.78rem; color:#94a3b8;">
              ${escapeHTML(this.detailMessage || 'Please wait while we publish your celebration...')}
            </div>
          </div>

          <div style="text-align:center; margin-top:16px;">
            <span style="font-size:0.75rem; color:rgba(255,255,255,0.4);">
              🔒 Publishing securely to cloud storage
            </span>
          </div>
        </div>
      `;
    } else if (this.state === 'error') {
      this.root.innerHTML = `
        <div class="wizard-modal text-center" style="max-width:480px; padding:28px; background:var(--surface, #131127); border:1px solid rgba(239,68,68,0.3); border-radius:16px; box-shadow:0 24px 60px rgba(0,0,0,0.7);">
          <div style="font-size:3rem; margin-bottom:8px;">⚠️</div>
          <h3 style="font-size:1.3rem; font-weight:800; color:#f87171; margin-bottom:6px;">Publication Failed</h3>
          <p style="font-size:0.85rem; color:var(--text-muted, #94a3b8); margin-bottom:18px;">
            An error occurred while publishing your celebration. Your draft project is completely safe and intact.
          </p>

          <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); padding:12px 16px; border-radius:10px; font-size:0.82rem; color:#fca5a5; margin-bottom:22px; text-align:left; line-height:1.4; word-break:break-word;">
            <strong>Error:</strong> ${escapeHTML(this.errorMessage || 'Network request failed. Please verify your connection.')}
          </div>

          <div style="display:flex; justify-content:center; gap:12px;">
            <button class="btn btn-secondary" id="btnCancelPublishError" style="padding:10px 18px;">Close</button>
            <button class="btn btn-primary" id="btnRetryPublish" style="padding:10px 22px; font-weight:800;">
              🔄 Retry Publishing
            </button>
          </div>
        </div>
      `;
    } else if (this.state === 'complete' && this.publication) {
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
        ? `Link updated for <strong>${escapeHTML(recipName)}</strong> • The public link remains unchanged and now displays all your latest edits.`
        : isPermanent
          ? `Created for <strong>${escapeHTML(recipName)}</strong> • ✨ <strong>Permanent Link (Never expires)</strong>`
          : `Created for <strong>${escapeHTML(recipName)}</strong> • Active for <strong>${durationDays} Day${durationDays === 1 ? '' : 's'}</strong> (Expires: ${expireDateStr})`;

      this.root.innerHTML = `
        <div class="wizard-modal text-center animate-fade" style="max-width:540px; padding:28px; position:relative; background:var(--surface, #131127); border:1px solid var(--border, rgba(255,255,255,0.12)); border-radius:16px; box-shadow:0 24px 60px rgba(0,0,0,0.7);">
          <button class="btn btn-ghost btn-icon" id="btnCloseSuccessModal" aria-label="Close modal" style="position:absolute; top:16px; right:16px; font-size:1.1rem; width:36px; height:36px;">✕</button>
          <div style="font-size:3rem; margin-bottom:4px;">${this.isUpdate ? '✨' : '🎉'}</div>
          <h2 style="font-size:1.55rem; font-weight:900; color:var(--text, #fff);">${this.isUpdate ? 'Celebration Link Updated!' : 'Your Celebration is Live!'}</h2>
          <p style="color:var(--text-muted, #94a3b8); font-size:0.85rem; margin-top:4px; line-height:1.4;">
            ${statusText}
          </p>

          <div style="display:flex; justify-content:center; margin:16px 0;">
            ${qrSvgHtml}
          </div>

          <div class="form-group" style="margin-bottom:16px; text-align:left;">
            <label style="font-size:0.78rem; font-weight:700; color:#cbd5e1; margin-bottom:4px; display:block;">Shareable Recipient Link</label>
            <div style="display:flex; gap:8px;">
              <input type="text" class="form-input" id="pubSuccessUrlInp" value="${escapeHTML(shareUrl)}" readonly style="text-align:center; font-size:0.82rem; font-family:monospace; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.15);" />
            </div>
          </div>

          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-primary" id="btnSuccessShare" style="min-height:44px; font-weight:800; padding:8px 18px;">🔗 Share Experience</button>
            <button class="btn btn-secondary" id="btnSuccessCopy" style="min-height:44px; padding:8px 16px;">📋 Copy Link</button>
            <a href="${escapeHTML(shareUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-success" style="min-height:44px; display:inline-flex; align-items:center; gap:6px; padding:8px 16px; text-decoration:none;">👁️ Open Link</a>
            <button class="btn btn-secondary" id="btnSuccessContinueEdit" style="min-height:44px; padding:8px 14px;">✏️ Keep Editing</button>
            <button class="btn btn-ghost" id="btnSuccessDashboard" style="min-height:44px; padding:8px 14px;">🏠 Dashboard</button>
          </div>
        </div>
      `;
    }
  }

  updateProgressDOM(data) {
    if (!this.root || this.state !== 'publishing') return;

    this.currentPercent = Math.min(100, Math.max(0, data.percent || 0));
    this.currentPhase = data.phase || this.currentPhase;
    this.statusMessage = data.message || this.statusMessage;
    this.detailMessage = data.detail || this.detailMessage;

    const fill = this.root.querySelector('#publishProgressBarFill');
    if (fill) fill.style.width = `${this.currentPercent}%`;

    const lblPercent = this.root.querySelector('#lblProgressPercent');
    if (lblPercent) lblPercent.textContent = `${this.currentPercent}%`;

    const lblStatus = this.root.querySelector('#lblStatusMessage');
    if (lblStatus) lblStatus.textContent = this.statusMessage;

    const lblDetail = this.root.querySelector('#lblDetailMessage');
    if (lblDetail) lblDetail.textContent = this.detailMessage;

    const phasesContainer = this.root.querySelector('#publishPhasesList');
    if (phasesContainer) {
      phasesContainer.innerHTML = `
        ${this.renderPhaseItem('preparing', 'Preparing celebration project')}
        ${this.renderPhaseItem('assets', 'Processing photos, music & assets')}
        ${this.renderPhaseItem('saving', 'Saving publication database')}
        ${this.renderPhaseItem('generating', 'Generating shareable link')}
      `;
    }
  }

  async startPublishing() {
    if (this.isPublishingInProgress) return;
    this.isPublishingInProgress = true;
    this.state = 'publishing';
    this.currentPercent = 0;
    this.currentPhase = 'preparing';
    this.errorMessage = null;

    this.renderModalContent();

    try {
      const publication = await publishedProjectRepository.publishProject(
        this.project,
        this.durationDays,
        (progressData) => {
          this.updateProgressDOM(progressData);
        }
      );

      this.publication = publication;
      this.state = 'complete';
      this.currentPercent = 100;
      this.isPublishingInProgress = false;

      this.renderModalContent();

      if (typeof this.onComplete === 'function') {
        this.onComplete(publication);
      }
    } catch (err) {
      console.error('[PublishProgressModal] Publishing error:', err);
      this.state = 'error';
      this.errorMessage = err.message || 'Failed to publish celebration';
      this.isPublishingInProgress = false;
      this.renderModalContent();
    }
  }

  attachEvents() {
    if (!this.root) return;

    this.root.addEventListener('click', async (e) => {
      // Error state retry
      if (e.target.closest('#btnRetryPublish')) {
        this.startPublishing();
        return;
      }

      // Error state cancel
      if (e.target.closest('#btnCancelPublishError')) {
        this.root.remove();
        if (typeof this.onClose === 'function') this.onClose();
        return;
      }

      // Complete state buttons
      if (e.target.closest('#btnCloseSuccessModal') || e.target.closest('#btnSuccessContinueEdit')) {
        this.root.remove();
        if (typeof this.onClose === 'function') this.onClose();
        return;
      }

      if (e.target.closest('#btnSuccessShare')) {
        if (!this.publication) return;
        const recipName = this.publication?.snapshot?.recipient?.name || 'Someone Special';
        const res = await ShareService.sharePublication(this.publication, `${recipName}'s Celebration`);
        if (res.success) Toast.show('Celebration shared!', 'success');
        else if (res.method === 'cancelled') Toast.show('Share cancelled', 'info');
        else Toast.show('Link copied to clipboard!', 'info');
        return;
      }

      if (e.target.closest('#btnSuccessCopy')) {
        const inp = this.root.querySelector('#pubSuccessUrlInp');
        if (inp) {
          inp.select();
          await navigator.clipboard.writeText(inp.value);
          Toast.show('Link copied to clipboard!', 'success');
        }
        return;
      }

      if (e.target.closest('#btnSuccessDashboard')) {
        this.root.remove();
        if (typeof this.onReturnDashboard === 'function') this.onReturnDashboard();
        return;
      }
    });
  }
}

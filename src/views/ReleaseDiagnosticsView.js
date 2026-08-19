/**
 * Birthday Studio - Release Diagnostics View Component (Section 12)
 * Developer-Only Diagnostic Panel (Gated away from Recipient View)
 */

import { ReleaseDiagnosticsService } from '../services/ReleaseDiagnosticsService.js';
import { Accessibility } from '../utils/Accessibility.js';

export class ReleaseDiagnosticsView {
  render() {
    // Security check: NEVER render on recipient routes
    if (window.location.hash.startsWith('#view/')) {
      return document.createElement('div');
    }

    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'releaseDiagnosticsModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const diag = ReleaseDiagnosticsService.getDiagnostics();

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:500px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.1rem; font-weight:800;">🛠️ Release & System Diagnostics</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseDiag" aria-label="Close Diagnostics">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.85rem; background:var(--surface-elevated); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border);">
          <div>🏷️ <strong>App Version:</strong> ${diag.version}</div>
          <div>📍 <strong>Active Hash Route:</strong> ${diag.currentHash}</div>
          <div>🔗 <strong>Active Tracked Object URLs:</strong> ${diag.activeObjectUrls}</div>
          <div>🌐 <strong>Web Share API Available:</strong> ${diag.browserCapabilities.share ? 'Yes ✅' : 'No ❌'}</div>
          <div>📋 <strong>Clipboard API Available:</strong> ${diag.browserCapabilities.clipboard ? 'Yes ✅' : 'No ❌'}</div>
          <div>💾 <strong>IndexedDB Available:</strong> ${diag.browserCapabilities.indexedDB ? 'Yes ✅' : 'No ❌'}</div>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:16px;">
          <button class="btn btn-secondary" id="btnDismissDiag">Close</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnCloseDiag' || e.target.id === 'btnDismissDiag') {
        modal.remove();
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}

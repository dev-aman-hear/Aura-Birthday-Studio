/**
 * Birthday Studio - Project Style Customizer Modal (Section 5, 6 & Post-Publish Customization)
 * Allows Creator to inspect, preview live, and update the celebration's visual style anytime
 */

import { StyleSelectionView } from './StyleSelectionView.js';
import { StyleRegistry } from '../data/styles/StyleRegistry.js';
import { Accessibility } from '../utils/Accessibility.js';

export class ProjectStyleModal {
  constructor(project, onSave = (() => {})) {
    this.project = project;
    this.onSave = onSave;
    this.currentStyleId = project?.theme || project?.settings?.styleConfig?.id || 'style_birthday';
    this.selectedStyleId = this.currentStyleId;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'projectStyleModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const styleView = new StyleSelectionView({
      selectedStyleId: this.selectedStyleId,
      occasion: this.project?.occasion || 'birthday',
      recipient: this.project?.recipient || { name: 'Friend' },
      project: this.project,
      deviceMode: this.project?.settings?.viewMode || 'desktop',
      onSelectStyle: (styleId) => {
        this.selectedStyleId = styleId;
        const curStyle = StyleRegistry.getStyleById(styleId);
        const namePill = modal.querySelector('#modalActiveStylePill');
        if (namePill) namePill.textContent = curStyle.name;
      }
    });


    const activeStyle = StyleRegistry.getStyleById(this.selectedStyleId);

    modal.innerHTML = `
      <div class="wizard-modal project-style-modal-content">
        <!-- Modal Top Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:16px; margin-bottom:20px;">
          <div>
            <h3 style="font-size:1.3rem; font-weight:800; display:flex; align-items:center; gap:8px;">
              <span>🎨</span> <span>Celebration Visual Style</span>
            </h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">
              Choose from 10 design themes. Updates apply live without modifying your scenes or media.
            </p>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnCloseStyleModal" aria-label="Close Style Modal">✕</button>
        </div>

        <!-- Embedded Interactive Split View -->
        <div id="modalStyleSelectionMount" style="flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;"></div>


        <!-- Modal Action Footer -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:16px; margin-top:24px;">
          <div style="font-size:0.88rem; color:var(--text-muted);">
            Selected: <strong style="color:var(--accent);" id="modalActiveStylePill">${activeStyle.name}</strong>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" id="btnCancelStyleModal">Cancel</button>
            <button class="btn btn-primary" id="btnApplyStyleModal">
              <span>✨</span> <span>Apply & Save Style</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const mount = modal.querySelector('#modalStyleSelectionMount');
    if (mount) {
      mount.appendChild(styleView.render());
    }

    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCloseStyleModal') || e.target.closest('#btnCancelStyleModal')) {
        styleView.destroy();
        modal.remove();
        return;
      }

      if (e.target.closest('#btnApplyStyleModal')) {
        styleView.destroy();
        modal.remove();
        await this.onSave(this.selectedStyleId);
        return;
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => {
      styleView.destroy();
      modal.remove();
    });

    return modal;
  }
}

/**
 * Birthday Studio - Scene Requirements Modal
 * Admin / Creator inspection modal for prebuilt scene asset specifications
 */

import { SceneAssetDefinitionService } from '../../services/asset/SceneAssetDefinitions.js';
import { Accessibility } from '../../utils/Accessibility.js';

export class SceneRequirementsModal {
  constructor(templateId = 'universal') {
    this.templateId = templateId;
  }

  render() {
    const info = SceneAssetDefinitionService.getRequirementsSummary(this.templateId);

    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'sceneReqsModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width: 600px; width: 92vw; padding: 24px; display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:8px;">
              <span>${info.icon}</span> <span>${info.templateName} Asset Specs</span>
            </h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              ${info.description}
            </p>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnCloseSceneReqs">✕</button>
        </div>

        <!-- Requirements Summary Table -->
        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.8rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
            Asset Requirements & Limits
          </h4>

          <div style="display:grid; grid-template-columns: 1fr; gap:8px;">
            ${info.summary.map(item => `
              <div style="background:var(--surface-elevated, #1a162c); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:var(--radius-sm, 6px); padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:1.2rem;">${item.icon}</span>
                  <div>
                    <strong style="font-size:0.85rem; color:var(--text);">${item.type}</strong>
                    <div style="font-size:0.72rem; color:var(--text-muted);">
                      Formats: ${item.formats} • Max: ${item.maxSize}
                      ${item.maxDuration ? ` • Duration: ${item.maxDuration}` : ''}
                    </div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:0.85rem; font-weight:800; color:var(--text);">${item.range}</span>
                  <div style="font-size:0.7rem; color:${item.required ? '#ffa502' : 'var(--text-muted)'}; font-weight:700;">
                    ${item.required ? 'REQUIRED' : 'OPTIONAL'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Semantic Slots -->
        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.8rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
            Predefined Semantic Slots (${info.slots.length})
          </h4>

          <div style="display:flex; flex-direction:column; gap:6px;">
            ${info.slots.map(slot => `
              <div style="background:var(--surface, #120f22); border:1px solid var(--border, rgba(255,255,255,0.08)); border-radius:var(--radius-sm, 6px); padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="font-size:0.8rem; color:var(--text);">${slot.name}</strong>
                  <div style="font-size:0.7rem; color:var(--text-muted);">
                    Accepts: ${(slot.acceptedTypes || []).join(', ').toUpperCase()}
                    ${slot.aspectRatio && slot.aspectRatio !== 'any' ? ` • Ratio: ${slot.aspectRatio}` : ''}
                    ${slot.recommendedDimensions ? ` • ${slot.recommendedDimensions.width}x${slot.recommendedDimensions.height}px` : ''}
                  </div>
                </div>
                <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px;">
                  ${slot.min || 0} – ${slot.max || 1}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex; justify-content:flex-end; border-top:1px solid var(--border); padding-top:12px;">
          <button class="btn btn-secondary btn-sm" id="btnDismissSceneReqs">Close</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnCloseSceneReqs' || e.target.id === 'btnDismissSceneReqs' || e.target === modal) {
        modal.remove();
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}

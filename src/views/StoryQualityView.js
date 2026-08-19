/**
 * Birthday Studio - Story Quality View (Section 7 & 8)
 * Displays 0-100 Story Quality Score Breakdown & Actionable Guidance
 */

import { StoryQualityService } from '../services/StoryQualityService.js';
import { StoryEnhancementService } from '../services/StoryEnhancementService.js';
import { Toast } from '../utils/Toast.js';

export class StoryQualityView {
  constructor(project, onApplySuggestion = (() => {})) {
    this.project = project;
    this.onApplySuggestion = onApplySuggestion;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';

    const quality = StoryQualityService.calculateScore(this.project);
    const suggestions = StoryEnhancementService.analyzeProject(this.project);

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:540px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800;">📊 Story Quality Score</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseQuality">✕</button>
        </div>

        <div style="text-align:center; padding:16px; background:var(--surface-elevated); border-radius:var(--radius-lg); border:1px solid var(--border); margin-bottom:20px;">
          <div style="font-size:3rem; font-weight:900; color:var(--accent);">${quality.score} / 100</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
            ${quality.score >= 80 ? '🎉 Excellent! Your celebration story is rich and complete.' : '💡 Good progress! Review suggestions below to polish further.'}
          </div>
        </div>

        <h4 style="font-size:0.9rem; font-weight:800; margin-bottom:8px;">Breakdown Criteria</h4>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
          ${quality.breakdown.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); padding:8px 12px; border-radius:var(--radius-sm); font-size:0.82rem;">
              <span>${item.status === 'pass' ? '✅' : item.status === 'partial' ? '⚠️' : '❌'} ${item.criteria}</span>
              <span style="font-weight:700;">${item.points} / ${item.max}</span>
            </div>
          `).join('')}
        </div>

        ${suggestions.length > 0 ? `
          <h4 style="font-size:0.9rem; font-weight:800; margin-bottom:8px;">✨ Improve My Story Suggestions</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${suggestions.map(s => `
              <div style="background:var(--surface-elevated); padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--border);">
                <div style="font-weight:700; font-size:0.85rem;">${s.title}</div>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">${s.message}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    modal.querySelector('#btnCloseQuality')?.addEventListener('click', () => modal.remove());
    return modal;
  }
}

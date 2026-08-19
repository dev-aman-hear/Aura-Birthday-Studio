/**
 * Birthday Studio - Project Progress View Component (Section 1)
 * Visual Completion Score Indicator & Actionable Advice
 */

import { ProjectProgressService } from '../services/ProjectProgressService.js';

export class ProjectProgressView {
  constructor(project, onNavigateSuggestion = (() => {})) {
    this.project = project;
    this.onNavigateSuggestion = onNavigateSuggestion;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'project-progress-card';
    card.style.background = 'var(--surface-elevated)';
    card.style.border = '1px solid var(--border)';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.padding = '14px';

    const progress = ProjectProgressService.calculateProgress(this.project);

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-weight:700; font-size:0.85rem; color:var(--text-muted);">
          READINESS PROGRESS
        </span>
        <span style="font-weight:800; font-size:0.85rem; color:${progress.score >= 80 ? 'var(--success)' : 'var(--accent-gold)'};">
          ${progress.score}% (${progress.status})
        </span>
      </div>

      <div style="width:100%; height:8px; background:var(--bg); border-radius:4px; overflow:hidden; margin-bottom:10px;">
        <div style="width:${progress.score}%; height:100%; background:linear-gradient(90deg, var(--accent), var(--accent-pink)); transition:width 0.3s ease;"></div>
      </div>

      ${progress.suggestions.length > 0 ? `
        <div style="font-size:0.78rem; color:var(--text-muted);">
          💡 Suggestion: ${progress.suggestions[0]}
        </div>
      ` : ''}
    `;

    return card;
  }
}

/**
 * Birthday Studio - Project Status Badge View (Section 3)
 * Reusable Visual Status Badge Component
 */

import { ProjectStatusService } from '../services/ProjectStatusService.js';

export class ProjectStatusBadge {
  constructor(project, latestPublication = null) {
    this.project = project;
    this.latestPublication = latestPublication;
  }

  render() {
    const status = ProjectStatusService.getProjectStatus(this.project, this.latestPublication);
    const span = document.createElement('span');
    span.className = `project-status-badge ${status.code.toLowerCase()}`;
    span.style.padding = '4px 10px';
    span.style.borderRadius = '12px';
    span.style.fontSize = '0.75rem';
    span.style.fontWeight = '700';
    span.style.background = 'var(--surface-elevated)';
    span.style.border = `1px solid ${status.color}`;
    span.style.color = status.color;
    span.textContent = `${status.code === 'PUBLISHED' ? '🟢' : status.code === 'EXPIRED' ? '⚫' : '🟡'} ${status.label}`;

    return span;
  }
}

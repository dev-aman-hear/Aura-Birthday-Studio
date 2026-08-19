/**
 * Birthday Studio - Recent Activity View Component (Section 5)
 * Dashboard Compact Recent Offline Action Log Section
 */

import { CreatorActivityService } from '../services/CreatorActivityService.js';
import { EmptyStateView } from './EmptyStateView.js';

export class RecentActivityView {
  render() {
    const card = document.createElement('div');
    card.className = 'recent-activity-panel';
    card.style.background = 'var(--surface-elevated)';
    card.style.border = '1px solid var(--border)';
    card.style.borderRadius = 'var(--radius-md)';
    card.style.padding = '16px';
    card.style.marginTop = '16px';

    const logs = CreatorActivityService.getActivities();

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:12px;">
        <h4 style="font-size:0.9rem; font-weight:800;">⚡ Recent Offline Activity</h4>
        <span style="font-size:0.75rem; color:var(--text-muted);">${logs.length} Actions Recorded</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${logs.length > 0 ? logs.slice(0, 10).map(act => {
          const timeStr = new Date(act.timestamp).toLocaleTimeString();
          return `
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg); padding:8px 12px; border-radius:var(--radius-sm); font-size:0.8rem;">
              <div>
                <span style="margin-right:6px;">${act.icon}</span>
                <span style="font-weight:600;">${act.action}</span>
                <span style="color:var(--text-muted); margin-left:6px;">(${act.context})</span>
              </div>
              <span style="font-size:0.72rem; color:var(--text-muted);">${timeStr}</span>
            </div>
          `;
        }).join('') : `
          <div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.8rem;">
            No recent activity recorded yet. Create or edit a celebration to build your log!
          </div>
        `}
      </div>
    `;

    return card;
  }
}

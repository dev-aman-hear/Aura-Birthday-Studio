/**
 * Birthday Studio - Quick Action Command Menu (Section 6)
 * Desktop Ctrl+K Global Quick Command Search Launcher
 */

import { Accessibility } from '../utils/Accessibility.js';

export class QuickActionMenu {
  constructor(onSelectAction = (() => {})) {
    this.onSelectAction = onSelectAction;
    this.selectedIndex = 0;
    this.commands = [
      { id: 'create', label: '✨ Create New Celebration', icon: '✍️' },
      { id: 'focus', label: '🎯 Toggle Focus Mode (Shortcut: F)', icon: '🎯' },
      { id: 'style', label: '🎨 Change Visual Style & Theme', icon: '✨' },
      { id: 'countdown', label: '⏳ Configure Countdown Timer', icon: '⏰' },
      { id: 'presets', label: '🖼️ Browse Preset Collection', icon: '🎨' },
      { id: 'editor', label: '🎬 Open Story Studio Editor', icon: '⚙️' },
      { id: 'preview', label: '▶️ Play Creator Preview', icon: '👁️' },
      { id: 'publish', label: '🚀 Publish / Share Celebration', icon: '🔗' },
      { id: 'settings', label: '⚙️ Creator Studio Settings', icon: '👤' }
    ];
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'quickActionModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:520px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.1rem; font-weight:800;">⚡ Quick Command Launcher</h3>
          <span style="font-size:0.75rem; color:var(--text-muted); background:var(--surface-elevated); padding:2px 8px; border-radius:4px;">Ctrl + K</span>
        </div>

        <input type="text" class="form-input" id="inpCmdSearch" placeholder="Type a command or action..." style="width:100%; margin-bottom:12px;" autofocus />

        <div class="cmd-list-container" id="cmdListContainer" style="display:flex; flex-direction:column; gap:6px; max-height:260px; overflow-y:auto;">
          ${this.commands.map((cmd, i) => `
            <div class="cmd-item-row ${i === 0 ? 'selected' : ''}" data-cmd-id="${cmd.id}" style="padding:10px 14px; background:${i === 0 ? 'var(--surface-hover)' : 'var(--surface-elevated)'}; border:1px solid var(--border); border-radius:var(--radius-sm); cursor:pointer; display:flex; align-items:center; gap:10px;">
              <span>${cmd.icon}</span>
              <span style="font-weight:700; font-size:0.88rem;">${cmd.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      const row = e.target.closest('[data-cmd-id]');
      if (row) {
        modal.remove();
        this.onSelectAction(row.dataset.cmdId);
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}

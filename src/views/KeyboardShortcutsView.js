/**
 * Birthday Studio - Keyboard Shortcuts Reference View (Section 16)
 */

export class KeyboardShortcutsView {
  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';

    const shortcuts = [
      { key: 'Ctrl + Z', label: 'Undo previous edit' },
      { key: 'Ctrl + Y / Shift + Ctrl + Z', label: 'Redo undone edit' },
      { key: 'Ctrl + S', label: 'Manual save draft snapshot' },
      { key: 'Ctrl + D', label: 'Duplicate selected scene' },
      { key: 'Delete / Backspace', label: 'Delete selected scene' },
      { key: 'Arrow Left / Right', label: 'Navigate previous / next scene' }
    ];

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:480px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800;">⌨️ Desktop Keyboard Shortcuts</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseShortcuts">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${shortcuts.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-elevated); padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--border); font-size:0.85rem;">
              <span style="font-weight:700; color:var(--accent);">${s.key}</span>
              <span style="color:var(--text-muted); font-size:0.8rem;">${s.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.querySelector('#btnCloseShortcuts')?.addEventListener('click', () => modal.remove());
    return modal;
  }
}

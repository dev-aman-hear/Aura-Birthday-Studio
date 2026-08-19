/**
 * Birthday Studio - Loading State View Component (Section 7)
 * Contextual Accessible Loading Indicator State
 */

export class LoadingStateView {
  constructor(message = 'Preparing celebration...') {
    this.message = message;
  }

  render() {
    const box = document.createElement('div');
    box.className = 'loading-state-box text-center animate-fade';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.style.padding = '40px 24px';

    box.innerHTML = `
      <div class="loading-spinner" style="font-size:2.5rem; margin-bottom:10px; display:inline-block; animation:spin 1s linear infinite;">⏳</div>
      <div style="font-weight:700; font-size:0.95rem; color:var(--accent);">${this.message}</div>
    `;

    return box;
  }
}

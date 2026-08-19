/**
 * Birthday Studio - Celebration Unavailable View (Section 5)
 * Safe Recipient Error & Loading Failure View (Zero Data Exposure)
 */

export class CelebrationUnavailableView {
  constructor(reason = 'Publication Unavailable') {
    this.reason = reason;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'expired-project-container animate-fade';
    root.id = 'celebrationUnavailableRoot';

    root.innerHTML = `
      <div class="expired-card text-center" style="max-width:480px; padding:32px 24px; background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-lg);">
        <div style="font-size:3rem; margin-bottom:8px;">⚠️</div>
        <h2 style="font-size:1.5rem; font-weight:800;">Celebration Unavailable</h2>
        <p style="color:var(--text-muted); font-size:0.88rem; margin-top:8px; margin-bottom:20px;">
          ${this.reason}
        </p>

        <div style="display:flex; gap:10px; justify-content:center;">
          <button class="btn btn-primary" id="btnRetryUnavailable">🔄 Retry Loading</button>
          <a href="#login" class="btn btn-secondary">🏠 Creator Studio</a>
        </div>
      </div>
    `;

    root.querySelector('#btnRetryUnavailable')?.addEventListener('click', () => {
      window.location.reload();
    });

    return root;
  }
}

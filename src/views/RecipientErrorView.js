/**
 * Birthday Studio - Recipient Error View Component (Section 7)
 * Minimal Secure Recipient Error View (Zero Data Leakage)
 */

export class RecipientErrorView {
  constructor(message = 'Publication not found or invalid.') {
    this.message = message;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'expired-project-container animate-fade';
    root.id = 'recipientErrorRoot';

    root.innerHTML = `
      <div class="expired-card text-center" style="max-width:480px; padding:32px 24px; background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-lg);">
        <div style="font-size:3rem; margin-bottom:8px;">⚠️</div>
        <h2 style="font-size:1.5rem; font-weight:800;">Celebration Unavailable</h2>
        <p style="color:var(--text-muted); font-size:0.88rem; margin-top:8px; margin-bottom:20px;">
          ${this.message}
        </p>

        <div style="display:flex; gap:10px; justify-content:center;">
          <a href="#login" class="btn btn-primary">🏠 Birthday Studio Creator Home</a>
        </div>
      </div>
    `;

    return root;
  }
}

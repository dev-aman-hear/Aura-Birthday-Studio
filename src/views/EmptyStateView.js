/**
 * Birthday Studio - Reusable Smart Empty State View (Section 2)
 * Explains: What is empty, Why it matters, What to do next
 */

export class EmptyStateView {
  constructor(options = {}) {
    this.icon = options.icon || '🎁';
    this.title = options.title || 'Nothing here yet';
    this.description = options.description || 'Start creating to bring this section to life.';
    this.actionLabel = options.actionLabel || null;
    this.onAction = options.onAction || null;
  }

  render() {
    const box = document.createElement('div');
    box.className = 'smart-empty-state-card text-center';
    box.style.padding = '40px 24px';
    box.style.background = 'var(--surface-elevated)';
    box.style.border = '1px solid var(--border)';
    box.style.borderRadius = 'var(--radius-lg)';
    box.style.margin = '16px 0';

    box.innerHTML = `
      <div style="font-size:3rem; margin-bottom:8px;">${this.icon}</div>
      <h3 style="font-size:1.2rem; font-weight:800;">${this.title}</h3>
      <p style="color:var(--text-muted); font-size:0.85rem; max-width:400px; margin:8px auto 16px auto;">
        ${this.description}
      </p>

      ${this.actionLabel ? `
        <button class="btn btn-primary" id="btnEmptyStateAction" style="min-height:44px; font-weight:700;">
          ${this.actionLabel}
        </button>
      ` : ''}
    `;

    if (this.onAction && this.actionLabel) {
      box.querySelector('#btnEmptyStateAction')?.addEventListener('click', () => {
        this.onAction();
      });
    }

    return box;
  }
}

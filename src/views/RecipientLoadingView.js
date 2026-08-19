/**
 * Birthday Studio - Recipient Loading View Component (Section 7)
 * Minimal Smooth Recipient Loading Transition
 */

export class RecipientLoadingView {
  render() {
    const root = document.createElement('div');
    root.className = 'recipient-loading-screen animate-fade';
    root.style.minHeight = '100vh';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.justifyContent = 'center';
    root.style.alignItems = 'center';
    root.style.background = 'var(--bg-dark)';
    root.style.color = '#fff';

    root.innerHTML = `
      <div style="font-size:3rem; margin-bottom:12px; animation:spin 1.2s linear infinite;">🎂</div>
      <div style="font-weight:700; font-size:1.1rem; color:var(--accent);">Preparing your celebration experience...</div>
    `;

    return root;
  }
}

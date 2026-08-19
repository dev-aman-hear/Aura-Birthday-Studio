/**
 * Birthday Studio - Expired Publication View (Requirements 7, 8, 9, 18 & TEST C, TEST H)
 * Secure Expired Screen (ZERO scene, photo, video, audio, wish, or creator data exposed!)
 */

export class ExpiredProjectView {
  constructor(publicationMetadata) {
    this.metadata = publicationMetadata || {};
  }

  render() {
    const root = document.createElement('div');
    root.className = 'expired-project-container';
    root.id = 'expiredProjectRoot';

    root.innerHTML = `
      <div class="expired-content-card">
        <div class="expired-icon font-size-xl">⏳</div>
        <h2 class="expired-title">Celebration Link Expired</h2>
        <p class="expired-subtitle">
          This publication link was active for its 7-day lifetime and has now expired.
        </p>

        <div class="expired-security-note">
          <p>🔒 Public access to photos, videos, messages, and the Wish Wall has ended for this link.</p>
        </div>

        <div class="expired-actions margin-top-md">
          <a href="#" class="btn btn-primary">Create Your Own Celebration</a>
        </div>
      </div>
    `;

    return root;
  }
}

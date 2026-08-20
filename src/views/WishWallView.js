/**
 * Birthday Studio - Dedicated Wish Wall View (Section 4 & Requirement 11)
 * TEST H Metadata-First Security Gated Wish Wall Cards & Submission Modal
 */

import { publishedProjectRepository } from '../services/PublishedProjectRepository.js';
import { wishRepository } from '../services/WishRepository.js';
import { ExpiredProjectView } from './ExpiredProjectView.js';
import { RecipientErrorView } from './RecipientErrorView.js';
import { CelebrationUnavailableView } from './CelebrationUnavailableView.js';
import { WishSubmissionModal } from './WishSubmissionModal.js';

export class WishWallView {
  constructor(publicationId) {
    this.publicationId = publicationId;
    this.publicationMeta = null;
    this.publication = null;
    this.wishes = [];
  }

  async render() {
    // STEP 1: Fetch metadata ONLY
    try {
      this.publicationMeta = await publishedProjectRepository.getPublicationMetadata(this.publicationId);
    } catch (err) {
      const unavailView = new CelebrationUnavailableView('Unable to connect to celebration database. Please check your internet connection.');
      return unavailView.render();
    }

    // STEP 2: Differentiated error checks
    if (!this.publicationMeta || this.publicationMeta.exists === false || this.publicationMeta.status === 'not_found') {
      const errView = new RecipientErrorView('Celebration not found. The link may be incorrect, incomplete, or deleted.');
      return errView.render();
    }

    if (this.publicationMeta.isPublic === false) {
      const errView = new RecipientErrorView('This celebration has been set to private by its creator.');
      return errView.render();
    }

    if (this.publicationMeta.isExpired || this.publicationMeta.status === 'expired') {
      const expiredView = new ExpiredProjectView(this.publicationMeta);
      return expiredView.render();
    }

    // STEP 3: Load snapshot payload & approved wishes
    try {
      this.publication = await publishedProjectRepository.getPublishedSnapshot(this.publicationId);
    } catch (err) {
      const unavailView = new CelebrationUnavailableView('Unable to load celebration data. Please check your internet connection.');
      return unavailView.render();
    }

    if (!this.publication || !this.publication.snapshot) {
      const errView = new RecipientErrorView('Celebration data is incomplete or unavailable.');
      return errView.render();
    }

    this.wishes = await wishRepository.getApprovedWishes(this.publication.projectId);


    const root = document.createElement('div');
    root.className = 'wish-wall-scene-container theme-wall-glassmorphic animate-fade';
    root.id = 'wishWallRoot';

    const recipName = this.publication.snapshot?.recipient?.name || 'Someone Special';
    const occasion = this.publication.snapshot?.occasion || 'birthday';
    const count = this.wishes.length;

    // Helper for relative time
    const formatTimeAgo = (ts) => {
      if (!ts) return 'Recently';
      const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    root.innerHTML = `
      <div class="wish-wall-ambience-layer">
        <div class="ambient-particle" style="top:15%; left:10%; width:6px; height:6px; background:#ffd700;"></div>
        <div class="ambient-particle" style="top:25%; right:12%; width:8px; height:8px; background:#a29bfe; animation-delay:1.5s;"></div>
        <div class="ambient-particle" style="top:70%; left:15%; width:5px; height:5px; background:#ff758c; animation-delay:3s;"></div>
      </div>

      <div class="wish-wall-scene-header">
        <div class="wish-wall-icon">💌</div>
        <h2 class="wish-wall-title">🌟 Wish Wall for ${recipName}</h2>
        <p class="wish-wall-subtitle">
          Leave your warm thoughts, memories and congratulations below.
        </p>

        <div class="wish-wall-counter-badge" id="wishCounterBadge">
          <span class="counter-pulse-dot"></span>
          <span>${count === 0 ? 'Be the first to leave a wish' : `${count} ${count === 1 ? 'wish' : 'wishes'} sent with love ❤️`}</span>
        </div>
      </div>

      <div class="wish-cards-container wish-cards-grid" id="wishCardsGrid" style="max-width:980px; padding:0 12px; margin-bottom:28px;">
        ${this.wishes.length > 0 ? this.wishes.map(w => {
          const initial = w.isAnonymous ? '❤️' : (w.name ? w.name.charAt(0).toUpperCase() : 'F');
          const timeAgo = formatTimeAgo(w.createdAt);
          const isPinned = w.isPinned || false;

          return `
            <div class="wish-card-item ${isPinned ? 'is-pinned' : ''}" data-wish-id="${w.id}">
              ${isPinned ? `<span class="pinned-badge-chip">📌 Featured Wish</span>` : ''}
              <div class="wish-card-header">
                <div class="wish-avatar">${initial}</div>
                <div class="wish-header-meta">
                  <div class="wish-author-row">
                    <span class="wish-author">${w.isAnonymous ? 'Anonymous' : (w.name || 'Friend')}</span>
                    ${w.relationship ? `<span class="wish-tag-badge">${w.relationship}</span>` : ''}
                  </div>
                  <span class="wish-time-badge">${timeAgo}</span>
                </div>
              </div>

              <div class="wish-card-body">
                <div class="wish-message-body">${w.message}</div>
              </div>

              <div class="wish-reactions-bar">
                <button class="wish-reaction-pill" data-emoji="❤️" title="Love this">
                  <span>❤️</span>
                  <span class="reaction-count">1</span>
                </button>
                <button class="wish-reaction-pill" data-emoji="🎉" title="Celebrate">
                  <span>🎉</span>
                  <span class="reaction-count">1</span>
                </button>
                <button class="wish-reaction-pill" data-emoji="✨" title="Sparkle">
                  <span>✨</span>
                  <span class="reaction-count">1</span>
                </button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="wish-empty-state" style="grid-column:1/-1;">
            <div class="wish-empty-icon">💌</div>
            <h4 style="color:var(--text-main); font-weight:700; margin-bottom:6px;">No wishes posted yet!</h4>
            <p style="font-size:0.85rem; max-width:340px; margin:0 auto 16px auto;">Be the very first one to send a warm celebration wish to ${recipName}.</p>
          </div>
        `}
      </div>

      <div class="wish-wall-action-bar">
        <button class="leave-wish-trigger-btn" id="btnOpenWishModalRoot">
          <span>💌</span>
          <span>Leave a Wish for ${recipName}</span>
        </button>
      </div>
    `;

    root.addEventListener('click', (e) => {
      // Reaction click
      const reactionPill = e.target.closest('.wish-reaction-pill');
      if (reactionPill) {
        const countSpan = reactionPill.querySelector('.reaction-count');
        if (countSpan) {
          const currentCount = parseInt(countSpan.textContent, 10) || 0;
          const isReacted = reactionPill.classList.toggle('is-reacted');
          countSpan.textContent = isReacted ? currentCount + 1 : Math.max(0, currentCount - 1);
          reactionPill.style.transform = 'scale(1.3)';
          setTimeout(() => { reactionPill.style.transform = ''; }, 200);
        }
        return;
      }

      // Open Modal
      if (e.target.closest('#btnOpenWishModalRoot')) {
        const mockProject = {
          id: this.publication.projectId,
          publicationId: this.publication.id,
          occasion: occasion,
          wishWall: this.publication.snapshot.publicWishWallSettings || this.publication.snapshot.wishWall
        };
        const subModal = new WishSubmissionModal(mockProject, async () => {
          const newRoot = await this.render();
          root.replaceWith(newRoot);
        });
        document.body.appendChild(subModal.render());
      }
    });

    return root;
  }
}

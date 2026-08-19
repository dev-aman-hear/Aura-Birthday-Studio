/**
 * Birthday Studio - Creator Wish Moderation & Management Studio (Section 30, 40, 63)
 * Full Wish Control Center: Real-time Stats, Live Search, Bulk Operations, Offline Wish Addition,
 * Pinning/Featuring, Reaction Management, and Comprehensive Wall Settings.
 */

import { wishRepository } from '../services/WishRepository.js';
import { WishWallPreviewModal } from './WishWallPreviewModal.js';
import { Toast } from '../utils/Toast.js';

export class WishModerationView {
  constructor(project, onClose, onProjectUpdated) {
    this.project = project;
    this.onClose = onClose;
    this.onProjectUpdated = onProjectUpdated;
    this.activeTab = 'pending'; // pending, approved, rejected, all
    this.searchQuery = '';
    this.showAddManualForm = false;
    this.wishes = [];
  }

  async loadWishes() {
    this.wishes = await wishRepository.getProjectWishes(this.project.id);
  }

  async render() {
    await this.loadWishes();

    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'moderationOverlay';

    const pendingList = this.wishes.filter(w => w.status === 'pending');
    const approvedList = this.wishes.filter(w => w.status === 'approved');
    const rejectedList = this.wishes.filter(w => w.status === 'rejected');

    let displayed = this.activeTab === 'pending' ? pendingList :
                    this.activeTab === 'approved' ? approvedList :
                    this.activeTab === 'rejected' ? rejectedList : this.wishes;

    // Apply search filter if query is entered
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      displayed = displayed.filter(w => 
        (w.name && w.name.toLowerCase().includes(q)) || 
        (w.message && w.message.toLowerCase().includes(q)) ||
        (w.relationship && w.relationship.toLowerCase().includes(q))
      );
    }

    if (!this.project.wishWall) {
      this.project.wishWall = { 
        enabled: true, 
        requireApproval: true, 
        allowAnonymous: true, 
        allowCustomMessages: true, 
        displayMode: 'counter-and-wishes',
        theme: 'glassmorphic',
        layout: 'grid',
        ambience: 'sparkles'
      };
    }
    const wishWallConfig = this.project.wishWall;
    const recipientName = this.project?.recipient?.name || 'Someone Special';

    // Format relative timestamp helper
    const formatTimeAgo = (ts) => {
      if (!ts) return 'Recently';
      const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    modal.innerHTML = `
      <div class="wizard-modal moderation-modal moderation-modal-container">
        <!-- Modal Header -->
        <div class="wizard-header" style="padding:16px 22px; border-bottom:1px solid var(--border, rgba(255,255,255,0.1)); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.6rem;">💌</span>
            <div>
              <h2 style="font-size:1.15rem; font-weight:800; margin:0; color:var(--text-main, #ffffff);">
                Wish Wall Studio & Moderation Center
              </h2>
              <span style="font-size:0.75rem; color:var(--text-muted, rgba(255,255,255,0.6));">
                Celebrating ${recipientName} • Real-time visitor messages & wall customization
              </span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-secondary btn-sm" id="btnModPreviewLiveWall" title="Launch Interactive Wish Wall Preview" style="display:flex; align-items:center; gap:6px; font-weight:800; font-size:0.8rem; padding:5px 12px; background:rgba(127,90,240,0.2); border:1px solid rgba(127,90,240,0.4); color:#a29bfe;">
              <span>👁️</span> <span>Preview Wall</span>
            </button>
            <button class="btn-modal-close" id="btnCloseMod" title="Close" style="background:none; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer; padding:6px;">✕</button>
          </div>
        </div>

        <!-- Top Statistics Summary -->
        <div class="moderation-header-stats">
          <div class="mod-stat-card">
            <span class="mod-stat-num">${this.wishes.length}</span>
            <span class="mod-stat-label">Total Received</span>
          </div>
          <div class="mod-stat-card" style="border-left:3px solid #2cb67d;">
            <span class="mod-stat-num" style="color:#2cb67d;">${approvedList.length}</span>
            <span class="mod-stat-label">Live on Wall</span>
          </div>
          <div class="mod-stat-card" style="border-left:3px solid #ffb300;">
            <span class="mod-stat-num" style="color:#ffb300;">${pendingList.length}</span>
            <span class="mod-stat-label">Pending Review</span>
          </div>
          <div class="mod-stat-card" style="border-left:3px solid #ef4565;">
            <span class="mod-stat-num" style="color:#ef4565;">${rejectedList.length}</span>
            <span class="mod-stat-label">Rejected</span>
          </div>
        </div>

        <!-- Main Workspace: Left Settings Sidebar + Right Wishes Manager -->
        <div class="moderation-main-content">
          <!-- Left Sidebar: Wall Rules & Configuration -->
          <div class="moderation-sidebar-settings">
            <h4 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:var(--accent, #a78bfa); margin-bottom:4px;">
              ⚙️ Wall Settings
            </h4>

            <div style="display:flex; flex-direction:column; gap:10px;">
              <label class="setting-toggle" style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer; font-weight:600;">
                <input type="checkbox" id="chkEnableWishWall" ${wishWallConfig.enabled !== false ? 'checked' : ''} />
                Enable Public Wish Wall
              </label>

              <label class="setting-toggle" style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer; font-weight:600;">
                <input type="checkbox" id="chkRequireApproval" ${wishWallConfig.requireApproval !== false ? 'checked' : ''} />
                Require Approval (Gatekeeper)
              </label>

              <label class="setting-toggle" style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer; font-weight:600;">
                <input type="checkbox" id="chkAllowAnonymous" ${wishWallConfig.allowAnonymous !== false ? 'checked' : ''} />
                Allow Anonymous Submissions
              </label>

              <label class="setting-toggle" style="display:flex; align-items:center; gap:8px; font-size:0.82rem; cursor:pointer; font-weight:600;">
                <input type="checkbox" id="chkAllowCustom" ${wishWallConfig.allowCustomMessages !== false ? 'checked' : ''} />
                Allow Custom Typed Messages
              </label>
            </div>

            <div style="height:1px; background:rgba(255,255,255,0.08); margin:4px 0;"></div>

            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Display Mode</label>
              <select class="form-input" id="selDisplayMode" style="width:100%; margin-top:4px; font-size:0.82rem;">
                <option value="counter-and-wishes" ${wishWallConfig.displayMode === 'counter-and-wishes' ? 'selected' : ''}>Counter + Wish Cards</option>
                <option value="counter-only" ${wishWallConfig.displayMode === 'counter-only' ? 'selected' : ''}>Counter Only</option>
                <option value="wishes-only" ${wishWallConfig.displayMode === 'wishes-only' ? 'selected' : ''}>Wish Cards Only</option>
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Default Wall Theme</label>
              <select class="form-input" id="selModWallTheme" style="width:100%; margin-top:4px; font-size:0.82rem;">
                <option value="glassmorphic" ${wishWallConfig.theme === 'glassmorphic' || !wishWallConfig.theme ? 'selected' : ''}>🪟 Frosted Glassmorphism</option>
                <option value="sticky-notes" ${wishWallConfig.theme === 'sticky-notes' ? 'selected' : ''}>📌 Sticky Notes Pinboard</option>
                <option value="midnight-gold" ${wishWallConfig.theme === 'midnight-gold' ? 'selected' : ''}>👑 Midnight & Gold</option>
                <option value="festive-neon" ${wishWallConfig.theme === 'festive-neon' ? 'selected' : ''}>🎆 Festive Neon Glow</option>
                <option value="clean-minimal" ${wishWallConfig.theme === 'clean-minimal' ? 'selected' : ''}>📄 Clean Minimal</option>
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Cards Layout</label>
              <select class="form-input" id="selModWallLayout" style="width:100%; margin-top:4px; font-size:0.82rem;">
                <option value="grid" ${wishWallConfig.layout === 'grid' || !wishWallConfig.layout ? 'selected' : ''}>📐 Responsive Grid</option>
                <option value="masonry" ${wishWallConfig.layout === 'masonry' ? 'selected' : ''}>🧱 Masonry Flow</option>
                <option value="pinboard" ${wishWallConfig.layout === 'pinboard' ? 'selected' : ''}>📌 Angled Pinboard</option>
                <option value="spotlight" ${wishWallConfig.layout === 'spotlight' ? 'selected' : ''}>🌟 Spotlight Cards</option>
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Ambient Particles</label>
              <select class="form-input" id="selModWallAmbience" style="width:100%; margin-top:4px; font-size:0.82rem;">
                <option value="sparkles" ${wishWallConfig.ambience === 'sparkles' || !wishWallConfig.ambience ? 'selected' : ''}>✨ Star Sparkles</option>
                <option value="hearts" ${wishWallConfig.ambience === 'hearts' ? 'selected' : ''}>💖 Floating Hearts</option>
                <option value="none" ${wishWallConfig.ambience === 'none' ? 'selected' : ''}>🚫 None</option>
              </select>
            </div>

            <div style="margin-top:auto; padding-top:12px;">
              <button class="btn btn-secondary btn-sm" id="btnModAddNewManualWish" style="width:100%; font-weight:700;">
                ➕ Add Offline / Manual Wish
              </button>
            </div>
          </div>

          <!-- Right Area: Wishes List & Interactive Moderation -->
          <div class="moderation-wishes-area">
            <!-- Manual Wish Addition Form (Toggleable) -->
            ${this.showAddManualForm ? `
              <div class="mod-add-form-container" style="background:rgba(127,90,240,0.1); border:1px solid rgba(127,90,240,0.3); border-radius:12px; padding:14px; margin-bottom:12px; display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.88rem; color:#a29bfe;">💌 Add Manual / Offline Wish</strong>
                  <button class="btn btn-ghost btn-xs" id="btnCancelManualWish">Cancel</button>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <input type="text" class="form-input" id="manualWishSender" placeholder="Sender Name (Optional)" style="font-size:0.82rem;" />
                  <select class="form-input" id="manualWishRelation" style="font-size:0.82rem;">
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Bestie">Bestie</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Well-Wisher">Well-Wisher</option>
                  </select>
                </div>
                <textarea class="form-input" id="manualWishMessage" rows="2" placeholder="Write or paste the celebration message..." style="font-size:0.82rem; resize:vertical;"></textarea>
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                  <button class="btn btn-primary btn-sm" id="btnSubmitManualWish" style="font-weight:700;">
                    💾 Post to Wish Wall
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Toolbar: Tabs + Search + Bulk Actions -->
            <div class="mod-toolbar-row">
              <div class="mod-tabs-group">
                <button class="mod-tab-btn mod-tab ${this.activeTab === 'pending' ? 'is-active active' : ''}" data-tab="pending">
                  Pending (${pendingList.length})
                </button>
                <button class="mod-tab-btn mod-tab ${this.activeTab === 'approved' ? 'is-active active' : ''}" data-tab="approved">
                  Approved (${approvedList.length})
                </button>
                <button class="mod-tab-btn mod-tab ${this.activeTab === 'rejected' ? 'is-active active' : ''}" data-tab="rejected">
                  Rejected (${rejectedList.length})
                </button>
                <button class="mod-tab-btn mod-tab ${this.activeTab === 'all' ? 'is-active active' : ''}" data-tab="all">
                  All (${this.wishes.length})
                </button>
              </div>

              <div style="display:flex; align-items:center; gap:8px;">
                <input type="text" class="mod-search-input" id="inputModSearch" placeholder="🔍 Search sender or text..." value="${this.searchQuery}" />
                ${pendingList.length > 0 ? `
                  <button class="btn btn-success btn-xs" id="btnApproveAllPending" title="Approve all pending wishes in one click" style="font-weight:700;">
                    ✅ Approve All
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Wishes Scroll List -->
            <div class="mod-cards-scroll-list">
              ${displayed.length > 0 ? displayed.map(wish => {
                const displayName = wish.isAnonymous ? 'Anonymous' : (wish.name || 'Friend');
                const initial = wish.isAnonymous ? '❤️' : (displayName.charAt(0).toUpperCase() || 'A');
                const isPinned = wish.isPinned || false;
                const statusClass = wish.status === 'approved' ? 'approved' : (wish.status === 'rejected' ? 'rejected' : 'pending');

                return `
                  <div class="mod-card-row mod-wish-card" data-wish-id="${wish.id}">
                    <div class="mod-card-top mod-wish-header">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <div class="wish-avatar" style="width:34px; height:34px; font-size:0.9rem;">${initial}</div>
                        <div>
                          <div style="display:flex; align-items:center; gap:6px;">
                            <strong class="mod-wish-author" style="font-size:0.9rem; color:var(--text-main, #ffffff);">${displayName}</strong>
                            ${wish.relationship ? `<span class="wish-tag-badge" style="font-size:0.65rem;">${wish.relationship}</span>` : ''}
                            ${isPinned ? `<span style="font-size:0.75rem;" title="Featured Wish">📌</span>` : ''}
                          </div>
                          <span class="mod-wish-date" style="font-size:0.7rem; color:var(--text-muted);">${formatTimeAgo(wish.createdAt)}</span>
                        </div>
                      </div>

                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="mod-status-pill ${statusClass}">${wish.status || 'pending'}</span>
                      </div>
                    </div>

                    <div class="mod-card-msg mod-wish-text">
                      "${wish.message}"
                    </div>

                    <div class="mod-card-actions mod-wish-actions">
                      <button class="btn btn-ghost btn-xs btn-mod-pin" data-wish-id="${wish.id}" title="${isPinned ? 'Unpin' : 'Pin to top of wall'}">
                        ${isPinned ? '📌 Unpin' : '📍 Pin'}
                      </button>

                      ${wish.status !== 'approved' ? `
                        <button class="btn btn-success btn-xs btn-mod-approve" data-wish-id="${wish.id}">
                          ✅ Approve
                        </button>
                      ` : ''}

                      ${wish.status !== 'rejected' ? `
                        <button class="btn btn-warning btn-xs btn-mod-reject" data-wish-id="${wish.id}">
                          ❌ Reject
                        </button>
                      ` : ''}

                      <button class="btn btn-danger btn-xs btn-mod-delete" data-wish-id="${wish.id}">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                `;
              }).join('') : `
                <div class="mod-empty" style="text-align:center; padding:48px 20px; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:12px; color:var(--text-muted);">
                  <div style="font-size:2.4rem; margin-bottom:8px;">💌</div>
                  <h4 style="font-weight:700; color:var(--text-main); margin-bottom:4px;">No ${this.activeTab} wishes found</h4>
                  <p style="font-size:0.82rem; margin:0 auto 14px auto; max-width:300px;">
                    ${this.searchQuery ? 'No wishes matched your search term.' : 'Wishes from visitors will appear here for review.'}
                  </p>
                  <button class="btn btn-secondary btn-xs" id="btnModEmptyAddManual">
                    ➕ Add a Wish Manually
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(modal);
    return modal;
  }

  attachEvents(modal) {
    const rerender = async () => {
      const newModal = await this.render();
      modal.replaceWith(newModal);
    };

    modal.addEventListener('click', async (e) => {
      // Close Modal
      if (e.target.closest('#btnCloseMod')) {
        modal.remove();
        if (typeof this.onClose === 'function') this.onClose();
        return;
      }

      // Open Wish Wall Preview
      if (e.target.closest('#btnModPreviewLiveWall')) {
        const previewModal = new WishWallPreviewModal({
          project: this.project,
          onClose: () => {},
          onOpenModeration: () => {}
        });
        document.body.appendChild(await previewModal.render());
        return;
      }

      // Tab Switching
      const tab = e.target.closest('.mod-tab, .mod-tab-btn');
      if (tab && tab.dataset.tab) {
        this.activeTab = tab.dataset.tab;
        await rerender();
        return;
      }

      // Toggle Manual Wish Form
      if (e.target.closest('#btnModAddNewManualWish') || e.target.closest('#btnModEmptyAddManual')) {
        this.showAddManualForm = true;
        await rerender();
        return;
      }

      if (e.target.closest('#btnCancelManualWish')) {
        this.showAddManualForm = false;
        await rerender();
        return;
      }

      // Submit Manual Wish
      if (e.target.closest('#btnSubmitManualWish')) {
        const senderInput = modal.querySelector('#manualWishSender');
        const relationInput = modal.querySelector('#manualWishRelation');
        const messageInput = modal.querySelector('#manualWishMessage');

        const sender = (senderInput?.value || '').trim() || 'Well-Wisher';
        const relation = relationInput?.value || 'Friend';
        const message = (messageInput?.value || '').trim();

        if (!message) {
          Toast.show('Please enter a wish message', 'warning');
          return;
        }

        try {
          const newWish = await wishRepository.createWish({
            name: sender,
            relationship: relation,
            message: message,
            isAnonymous: false,
            status: 'approved'
          }, this.project);

          // Mark approved immediately
          if (newWish && newWish.status !== 'approved') {
            await wishRepository.approveWish(newWish.id);
          }

          Toast.show(`Added wish from ${sender}!`, 'success');
          this.showAddManualForm = false;
          this.activeTab = 'approved';
          if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
          await rerender();
        } catch (err) {
          Toast.show(err.message || 'Failed to add wish', 'error');
        }
        return;
      }

      // Approve Single Wish
      const btnApp = e.target.closest('.btn-mod-approve');
      if (btnApp && btnApp.dataset.wishId) {
        await wishRepository.approveWish(btnApp.dataset.wishId);
        Toast.show('Wish approved and published to wall!', 'success');
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
        await rerender();
        return;
      }

      // Reject Single Wish
      const btnRej = e.target.closest('.btn-mod-reject');
      if (btnRej && btnRej.dataset.wishId) {
        await wishRepository.rejectWish(btnRej.dataset.wishId);
        Toast.show('Wish rejected', 'info');
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
        await rerender();
        return;
      }

      // Delete Single Wish
      const btnDel = e.target.closest('.btn-mod-delete');
      if (btnDel && btnDel.dataset.wishId) {
        await wishRepository.deleteWish(btnDel.dataset.wishId);
        Toast.show('Wish deleted', 'info');
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
        await rerender();
        return;
      }

      // Pin / Unpin Wish
      const btnPin = e.target.closest('.btn-mod-pin');
      if (btnPin && btnPin.dataset.wishId) {
        const wish = await wishRepository.getWish(btnPin.dataset.wishId);
        if (wish) {
          wish.isPinned = !wish.isPinned;
          await wishRepository.createWish ? null : null;
          // save wish
          const { dbService } = await import('../services/IndexedDBService.js');
          await dbService.put('wishes', wish.toJSON ? wish.toJSON() : wish);
          Toast.show(wish.isPinned ? 'Wish pinned to top!' : 'Wish unpinned', 'info');
          if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
          await rerender();
        }
        return;
      }

      // Bulk Approve All Pending
      if (e.target.closest('#btnApproveAllPending')) {
        const pending = this.wishes.filter(w => w.status === 'pending');
        for (const w of pending) {
          await wishRepository.approveWish(w.id);
        }
        Toast.show(`Approved ${pending.length} pending wishes!`, 'success');
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
        await rerender();
        return;
      }
    });

    // Search Input Listener
    const searchInput = modal.querySelector('#inputModSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        const q = this.searchQuery.toLowerCase();
        const pendingList = this.wishes.filter(w => w.status === 'pending');
        const approvedList = this.wishes.filter(w => w.status === 'approved');
        const rejectedList = this.wishes.filter(w => w.status === 'rejected');

        let list = this.activeTab === 'pending' ? pendingList :
                    this.activeTab === 'approved' ? approvedList :
                    this.activeTab === 'rejected' ? rejectedList : this.wishes;

        if (q.trim()) {
          list = list.filter(w => 
            (w.name && w.name.toLowerCase().includes(q)) || 
            (w.message && w.message.toLowerCase().includes(q)) ||
            (w.relationship && w.relationship.toLowerCase().includes(q))
          );
        }

        // Live filter card container without losing focus
        const scrollList = modal.querySelector('.mod-cards-scroll-list');
        if (scrollList) {
          if (list.length === 0) {
            scrollList.innerHTML = `<div class="mod-empty" style="text-align:center; padding:30px; color:var(--text-muted);">No wishes matching "${this.searchQuery}"</div>`;
          } else {
            scrollList.innerHTML = list.map(wish => {
              const displayName = wish.isAnonymous ? 'Anonymous' : (wish.name || 'Friend');
              const initial = wish.isAnonymous ? '❤️' : (displayName.charAt(0).toUpperCase() || 'A');
              const isPinned = wish.isPinned || false;
              const statusClass = wish.status === 'approved' ? 'approved' : (wish.status === 'rejected' ? 'rejected' : 'pending');

              return `
                <div class="mod-card-row mod-wish-card" data-wish-id="${wish.id}">
                  <div class="mod-card-top mod-wish-header">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div class="wish-avatar" style="width:34px; height:34px; font-size:0.9rem;">${initial}</div>
                      <div>
                        <div style="display:flex; align-items:center; gap:6px;">
                          <strong class="mod-wish-author" style="font-size:0.9rem; color:var(--text-main, #ffffff);">${displayName}</strong>
                          ${wish.relationship ? `<span class="wish-tag-badge" style="font-size:0.65rem;">${wish.relationship}</span>` : ''}
                          ${isPinned ? `<span style="font-size:0.75rem;" title="Featured Wish">📌</span>` : ''}
                        </div>
                        <span class="mod-wish-date" style="font-size:0.7rem; color:var(--text-muted);">${new Date(wish.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:8px;">
                      <span class="mod-status-pill ${statusClass}">${wish.status || 'pending'}</span>
                    </div>
                  </div>

                  <div class="mod-card-msg mod-wish-text">
                    "${wish.message}"
                  </div>

                  <div class="mod-card-actions mod-wish-actions">
                    <button class="btn btn-ghost btn-xs btn-mod-pin" data-wish-id="${wish.id}" title="${isPinned ? 'Unpin' : 'Pin to top of wall'}">
                      ${isPinned ? '📌 Unpin' : '📍 Pin'}
                    </button>

                    ${wish.status !== 'approved' ? `
                      <button class="btn btn-success btn-xs btn-mod-approve" data-wish-id="${wish.id}">
                        ✅ Approve
                      </button>
                    ` : ''}

                    ${wish.status !== 'rejected' ? `
                      <button class="btn btn-warning btn-xs btn-mod-reject" data-wish-id="${wish.id}">
                        ❌ Reject
                      </button>
                    ` : ''}

                    <button class="btn btn-danger btn-xs btn-mod-delete" data-wish-id="${wish.id}">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              `;
            }).join('');
          }
        }
      });
    }

    // Settings changes
    modal.addEventListener('change', (e) => {
      if (!this.project.wishWall) this.project.wishWall = {};

      if (e.target.id === 'chkEnableWishWall') {
        this.project.wishWall.enabled = e.target.checked;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'chkRequireApproval') {
        this.project.wishWall.requireApproval = e.target.checked;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'chkAllowAnonymous') {
        this.project.wishWall.allowAnonymous = e.target.checked;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'chkAllowCustom') {
        this.project.wishWall.allowCustomMessages = e.target.checked;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'selDisplayMode') {
        this.project.wishWall.displayMode = e.target.value;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'selModWallTheme') {
        this.project.wishWall.theme = e.target.value;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'selModWallLayout') {
        this.project.wishWall.layout = e.target.value;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
      if (e.target.id === 'selModWallAmbience') {
        this.project.wishWall.ambience = e.target.value;
        if (typeof this.onProjectUpdated === 'function') this.onProjectUpdated(this.project);
      }
    });
  }
}

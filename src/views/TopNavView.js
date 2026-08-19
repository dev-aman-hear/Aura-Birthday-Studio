/**
 * Birthday Studio - Minimalist Clean Top Nav Bar
 * Simplified header with only essential primary actions visible,
 * secondary features cleanly organized in an anchored '⋯ More' menu.
 */

export class TopNavView {
  constructor(options = {}) {
    this.project = options.project;
    this.publication = options.publication;
    this.pendingWishCount = options.pendingWishCount || 0;
    this.autosaveStatus = options.autosaveStatus || 'Saved';
    this.canUndo = options.canUndo || false;
    this.canRedo = options.canRedo || false;
    this.onAction = options.onAction || (() => {});
    this.isMoreMenuOpen = false;
  }

  render() {
    const nav = document.createElement('header');
    nav.className = 'top-nav top-nav-minimal';
    nav.id = 'topNavRoot';

    const recipientName = this.project?.recipient?.name || 'Friend';
    const occasion = this.project?.occasion || 'birthday';

    let pubBadgeHtml = `<span class="save-status" id="navAutosaveLabel">● ${this.autosaveStatus}</span>`;
    if (this.publication) {
      if (this.publication.isExpired()) {
        pubBadgeHtml = `<span class="pub-status-badge expired" style="font-size:0.7rem; padding:2px 6px;">⚠️ Expired</span>`;
      } else {
        const daysLeft = Math.max(1, Math.ceil((this.publication.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)));
        pubBadgeHtml = `<span class="pub-status-badge active" style="font-size:0.7rem; padding:2px 6px;">🟢 Live (${daysLeft}d)</span>`;
      }
    }

    nav.innerHTML = `
      <!-- Left: Navigation & Project Context -->
      <div class="nav-left" style="display:flex; align-items:center; gap:12px;">
        <button class="btn btn-ghost btn-sm" id="btnNavDashboard" title="Return to Dashboard" style="font-weight:700;">
          ← Dashboard
        </button>

        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:800; font-size:0.95rem; color:var(--text); white-space:nowrap; max-width:240px; overflow:hidden; text-overflow:ellipsis;">
            ${recipientName}'s ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}
          </span>
          ${pubBadgeHtml}
        </div>
      </div>

      <!-- Right: Essential Primary Actions + More Overflow Menu -->
      <div class="nav-right" style="display:flex; align-items:center; gap:8px; position:relative;">
        <!-- Undo / Redo -->
        <button class="btn btn-ghost btn-icon btn-sm" id="btnNavUndo" ${!this.canUndo ? 'disabled' : ''} title="Undo (Ctrl+Z)" aria-label="Undo" style="font-size:0.9rem;">↶</button>
        <button class="btn btn-ghost btn-icon btn-sm" id="btnNavRedo" ${!this.canRedo ? 'disabled' : ''} title="Redo (Ctrl+Y)" aria-label="Redo" style="font-size:0.9rem;">↷</button>

        <!-- Preview -->
        <button class="btn btn-secondary btn-sm" id="btnNavPreviewExperience" title="Play celebration preview" style="font-weight:700;">
          ▶️ Preview
        </button>

        <!-- Publish / Manage Link -->
        <button class="btn btn-primary btn-sm" id="btnNavPublish" title="Publish or manage celebration link" style="font-weight:800; min-height:34px;">
          🚀 ${this.publication && !this.publication.isExpired() ? 'Manage Link' : 'Publish'}
        </button>

        <!-- More Menu Toggle Container -->
        <div style="position:relative;">
          <button class="btn btn-ghost btn-icon btn-sm" id="btnNavMoreMenu" title="More studio options" aria-label="More options" aria-haspopup="true" style="font-size:1.1rem; font-weight:800; padding:4px 8px;">
            ⋯
          </button>

          <!-- Dropdown Popup -->
          <div class="nav-more-dropdown" id="navMoreDropdown" style="display:none; position:absolute; right:0; top:calc(100% + 6px); width:230px; background:var(--surface-elevated, #1c1830); border:1px solid var(--border, rgba(255,255,255,0.15)); border-radius:var(--radius-md, 10px); box-shadow:0 14px 36px rgba(0,0,0,0.6); padding:6px; z-index:99999; flex-direction:column; gap:2px;">
            <button class="more-menu-item" data-more-action="openStyle">
              <span>🎨</span> <span>Theme & Style</span>
            </button>
            <button class="more-menu-item" data-more-action="openCountdown">
              <span>⏳</span> <span>Countdown Timer</span>
            </button>
            <button class="more-menu-item" data-more-action="autoArrange">
              <span>🪄</span> <span>Auto-Arrange Assets</span>
            </button>
            <button class="more-menu-item" data-more-action="toggleFocusMode">
              <span>🎯</span> <span>Focus Mode (F)</span>
            </button>
            <div style="height:1px; background:var(--border, rgba(255,255,255,0.1)); margin:4px 0;"></div>
            <button class="more-menu-item" data-more-action="openVersionHistory">
              <span>📜</span> <span>Version History</span>
            </button>
            <button class="more-menu-item" data-more-action="openCmdMenu">
              <span>⚡</span> <span>Command Search (Ctrl+K)</span>
            </button>
            <button class="more-menu-item" data-more-action="openWishWallPreview">
              <span>👁️</span> <span>Wish Wall Live Preview</span>
            </button>
            <button class="more-menu-item" data-more-action="openModeration">
              <span>💌</span> <span>Wish Wall Moderation ${this.pendingWishCount > 0 ? `(${this.pendingWishCount})` : ''}</span>
            </button>
            <div style="height:1px; background:var(--border, rgba(255,255,255,0.1)); margin:4px 0;"></div>
            <button class="more-menu-item" data-more-action="newProject">
              <span>➕</span> <span>New Celebration</span>
            </button>
            <button class="more-menu-item" data-more-action="openSettings">
              <span>⚙️</span> <span>Creator Settings</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(nav);
    return nav;
  }

  attachEvents(nav) {
    const moreBtn = nav.querySelector('#btnNavMoreMenu');
    const moreDropdown = nav.querySelector('#navMoreDropdown');

    const closeDropdown = () => {
      if (this.isMoreMenuOpen) {
        this.isMoreMenuOpen = false;
        if (moreDropdown) moreDropdown.style.display = 'none';
      }
    };

    if (moreBtn && moreDropdown) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isMoreMenuOpen = !this.isMoreMenuOpen;
        moreDropdown.style.display = this.isMoreMenuOpen ? 'flex' : 'none';
      });

      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
          closeDropdown();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDropdown();
        }
      });
    }

    // Direct and dropdown action handler
    nav.addEventListener('click', (e) => {
      const moreItem = e.target.closest('[data-more-action]');
      if (moreItem) {
        const act = moreItem.dataset.moreAction;
        closeDropdown();
        this.onAction(act);
        return;
      }

      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'btnNavDashboard') this.onAction('goDashboard');
      if (btn.id === 'btnNavUndo') this.onAction('undo');
      if (btn.id === 'btnNavRedo') this.onAction('redo');
      if (btn.id === 'btnNavPreviewExperience') this.onAction('previewExperience');
      if (btn.id === 'btnNavPublish') this.onAction('publish');
    });
  }
}

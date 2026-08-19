/**
 * Birthday Studio - Modern Responsive Creator Dashboard (Canva / PowerPoint Style)
 * Unified Single Dashboard Layout:
 * Top Bar (Constant, Fixed Position & Height, Never Shifts)
 *   ↓
 * Welcome Hero & Navigation Tabs (My Creations | Prebuilt Presets | Manage Links)
 *   ↓
 * Content Area (Dynamically rendered per tab without full-page reloads or layout shifts)
 */

import { authRepository } from '../services/AuthRepository.js';
import { projectRepository } from '../services/ProjectRepository.js';
import { publishedProjectRepository } from '../services/PublishedProjectRepository.js';
import { CreatorActivityService } from '../services/CreatorActivityService.js';
import { OnboardingService } from '../services/OnboardingService.js';
import { ProjectProgressService } from '../services/ProjectProgressService.js';
import { PresetRegistry } from '../data/presets/PresetRegistry.js';

import { Toast } from '../utils/Toast.js';
import { WizardView } from './WizardView.js';
import { PreviewPlayerView } from './PreviewPlayerView.js';
import { PresetPreviewView } from './PresetPreviewView.js';
import { PresetDetailView } from './PresetDetailView.js';
import { PresetPersonalizationView } from './PresetPersonalizationView.js';
import { RepublishDurationModal } from './RepublishDurationModal.js';
import { ProjectProgressView } from './ProjectProgressView.js';
import { RecentActivityView } from './RecentActivityView.js';
import { EmptyStateView } from './EmptyStateView.js';
import { CreatorOnboardingView } from './CreatorOnboardingView.js';
import { ProjectStatusBadge } from './ProjectStatusBadge.js';
import { dbService } from '../services/IndexedDBService.js';

export class DashboardView {
  constructor(options = {}) {
    this.user = options.user;
    this.onNavigateEditor = options.onNavigateEditor || (() => {});
    this.onLogout = options.onLogout || (() => {});

    // Canonical tabs: 'my_creations' | 'presets' | 'links'
    const initialTab = options.activeTab || 'my_creations';
    this.activeTab = (initialTab === 'celebrations' || initialTab === 'my_creations') ? 'my_creations' : initialTab;

    this.projects = [];
    this.publications = [];

    // Search, filter & sort state
    this.searchQuery = '';
    this.selectedOccasionFilter = 'all';
    this.sortBy = 'recently_edited';
    this.isSearchOpen = false;

    // Preset filter state
    this.activePresetCategory = 'all';

    this.rootElement = null;
  }

  async loadData() {
    this.user = await authRepository.getCurrentUser();
    if (this.user) {
      this.projects = await projectRepository.getAllProjects(this.user.id);
    } else {
      this.projects = await projectRepository.getAllProjects();
    }
    this.publications = await dbService_getAllPubs();
  }

  getFilteredProjects() {
    let list = [...this.projects];

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const recip = (p.recipient?.name || '').toLowerCase();
        const occ = (p.occasion || '').toLowerCase();
        const title = (p.title || `${recip} ${occ}`).toLowerCase();
        return title.includes(q) || recip.includes(q) || occ.includes(q);
      });
    }

    if (this.selectedOccasionFilter && this.selectedOccasionFilter !== 'all') {
      list = list.filter(p => (p.occasion || '').toLowerCase() === this.selectedOccasionFilter.toLowerCase());
    }

    if (this.sortBy === 'recently_edited') {
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } else if (this.sortBy === 'recently_created') {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => (a.recipient?.name || a.title || '').localeCompare(b.recipient?.name || b.title || ''));
    }

    return list;
  }

  getDynamicGreeting() {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeGreeting = 'Good Evening';
    } else {
      timeGreeting = 'Good Night';
    }

    const displayName = this.user?.displayName || this.user?.username || 'Creator';
    return `${timeGreeting}, ${displayName}`;
  }

  getUserInitial() {
    const name = this.user?.displayName || this.user?.username || 'C';
    return (name.trim().charAt(0) || 'C').toUpperCase();
  }

  async render() {
    await this.loadData();

    // Check first-time creator onboarding
    if (OnboardingService.isFirstTimeCreator()) {
      setTimeout(() => {
        const onboardingModal = new CreatorOnboardingView(() => {});
        document.body.appendChild(onboardingModal.render());
      }, 300);
    }

    const root = document.createElement('div');
    root.className = 'dashboard-page-container';
    root.id = 'dashboardPageRoot';
    this.rootElement = root;

    const greeting = this.getDynamicGreeting();
    const userInitial = this.getUserInitial();
    const displayName = this.user?.displayName || this.user?.username || 'Creator';

    root.innerHTML = `
      <!-- SHARED CONSTANT TOP BAR (Fixed position, fixed height, never moves or shifts) -->
      <header class="dashboard-top-bar" id="dashTopBar">
        <div class="dash-brand-container">
          <div class="dash-brand-logo-icon">🎂</div>
          <div class="dash-brand-title-group">
            <h1 class="dash-brand-title">Aura Birthday Studio</h1>
            <span class="dash-brand-tagline">Celebration Studio</span>
          </div>
        </div>

        <div class="dash-top-actions">
          <button class="btn btn-ghost btn-sm dash-help-btn" id="btnDashOnboardingHelp" title="Creator Guide & Onboarding">
            <span class="btn-icon-symbol">✨</span>
            <span class="btn-label-text">Guide</span>
          </button>

          <!-- User First-Letter Avatar (Clicking opens Profile & Account) -->
          <button class="dash-user-avatar-btn" id="btnDashUserAvatar" title="Profile & Account (${displayName})">
            <span class="avatar-initial">${userInitial}</span>
          </button>
        </div>
      </header>

      <!-- SHARED DASHBOARD MAIN CONTAINER -->
      <main class="dashboard-main-content">
        <!-- Welcome Hero Section -->
        <section class="dashboard-welcome-hero" id="dashWelcomeHero">
          <div class="welcome-hero-content">
            <div class="welcome-hero-text">
              <h2 class="welcome-title">${greeting}</h2>
              <p class="welcome-subtitle">Create animated celebration stories, interactive photo memories, and community wish walls in minutes.</p>
            </div>
            <div class="welcome-hero-actions" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <button class="btn btn-primary btn-hero-start" id="btnDashNewCelebration">
                <span class="btn-hero-icon">✨</span>
                <span>+ Create Celebration</span>
              </button>
              <button class="btn btn-secondary btn-hero-start" id="btnStartFromBlank" style="background:var(--surface-elevated); border:1px solid var(--border);">
                <span class="btn-hero-icon">✍️</span>
                <span>Start From Blank</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Main Navigation Bar & Dynamic Search -->
        <div class="dashboard-nav-bar" id="dashNavBar">
          <nav class="dashboard-nav-tabs" id="dashNavTabs" role="tablist" aria-label="Dashboard Navigation">
            <button class="dash-nav-tab ${(this.activeTab === 'my_creations' || this.activeTab === 'celebrations') ? 'active' : ''}" data-tab="my_creations" role="tab" aria-selected="${(this.activeTab === 'my_creations' || this.activeTab === 'celebrations') ? 'true' : 'false'}">
              <span class="tab-icon">📁</span>
              <span>My Creations</span>
              <span class="tab-count-pill" id="badgeCreationsCount">${this.projects.length}</span>
            </button>

            <button class="dash-nav-tab ${this.activeTab === 'presets' ? 'active' : ''}" data-tab="presets" role="tab" aria-selected="${this.activeTab === 'presets' ? 'true' : 'false'}">
              <span class="tab-icon">🎨</span>
              <span>Prebuilt Presets</span>
            </button>

            <button class="dash-nav-tab ${this.activeTab === 'links' ? 'active' : ''}" data-tab="links" role="tab" aria-selected="${this.activeTab === 'links' ? 'true' : 'false'}">
              <span class="tab-icon">🚀</span>
              <span>Manage Links</span>
              <span class="tab-count-pill" id="badgeLinksCount">${this.publications.length}</span>
            </button>
          </nav>

          <!-- Dynamic Search Widget at Rightmost Area -->
          <div class="dash-nav-search-wrapper" id="dashNavSearchWrapper">
            <button class="dash-search-trigger-btn ${(this.isSearchOpen || this.searchQuery) ? 'hidden' : ''}" id="btnToggleNavSearch" title="Search Creations" aria-label="Search creations">
              <span>🔍</span>
            </button>
            <div class="dash-nav-search-expandable ${(this.isSearchOpen || this.searchQuery) ? 'expanded' : ''}" id="dashNavSearchExpandable">
              <span class="nav-search-inner-icon">🔍</span>
              <input type="text" class="form-input dash-nav-search-input" id="inpDashSearch" value="${this.searchQuery}" placeholder="Search creations..." aria-label="Search creations by name or occasion" />
              ${this.searchQuery ? `<button class="btn-clear-search" id="btnClearNavSearch" title="Clear Search">✕</button>` : ''}
              <button class="btn-close-search" id="btnCloseNavSearch" title="Close Search">✕</button>
            </div>
          </div>
        </div>

        <!-- DYNAMIC TAB CONTENT AREA: ONLY this area is swapped on navigation! -->
        <div class="dashboard-tab-body" id="dashTabBody">
          ${await this.renderTabContent()}
        </div>
      </main>

      <!-- Modal Mount Container -->
      <div id="dashModalContainer"></div>
    `;

    this.attachEvents(root);
    return root;
  }

  async switchTab(tabKey) {
    const normalized = (tabKey === 'celebrations' || tabKey === 'my_creations') ? 'my_creations' : tabKey;
    this.activeTab = normalized;

    // Update active tab buttons in navbar without touching Top Bar or Header
    const navTabs = this.rootElement?.querySelector('#dashNavTabs') || document.querySelector('#dashNavTabs');
    if (navTabs) {
      navTabs.querySelectorAll('.dash-nav-tab').forEach(btn => {
        const isMatch = btn.dataset.tab === normalized;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
    }

    // Render new content into #dashTabBody ONLY
    const tabBody = this.rootElement?.querySelector('#dashTabBody') || document.querySelector('#dashTabBody');
    if (tabBody) {
      tabBody.innerHTML = await this.renderTabContent();
    }

    // Update history state without triggering page route reload
    try {
      window.history.replaceState(null, '', `#dashboard?tab=${normalized}`);
    } catch (e) {}
  }

  async renderTabContent() {
    if (this.activeTab === 'my_creations' || this.activeTab === 'celebrations') {
      return this.renderMyCreationsTab();
    } else if (this.activeTab === 'presets') {
      return this.renderPrebuiltPresetsTab();
    } else if (this.activeTab === 'links') {
      return this.renderManageLinksTab();
    }
    return this.renderMyCreationsTab();
  }

  renderMyCreationsTab() {
    const filtered = this.getFilteredProjects();
    const hasProjects = this.projects.length > 0;

    // Check project suggestions / recommendations
    const needsAttentionList = [];
    this.projects.forEach(p => {
      const prog = ProjectProgressService.calculateProgress(p);
      if (prog.suggestions.length > 0) {
        needsAttentionList.push({ project: p, suggestion: prog.suggestions[0] });
      }
    });

    return `
      <div class="my-creations-tab-content">
        ${needsAttentionList.length > 0 ? `
          <div class="needs-attention-banner">
            <div class="needs-attention-left">
              <span class="attention-icon">💡</span>
              <div class="attention-text">
                <strong class="attention-badge">Needs Attention:</strong>
                <span>"${needsAttentionList[0].project.recipient?.name || 'Celebration'}" — ${needsAttentionList[0].suggestion}</span>
              </div>
            </div>
            <button class="btn btn-warning btn-sm btn-edit-proj" data-proj-id="${needsAttentionList[0].project.id}">Fix in Editor →</button>
          </div>
        ` : ''}

        ${hasProjects ? `
          <!-- Category Filter Pills Bar (Preset-style aesthetic) -->
          <div class="preset-category-filter-bar" style="margin-bottom: 24px;">
            <div class="preset-category-filter-pills" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">
              ${[
                { id: 'all', label: '✨ All Creations' },
                { id: 'birthday', label: '🎂 Birthday' },
                { id: 'wedding', label: '💍 Wedding' },
                { id: 'anniversary', label: '❤️ Anniversary' },
                { id: 'graduation', label: '🎓 Graduation' },
                { id: 'congratulations', label: '🎉 Congratulations' }
              ].map(occ => `
                <button class="btn btn-compact btn-preset-cat-filter dash-filter-pill ${this.selectedOccasionFilter === occ.id ? 'btn-primary active' : 'btn-secondary'}" data-occ-filter="${occ.id}">
                  ${occ.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Creations Grid -->
          <div class="celebrations-grid" id="celebrationsGrid">
            ${filtered.length > 0 ? filtered.map((p, idx) => this.renderProjectCard(p, idx)).join('') : `
              <div class="no-results-box" style="grid-column: 1 / -1; padding:40px; text-align:center; color:var(--text-muted);">
                <div style="font-size:2.5rem; margin-bottom:8px;">🔍</div>
                <h3>No matching celebrations found</h3>
                <p>Try searching for a different name or clearing filters.</p>
                <button class="btn btn-secondary margin-top-sm" id="btnClearDashFilters">Clear Filters</button>
              </div>
            `}
          </div>
        ` : `
          <!-- Empty State (Section 4 Requirement) -->
          <div class="dashboard-empty-card">
            <div class="empty-card-illustration">✨</div>
            <h3 class="empty-card-title">Your first celebration starts here.</h3>
            <p class="empty-card-desc">
              Create your first celebration and turn your favorite memories into a visual story.
            </p>
            <div class="empty-card-actions">
              <button class="btn btn-primary btn-lg" id="btnEmptyStateCreateDesign">
                <span>✨</span>
                <span>Create A Design</span>
              </button>
            </div>
          </div>
        `}

        <!-- Recent Activity Feed -->
        <section class="dashboard-activity-section" style="margin-top: 36px;">
          <div class="section-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text);">Recent Activity</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">Recent actions & draft updates</span>
          </div>
          <div id="recentActivityMount">
            ${new RecentActivityView().render().outerHTML}
          </div>
        </section>
      </div>
    `;
  }

  renderProjectCard(project, index = 0) {
    const recipName = project.recipient?.name || 'Friend';
    const occ = (project.occasion || 'birthday').toUpperCase();
    const sceneCount = project.scenes?.length || 0;
    const progress = ProjectProgressService.calculateProgress(project);
    const dateFormatted = new Date(project.updatedAt || project.createdAt || Date.now()).toLocaleDateString();

    const occasionEmojis = {
      birthday: '🎂',
      wedding: '💍',
      anniversary: '❤️',
      graduation: '🎓',
      congratulations: '🎉',
      babyShower: '🍼'
    };
    const emoji = occasionEmojis[project.occasion] || '✨';

    const occasionGradients = {
      birthday: 'linear-gradient(135deg, rgba(127, 90, 240, 0.35) 0%, rgba(255, 0, 127, 0.25) 100%)',
      wedding: 'linear-gradient(135deg, rgba(255, 107, 107, 0.35) 0%, rgba(255, 217, 61, 0.25) 100%)',
      anniversary: 'linear-gradient(135deg, rgba(235, 77, 75, 0.35) 0%, rgba(104, 109, 224, 0.25) 100%)',
      graduation: 'linear-gradient(135deg, rgba(72, 52, 212, 0.35) 0%, rgba(34, 166, 179, 0.25) 100%)',
      congratulations: 'linear-gradient(135deg, rgba(240, 147, 43, 0.35) 0%, rgba(235, 77, 75, 0.25) 100%)',
      babyShower: 'linear-gradient(135deg, rgba(106, 176, 76, 0.35) 0%, rgba(19, 15, 64, 0.25) 100%)'
    };
    const gradient = occasionGradients[project.occasion] || occasionGradients.birthday;
    const animDelay = (index * 0.05).toFixed(2);

    return `
      <div class="celebration-studio-card" data-project-id="${project.id}" style="animation-delay: ${animDelay}s;">
        <!-- Preset-Style Thumbnail Graphic Header -->
        <div class="card-cover-graphic" style="background: ${gradient};">
          <span class="cover-emoji">${emoji}</span>
          <span class="preset-scene-counter-badge">${sceneCount} Scene${sceneCount === 1 ? '' : 's'}</span>
          <span class="preset-cat-badge">${occ}</span>
          <span class="badge-status-pill ${progress.isReadyToPublish ? 'status-ready' : 'status-draft'}" style="position: absolute; top: 12px; left: 12px;">
            ${progress.isReadyToPublish ? '● Ready' : '● Draft'}
          </span>
        </div>

        <!-- Card Body Details -->
        <div class="card-body-details">
          <div>
            <h4 class="card-project-title" title="${project.title || recipName}">
              ${project.title || `${recipName}'s ${project.occasion || 'Celebration'}`}
            </h4>
            <span class="card-subtitle-meta">
              For <strong>${recipName}</strong> • ${project.relationship || 'Friend'}
            </span>

            <!-- Progress Bar -->
            <div class="card-progress-box">
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-muted); margin-bottom:4px;">
                <span>Completion Status</span>
                <span style="font-weight:700; color:var(--text);">${progress.score}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width:${progress.score}%; background: linear-gradient(90deg, #7f5af0, #ff007f);"></div>
              </div>
            </div>

            <!-- Tags List (Matching Preset Card Tags) -->
            <div class="preset-tags-list">
              <span class="preset-tag-chip">#${project.occasion || 'Birthday'}</span>
              <span class="preset-tag-chip">#${project.relationship || 'Friend'}</span>
              <span class="preset-tag-chip">🕒 ${dateFormatted}</span>
            </div>
          </div>

          <!-- Card Actions Grid -->
          <div class="card-actions-grid">
            <button class="btn btn-primary btn-sm btn-edit-proj" data-proj-id="${project.id}" title="Open Studio Editor">
              <span>✏️</span> <span>Edit</span>
            </button>
            <button class="btn btn-secondary btn-sm btn-preview-proj" data-proj-id="${project.id}" title="Live Fullscreen Preview">
              <span>👁️</span>
            </button>
            <button class="btn btn-secondary btn-sm btn-dup-proj" data-proj-id="${project.id}" title="Duplicate Draft">
              <span>📋</span>
            </button>
            <button class="btn btn-ghost btn-sm btn-danger btn-delete-proj" data-proj-id="${project.id}" title="Delete Celebration">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderPrebuiltPresetsTab() {
    const allPresets = PresetRegistry.getAllPresets();
    const categories = [
      { id: 'all', label: '✨ All Presets' },
      { id: 'birthday', label: '🎂 Birthday' },
      { id: 'wedding', label: '💍 Wedding' },
      { id: 'graduation', label: '🎓 Graduation' },
      { id: 'congratulations', label: '🎉 Congratulations' },
      { id: 'anniversary', label: '🥂 Anniversary' },
      { id: 'other', label: '🌟 Other' }
    ];

    let filteredPresets = allPresets;
    if (this.activePresetCategory && this.activePresetCategory !== 'all') {
      if (this.activePresetCategory === 'other') {
        filteredPresets = allPresets.filter(p => !['birthday', 'wedding', 'graduation', 'congratulations', 'anniversary'].includes(p.occasion));
      } else {
        filteredPresets = allPresets.filter(p => (p.occasion || '').toLowerCase() === this.activePresetCategory.toLowerCase());
      }
    }

    return `
      <div class="prebuilt-presets-tab-content">
        <!-- Category Filter Pills -->
        <div class="preset-category-filter-bar" style="margin-bottom: 20px;">
          <div class="preset-category-filter-pills" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">
            ${categories.map(cat => `
              <button class="btn btn-compact btn-preset-cat-filter ${this.activePresetCategory === cat.id ? 'btn-primary active' : 'btn-secondary'}" data-preset-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Helpful Onboarding Banner -->
        <div style="background:var(--surface-elevated); border:1px solid var(--border); border-radius:12px; padding:12px 18px; margin-bottom:20px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:1.3rem;">🎨</span>
          <div style="font-size:0.88rem; color:var(--text-muted);">
            <strong style="color:var(--text); font-weight:700;">Ready-Made Starting Points:</strong>
            Choose a preset design below. Once selected, you can customize every scene, text, and photo in the editor.
          </div>
        </div>

        <!-- Presets Grid -->
        <div class="preset-cards-grid">
          ${filteredPresets.map(preset => this.renderPresetCard(preset)).join('')}
        </div>
      </div>
    `;
  }

  renderPresetCard(preset) {
    const defaultScenes = preset.sceneBlueprints[preset.defaultVariant] || Object.values(preset.sceneBlueprints || {})[0] || [];
    const sceneCount = defaultScenes.length || 3;
    const cat = preset.category && preset.category.toLowerCase() !== 'universal' ? preset.category : (preset.occasion || 'FEATURED');
    const categoryTag = cat.toUpperCase();

    return `
      <div class="preset-card-item" data-preset-id="${preset.id}">
        <!-- Preset Preview Thumbnail Graphic -->
        <div class="preset-card-preview-thumb">
          <span class="preset-card-icon-art">${preset.icon || '✨'}</span>
          <span class="preset-scene-counter-badge">${sceneCount} Scenes</span>
          <span class="preset-cat-badge">${categoryTag}</span>
        </div>

        <!-- Preset Information & Actions -->
        <div class="preset-card-details">
          <div>
            <h4 class="preset-card-title">${preset.title}</h4>
            <p class="preset-card-desc">${preset.description || 'A modern cinematic celebration blueprint.'}</p>
          </div>
          
          <div>
            <div class="preset-tags-list">
              ${(preset.tags || ['Cinematic', 'Dynamic']).map(tag => `
                <span class="preset-tag-chip">${tag}</span>
              `).join('')}
            </div>

            <!-- Preset Action Buttons -->
            <div class="preset-card-actions">
              <button class="btn btn-secondary btn-sm btn-preview-preset" data-preset-id="${preset.id}">
                <span>👁️</span> <span>Preview</span>
              </button>
              <button class="btn btn-primary btn-sm btn-use-preset" data-preset-id="${preset.id}">
                <span>✨</span> <span>Use Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderManageLinksTab() {
    const list = this.publications;
    const hasLinks = list && list.length > 0;

    return `
      <div class="manage-links-container">
        <div class="manage-links-header-panel">
          <div>
            <h3 class="manage-links-title">Active Celebration Links</h3>
            <p class="manage-links-subtitle">Live, shareable 7-day recipient links with instant wish notifications.</p>
          </div>
          <span class="links-counter-badge">${list.length} Live Link${list.length === 1 ? '' : 's'}</span>
        </div>

        ${hasLinks ? `
          <!-- Desktop Responsive Table View -->
          <div class="manage-links-table-wrapper desktop-only-view">
            <table class="manage-links-table">
              <thead>
                <tr>
                  <th>Link Name</th>
                  <th>Link</th>
                  <th>Status</th>
                  <th>Preview</th>
                  <th>Wish Wall</th>
                  <th>Share</th>
                  <th>Republish</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(pub => this.renderDesktopTableRow(pub)).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Stacked Card View (<768px) -->
          <div class="manage-links-cards-wrapper mobile-only-view">
            ${list.map(pub => this.renderMobileLinkCard(pub)).join('')}
          </div>
        ` : `
          <!-- Empty State for Links -->
          <div class="dashboard-empty-card" style="padding:50px 24px;">
            <div class="empty-card-illustration">🚀</div>
            <h3 class="empty-card-title">No active celebration links yet</h3>
            <p class="empty-card-desc">
              When you publish a celebration, its recipient link and shareable QR code will appear here.
            </p>
            <button class="btn btn-primary margin-top-md" id="btnEmptyLinksGoCreations">
              View My Creations
            </button>
          </div>
        `}
      </div>
    `;
  }

  renderDesktopTableRow(pub) {
    const isExpired = Date.now() >= (pub.expiresAt || 0);
    const shareUrl = `${window.location.origin}${window.location.pathname}#view/${pub.id}`;
    const daysLeft = Math.max(0, Math.ceil(((pub.expiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)));
    const recipient = pub.snapshot?.recipient?.name || pub.projectSnapshot?.recipient?.name || 'Friend';
    const occasion = pub.snapshot?.occasion || pub.projectSnapshot?.occasion || 'Celebration';
    const expireDateStr = pub.expiresAt ? new Date(pub.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

    return `
      <tr class="link-row ${isExpired ? 'row-expired' : ''}">
        <td class="col-link-name">
          <strong>${recipient}'s ${occasion}</strong>
          <span class="link-created-date">Published ${new Date(pub.publishedAt).toLocaleDateString()}</span>
        </td>
        <td class="col-link-url">
          <div class="link-url-input-group">
            <input type="text" readonly value="${shareUrl}" class="link-url-input" />
            <button class="btn btn-ghost btn-compact btn-copy-link" data-url="${shareUrl}" title="Copy Link">📋</button>
          </div>
        </td>
        <td class="col-link-status">
          ${isExpired ? `
            <span class="badge-status-pill status-expired" title="Expired on ${expireDateStr}">● Expired</span>
          ` : `
            <span class="badge-status-pill status-active" title="Expires: ${expireDateStr} (${daysLeft}d left)">● Active (${daysLeft}d)</span>
          `}
        </td>
        <td class="col-action">
          <a href="#view/${pub.id}" target="_blank" class="btn btn-ghost btn-sm btn-table-action" title="Open Recipient View">👁️ View</a>
        </td>
        <td class="col-action">
          <a href="#wishwall/${pub.id}" target="_blank" class="btn btn-ghost btn-sm btn-table-action" title="Open Guest Wish Wall" style="color:#a29bfe; font-weight:700;">💌 Wall</a>
        </td>
        <td class="col-action">
          <button class="btn btn-secondary btn-sm btn-share-pub btn-table-action" data-pub-id="${pub.id}" data-url="${shareUrl}" title="Share Link & QR">🔗 Share</button>
        </td>
        <td class="col-action">
          <button class="btn ${isExpired ? 'btn-primary' : 'btn-secondary'} btn-sm btn-republish-pub btn-table-action" data-pub-id="${pub.id}" title="Republish Link (Choose 1, 3, 5, 7 Days)">🔄 Republish</button>
        </td>
        <td class="col-action">
          <button class="btn btn-ghost btn-sm btn-danger btn-delete-pub btn-table-action" data-pub-id="${pub.id}" title="Delete Link">🗑️</button>
        </td>
      </tr>
    `;
  }

  renderMobileLinkCard(pub) {
    const isExpired = Date.now() >= (pub.expiresAt || 0);
    const shareUrl = `${window.location.origin}${window.location.pathname}#view/${pub.id}`;
    const daysLeft = Math.max(0, Math.ceil(((pub.expiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)));
    const recipient = pub.snapshot?.recipient?.name || pub.projectSnapshot?.recipient?.name || 'Friend';
    const occasion = pub.snapshot?.occasion || pub.projectSnapshot?.occasion || 'Celebration';
    const expireDateStr = pub.expiresAt ? new Date(pub.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

    return `
      <div class="mobile-link-card ${isExpired ? 'card-expired' : ''}">
        <div class="mobile-link-header">
          <h4 class="mobile-link-title">${recipient}'s ${occasion}</h4>
          <div class="mobile-link-meta">
            <span class="badge-status-pill ${isExpired ? 'status-expired' : 'status-active'}">
              ${isExpired ? '● Expired' : `● Active (${daysLeft}d left)`}
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">Exp: ${expireDateStr}</span>
          </div>
        </div>

        <div class="mobile-link-url-box">
          <input type="text" readonly value="${shareUrl}" class="form-input mobile-url-input" />
          <button class="btn btn-secondary btn-copy-link" data-url="${shareUrl}">📋 Copy</button>
        </div>

        <div class="mobile-link-actions-grid" style="grid-template-columns: repeat(2, 1fr); gap: 6px;">
          <a href="#view/${pub.id}" target="_blank" class="btn btn-secondary btn-block">👁️ View</a>
          <a href="#wishwall/${pub.id}" target="_blank" class="btn btn-secondary btn-block" style="color:#a29bfe; font-weight:700;">💌 Wall</a>
          <button class="btn btn-primary btn-block btn-share-pub" data-pub-id="${pub.id}" data-url="${shareUrl}">🔗 Share</button>
          <button class="btn ${isExpired ? 'btn-primary' : 'btn-secondary'} btn-block btn-republish-pub" data-pub-id="${pub.id}">🔄 Republish</button>
          <button class="btn btn-ghost btn-danger btn-block btn-delete-pub" data-pub-id="${pub.id}" style="grid-column: 1 / -1;">🗑️ Delete</button>
        </div>
      </div>
    `;
  }

  openProfileModal() {
    const modalContainer = this.rootElement?.querySelector('#dashModalContainer') || document.body;
    const existing = document.getElementById('profileModalBackdrop');
    if (existing) existing.remove();

    const userInitial = this.getUserInitial();
    const displayName = this.user?.displayName || this.user?.username || 'Creator';
    const username = this.user?.username || 'creator';
    const createdDate = new Date(this.user?.createdAt || Date.now()).toLocaleDateString();

    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = `
      <div class="profile-modal-backdrop" id="profileModalBackdrop">
        <div class="profile-modal-dialog" id="profileModalDialog">
          <div class="profile-modal-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="profile-avatar-circle-large">${userInitial}</div>
              <div>
                <h3 class="profile-modal-title">Profile & Account</h3>
                <span class="profile-modal-sub">Personalize your creator profile</span>
              </div>
            </div>
            <button class="btn-icon-close" id="btnCloseProfileModal">✕</button>
          </div>

          <div class="profile-modal-body">
            <div class="form-group">
              <label for="profDisplayNameInput">Creator Display Name</label>
              <input type="text" class="form-input" id="profDisplayNameInput" value="${displayName}" placeholder="Enter your name" />
            </div>

            <div class="form-group">
              <label>Account Username</label>
              <input type="text" class="form-input" value="@${username}" disabled style="opacity:0.6; cursor:not-allowed;" />
            </div>

            <div class="form-group">
              <label>Member Since</label>
              <div style="font-size:0.85rem; color:var(--text-muted); padding:8px 0;">${createdDate}</div>
            </div>
          </div>

          <div class="profile-modal-footer">
            <button class="btn btn-ghost btn-danger" id="btnProfileLogout">Log Out</button>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" id="btnCancelProfile">Cancel</button>
              <button class="btn btn-primary" id="btnSaveProfile">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modalContainer.appendChild(modalWrapper.firstElementChild);
  }

  closeProfileModal() {
    const modal = document.getElementById('profileModalBackdrop');
    if (modal) modal.remove();
  }

  attachEvents(root) {
    // Search input real-time filtering
    root.addEventListener('input', async (e) => {
      if (e.target.id === 'inpDashSearch') {
        this.searchQuery = e.target.value;
        const expandable = root.querySelector('#dashNavSearchExpandable');
        if (expandable) {
          let clearBtn = expandable.querySelector('#btnClearNavSearch');
          const closeBtn = expandable.querySelector('#btnCloseNavSearch');
          if (this.searchQuery && !clearBtn && closeBtn) {
            const btn = document.createElement('button');
            btn.className = 'btn-clear-search';
            btn.id = 'btnClearNavSearch';
            btn.title = 'Clear Search';
            btn.textContent = '✕';
            closeBtn.before(btn);
          } else if (!this.searchQuery && clearBtn) {
            clearBtn.remove();
          }
        }

        if (this.activeTab !== 'my_creations') {
          await this.switchTab('my_creations');
        } else {
          this.updateCreationsGrid(root);
        }
      }
    });

    // Global Click Delegation
    root.addEventListener('click', async (e) => {
      // Dynamic Search Open / Toggle
      if (e.target.closest('#btnToggleNavSearch')) {
        this.isSearchOpen = true;
        const trigger = root.querySelector('#btnToggleNavSearch');
        const expandable = root.querySelector('#dashNavSearchExpandable');
        if (trigger) trigger.classList.add('hidden');
        if (expandable) {
          expandable.classList.add('expanded');
          const inp = expandable.querySelector('#inpDashSearch');
          if (inp) {
            inp.focus();
            if (this.searchQuery) inp.select();
          }
        }
        if (this.activeTab !== 'my_creations') {
          await this.switchTab('my_creations');
        }
        return;
      }

      // Dynamic Search Close
      if (e.target.closest('#btnCloseNavSearch')) {
        this.isSearchOpen = false;
        this.searchQuery = '';
        const trigger = root.querySelector('#btnToggleNavSearch');
        const expandable = root.querySelector('#dashNavSearchExpandable');
        if (trigger) trigger.classList.remove('hidden');
        if (expandable) expandable.classList.remove('expanded');
        const inp = root.querySelector('#inpDashSearch');
        if (inp) inp.value = '';
        const clearBtn = root.querySelector('#btnClearNavSearch');
        if (clearBtn) clearBtn.remove();
        this.updateCreationsGrid(root);
        return;
      }

      // Dynamic Search Clear
      if (e.target.closest('#btnClearNavSearch') || e.target.closest('#btnClearDashFilters')) {
        this.searchQuery = '';
        this.selectedOccasionFilter = 'all';
        const inp = root.querySelector('#inpDashSearch');
        if (inp) {
          inp.value = '';
          inp.focus();
        }
        const clearBtn = root.querySelector('#btnClearNavSearch');
        if (clearBtn) clearBtn.remove();
        root.querySelectorAll('.dash-filter-pill').forEach(p => p.classList.toggle('active', p.dataset.occFilter === 'all'));
        this.updateCreationsGrid(root);
        return;
      }
      // 1. Avatar click -> Open Profile Modal
      if (e.target.closest('#btnDashUserAvatar')) {
        this.openProfileModal();
        return;
      }

      // 2. Close Profile Modal
      if (e.target.closest('#btnCloseProfileModal') || e.target.closest('#btnCancelProfile') || e.target.id === 'profileModalBackdrop') {
        this.closeProfileModal();
        return;
      }

      // 3. Save Profile
      if (e.target.closest('#btnSaveProfile')) {
        const newName = document.querySelector('#profDisplayNameInput')?.value;
        try {
          this.user = await authRepository.updateProfile(newName);
          Toast.show('Profile updated successfully!', 'success');
          this.closeProfileModal();
          // Update avatar initial and greeting dynamically in place
          const avatarBtn = root.querySelector('#btnDashUserAvatar .avatar-initial');
          if (avatarBtn) avatarBtn.textContent = this.getUserInitial();
          const welcomeTitle = root.querySelector('#dashWelcomeHero .welcome-title');
          if (welcomeTitle) welcomeTitle.textContent = this.getDynamicGreeting();
        } catch (err) {
          Toast.show(err.message || 'Failed to update profile.', 'error');
        }
        return;
      }

      // 4. Logout Action
      if (e.target.closest('#btnProfileLogout') || e.target.closest('#btnDashLogout')) {
        this.closeProfileModal();
        authRepository.logout();
        Toast.show('Logged out successfully.', 'info');
        this.onLogout();
        return;
      }

      // 5. Onboarding Guide Modal
      if (e.target.closest('#btnDashOnboardingHelp')) {
        const onboardingModal = new CreatorOnboardingView(() => {});
        document.body.appendChild(onboardingModal.render());
        return;
      }

      // 6. Navigation Tabs Click (Switches ONLY Content Area without layout shifting)
      const tabBtn = e.target.closest('.dash-nav-tab');
      if (tabBtn) {
        const newTab = tabBtn.dataset.tab;
        await this.switchTab(newTab);
        return;
      }

      // 7. Start From Blank / Create A Design
      if (e.target.closest('#btnDashNewCelebration') || e.target.closest('#btnStartFromBlank') || e.target.closest('#btnCreateNewDesign') || e.target.closest('#btnEmptyStateCreateDesign')) {
        window.location.hash = '#wizard';
        return;
      }

      // 8. Empty Links -> Go to Creations Tab
      if (e.target.closest('#btnEmptyLinksGoCreations')) {
        await this.switchTab('my_creations');
        return;
      }

      // 9. Occasion filter pill in My Creations
      const occPill = e.target.closest('.dash-filter-pill');
      if (occPill) {
        this.selectedOccasionFilter = occPill.dataset.occFilter;
        root.querySelectorAll('.dash-filter-pill').forEach(p => p.classList.toggle('active', p === occPill));
        this.updateCreationsGrid(root);
        return;
      }

      // 10. Preset Category Filter Pills
      const presetCatBtn = e.target.closest('.btn-preset-cat-filter');
      if (presetCatBtn) {
        this.activePresetCategory = presetCatBtn.dataset.presetCat;
        const tabBody = root.querySelector('#dashTabBody');
        if (tabBody) {
          tabBody.innerHTML = await this.renderTabContent();
        }
        return;
      }

      // 11. Edit Project Draft
      const btnEdit = e.target.closest('.btn-edit-proj');
      if (btnEdit) {
        this.onNavigateEditor(btnEdit.dataset.projId);
        return;
      }

      // 12. Preview Project
      const btnPrev = e.target.closest('.btn-preview-proj');
      if (btnPrev) {
        const projId = btnPrev.dataset.projId;
        const proj = (await projectRepository.getProject(projId)) || this.projects.find(p => p.id === projId);
        if (proj) {
          const player = new PreviewPlayerView(proj);
          const playerElem = await player.render();
          document.body.appendChild(playerElem);
        } else {
          Toast.show('Unable to load preview.', 'warning');
        }
        return;
      }

      // 13. Duplicate Project Draft
      const btnDup = e.target.closest('.btn-dup-proj');
      if (btnDup) {
        const targetProj = await projectRepository.getProject(btnDup.dataset.projId);
        if (targetProj) {
          const dupProj = JSON.parse(JSON.stringify(targetProj));
          dupProj.id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          dupProj.title = `Copy of ${targetProj.title || 'Celebration'}`;
          dupProj.createdAt = Date.now();
          dupProj.updatedAt = Date.now();

          dupProj.scenes = (dupProj.scenes || []).map(s => {
            const sc = JSON.parse(JSON.stringify(s));
            sc.id = `sc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            return sc;
          });

          await projectRepository.saveProject(dupProj, this.user?.id);
          CreatorActivityService.logActivity('Project Duplicated', dupProj.recipient?.name, '📋');
          Toast.show('Celebration draft duplicated!', 'success');
          await this.loadData();
          this.updateCountsBadge(root);
          this.updateCreationsGrid(root);
        }
        return;
      }

      // 14. Delete Project Draft
      const btnDel = e.target.closest('.btn-delete-proj');
      if (btnDel) {
        const confirmed = await Toast.confirm('Are you sure you want to delete this celebration project?', 'Delete Project');
        if (confirmed) {
          await projectRepository.deleteProject(btnDel.dataset.projId);
          await this.loadData();
          Toast.show('Project deleted.', 'info');
          this.updateCountsBadge(root);
          const tabBody = root.querySelector('#dashTabBody');
          if (tabBody) {
            tabBody.innerHTML = await this.renderTabContent();
          }
        }
        return;
      }

      // 15. Preset Preview Modal
      const btnPresetPrev = e.target.closest('.btn-preview-preset');
      if (btnPresetPrev) {
        e.stopPropagation();
        const presetId = btnPresetPrev.dataset.presetId;
        const preset = PresetRegistry.getPresetById(presetId);
        if (preset) {
          const previewModal = new PresetPreviewView({
            preset,
            onUsePreset: (p) => this.openPresetDetail(p)
          });
          document.body.appendChild(previewModal.render());
        }
        return;
      }

      // 16. Use Preset Button / Card Click
      const btnUsePreset = e.target.closest('.btn-use-preset');
      if (btnUsePreset) {
        const presetId = btnUsePreset.dataset.presetId;
        const preset = PresetRegistry.getPresetById(presetId);
        if (preset) {
          this.openPresetDetail(preset);
        }
        return;
      }

      const presetCard = e.target.closest('.preset-card-item');
      if (presetCard && !e.target.closest('button')) {
        const presetId = presetCard.dataset.presetId;
        const preset = PresetRegistry.getPresetById(presetId);
        if (preset) {
          this.openPresetDetail(preset);
        }
        return;
      }

      // 17. Copy Link URL
      const btnCopy = e.target.closest('.btn-copy-link');
      if (btnCopy) {
        const url = btnCopy.dataset.url;
        navigator.clipboard.writeText(url).then(() => {
          Toast.show('Recipient link copied to clipboard! 📋', 'success');
        }).catch(() => {
          Toast.show('Failed to copy. Please select manually.', 'error');
        });
        return;
      }

      // 18. Share Public Link
      const btnShare = e.target.closest('.btn-share-pub');
      if (btnShare) {
        const url = btnShare.dataset.url;
        if (navigator.share) {
          navigator.share({
            title: 'Aura Birthday Studio Celebration',
            text: 'Check out this personalized celebration experience!',
            url: url
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(url);
          Toast.show('Link copied to clipboard! Ready to share.', 'success');
        }
        return;
      }

      // 19. Republish Link (Choose 1, 3, 5, 7 Days Expiration Window)
      const btnRepub = e.target.closest('.btn-republish-pub');
      if (btnRepub) {
        const pubId = btnRepub.dataset.pubId;
        const pubMeta = await publishedProjectRepository.getPublicationMetadata(pubId);
        const repubModal = new RepublishDurationModal(pubMeta, async (selectedDays = 3) => {
          await publishedProjectRepository.setPublicationDuration(pubId, selectedDays);
          await this.loadData();
          CreatorActivityService.logActivity('Celebration Link Republished', pubMeta?.id || pubId, '🔄');
          Toast.show(`Celebration link active for ${selectedDays} day(s)! 🚀`, 'success');
          this.updateCountsBadge(root);
          const tabBody = root.querySelector('#dashTabBody');
          if (tabBody) {
            tabBody.innerHTML = await this.renderTabContent();
          }
        });
        document.body.appendChild(repubModal.render());
        return;
      }

      // 20. Delete Public Link
      const btnDelPub = e.target.closest('.btn-delete-pub');
      if (btnDelPub) {
        const confirmed = await Toast.confirm('Remove this published link? The creator draft project will remain intact.', 'Delete Publication');
        if (confirmed) {
          await publishedProjectRepository.deletePublication(btnDelPub.dataset.pubId);
          await this.loadData();
          CreatorActivityService.logActivity('Publication Link Deleted', btnDelPub.dataset.pubId, '🗑️');
          Toast.show('Publication link deleted.', 'info');
          this.updateCountsBadge(root);
          const tabBody = root.querySelector('#dashTabBody');
          if (tabBody) {
            tabBody.innerHTML = await this.renderTabContent();
          }
        }
        return;
      }

      // 21. Clear Filters
      if (e.target.closest('#btnClearDashFilters')) {
        this.searchQuery = '';
        this.selectedOccasionFilter = 'all';
        this.updateCreationsGrid(root);
        return;
      }
    });
  }

  updateCreationsGrid(root) {
    const grid = root.querySelector('#celebrationsGrid');
    if (grid) {
      const filtered = this.getFilteredProjects();
      if (filtered.length > 0) {
        grid.innerHTML = filtered.map((p, idx) => this.renderProjectCard(p, idx)).join('');
      } else {
        grid.innerHTML = `
          <div class="no-results-box" style="grid-column: 1 / -1; padding:40px; text-align:center; color:var(--text-muted);">
            <div style="font-size:2.5rem; margin-bottom:8px;">🔍</div>
            <h3>No matching celebrations found</h3>
            <p>Try searching for a different name or clearing filters.</p>
            <button class="btn btn-secondary margin-top-sm" id="btnClearDashFilters">Clear Filters</button>
          </div>
        `;
      }
    }
  }

  updateCountsBadge(root) {
    const badgeCreations = root.querySelector('#badgeCreationsCount');
    if (badgeCreations) badgeCreations.textContent = this.projects.length;
    const badgeLinks = root.querySelector('#badgeLinksCount');
    if (badgeLinks) badgeLinks.textContent = this.publications.length;
  }

  openPresetDetail(preset) {
    const detailView = new PresetDetailView(preset, (selectedPreset, variantKey) => {
      const personalizeView = new PresetPersonalizationView(
        selectedPreset,
        variantKey,
        this.user,
        (projectId) => {
          this.onNavigateEditor(projectId);
        }
      );
      document.body.appendChild(personalizeView.render());
    });

    document.body.appendChild(detailView.render());
  }
}

async function dbService_getAllPubs() {
  const list = await dbService.getAll('published_projects');
  return list.sort((a, b) => b.publishedAt - a.publishedAt);
}

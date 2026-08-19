/**
 * Birthday Studio - Modern Wish Wall Scene Template
 * Dynamic Runtime Data Renderer for Approved Wishes, Custom Themes, Layouts, Interactive Reaction Pills & Counter
 */

export function renderWishWallSceneTemplate(scene = {}, project = {}, assets = [], options = {}) {
  const projectId = project?.id || '';
  const wishWallConfig = project?.wishWall || {};
  const sceneSettings = scene?.settings || {};
  const recipientName = project?.recipient?.name || 'Someone Special';
  const occasion = project?.occasion || 'birthday';

  // Config properties with fallback defaults
  const theme = sceneSettings.wallTheme || wishWallConfig.theme || 'glassmorphic';
  const layout = sceneSettings.wallLayout || wishWallConfig.layout || 'grid';
  const headerIcon = sceneSettings.headerIcon || wishWallConfig.headerIcon || '💌';
  
  let title = sceneSettings.titleText || sceneSettings.title || wishWallConfig.title || `Wishes for {{recipientName}}`;
  title = title.replace(/\{\{recipientName\}\}/gi, recipientName)
               .replace(/\{\{occasion\}\}/gi, occasion.charAt(0).toUpperCase() + occasion.slice(1));

  let subtitle = sceneSettings.subtitleText || sceneSettings.subtitle || wishWallConfig.subtitle || `Leave your warmest thoughts, sweet memories, and congratulations below.`;
  subtitle = subtitle.replace(/\{\{recipientName\}\}/gi, recipientName);

  const displayMode = sceneSettings.displayMode || wishWallConfig.displayMode || 'counter-and-wishes';
  const showReactions = sceneSettings.showReactions !== false && wishWallConfig.showReactions !== false;
  const showTags = sceneSettings.showTags !== false;
  const showCta = sceneSettings.showCta !== false && wishWallConfig.enabled !== false;
  const ambience = sceneSettings.ambience || wishWallConfig.ambience || 'sparkles';

  // Determine if sample wishes should be included
  // Strictly OPTIONAL: Only included if explicitly set to true in sceneSettings or wishWallConfig
  const includeSampleWishes = sceneSettings.includeSampleWishes === true || (sceneSettings.includeSampleWishes !== false && wishWallConfig.includeSampleWishes === true);

  // Resolve wishes: either passed via options, scene, or live approved wishes
  let approvedWishes = Array.isArray(options.wishes) ? options.wishes : (Array.isArray(scene.wishes) ? scene.wishes : []);
  
  let displayWishes = approvedWishes;

  if (approvedWishes.length === 0 && includeSampleWishes) {
    if (Array.isArray(sceneSettings.sampleWishes) && sceneSettings.sampleWishes.length > 0) {
      displayWishes = sceneSettings.sampleWishes;
    } else {
      displayWishes = [
        {
          id: 'sample_wish_1',
          name: 'Close Friends',
          isAnonymous: false,
          relationship: 'Friends',
          message: `Happy ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}, ${recipientName}! May this year bring you endless joy, laughter, and unforgettable adventures! 🎉✨`,
          isPinned: true,
          reactions: { '❤️': 14, '🎉': 9, '🎂': 6 },
          createdAt: Date.now() - 1000 * 60 * 35
        },
        {
          id: 'sample_wish_2',
          name: 'Family Member',
          isAnonymous: false,
          relationship: 'Family',
          message: `So proud of everything you have achieved. Wishing you health, happiness, and prosperity always! ❤️🥂`,
          isPinned: false,
          reactions: { '❤️': 8, '👏': 5 },
          createdAt: Date.now() - 1000 * 60 * 120
        },
        {
          id: 'sample_wish_3',
          name: 'Anonymous',
          isAnonymous: true,
          relationship: 'Well-Wisher',
          message: `Keep shining bright like the absolute star you are! Have the most wonderful day! ✨🌟`,
          isPinned: false,
          reactions: { '🌟': 11, '❤️': 7 },
          createdAt: Date.now() - 1000 * 60 * 240
        },
        {
          id: 'sample_wish_4',
          name: 'College Friends',
          isAnonymous: false,
          relationship: 'Friends',
          message: `Can't wait to celebrate tonight! Here is to creating many more wonderful memories together! 🥳🥂🎂`,
          isPinned: false,
          reactions: { '🎉': 12, '🎂': 8 },
          createdAt: Date.now() - 1000 * 60 * 360
        }
      ];
    }
  }

  const wishCount = approvedWishes.length > 0 ? approvedWishes.length : (includeSampleWishes ? displayWishes.length : 0);

  // Dynamic counter text calculation
  let counterText = sceneSettings.customCounterText || '';
  if (!counterText) {
    if (wishCount === 0) {
      counterText = '💌 Be the first to leave a wish';
    } else if (wishCount === 1) {
      counterText = '💌 1 person sent warm wishes';
    } else if (wishCount > 1 && wishCount < 100) {
      counterText = `💌 ${wishCount} people are thinking of you today ❤️`;
    } else {
      counterText = `💌 ${wishCount}+ people sent their love & blessings ❤️`;
    }
  } else {
    counterText = counterText.replace(/\{count\}/gi, `${wishCount}`);
  }

  const showCounter = displayMode !== 'wishes-only';
  const showCards = displayMode !== 'counter-only';

  // Map layout class
  let layoutClass = 'wish-cards-grid';
  if (layout === 'masonry') layoutClass = 'wish-cards-masonry';
  else if (layout === 'pinboard') layoutClass = 'wish-cards-pinboard';
  else if (layout === 'spotlight') layoutClass = 'wish-cards-spotlight';

  // Ambience particles HTML
  let ambienceHtml = '';
  if (ambience === 'sparkles') {
    ambienceHtml = `
      <div class="wish-wall-ambience-layer">
        <div class="ambient-particle" style="top:15%; left:10%; width:6px; height:6px; background:#ffd700; box-shadow:0 0 10px #ffd700;"></div>
        <div class="ambient-particle" style="top:25%; right:12%; width:8px; height:8px; background:#a29bfe; animation-delay:1.5s; box-shadow:0 0 12px #a29bfe;"></div>
        <div class="ambient-particle" style="top:70%; left:15%; width:5px; height:5px; background:#ff758c; animation-delay:3s;"></div>
        <div class="ambient-particle" style="top:80%; right:20%; width:7px; height:7px; background:#00f2fe; animation-delay:2s;"></div>
      </div>
    `;
  } else if (ambience === 'hearts') {
    ambienceHtml = `
      <div class="wish-wall-ambience-layer">
        <div class="ambient-particle" style="top:20%; left:8%; font-size:18px; animation-delay:0.5s;">💖</div>
        <div class="ambient-particle" style="top:30%; right:10%; font-size:16px; animation-delay:2s;">❤️</div>
        <div class="ambient-particle" style="top:75%; left:12%; font-size:20px; animation-delay:3.5s;">💕</div>
        <div class="ambient-particle" style="top:65%; right:15%; font-size:14px; animation-delay:1.2s;">✨</div>
      </div>
    `;
  }

  // Format relative timestamp helper
  const formatTimeAgo = (ts) => {
    if (!ts) return 'Recently';
    const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return `
    <div class="template-container wish-wall-scene-container theme-wall-${theme}" id="wishWallSceneRoot">
      ${ambienceHtml}

      <!-- Header Section -->
      <div class="wish-wall-scene-header">
        <div class="wish-wall-icon" id="wishWallIcon">${headerIcon}</div>
        <h2 class="wish-wall-title" id="wishWallTitle">${title}</h2>
        ${subtitle ? `<p class="wish-wall-subtitle" id="wishWallSubtitle">${subtitle}</p>` : ''}
        
        ${showCounter ? `
          <div class="wish-wall-counter-badge" id="wishCounterBadge">
            <span class="counter-pulse-dot"></span>
            <span>${counterText}</span>
          </div>
        ` : ''}
      </div>

      <!-- Cards Grid / Layout Section -->
      ${showCards ? `
        <div class="wish-cards-container ${layoutClass}" id="wishCardsGrid">
          ${displayWishes.length > 0 ? displayWishes.map((wish, index) => {
            const displayName = wish.isAnonymous ? 'Anonymous' : (wish.name || 'Friend');
            const initial = wish.isAnonymous ? '❤️' : (displayName.charAt(0).toUpperCase() || 'A');
            const tag = wish.relationship || (wish.isAnonymous ? 'Secret Friend' : 'Well-Wisher');
            const isPinned = wish.isPinned || false;
            const timeAgo = formatTimeAgo(wish.createdAt);
            const reactions = wish.reactions || { '❤️': 1 };

            return `
              <div class="wish-card-item ${isPinned ? 'is-pinned' : ''}" data-wish-id="${wish.id || index}">
                ${isPinned ? `<span class="pinned-badge-chip">📌 Featured Wish</span>` : ''}
                
                <div class="wish-card-header">
                  <div class="wish-avatar">${initial}</div>
                  <div class="wish-header-meta">
                    <div class="wish-author-row">
                      <span class="wish-author">${displayName}</span>
                      ${showTags ? `<span class="wish-tag-badge">${tag}</span>` : ''}
                    </div>
                    <span class="wish-time-badge">${timeAgo}</span>
                  </div>
                </div>

                <div class="wish-card-body">
                  <div class="wish-message-body">${wish.message || ''}</div>
                </div>

                ${showReactions ? `
                  <div class="wish-reactions-bar">
                    ${Object.entries(reactions).map(([emoji, count]) => `
                      <button class="wish-reaction-pill" data-emoji="${emoji}" data-wish-id="${wish.id || index}" title="React with ${emoji}">
                        <span>${emoji}</span>
                        <span class="reaction-count">${count}</span>
                      </button>
                    `).join('')}
                    <button class="wish-reaction-pill btn-add-reaction" data-wish-id="${wish.id || index}" title="Add a reaction">
                      <span>➕</span>
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('') : `
            <div class="wish-empty-state" style="text-align:center; padding:32px 20px; color:var(--text-muted);">
              <div class="wish-empty-icon">💌</div>
              <h4 style="font-weight:700; margin-bottom:6px; color:var(--text-main);">No wishes yet!</h4>
              <p style="font-size:0.85rem; max-width:320px; margin:0 auto 16px auto;">Click below to send the very first celebration wish to ${recipientName}.</p>
            </div>
          `}
        </div>
      ` : ''}

      <!-- Bottom Action CTA -->
      ${showCta ? `
        <div class="wish-wall-action-bar">
          <button class="leave-wish-trigger-btn" id="btnOpenLeaveWishModal">
            <span>💌</span>
            <span>Leave a ${occasion ? (occasion.charAt(0).toUpperCase() + occasion.slice(1)) : 'Celebration'} Wish</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export const WishWallSceneTemplate = {
  render: renderWishWallSceneTemplate
};


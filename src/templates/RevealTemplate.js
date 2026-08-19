import { getOccasionThemeDetails } from '../data/Occasions.js';
import { renderTextElementHTML } from './TextElementHelper.js';

export function renderRevealTemplate(scene, project, assets = []) {
  const occTheme = getOccasionThemeDetails(project?.occasion);
  const assignedSlotId = scene.slots?.reveal_photo || scene.slots?.hero_photo || (Array.isArray(scene.assetIds) ? scene.assetIds[0] : null);
  const assignedAsset = assignedSlotId ? assets.find(a => a.id === assignedSlotId) : null;
  const revealImage = scene.media?.revealImage?.src || scene.settings?.revealPhotoUrl || scene.settings?.photoUrl || assignedAsset?.renderUrl || assets.find(a => a.type === 'image')?.renderUrl || occTheme.revealStockPhoto;
  const recipientName = project?.recipient?.name || 'Someone Special';
  const age = project?.recipient?.age ? ` (${project.recipient.age}th Milestone)` : '';

  const defaultBadge = scene.settings?.badgeText !== undefined ? scene.settings.badgeText : `${occTheme.icon} BIG REVEAL ${occTheme.icon}`;
  const titleText = scene.settings?.titleText !== undefined ? scene.settings.titleText : `${recipientName}${age}`;
  const subtitleText = scene.settings?.subtitleText !== undefined ? scene.settings.subtitleText : occTheme.defaultMessage;
  const customBg = scene.settings?.bgGradient;
  const bgStyle = customBg ? `background: ${customBg};` : `background: var(--style-gradient, ${occTheme.revealGradient});`;

  return `
    <div class="template-container reveal-template" style="${bgStyle}">
      <div class="reveal-badge-pulse-wrapper">${renderTextElementHTML(scene, 'badge', defaultBadge, 'reveal-badge-pulse')}</div>
      <h2 class="reveal-heading-wrapper">${renderTextElementHTML(scene, 'title', titleText, 'reveal-heading')}</h2>

      <div class="reveal-card">
        <img src="${revealImage}" class="reveal-photo" alt="Reveal Photo" />
        <div class="reveal-text-overlay">
          <p class="reveal-text-p">${renderTextElementHTML(scene, 'subtitle', subtitleText, 'reveal-subtitle')}</p>
        </div>
      </div>
    </div>
  `;
}

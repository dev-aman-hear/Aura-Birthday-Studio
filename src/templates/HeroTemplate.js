import { getOccasionThemeDetails } from '../data/Occasions.js';
import { renderTextElementHTML } from './TextElementHelper.js';

export function renderHeroTemplate(scene, project, assets = []) {
  const occTheme = getOccasionThemeDetails(project?.occasion);
  const assignedSlotId = scene.slots?.hero_image || scene.slots?.hero_photo || scene.settings?.heroPhotoAssetId || scene.settings?.photoAssetId || (Array.isArray(scene.assetIds) ? scene.assetIds[0] : null);
  const assignedAsset = assignedSlotId ? assets.find(a => a.id === assignedSlotId) : null;
  const heroImage = scene.media?.heroImage?.src || scene.settings?.heroPhotoUrl || scene.settings?.photoUrl || assignedAsset?.renderUrl || assets.find(a => a.type === 'image')?.renderUrl || occTheme.heroStockPhoto;
  const recipientName = project?.recipient?.name || 'Recipient Name';

  const defaultBadge = scene.settings?.badgeText !== undefined ? scene.settings.badgeText : '👑';
  const defaultTitle = scene.settings?.titleText !== undefined ? scene.settings.titleText : (scene.settings?.title !== undefined ? scene.settings.title : (recipientName ? recipientName.toUpperCase() : 'CELEBRATION'));
  const defaultSub = scene.settings?.subtitleText !== undefined ? scene.settings.subtitleText : (scene.settings?.subtitle !== undefined ? scene.settings.subtitle : 'Get ready for a visual celebration');
  const scriptNote = scene.settings?.scriptNote !== undefined ? scene.settings.scriptNote : 'made just for you.';
  const customBg = scene.settings?.bgGradient || scene.settings?.bgColor;
  const bgStyle = customBg ? `background: ${customBg};` : (heroImage && scene.settings?.showHeroAsBg ? `background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${heroImage}') center/cover no-repeat;` : `background: var(--style-gradient, ${occTheme.bgGradient});`);

  return `
    <div class="template-container hero-template" style="${bgStyle}">
      <!-- Atmospheric Backdrop Overlays -->
      <div class="hero-ambiance-glow"></div>
      <div class="hero-gold-balloons-left"></div>
      <div class="hero-gold-balloons-right"></div>

      <div class="hero-content">
        <div class="hero-badge-wrapper">${renderTextElementHTML(scene, 'badge', defaultBadge, 'hero-badge')}</div>
        <h1 class="hero-title-wrapper">${renderTextElementHTML(scene, 'title', defaultTitle, 'hero-title')}</h1>
        <div class="hero-ornament-divider"><span>❖</span></div>
        <p class="hero-subtitle-wrapper">${renderTextElementHTML(scene, 'subtitle', defaultSub, 'hero-subtitle')}</p>
        <div class="hero-script-note">${renderTextElementHTML(scene, 'scriptNote', scriptNote, 'hero-script-note')}</div>
      </div>
    </div>
  `;
}



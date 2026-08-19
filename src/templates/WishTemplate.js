import { getOccasionThemeDetails } from '../data/Occasions.js';
import { renderTextElementHTML } from './TextElementHelper.js';

export function renderWishTemplate(scene, project, assets = []) {
  const occTheme = getOccasionThemeDetails(project?.occasion);
  const wishTitle = scene.settings?.titleText !== undefined ? scene.settings.titleText : (occTheme.wishTitle || 'Warmest Wishes!');
  const wishSubtitle = scene.settings?.subtitleText !== undefined ? scene.settings.subtitleText : (occTheme.wishSubtitle || 'Wishing you continuous happiness, success, and joy!');
  const btnText = scene.settings?.buttonText !== undefined ? scene.settings.buttonText : 'Replay';
  const customBg = scene.settings?.bgGradient;
  const bgStyle = customBg ? `background: ${customBg};` : `background: var(--style-gradient, ${occTheme.bgGradient});`;

  return `
    <div class="template-container final-wish-template" style="${bgStyle}">
      <div class="wish-cake-icon">${occTheme.icon}</div>
      <h1 class="wish-title" style="font-family: var(--style-heading-font); color: var(--style-text); letter-spacing: var(--style-heading-spacing);">${renderTextElementHTML(scene, 'title', wishTitle, 'wish-title-text')}</h1>
      <p class="wish-message" style="font-family: var(--style-body-font); color: var(--style-text-muted);">${renderTextElementHTML(scene, 'subtitle', wishSubtitle, 'wish-message-text')}</p>

      <button class="replay-experience-btn" id="btnReplayExperience" data-action="replay" title="Replay Celebration">
        <span>↻</span> <span>${btnText}</span>
      </button>
    </div>
  `;
}

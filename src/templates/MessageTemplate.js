import { getOccasionThemeDetails } from '../data/Occasions.js';
import { renderTextElementHTML } from './TextElementHelper.js';
import { renderCollageTemplate } from './CollageTemplate.js';
import { renderFullscreenTemplate } from './FullscreenTemplate.js';
import { renderWishTemplate } from './WishTemplate.js';

export function renderMessageTemplate(scene, project, assets = []) {
  const occTheme = getOccasionThemeDetails(project?.occasion);
  const textAsset = assets.find(a => a.type === 'text');
  const messageText = scene.settings?.subtitleText !== undefined ? scene.settings.subtitleText : (scene.settings?.textContent !== undefined ? scene.settings.textContent : (scene.settings?.messageText !== undefined ? scene.settings.messageText : (textAsset?.metadata?.textContent || occTheme.defaultMessage)));
  const signatureText = scene.settings?.signatureText !== undefined ? scene.settings.signatureText : (scene.settings?.signature !== undefined ? scene.settings.signature : (project?.creator?.name ? `— With love, ${project.creator.name}` : '— With love, Your Name'));
  const customBg = scene.settings?.bgGradient;
  const bgStyle = customBg ? `background: ${customBg};` : `background: var(--style-gradient, ${occTheme.bgGradient});`;

  return `
    <div class="template-container message-template" style="${bgStyle}">
      <div class="message-quote-card">
        <div class="quote-mark">“</div>
        <p class="message-quote-text">${renderTextElementHTML(scene, 'subtitle', messageText, 'message-quote-text')}</p>
        <div class="message-signature">${renderTextElementHTML(scene, 'signature', signatureText, 'message-signature')}</div>
      </div>
    </div>
  `;
}

// Backward compatibility re-exports
export { renderCollageTemplate, renderFullscreenTemplate, renderWishTemplate };

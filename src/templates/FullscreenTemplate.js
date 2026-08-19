import { renderTextElementHTML } from './TextElementHelper.js';

export function renderFullscreenTemplate(scene, project, assets = []) {
  const assignedSlotId = scene.slots?.fullscreen_image || scene.slots?.hero_photo || (Array.isArray(scene.assetIds) ? scene.assetIds[0] : null);
  const img = (assignedSlotId ? assets.find(a => a.id === assignedSlotId) : null) || assets.find(a => a.type === 'image');
  const bgUrl = scene.media?.fullscreenImage?.src || scene.settings?.photoUrl || img?.renderUrl || 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80';
  const captionText = scene.settings?.titleText !== undefined ? scene.settings.titleText : (scene.settings?.captionText !== undefined ? scene.settings.captionText : 'Forever Cherished');

  return `
    <div class="template-container fullscreen-template" style="background-image: url('${bgUrl}')">
      <div class="fullscreen-overlay">
        <h2 class="fullscreen-caption" style="font-family: var(--style-heading-font); letter-spacing: var(--style-heading-spacing);">${renderTextElementHTML(scene, 'title', captionText, 'fullscreen-caption')}</h2>
      </div>
    </div>
  `;
}

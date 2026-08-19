import { renderTextElementHTML } from './TextElementHelper.js';

export function renderCollageTemplate(scene, project, assets = []) {
  let collageImgs = [];
  if (scene.media?.collageImages && Array.isArray(scene.media.collageImages) && scene.media.collageImages.length > 0) {
    collageImgs = scene.media.collageImages.map((img, idx) => ({
      id: img.id || `collage-item-${idx}`,
      renderUrl: img.src || img.renderUrl
    }));
  } else if (scene.slots?.collage_images || scene.slots?.photos) {
    const slotVal = scene.slots.collage_images || scene.slots.photos;
    const ids = Array.isArray(slotVal) ? slotVal : [slotVal];
    collageImgs = ids.map(id => assets.find(a => a.id === id)).filter(Boolean);
  } else if (scene.assetIds && scene.assetIds.length > 0) {
    collageImgs = scene.assetIds.map(id => assets.find(a => a.id === id)).filter(a => a && a.type === 'image');
  }

  if (collageImgs.length === 0) {
    const images = assets.filter(a => a.type === 'image');
    collageImgs = images.length > 0 ? images : [
      { renderUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80' },
      { renderUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80' },
      { renderUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80' }
    ];
  }
  const customBg = scene.settings?.bgGradient;
  const bgStyle = customBg ? `background: ${customBg};` : `background: var(--style-gradient, linear-gradient(135deg, #1f1235 0%, #110826 100%));`;
  const titleText = scene.settings?.titleText !== undefined ? scene.settings.titleText : '🎨 Photo Collage';

  return `
    <div class="template-container collage-template" style="${bgStyle}">
      <h2 style="font-family: var(--style-heading-font); color: var(--style-text);">${renderTextElementHTML(scene, 'title', titleText, 'collage-title')}</h2>
      <div class="collage-mesh">
        ${collageImgs.map((img, idx) => `
          <div class="collage-item collage-tilt-${(idx % 3) + 1}" data-collage-id="${img.id || `collage-item-${idx}`}">
            <img src="${img.renderUrl}" alt="Collage Photo" />
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

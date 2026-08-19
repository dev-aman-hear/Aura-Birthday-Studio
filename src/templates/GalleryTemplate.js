import { renderTextElementHTML } from './TextElementHelper.js';

export function renderGalleryTemplate(scene, project, assets = []) {
  let displayImages = [];
  if (scene.media?.images && Array.isArray(scene.media.images) && scene.media.images.length > 0) {
    displayImages = scene.media.images.map((img, idx) => ({
      id: img.id || `gallery-img-${idx}`,
      renderUrl: img.src || img.renderUrl,
      name: img.caption || img.name || `Memory ${idx + 1}`
    }));
  } else if (scene.slots?.gallery_photos || scene.slots?.gallery_images || scene.slots?.photos) {
    const slotVal = scene.slots.gallery_photos || scene.slots.gallery_images || scene.slots.photos;
    const ids = Array.isArray(slotVal) ? slotVal : [slotVal];
    displayImages = ids.map(id => assets.find(a => a.id === id)).filter(Boolean);
  } else if (scene.assetIds && scene.assetIds.length > 0) {
    displayImages = scene.assetIds.map(id => assets.find(a => a.id === id)).filter(a => a && a.type === 'image');
  }

  if (displayImages.length === 0) {
    const images = assets.filter(a => a.type === 'image');
    displayImages = images.length > 0 ? images : [
      { renderUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80', name: 'Memory 1' },
      { renderUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', name: 'Memory 2' },
      { renderUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80', name: 'Memory 3' }
    ];
  }

  const titleText = scene.settings?.titleText !== undefined ? scene.settings.titleText : '🖼️ Precious Memories';
  const subtitleText = scene.settings?.subtitleText !== undefined ? scene.settings.subtitleText : 'A collection of beautiful moments shared together';

  return `
    <div class="template-container gallery-template">
      <div class="gallery-header">
        <h2>${renderTextElementHTML(scene, 'title', titleText, 'gallery-title')}</h2>
        <p>${renderTextElementHTML(scene, 'subtitle', subtitleText, 'gallery-subtitle')}</p>
      </div>

      <div class="gallery-grid">
        ${displayImages.map((img, idx) => `
          <div class="gallery-card" data-image-id="${img.id || `gallery-img-${idx}`}">
            <img src="${img.renderUrl}" alt="${img.name || 'Memory'}" />
            <div class="gallery-card-caption">${img.name || `Special Memory ${idx + 1}`}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Memory Timeline Scene Template
 * Fixed-dimension photo containers with object-fit: cover cropping (Section 7)
 */

import { getOccasionThemeDetails } from '../data/Occasions.js';
import { renderTextElementHTML } from './TextElementHelper.js';

export function renderTimelineTemplate(scene = {}, project = {}, assets = []) {
  const occTheme = getOccasionThemeDetails(project?.occasion);
  let timelineItems = [];
  if (scene.media?.timelinePhotos && Array.isArray(scene.media.timelinePhotos) && scene.media.timelinePhotos.length > 0) {
    timelineItems = scene.media.timelinePhotos.map((p, idx) => ({
      id: p.id || `timeline-photo-${idx}`,
      renderUrl: p.src || p.renderUrl,
      name: p.caption || p.name || `Chapter ${idx + 1}`
    }));
  } else if (scene.slots?.timeline_photos || scene.slots?.timeline_images) {
    const slotVal = scene.slots.timeline_photos || scene.slots.timeline_images;
    const ids = Array.isArray(slotVal) ? slotVal : [slotVal];
    timelineItems = ids.map(id => assets.find(a => a.id === id)).filter(Boolean);
  } else if (scene.assetIds && scene.assetIds.length > 0) {
    timelineItems = scene.assetIds.map(id => assets.find(a => a.id === id)).filter(a => a && a.type === 'image');
  }

  if (timelineItems.length === 0) {
    const photos = assets.filter(a => a?.type === 'image');
    timelineItems = photos.length > 0 ? photos : [
      { renderUrl: occTheme.heroStockPhoto || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80', name: 'Where it all started' },
      { renderUrl: occTheme.revealStockPhoto || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', name: 'Unforgettable moments' }
    ];
  }

  const titleText = scene.settings?.titleText !== undefined ? scene.settings.titleText : '⏳ Memory Timeline';
  const bg = scene.settings?.bgGradient || occTheme.bgGradient;

  return `
    <div class="template-container timeline-template" style="background: ${bg}">
      <h2 class="timeline-heading">${renderTextElementHTML(scene, 'title', titleText, 'timeline-heading-text')}</h2>
      <div class="timeline-stepper">
        ${timelineItems.map((item, idx) => `
          <div class="timeline-step">
            <div class="timeline-node">${idx + 1}</div>
            <div class="timeline-card">
              <div class="timeline-photo-wrapper">
                <img src="${item.renderUrl}" alt="${item.name || 'Memory'}" class="timeline-photo" />
              </div>
              <div class="timeline-caption">${item.name || `Chapter ${idx + 1}`}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

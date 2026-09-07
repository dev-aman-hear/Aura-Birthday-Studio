import { renderTextElementHTML } from './TextElementHelper.js';

export function renderVideoTemplate(scene, project, assets = []) {
  const assignedSlotId = scene.slots?.main_video || scene.slots?.video || scene.settings?.videoAssetId || (Array.isArray(scene.assetIds) ? scene.assetIds.find(id => assets.find(a => a.id === id)?.type === 'video') : null);
  const video = (assignedSlotId ? assets.find(a => a.id === assignedSlotId) : null) || assets.find(a => a.type === 'video');
  const videoUrl = scene.media?.video?.src || scene.settings?.videoUrl || video?.renderUrl || '';
  const titleText = scene.settings?.titleText !== undefined ? scene.settings.titleText : (scene.settings?.title || '🎬 Video Highlight');
  const recName = project?.recipient?.name || 'Someone Special';
  const subtitleText = scene.settings?.subtitleText !== undefined ? scene.settings.subtitleText : (scene.settings?.subtitle || `Special video dedicated to ${recName}`);
  const isAutoplay = scene.settings?.autoplay !== false;
  const isLoop = scene.settings?.loop !== false;
  const isMuted = scene.settings?.muted !== false;

  return `
    <div class="template-container video-template">
      <div class="video-header">
        <h2>${renderTextElementHTML(scene, 'title', titleText, 'video-title')}</h2>
        <p>${renderTextElementHTML(scene, 'subtitle', subtitleText, 'video-subtitle')}</p>
      </div>

      <div class="video-frame" data-element-id="video">
        ${videoUrl ? `
          <video controls ${isAutoplay ? 'autoplay' : ''} ${isLoop ? 'loop' : ''} ${isMuted ? 'muted' : ''} playsinline class="video-player" data-element-id="video">
            <source src="${videoUrl}" type="${video?.metadata?.mimeType || 'video/mp4'}" />
            Your browser does not support video tag.
          </video>
        ` : `
          <div class="video-placeholder">
            <div class="video-icon">🎥</div>
            <p>Upload a video in the Asset Library to feature it here!</p>
          </div>
        `}
      </div>
    </div>
  `;
}

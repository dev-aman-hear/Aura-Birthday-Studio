/**
 * Birthday Studio - Smart Auto Arrange Service (Section 11)
 * Rule-based asset-to-scene distribution algorithm
 */

import { assetRepository } from './AssetRepository.js';

export class AutoArrangeService {
  /**
   * Intelligently assigns unallocated assets into matching scene templates
   */
  static async autoArrangeProject(project) {
    if (!project || !project.scenes) return project;

    const allAssets = await assetRepository.getAssets(project.assetIds);
    const photos = allAssets.filter(a => a.type === 'image');
    const videos = allAssets.filter(a => a.type === 'video');
    const audio = allAssets.filter(a => a.type === 'audio');
    const textAssets = allAssets.filter(a => a.type === 'text');

    let photoIndex = 0;
    let videoIndex = 0;

    project.scenes.forEach(scene => {
      // Keep existing scene assets or clear if empty
      const existing = scene.assetIds || [];
      const newAssetIds = [...existing];

      if (scene.template === 'hero' && photos.length > photoIndex && newAssetIds.length < 10) {
        if (!newAssetIds.includes(photos[photoIndex].id)) {
          newAssetIds.push(photos[photoIndex].id);
          photoIndex++;
        }
      } else if (scene.template === 'reveal' && photos.length > photoIndex && newAssetIds.length < 10) {
        if (!newAssetIds.includes(photos[photoIndex].id)) {
          newAssetIds.push(photos[photoIndex].id);
          photoIndex++;
        }
      } else if ((scene.template === 'photo_gallery' || scene.template === 'collage' || scene.template === 'memory_timeline')) {
        while (photoIndex < photos.length && newAssetIds.length < 8) {
          if (!newAssetIds.includes(photos[photoIndex].id)) {
            newAssetIds.push(photos[photoIndex].id);
          }
          photoIndex++;
        }
      } else if (scene.template === 'video_showcase' && videos.length > videoIndex && newAssetIds.length < 10) {
        if (!newAssetIds.includes(videos[videoIndex].id)) {
          newAssetIds.push(videos[videoIndex].id);
          videoIndex++;
        }
      } else if (scene.template === 'message' && textAssets.length > 0 && newAssetIds.length < 10) {
        if (!newAssetIds.includes(textAssets[0].id)) {
          newAssetIds.push(textAssets[0].id);
        }
      }

      scene.assetIds = newAssetIds.slice(0, 10);
    });

    // Automatically set background music if available
    if (audio.length > 0 && !project.settings.bgMusicAssetId) {
      project.settings.bgMusicAssetId = audio[0].id;
    }

    return project;
  }
}

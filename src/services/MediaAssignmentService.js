/**
 * Birthday Studio - Media Assignment Service (Section 7 & 8)
 * Smart Asset Distribution & Zero-Asset Fallback Engine
 */

export class MediaAssignmentService {
  /**
   * Intelligently assigns uploaded media assets across project scenes
   */
  static assignMediaToScenes(scenes, uploadedAssetIds = []) {
    if (!scenes || scenes.length === 0) return scenes;

    if (!uploadedAssetIds || uploadedAssetIds.length === 0) {
      // Zero-asset fallback: maintain existing scene placeholders (Section 8)
      return scenes;
    }

    const imageAssetIds = uploadedAssetIds.filter(id => id.includes('photo') || id.includes('img') || id.includes('asset') || id.includes('sticker'));

    if (imageAssetIds.length === 0) return scenes;

    // Distribute images evenly across compatible gallery/photo scenes
    let assetIdx = 0;

    return scenes.map(scene => {
      const template = scene.template || 'hero';

      // Scenes designed to display images
      if (['hero', 'reveal', 'photo_gallery', 'memory_timeline', 'collage', 'fullscreen_photo', 'final_wish'].includes(template)) {
        if (assetIdx < imageAssetIds.length) {
          const assignCount = template === 'photo_gallery' || template === 'collage' ? 4 : 1;
          const assigned = imageAssetIds.slice(assetIdx, assetIdx + assignCount);
          assetIdx += assignCount;

          scene.assetIds = Array.from(new Set([...(scene.assetIds || []), ...assigned])).slice(0, 10);
        }
      }
      return scene;
    });
  }
}

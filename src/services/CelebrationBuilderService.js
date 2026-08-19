/**
 * Birthday Studio - Celebration Builder Service (Section 9)
 * Orchestrates Preset + Variant + Personalization + Style + Media -> Project
 */

import { PresetRegistry } from '../data/presets/PresetRegistry.js';
import { PresetService } from './PresetService.js';
import { StyleRegistry } from '../data/styles/StyleRegistry.js';
import { MediaAssignmentService } from './MediaAssignmentService.js';
import { projectRepository } from './ProjectRepository.js';

export class CelebrationBuilderService {
  /**
   * Main builder method generating a complete celebration project
   */
  static async buildCelebration(config = {}) {
    let presetId = config.presetId || 'birthday_wisher';
    const personalization = config.personalization || {};
    const styleId = config.styleId || 'style_party';
    const uploadedAssetIds = config.uploadedAssetIds || [];
    const creatorId = config.creatorId || null;
    const occasion = config.occasion;

    // Resolve matching preset for occasion if specified and presetId doesn't match occasion
    if (occasion) {
      const matchingPresets = PresetRegistry.getPresetsByOccasion(occasion);
      if (matchingPresets && matchingPresets.length > 0) {
        const curPreset = PresetRegistry.getPresetById(presetId);
        if (!curPreset || curPreset.occasion.toLowerCase() !== occasion.toLowerCase()) {
          presetId = matchingPresets[0].id;
        }
      }
    }

    const preset = PresetRegistry.getPresetById(presetId);
    const variant = config.variant || preset?.defaultVariant || (preset?.availableVariants ? preset.availableVariants[preset.availableVariants.length - 1] : '8-scene');
    const style = StyleRegistry.getStyleById(styleId);

    // 1. Generate base project and scene graph from preset blueprint
    const project = await PresetService.generateProjectFromPreset(
      preset,
      variant,
      personalization,
      creatorId,
      occasion
    );

    if (occasion) {
      project.occasion = occasion;
    }

    if (personalization.countdown) {
      project.countdown = {
        ...project.countdown,
        ...personalization.countdown
      };
    }

    // 2. Apply Visual Style Theme (Section 5)
    project.theme = style.id;
    project.settings.styleConfig = {
      name: style.name,
      colors: style.colors,
      typography: style.typography,
      animation: style.animation,
      transition: style.transition
    };

    // Apply style transition to generated scenes
    project.scenes.forEach(s => {
      s.transition = style.transition || s.transition;
    });

    // 3. Intelligently Assign Uploaded Assets (Section 8)
    if (uploadedAssetIds.length > 0) {
      project.assetIds = Array.from(new Set([...(project.assetIds || []), ...uploadedAssetIds]));
      project.scenes = MediaAssignmentService.assignMediaToScenes(project.scenes, uploadedAssetIds);
    }

    // 4. Save using ProjectRepository
    await projectRepository.saveProject(project, creatorId);
    return project;
  }
}

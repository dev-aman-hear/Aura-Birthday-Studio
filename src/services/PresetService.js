/**
 * Birthday Studio - Preset Service
 * Blueprint -> Project & Scene Generator Service with Universal Variable Support
 */

import { projectRepository } from './ProjectRepository.js';
import { Project } from '../models/Project.js';
import { Scene } from '../models/Scene.js';

export class PresetService {
  /**
   * Generates a fully populated Project and Scene graph from a Preset Blueprint & Variant
   */
  static async generateProjectFromPreset(preset, variantKey, personalizationInput = {}, creatorId = null, targetOccasion = null) {
    if (!preset) {
      throw new Error('[PresetService] Cannot generate project: No preset provided.');
    }

    const fallbacks = preset.fallbackContent || {};
    const finalOccasion = targetOccasion || personalizationInput.occasion || preset.occasion || 'birthday';

    // 1. Resolve Personalization Values with Smart Fallbacks
    const recipientName = (personalizationInput.recipientName || personalizationInput.name || '').trim() || fallbacks.recipientName || 'Someone Special';
    const senderName = (personalizationInput.senderName || personalizationInput.sender || personalizationInput.creatorName || '').trim() || fallbacks.senderName || fallbacks.creatorName || 'A Dear Friend';
    const creatorName = senderName;
    const occasion = (personalizationInput.occasion || '').trim() || fallbacks.occasion || finalOccasion;
    const message = (personalizationInput.message || personalizationInput.customMessage || '').trim() || fallbacks.message || fallbacks.customMessage || 'Wishing you a magical day filled with joy!';
    const age = (personalizationInput.age || '').trim() || fallbacks.age || '';
    const date = (personalizationInput.date || '').trim() || fallbacks.date || 'Today';
    const relationship = (personalizationInput.relationship || '').trim() || 'Friend';

    const photo1 = personalizationInput.photo1 || fallbacks.photo1 || '';
    const photo2 = personalizationInput.photo2 || fallbacks.photo2 || '';
    const photo3 = personalizationInput.photo3 || fallbacks.photo3 || '';
    const video1 = personalizationInput.video1 || fallbacks.video1 || '';
    const music = personalizationInput.music || fallbacks.music || '';

    const replacements = {
      name: recipientName,
      recipientName,
      recipient: recipientName,
      sender: senderName,
      senderName,
      creator: creatorName,
      creatorName,
      occasion,
      message,
      customMessage: message,
      age: age ? `${age}` : '',
      date,
      photo1,
      photo2,
      photo3,
      video1,
      music,
      ...(personalizationInput || {})
    };

    // 2. Generic Variant Resolution Order:
    // requested variant -> preset.defaultVariant -> longest available blueprint -> legacy preset.scenes -> error
    let variantBlueprints = null;
    let resolvedVariantName = '';

    if (variantKey && preset.sceneBlueprints && preset.sceneBlueprints[variantKey]) {
      variantBlueprints = preset.sceneBlueprints[variantKey];
      resolvedVariantName = variantKey;
    } else if (preset.defaultVariant && preset.sceneBlueprints && preset.sceneBlueprints[preset.defaultVariant]) {
      variantBlueprints = preset.sceneBlueprints[preset.defaultVariant];
      resolvedVariantName = preset.defaultVariant;
      if (variantKey) {
        console.warn(`[PresetService] Requested variant "${variantKey}" unavailable. Falling back to default variant "${resolvedVariantName}".`);
      }
    } else if (preset.sceneBlueprints && Object.keys(preset.sceneBlueprints).length > 0) {
      const allVariantEntries = Object.entries(preset.sceneBlueprints);
      const longest = allVariantEntries.reduce((best, cur) => 
        (Array.isArray(cur[1]) && cur[1].length > (best?.[1]?.length || 0)) ? cur : best, 
        allVariantEntries[0]
      );
      if (longest && Array.isArray(longest[1])) {
        variantBlueprints = longest[1];
        resolvedVariantName = longest[0];
        if (variantKey) {
          console.warn(`[PresetService] Requested variant "${variantKey}" unavailable. Falling back to longest variant "${resolvedVariantName}".`);
        }
      }
    } else if (Array.isArray(preset.scenes) && preset.scenes.length > 0) {
      variantBlueprints = preset.scenes;
      resolvedVariantName = 'legacy_scenes';
    }

    if (!variantBlueprints || !Array.isArray(variantBlueprints) || variantBlueprints.length === 0) {
      throw new Error(`[PresetService] Preset "${preset.title || preset.id}" does not contain any valid scene blueprints.`);
    }

    console.log(`[PresetService] Preset scenes defined: ${variantBlueprints.length}`);

    // Create independently cloned and constructed scene instances
    const nowTimestamp = Date.now();
    const generatedScenes = variantBlueprints.map((rawBp, idx) => {
      // Deep clone blueprint to prevent any shared object mutation
      const bp = JSON.parse(JSON.stringify(rawBp));
      const sceneIndex = idx + 1;
      const uniqueSceneId = `scene_${nowTimestamp}_${sceneIndex}_${Math.random().toString(36).substr(2, 5)}`;

      let title = this.interpolate(bp.titleText || bp.name, replacements);
      let subtitle = this.interpolate(bp.subtitleText || '', replacements);
      let sceneName = this.interpolate(bp.name || `Scene ${sceneIndex}`, replacements);

      // Deeply clone and interpolate elements with unique element IDs
      let elements = [];
      if (Array.isArray(bp.elements)) {
        elements = bp.elements.map((el, elIdx) => {
          const cloned = JSON.parse(JSON.stringify(el));
          cloned.id = el.id ? `${el.id}` : `el_s${sceneIndex}_${elIdx + 1}`;
          if (typeof cloned.content === 'string') {
            cloned.content = this.interpolate(cloned.content, replacements);
          }
          return cloned;
        });
      }

      return new Scene({
        id: uniqueSceneId,
        name: sceneName,
        template: bp.template || 'universal',
        order: sceneIndex,
        duration: bp.duration || 7,
        transition: bp.transition || 'fade',
        assetIds: Array.isArray(bp.assetIds) ? [...bp.assetIds] : [],
        elements: elements,
        textElements: elements,
        lockedLayout: true,
        referenceWidth: bp.referenceWidth || 1080,
        referenceHeight: bp.referenceHeight || 1920,
        settings: {
          titleText: title,
          subtitleText: subtitle,
          textContent: subtitle || title,
          caption: title,
          ...(bp.settings ? JSON.parse(JSON.stringify(bp.settings)) : {})
        }
      });
    });

    console.log(`[PresetService] Scenes after conversion: ${generatedScenes.length}`);
    console.log('[PresetService] Generated Scenes Validation:',
      generatedScenes.map(scene => ({
        id: scene.id,
        order: scene.order,
        name: scene.name,
        elementCount: scene.elements?.length
      }))
    );

    // Duplicate Scene ID validation check
    const ids = generatedScenes.map(s => s.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.error('[PresetService] Duplicate scene IDs detected:', duplicateIds);
    }

    // 3. Create Standard Project Instance
    const project = new Project({
      creatorId,
      occasion: finalOccasion,
      relationship,
      theme: preset.theme || 'purple_gold',
      recipient: {
        name: recipientName,
        nickname: recipientName,
        age: age,
        description: `${finalOccasion.charAt(0).toUpperCase() + finalOccasion.slice(1)} Celebration`
      },
      creator: {
        name: creatorName
      },
      birthdayDate: date.includes('-') ? date : new Date().toISOString().split('T')[0],
      scenes: generatedScenes,
      assetIds: [],
      templateVariables: replacements
    });

    console.log(`[PresetService] Scenes added to project: ${project.scenes.length}`);

    // Save using existing ProjectRepository
    await projectRepository.saveProject(project, creatorId);
    return project;
  }

  /**
   * Helper: Replace {token} or {{token}} placeholders cleanly without undefined/null leaking
   */
  static interpolate(templateStr, map = {}) {
    if (!templateStr || typeof templateStr !== 'string') return '';
    return templateStr
      .replace(/\{{1,2}(\w+)\}{1,2}/g, (match, key) => {
        return map[key] !== undefined && map[key] !== null && map[key] !== '' ? map[key] : match;
      })
      .replace(/\s+/g, ' ')
      .trim();
  }
}

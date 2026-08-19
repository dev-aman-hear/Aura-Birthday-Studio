/**
 * Birthday Studio - Semantic Scene Slot Manager
 * Manages semantic asset slot assignments, required asset tracking,
 * and seamless synchronization with scene elements.
 */

import { SceneAssetDefinitionService } from './SceneAssetDefinitions.js';
import { AssetCompatibilityValidator } from './AssetCompatibilityValidator.js';

export class SlotManager {
  /**
   * Get all semantic slots for a scene along with their current assignment status
   */
  static getSceneSlotsState(scene, allAssets = []) {
    if (!scene) return [];

    const def = SceneAssetDefinitionService.getDefinition(scene.template);
    const slots = def.slots || [];
    const sceneSlots = scene.slots || {};

    return slots.map(slotDef => {
      const assigned = sceneSlots[slotDef.id];
      let assignedAssets = [];

      if (Array.isArray(assigned)) {
        assignedAssets = assigned
          .map(id => allAssets.find(a => a.id === id) || { id, name: 'Assigned Asset' })
          .filter(Boolean);
      } else if (assigned) {
        const found = allAssets.find(a => a.id === assigned) || { id: assigned, name: 'Assigned Asset' };
        assignedAssets = [found];
      }

      // Fallback: If no explicit slot mapping exists, check scene.assetIds by type
      if (assignedAssets.length === 0 && scene.assetIds && scene.assetIds.length > 0) {
        const matchingFromAssetIds = scene.assetIds
          .map(id => allAssets.find(a => a.id === id))
          .filter(a => a && (slotDef.acceptedTypes || []).includes(a.type));

        if (matchingFromAssetIds.length > 0) {
          assignedAssets = slotDef.allowMultiple ? matchingFromAssetIds.slice(0, slotDef.max || 1) : [matchingFromAssetIds[0]];
        }
      }

      const count = assignedAssets.length;
      const min = slotDef.min || (slotDef.required ? 1 : 0);
      const max = slotDef.max || 1;
      const isComplete = count >= min;
      const isFull = count >= max;
      const isMissingRequired = slotDef.required && count < min;

      return {
        definition: slotDef,
        slotId: slotDef.id,
        name: slotDef.name,
        description: slotDef.description,
        acceptedTypes: slotDef.acceptedTypes,
        required: slotDef.required,
        min,
        max,
        assignedAssets,
        assignedCount: count,
        isComplete,
        isFull,
        isMissingRequired,
        aspectRatio: slotDef.aspectRatio,
        recommendedDimensions: slotDef.recommendedDimensions
      };
    });
  }

  /**
   * Assign an asset to a semantic slot in a scene
   */
  static assignAssetToSlot(scene, slotId, asset, allAssets = []) {
    if (!scene || !slotId || !asset) return { success: false, error: 'Missing parameters' };

    const def = SceneAssetDefinitionService.getDefinition(scene.template);
    const slotDef = def.slots?.find(s => s.id === slotId);

    if (!slotDef) {
      return { success: false, error: `Slot ${slotId} does not exist in scene ${scene.template}` };
    }

    if (!scene.slots) scene.slots = {};

    const validation = AssetCompatibilityValidator.validate(asset, def, slotId);
    if (!validation.compatible) {
      return { success: false, error: validation.reason, validation };
    }

    if (slotDef.allowMultiple) {
      const current = Array.isArray(scene.slots[slotId]) ? scene.slots[slotId] : (scene.slots[slotId] ? [scene.slots[slotId]] : []);
      if (!current.includes(asset.id)) {
        if (current.length >= (slotDef.max || 10)) {
          return { success: false, error: `Maximum slot capacity reached (${slotDef.max})` };
        }
        current.push(asset.id);
        scene.slots[slotId] = current;
      }
    } else {
      scene.slots[slotId] = asset.id;
    }

    // Ensure asset is in scene.assetIds
    if (!Array.isArray(scene.assetIds)) scene.assetIds = [];
    if (!scene.assetIds.includes(asset.id)) {
      scene.assetIds.push(asset.id);
    }

    // Synchronize to canvas elements if element is bound to slot
    const elements = Array.isArray(scene.elements) ? scene.elements : (scene.textElements || []);
    const matchingEl = elements.find(el => el.slotId === slotId || (el.type === asset.type && !el.assetId));
    if (matchingEl) {
      matchingEl.assetId = asset.id;
      matchingEl.content = asset.id;
    }

    return { success: true, validation };
  }

  /**
   * Remove an asset from a semantic slot
   */
  static removeAssetFromSlot(scene, slotId, assetId = null) {
    if (!scene || !slotId || !scene.slots) return false;

    if (assetId && Array.isArray(scene.slots[slotId])) {
      scene.slots[slotId] = scene.slots[slotId].filter(id => id !== assetId);
      if (scene.slots[slotId].length === 0) delete scene.slots[slotId];
    } else {
      delete scene.slots[slotId];
    }

    if (assetId && Array.isArray(scene.assetIds)) {
      scene.assetIds = scene.assetIds.filter(id => id !== assetId);
    }

    // Unbind element if attached
    const elements = Array.isArray(scene.elements) ? scene.elements : (scene.textElements || []);
    elements.forEach(el => {
      if (el.slotId === slotId || el.assetId === assetId) {
        el.assetId = null;
        if (el.content === assetId) el.content = '';
      }
    });

    return true;
  }

  /**
   * Check if scene has all required assets fulfilled
   */
  static getSceneCompleteness(scene, allAssets = []) {
    const slotsState = this.getSceneSlotsState(scene, allAssets);
    const missing = slotsState.filter(s => s.isMissingRequired);
    return {
      isComplete: missing.length === 0,
      totalSlots: slotsState.length,
      filledSlots: slotsState.filter(s => s.assignedCount > 0).length,
      missingRequired: missing
    };
  }
}

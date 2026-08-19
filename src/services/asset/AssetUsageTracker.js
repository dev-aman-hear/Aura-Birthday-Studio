/**
 * Birthday Studio - Asset Usage Tracker & Multi-Scene Reference Engine
 * Tracks exact scene and element references, handles universal asset replacement,
 * and maintains layout coordinate independence.
 */

export class AssetUsageTracker {
  /**
   * Scan project to find all scenes and slots referencing an asset
   */
  static getAssetUsage(assetId, project) {
    if (!project || !project.scenes || !assetId) {
      return { count: 0, scenes: [] };
    }

    const sceneUsages = [];

    project.scenes.forEach(scene => {
      let isUsed = false;
      const matchedSlots = [];
      const matchedElements = [];

      // 1. Check Scene assetIds array
      if (Array.isArray(scene.assetIds) && scene.assetIds.includes(assetId)) {
        isUsed = true;
      }

      // 2. Check Scene Slots mapping
      if (scene.slots && typeof scene.slots === 'object') {
        Object.entries(scene.slots).forEach(([slotKey, assigned]) => {
          if (assigned === assetId || (Array.isArray(assigned) && assigned.includes(assetId))) {
            isUsed = true;
            matchedSlots.push(slotKey);
          }
        });
      }

      // 3. Check Scene Canvas Elements
      const elements = Array.isArray(scene.elements) ? scene.elements : (scene.textElements || []);
      elements.forEach(el => {
        if (el.assetId === assetId || el.content === assetId || el.content === `{{${assetId}}}`) {
          isUsed = true;
          matchedElements.push(el.name || el.type || 'Element');
        }
      });

      if (isUsed) {
        sceneUsages.push({
          sceneId: scene.id,
          sceneName: scene.name || 'Untitled Scene',
          template: scene.template,
          slots: matchedSlots,
          elements: matchedElements
        });
      }
    });

    return {
      count: sceneUsages.length,
      scenes: sceneUsages
    };
  }

  /**
   * Replaces an asset globally across the entire project without modifying layout coordinates
   */
  static replaceAssetInProject(oldAssetId, newAssetId, project) {
    if (!project || !project.scenes || !oldAssetId || !newAssetId) return 0;

    let modifiedScenesCount = 0;

    project.scenes.forEach(scene => {
      let sceneModified = false;

      // 1. Update assetIds list
      if (Array.isArray(scene.assetIds) && scene.assetIds.includes(oldAssetId)) {
        scene.assetIds = scene.assetIds.map(id => id === oldAssetId ? newAssetId : id);
        sceneModified = true;
      }

      // 2. Update slots map
      if (scene.slots && typeof scene.slots === 'object') {
        Object.entries(scene.slots).forEach(([slotKey, assigned]) => {
          if (assigned === oldAssetId) {
            scene.slots[slotKey] = newAssetId;
            sceneModified = true;
          } else if (Array.isArray(assigned) && assigned.includes(oldAssetId)) {
            scene.slots[slotKey] = assigned.map(id => id === oldAssetId ? newAssetId : id);
            sceneModified = true;
          }
        });
      }

      // 3. Update elements (CRITICAL: preserve position x/y, width/height, rotation, zIndex)
      const elements = Array.isArray(scene.elements) ? scene.elements : (scene.textElements || []);
      elements.forEach(el => {
        if (el.assetId === oldAssetId) {
          el.assetId = newAssetId;
          sceneModified = true;
        }
        if (el.content === oldAssetId) {
          el.content = newAssetId;
          sceneModified = true;
        }
      });

      if (sceneModified) {
        modifiedScenesCount++;
      }
    });

    return modifiedScenesCount;
  }

  /**
   * Safely detach an asset from all project scenes
   */
  static removeAssetFromProject(assetId, project) {
    if (!project || !project.scenes || !assetId) return 0;

    let affectedCount = 0;

    project.scenes.forEach(scene => {
      let changed = false;

      if (Array.isArray(scene.assetIds) && scene.assetIds.includes(assetId)) {
        scene.assetIds = scene.assetIds.filter(id => id !== assetId);
        changed = true;
      }

      if (scene.slots && typeof scene.slots === 'object') {
        Object.entries(scene.slots).forEach(([slotKey, assigned]) => {
          if (assigned === assetId) {
            delete scene.slots[slotKey];
            changed = true;
          } else if (Array.isArray(assigned) && assigned.includes(assetId)) {
            scene.slots[slotKey] = assigned.filter(id => id !== assetId);
            changed = true;
          }
        });
      }

      const elements = Array.isArray(scene.elements) ? scene.elements : (scene.textElements || []);
      elements.forEach(el => {
        if (el.assetId === assetId) {
          el.assetId = null;
          changed = true;
        }
        if (el.content === assetId) {
          el.content = '';
          changed = true;
        }
      });

      if (changed) affectedCount++;
    });

    return affectedCount;
  }
}

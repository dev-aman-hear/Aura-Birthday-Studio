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

      // 4. Check Scene Settings (Timeline Memories, Collages, Items, Hero Photo)
      if (scene.settings) {
        if (Array.isArray(scene.settings.memories)) {
          scene.settings.memories.forEach((m, idx) => {
            if (m.photoAssetId === assetId) {
              isUsed = true;
              matchedElements.push(`Timeline Memory #${idx + 1} (${m.title || m.year || 'Memory'})`);
            }
          });
        }
        if (Array.isArray(scene.settings.collages)) {
          scene.settings.collages.forEach((c, idx) => {
            if (c.photoAssetId === assetId) {
              isUsed = true;
              matchedElements.push(`Collage Photo #${idx + 1} (${c.title || 'Photo'})`);
            }
          });
        }
        if (Array.isArray(scene.settings.items)) {
          scene.settings.items.forEach((it, idx) => {
            if (it.photoAssetId === assetId) {
              isUsed = true;
              matchedElements.push(`Bonus Memory #${idx + 1} (${it.title || 'Item'})`);
            }
          });
        }
        if (scene.settings.heroPhotoAssetId === assetId) {
          isUsed = true;
          matchedElements.push('Hero Photo');
        }
        if (scene.settings.revealPhotoAssetId === assetId) {
          isUsed = true;
          matchedElements.push('Reveal Photo');
        }
        if (scene.settings.giftBox?.contentAssetId === assetId || scene.settings.giftContentAssetId === assetId || scene.settings.giftPhotoAssetId === assetId || scene.settings.giftAssetId === assetId) {
          isUsed = true;
          matchedElements.push('Gift Box Content');
        }
      }

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

    // Check Project Settings (Background Music, etc.)
    if (project.settings?.bgMusicAssetId === assetId) {
      sceneUsages.push({
        sceneId: 'project_settings',
        sceneName: 'Project Background Audio',
        template: 'settings',
        slots: ['bg_music'],
        elements: ['Background Music']
      });
    }

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

      // 4. Update Scene Settings (Timeline Memories, Collages, Items, Hero Photo)
      if (scene.settings) {
        if (Array.isArray(scene.settings.memories)) {
          scene.settings.memories.forEach(m => {
            if (m.photoAssetId === oldAssetId) {
              m.photoAssetId = newAssetId;
              sceneModified = true;
            }
          });
        }
        if (Array.isArray(scene.settings.collages)) {
          scene.settings.collages.forEach(c => {
            if (c.photoAssetId === oldAssetId) {
              c.photoAssetId = newAssetId;
              sceneModified = true;
            }
          });
        }
        if (Array.isArray(scene.settings.items)) {
          scene.settings.items.forEach(it => {
            if (it.photoAssetId === oldAssetId) {
              it.photoAssetId = newAssetId;
              sceneModified = true;
            }
          });
        }
        if (scene.settings.heroPhotoAssetId === oldAssetId) {
          scene.settings.heroPhotoAssetId = newAssetId;
          sceneModified = true;
        }
        if (scene.settings.revealPhotoAssetId === oldAssetId) {
          scene.settings.revealPhotoAssetId = newAssetId;
          sceneModified = true;
        }
        if (scene.settings.giftBox?.contentAssetId === oldAssetId) {
          scene.settings.giftBox.contentAssetId = newAssetId;
          sceneModified = true;
        }
        if (scene.settings.giftContentAssetId === oldAssetId) {
          scene.settings.giftContentAssetId = newAssetId;
          sceneModified = true;
        }
        if (scene.settings.giftPhotoAssetId === oldAssetId) {
          scene.settings.giftPhotoAssetId = newAssetId;
          sceneModified = true;
        }
        if (scene.settings.giftAssetId === oldAssetId) {
          scene.settings.giftAssetId = newAssetId;
          sceneModified = true;
        }
      }

      if (sceneModified) {
        modifiedScenesCount++;
      }
    });

    if (project.settings?.bgMusicAssetId === oldAssetId) {
      project.settings.bgMusicAssetId = newAssetId;
    }

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

      // Safely detach from Scene Settings (Timeline Memories, Collages, Items, Hero Photo)
      if (scene.settings) {
        if (Array.isArray(scene.settings.memories)) {
          scene.settings.memories.forEach(m => {
            if (m.photoAssetId === assetId) {
              m.photoAssetId = null;
              if (m.photoUrl && (m.photoUrl.startsWith('blob:') || m.photoUrl.startsWith('data:'))) {
                m.photoUrl = '';
              }
              changed = true;
            }
          });
        }
        if (Array.isArray(scene.settings.collages)) {
          scene.settings.collages.forEach(c => {
            if (c.photoAssetId === assetId) {
              c.photoAssetId = null;
              if (c.photoUrl && (c.photoUrl.startsWith('blob:') || c.photoUrl.startsWith('data:'))) {
                c.photoUrl = '';
              }
              changed = true;
            }
          });
        }
        if (Array.isArray(scene.settings.items)) {
          scene.settings.items.forEach(it => {
            if (it.photoAssetId === assetId) {
              it.photoAssetId = null;
              if (it.photoUrl && (it.photoUrl.startsWith('blob:') || it.photoUrl.startsWith('data:'))) {
                it.photoUrl = '';
              }
              changed = true;
            }
          });
        }
        if (scene.settings.heroPhotoAssetId === assetId) {
          scene.settings.heroPhotoAssetId = null;
          if (scene.settings.heroPhotoUrl && (scene.settings.heroPhotoUrl.startsWith('blob:') || scene.settings.heroPhotoUrl.startsWith('data:'))) {
            scene.settings.heroPhotoUrl = '';
          }
          changed = true;
        }
        if (scene.settings.revealPhotoAssetId === assetId) {
          scene.settings.revealPhotoAssetId = null;
          if (scene.settings.revealPhotoUrl && (scene.settings.revealPhotoUrl.startsWith('blob:') || scene.settings.revealPhotoUrl.startsWith('data:'))) {
            scene.settings.revealPhotoUrl = '';
          }
          changed = true;
        }
        if (scene.settings.giftBox?.contentAssetId === assetId) {
          scene.settings.giftBox.contentAssetId = null;
          if (scene.settings.giftBox.contentUrl && (scene.settings.giftBox.contentUrl.startsWith('blob:') || scene.settings.giftBox.contentUrl.startsWith('data:'))) {
            scene.settings.giftBox.contentUrl = '';
          }
          changed = true;
        }
        if (scene.settings.giftContentAssetId === assetId) {
          scene.settings.giftContentAssetId = null;
          if (scene.settings.giftContentUrl && (scene.settings.giftContentUrl.startsWith('blob:') || scene.settings.giftContentUrl.startsWith('data:'))) {
            scene.settings.giftContentUrl = '';
          }
          changed = true;
        }
        if (scene.settings.giftPhotoAssetId === assetId) {
          scene.settings.giftPhotoAssetId = null;
          if (scene.settings.giftPhotoUrl && (scene.settings.giftPhotoUrl.startsWith('blob:') || scene.settings.giftPhotoUrl.startsWith('data:'))) {
            scene.settings.giftPhotoUrl = '';
          }
          changed = true;
        }
        if (scene.settings.giftAssetId === assetId) {
          scene.settings.giftAssetId = null;
          if (scene.settings.giftUrl && (scene.settings.giftUrl.startsWith('blob:') || scene.settings.giftUrl.startsWith('data:'))) {
            scene.settings.giftUrl = '';
          }
          changed = true;
        }
      }

      if (changed) affectedCount++;
    });

    if (project.settings?.bgMusicAssetId === assetId) {
      project.settings.bgMusicAssetId = null;
      project.settings.bgMusicUrl = '';
    }

    return affectedCount;
  }
}

/**
 * Birthday Studio - Scene Repository (Section 3, 4, 5, 56)
 * Manages Scene Flow & 10-Asset Scene Limit Enforcement
 */

import { Scene } from '../models/Scene.js';

class SceneRepository {
  /**
   * Create new scene object with unique ID
   */
  createScene(data = {}) {
    const id = `sc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return new Scene({
      id,
      name: data.name || 'New Scene',
      template: data.template || 'hero',
      duration: data.duration || 6,
      assetIds: Array.isArray(data.assetIds) ? [...data.assetIds] : [],
      transition: data.transition || 'fade',
      settings: data.settings || {},
      order: data.order || 1
    });
  }

  /**
   * Normalize scene order numbers
   */
  normalizeOrders(scenes) {
    if (!Array.isArray(scenes)) return;
    scenes.forEach((scene, index) => {
      scene.order = index + 1;
    });
  }

  /**
   * Add asset to scene with strict 10-asset limit enforcement (Section 3)
   */
  addAssetToScene(scene, assetId) {
    if (!scene || !assetId) return { success: false, message: 'Invalid operation' };

    if (scene.assetIds.length >= Scene.MAX_ASSETS) {
      return {
        success: false,
        message: `Scene limit reached: Maximum ${Scene.MAX_ASSETS} assets allowed per scene.`
      };
    }

    if (!scene.assetIds.includes(assetId)) {
      scene.assetIds.push(assetId);
    }
    return { success: true, scene };
  }

  /**
   * Remove asset from scene
   */
  removeAssetFromScene(scene, assetId) {
    if (!scene || !assetId) return scene;
    scene.assetIds = scene.assetIds.filter(id => id !== assetId);
    return scene;
  }

  /**
   * Reorder asset position inside scene (Section 5, 6)
   */
  reorderSceneAsset(scene, fromIndex, toIndex) {
    if (!scene || fromIndex < 0 || toIndex < 0 || fromIndex >= scene.assetIds.length || toIndex >= scene.assetIds.length) {
      return scene;
    }
    const updated = [...scene.assetIds];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    scene.assetIds = updated;
    return scene;
  }

  /**
   * Duplicate scene (Section 4)
   */
  duplicateScene(project, sceneId) {
    const idx = project.scenes.findIndex(s => s.id === sceneId);
    if (idx === -1) return project;

    const original = project.scenes[idx];
    const originalJson = JSON.parse(JSON.stringify(original.toJSON ? original.toJSON() : original));

    // Generate new IDs for cloned elements to guarantee full element-level data isolation
    if (Array.isArray(originalJson.elements)) {
      originalJson.elements = originalJson.elements.map(el => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }));
    }

    const copy = new Scene({
      ...originalJson,
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: `${original.name} (Copy)`,
      order: idx + 1
    });

    project.scenes.splice(idx + 1, 0, copy);
    this.reindexSceneOrders(project);
    return copy;
  }

  /**
   * Delete scene (Section 4)
   */
  deleteScene(project, sceneId) {
    project.scenes = project.scenes.filter(s => s.id !== sceneId);
    this.reindexSceneOrders(project);
    return project;
  }

  /**
   * Reorder scenes in project sequence (Section 4, 6)
   */
  reorderScenes(project, fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= project.scenes.length || toIndex >= project.scenes.length) {
      return project;
    }
    const [moved] = project.scenes.splice(fromIndex, 1);
    project.scenes.splice(toIndex, 0, moved);
    this.reindexSceneOrders(project);
    return project;
  }

  reindexSceneOrders(project) {
    project.scenes.forEach((scene, index) => {
      scene.order = index + 1;
    });
  }
}

export const sceneRepository = new SceneRepository();

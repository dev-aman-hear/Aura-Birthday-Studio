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
      template: data.template || 'basic_celebration',
      duration: data.duration || 6,
      assetIds: Array.isArray(data.assetIds) ? [...data.assetIds] : [],
      transition: data.transition || 'fade',
      settings: data.settings || {},
      order: data.order || 1,
      ...data
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
  reorderScenes(projectOrScenes, fromIndex, toIndex) {
    const scenes = Array.isArray(projectOrScenes) ? projectOrScenes : projectOrScenes?.scenes;
    if (!Array.isArray(scenes)) return projectOrScenes;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= scenes.length || toIndex >= scenes.length || fromIndex === toIndex) {
      return projectOrScenes;
    }
    const [moved] = scenes.splice(fromIndex, 1);
    scenes.splice(toIndex, 0, moved);
    this.normalizeOrders(scenes);
    return projectOrScenes;
  }

  /**
   * Move a scene UP (swaps with previous scene).
   * Returns true if swapped, false if already at top or invalid.
   */
  moveSceneUp(projectOrScenes, sceneId) {
    const scenes = Array.isArray(projectOrScenes) ? projectOrScenes : projectOrScenes?.scenes;
    if (!Array.isArray(scenes) || !sceneId) return false;
    const index = scenes.findIndex(s => s.id === sceneId);
    if (index <= 0) return false;
    const [moved] = scenes.splice(index, 1);
    scenes.splice(index - 1, 0, moved);
    this.normalizeOrders(scenes);
    return true;
  }

  /**
   * Move a scene DOWN (swaps with next scene).
   * Returns true if swapped, false if already at bottom or invalid.
   */
  moveSceneDown(projectOrScenes, sceneId) {
    const scenes = Array.isArray(projectOrScenes) ? projectOrScenes : projectOrScenes?.scenes;
    if (!Array.isArray(scenes) || !sceneId) return false;
    const index = scenes.findIndex(s => s.id === sceneId);
    if (index === -1 || index >= scenes.length - 1) return false;
    const [moved] = scenes.splice(index, 1);
    scenes.splice(index + 1, 0, moved);
    this.normalizeOrders(scenes);
    return true;
  }

  reindexSceneOrders(projectOrScenes) {
    const scenes = Array.isArray(projectOrScenes) ? projectOrScenes : projectOrScenes?.scenes;
    if (!Array.isArray(scenes)) return;
    this.normalizeOrders(scenes);
  }
}

export const sceneRepository = new SceneRepository();

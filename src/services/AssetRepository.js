/**
 * Birthday Studio - Asset Repository
 * Central Source of Truth for Universal Asset Metadata & Media Storage
 */

import { dbService } from './IndexedDBService.js';
import { Asset } from '../models/Asset.js';
import { SAMPLE_ASSETS } from '../data/SampleData.js';
import { AssetMetadataExtractor } from './asset/AssetMetadataExtractor.js';
import { AssetUsageTracker } from './asset/AssetUsageTracker.js';

class AssetRepository {
  constructor() {
    this.objectUrlCache = new Map();
  }

  /**
   * Save a File or Blob directly with automated metadata extraction
   */
  async saveFileAsset(file, customName = null) {
    if (!file) return null;

    const extractedMeta = await AssetMetadataExtractor.extractFromFile(file);
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const storageKey = `blob_${assetId}_${Date.now()}`;

    // Store binary blob in IndexedDB
    await dbService.put('blobs', { key: storageKey, blob: file });

    // Generate local Object URL for immediate preview
    const objectUrl = URL.createObjectURL(file);
    this.objectUrlCache.set(storageKey, objectUrl);

    const assetData = {
      id: assetId,
      name: customName || file.name || 'Uploaded Asset',
      type: extractedMeta.type || 'image',
      storageKey: storageKey,
      thumbnail: objectUrl,
      renderUrl: objectUrl,
      metadata: {
        ...extractedMeta,
        size: file.size,
        mimeType: file.type
      }
    };

    const asset = new Asset(assetData);
    await dbService.put('assets', asset.toJSON());
    return asset;
  }

  /**
   * Save asset metadata and optional binary File/Blob
   */
  async saveAsset(assetData, file = null) {
    let extracted = {};
    if (file) {
      extracted = await AssetMetadataExtractor.extractFromFile(file);
    }

    const mergedData = {
      ...assetData,
      metadata: {
        ...extracted,
        ...(assetData.metadata || {})
      }
    };

    const asset = new Asset(mergedData);

    if (file) {
      const storageKey = `blob_${asset.id}_${Date.now()}`;
      await dbService.put('blobs', { key: storageKey, blob: file });
      asset.storageKey = storageKey;

      const objectUrl = URL.createObjectURL(file);
      this.objectUrlCache.set(storageKey, objectUrl);
      asset.renderUrl = objectUrl;
      if (!asset.thumbnail) asset.thumbnail = objectUrl;
    }

    await dbService.put('assets', asset.toJSON());
    return asset;
  }

  /**
   * Replace an existing asset with new media, automatically refreshing all scene references
   */
  async replaceAsset(assetId, newFile, project = null) {
    const existing = await this.getAsset(assetId);
    if (!existing) return null;

    // Clean up old object URL and blob
    if (existing.storageKey) {
      if (this.objectUrlCache.has(existing.storageKey)) {
        URL.revokeObjectURL(this.objectUrlCache.get(existing.storageKey));
        this.objectUrlCache.delete(existing.storageKey);
      }
      await dbService.delete('blobs', existing.storageKey);
    }

    // Extract new metadata and save new blob
    const extractedMeta = await AssetMetadataExtractor.extractFromFile(newFile);
    const newStorageKey = `blob_${assetId}_${Date.now()}`;
    await dbService.put('blobs', { key: newStorageKey, blob: newFile });

    const newUrl = URL.createObjectURL(newFile);
    this.objectUrlCache.set(newStorageKey, newUrl);

    existing.name = newFile.name || existing.name;
    existing.type = extractedMeta.type || existing.type;
    existing.storageKey = newStorageKey;
    existing.thumbnail = newUrl;
    existing.renderUrl = newUrl;
    existing.metadata = {
      ...existing.metadata,
      ...extractedMeta,
      size: newFile.size,
      mimeType: newFile.type
    };
    existing.updatedAt = Date.now();

    await dbService.put('assets', existing.toJSON());

    // If project is provided, update references without modifying coordinates
    if (project) {
      AssetUsageTracker.replaceAssetInProject(assetId, assetId, project);
    }

    return existing;
  }

  async getAsset(assetId) {
    // Check preset samples first
    const sample = SAMPLE_ASSETS.find(s => s.id === assetId);
    if (sample) return new Asset(sample);

    const data = await dbService.get('assets', assetId);
    return data ? new Asset(data) : null;
  }

  async getAssets(assetIds = []) {
    if (!assetIds || assetIds.length === 0) return [];
    const assets = await Promise.all(assetIds.map(id => this.getAsset(id)));
    return assets.filter(Boolean);
  }

  async getAllAssets() {
    const dbAssets = await dbService.getAll('assets');
    const userAssets = dbAssets.map(a => new Asset(a));
    const sampleAssets = SAMPLE_ASSETS.map(s => new Asset(s));
    return [...sampleAssets, ...userAssets];
  }

  /**
   * Generate temporary rendering Object URL for an asset
   */
  async getRenderableUrl(asset) {
    if (!asset) return '';
    if (asset.renderUrl) return asset.renderUrl;
    if (asset.url) return asset.url; // Preset or static URL

    if (asset.storageKey) {
      if (this.objectUrlCache.has(asset.storageKey)) {
        return this.objectUrlCache.get(asset.storageKey);
      }
      const record = await dbService.get('blobs', asset.storageKey);
      if (record && record.blob) {
        const objectUrl = URL.createObjectURL(record.blob);
        this.objectUrlCache.set(asset.storageKey, objectUrl);
        return objectUrl;
      }
    }
    return asset.thumbnail || '';
  }

  /**
   * Calculate usage count across all project scenes
   */
  async getAssetUsageCount(assetId, project) {
    const usage = AssetUsageTracker.getAssetUsage(assetId, project);
    return usage.count;
  }

  /**
   * Get detailed usage breakdown across all project scenes
   */
  getAssetUsageDetails(assetId, project) {
    return AssetUsageTracker.getAssetUsage(assetId, project);
  }

  /**
   * Safely delete asset with usage verification
   */
  async deleteAsset(assetId, project = null) {
    if (project) {
      const usage = AssetUsageTracker.getAssetUsage(assetId, project);
      if (usage.count > 0) {
        const sceneNames = usage.scenes.map(s => s.sceneName).join(', ');
        const confirmed = confirm(`This asset is currently used in ${usage.count} scene(s): ${sceneNames}.\n\nAre you sure you want to delete it?`);
        if (!confirmed) return false;

        // Clean up project references safely
        AssetUsageTracker.removeAssetFromProject(assetId, project);
      }
    }

    const asset = await this.getAsset(assetId);
    if (asset && asset.storageKey) {
      if (this.objectUrlCache.has(asset.storageKey)) {
        URL.revokeObjectURL(this.objectUrlCache.get(asset.storageKey));
        this.objectUrlCache.delete(asset.storageKey);
      }
      await dbService.delete('blobs', asset.storageKey);
    }
    await dbService.delete('assets', assetId);
    return true;
  }

  /**
   * Batch delete multiple assets
   */
  async batchDeleteAssets(assetIds = [], project = null) {
    let deletedCount = 0;
    for (const id of assetIds) {
      const success = await this.deleteAsset(id, project);
      if (success) deletedCount++;
    }
    return deletedCount;
  }
}

export const assetRepository = new AssetRepository();


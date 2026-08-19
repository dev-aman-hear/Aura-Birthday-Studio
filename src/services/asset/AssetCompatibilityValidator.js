/**
 * Birthday Studio - Asset Compatibility Validator
 * Central validation engine enforcing machine-readable scene and slot constraints.
 * Generates structured validation feedback with warnings, errors, and suggestions.
 */

import { SceneAssetDefinitionService } from './SceneAssetDefinitions.js';

export class AssetCompatibilityValidator {
  /**
   * Validate an asset against a specific semantic slot or whole scene
   */
  static validate(asset, sceneOrDef, slotId = null, currentAssignedCount = 0) {
    const sceneDef = typeof sceneOrDef === 'string'
      ? SceneAssetDefinitionService.getDefinition(sceneOrDef)
      : (sceneOrDef?.assetRules ? sceneOrDef : SceneAssetDefinitionService.getDefinition(sceneOrDef?.template || 'universal'));

    if (!asset) {
      return {
        compatible: false,
        reason: 'No asset provided for validation',
        errors: ['Asset is null or undefined'],
        warnings: [],
        suggestions: ['Select or upload a valid media asset'],
        score: 0,
        details: { typeValid: false, formatValid: false, sizeValid: false, dimensionValid: false, durationValid: false, capacityAvailable: false }
      };
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    const assetType = (asset.type || 'image').toLowerCase();
    const meta = asset.metadata || {};
    const fileFormat = (meta.fileFormat || (asset.name?.includes('.') ? asset.name.split('.').pop() : '')).toLowerCase();
    const sizeMB = meta.sizeMB || (meta.size ? meta.size / (1024 * 1024) : 0);

    // 1. If Slot is specified, validate against slot constraints
    let targetSlot = null;
    if (slotId && sceneDef.slots) {
      targetSlot = sceneDef.slots.find(s => s.id === slotId);
    }

    if (targetSlot) {
      // 1A. Slot Type Check
      const acceptedTypes = (targetSlot.acceptedTypes || []).map(t => t.toLowerCase());
      const typeMatches = acceptedTypes.includes(assetType) || 
        (acceptedTypes.includes('image') && (assetType === 'sticker' || assetType === 'gif')) ||
        (acceptedTypes.includes('sticker') && assetType === 'image');

      if (!typeMatches) {
        errors.push(`Slot "${targetSlot.name}" accepts ${acceptedTypes.join(', ')}, but asset is ${assetType.toUpperCase()}.`);
        suggestions.push(`Choose an asset of type ${acceptedTypes.join(' or ')} for this slot.`);
        score = 0;
      }

      // 1B. Slot Format Check
      if (targetSlot.formats && targetSlot.formats.length > 0 && fileFormat) {
        const allowedFormats = targetSlot.formats.map(f => f.toLowerCase());
        if (!allowedFormats.includes(fileFormat)) {
          errors.push(`Format .${fileFormat.toUpperCase()} is not supported by slot "${targetSlot.name}". Supported: ${allowedFormats.map(f => f.toUpperCase()).join(', ')}`);
          suggestions.push(`Convert file to ${allowedFormats.slice(0, 3).map(f => f.toUpperCase()).join(', ')} before uploading.`);
          score = Math.max(0, score - 50);
        }
      }

      // 1C. Slot Size Check
      const maxSlotSize = targetSlot.maxSizeMB || 25;
      if (sizeMB > maxSlotSize) {
        errors.push(`File size (${sizeMB.toFixed(1)} MB) exceeds maximum allowed for slot "${targetSlot.name}" (${maxSlotSize} MB).`);
        suggestions.push(`Compress the media file to under ${maxSlotSize} MB.`);
        score = Math.max(0, score - 40);
      }

      // 1D. Slot Aspect Ratio & Recommendation Warnings
      if (targetSlot.aspectRatio && targetSlot.aspectRatio !== 'any' && meta.aspectRatio) {
        if (meta.aspectRatio !== targetSlot.aspectRatio) {
          warnings.push(`Asset aspect ratio is ${meta.aspectRatio}, but slot "${targetSlot.name}" is optimized for ${targetSlot.aspectRatio}.`);
          suggestions.push(`The asset will be auto-cropped/fitted. For best results, use a ${targetSlot.aspectRatio} ratio.`);
          score -= 10;
        }
      }

      // 1E. Slot Max Duration Check (Video / Audio)
      if (targetSlot.maxDurationSec && meta.duration && meta.duration > targetSlot.maxDurationSec) {
        errors.push(`Duration (${meta.duration}s) exceeds maximum allowed duration (${targetSlot.maxDurationSec}s).`);
        suggestions.push(`Trim video to under ${Math.round(targetSlot.maxDurationSec / 60)} minutes.`);
        score = Math.max(0, score - 50);
      }

      // 1F. Slot Capacity
      if (currentAssignedCount >= (targetSlot.max || 1)) {
        errors.push(`Slot "${targetSlot.name}" has reached maximum capacity (${targetSlot.max || 1} asset).`);
        suggestions.push(`Replace an existing asset in this slot or remove it first.`);
        score = 0;
      }
    } else {
      // 2. Validate against Scene Level Rules
      const rules = sceneDef.assetRules || {};
      const typeRule = rules[assetType];

      if (!typeRule && assetType !== 'text') {
        errors.push(`Scene "${sceneDef.name}" does not support ${assetType.toUpperCase()} assets.`);
        suggestions.push(`Supported media types: ${Object.keys(rules).map(k => k.toUpperCase()).join(', ')}.`);
        score = 0;
      } else if (typeRule) {
        // 2A. Format Check
        if (typeRule.formats && typeRule.formats.length > 0 && fileFormat) {
          const allowedFormats = typeRule.formats.map(f => f.toLowerCase());
          if (!allowedFormats.includes(fileFormat)) {
            errors.push(`.${fileFormat.toUpperCase()} is not supported for ${assetType.toUpperCase()}s. Supported: ${allowedFormats.map(f => f.toUpperCase()).join(', ')}.`);
            suggestions.push(`Convert to ${allowedFormats.slice(0, 3).map(f => f.toUpperCase()).join(', ')}.`);
            score = Math.max(0, score - 50);
          }
        }

        // 2B. Size Check
        const maxSize = typeRule.maxSizeMB || 20;
        if (sizeMB > maxSize) {
          errors.push(`File size (${sizeMB.toFixed(1)} MB) exceeds maximum allowed (${maxSize} MB).`);
          suggestions.push(`Compress file to under ${maxSize} MB.`);
          score = Math.max(0, score - 40);
        }

        // 2C. Duration Check
        if (typeRule.maxDurationSec && meta.duration && meta.duration > typeRule.maxDurationSec) {
          errors.push(`Duration (${meta.duration}s) exceeds scene limit (${typeRule.maxDurationSec}s).`);
          suggestions.push(`Trim video length.`);
          score = Math.max(0, score - 50);
        }
      }
    }

    const compatible = errors.length === 0;
    let reason = compatible ? 'Asset is fully compatible' : errors[0];

    if (compatible && warnings.length > 0) {
      reason = `Compatible with advisory: ${warnings[0]}`;
    }

    return {
      compatible,
      reason,
      warnings,
      errors,
      suggestions,
      score: compatible ? Math.max(50, score) : 0,
      details: {
        typeValid: !errors.some(e => e.includes('accepts') || e.includes('does not support')),
        formatValid: !errors.some(e => e.includes('Format') || e.includes('supported for')),
        sizeValid: !errors.some(e => e.includes('File size')),
        dimensionValid: !warnings.some(w => w.includes('aspect ratio')),
        durationValid: !errors.some(e => e.includes('Duration')),
        capacityAvailable: !errors.some(e => e.includes('capacity'))
      }
    };
  }

  /**
   * Sort assets prioritizing most compatible first
   */
  static rankAssetsForSlot(assets = [], scene, slotId = null) {
    return assets.map(asset => {
      const validation = this.validate(asset, scene, slotId);
      return {
        asset,
        validation,
        isCompatible: validation.compatible,
        score: validation.score
      };
    }).sort((a, b) => b.score - a.score);
  }
}

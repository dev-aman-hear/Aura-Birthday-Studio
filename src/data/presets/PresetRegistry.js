/**
 * Birthday Studio - Central Preset Registry
 * Indexes all scene presets across categories:
 * Birthday, Birthday Memories, Anniversary, Friendship, Wedding, Celebration, Memories, Love, Universal
 */

import { BIRTHDAY_PRESETS } from './birthday/BirthdayPresets.js';
import { WEDDING_PRESETS } from './wedding/WeddingPresets.js';
import { ANNIVERSARY_PRESETS } from './anniversary/AnniversaryPresets.js';
import { GRADUATION_PRESETS } from './graduation/GraduationPresets.js';
import { CONGRATULATIONS_PRESETS } from './congratulations/CongratulationsPresets.js';
import { BABYSHOWER_PRESETS } from './babyshower/BabyShowerPresets.js';
import { UNIVERSAL_PRESETS } from './universal/UniversalPresets.js';

export const ALL_PRESETS = [
  ...UNIVERSAL_PRESETS,
  ...BIRTHDAY_PRESETS,
  ...WEDDING_PRESETS,
  ...ANNIVERSARY_PRESETS,
  ...GRADUATION_PRESETS,
  ...CONGRATULATIONS_PRESETS,
  ...BABYSHOWER_PRESETS
];

export class PresetRegistry {
  static getAllPresets() {
    return ALL_PRESETS;
  }

  static getPresetsByCategory(category) {
    if (!category || category === 'all' || category === 'all presets') return ALL_PRESETS;
    const catLower = category.toLowerCase().trim();
    if (catLower === 'other') {
      const primaryOccasions = ['birthday', 'wedding', 'graduation', 'congratulations', 'anniversary'];
      return ALL_PRESETS.filter(p => {
        const occ = (p.occasion || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return !primaryOccasions.some(prim => occ.includes(prim) || cat.includes(prim));
      });
    }
    return ALL_PRESETS.filter(p => 
      (p.category && p.category.toLowerCase().includes(catLower)) ||
      (p.occasion && p.occasion.toLowerCase() === catLower) ||
      (p.occasion && p.occasion.toLowerCase().includes(catLower)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(catLower)))
    );
  }

  static getPresetsByOccasion(occasion) {
    return this.getPresetsByCategory(occasion);
  }

  static getPresetById(id) {
    return ALL_PRESETS.find(p => p.id === id) || ALL_PRESETS[0];
  }
}


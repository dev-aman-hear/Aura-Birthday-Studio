/**
 * Birthday Studio - Creator Settings Service (Section 9)
 * Local Preferences Manager (Default Occasion, Default Style, Wish Wall & Reduced Motion)
 */

const SETTINGS_KEY = 'birthday_studio_creator_settings';

export const DEFAULT_SETTINGS = {
  defaultOccasion: 'birthday',
  defaultStyle: 'party',
  enableWishWall: true,
  reducedMotion: false
};

export class CreatorSettingsService {
  static getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (err) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(newSettings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error('Failed to save creator settings:', err);
      return DEFAULT_SETTINGS;
    }
  }

  static resetToDefault() {
    localStorage.removeItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS };
  }
}

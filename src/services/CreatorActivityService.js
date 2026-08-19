/**
 * Birthday Studio - Local Creator Activity Tracker Service (Section 5)
 * 100% Offline Local Action Logger (Zero External Analytics / Network Telemetry)
 */

const ACTIVITY_STORAGE_KEY = 'birthday_studio_creator_activity_log';

export class CreatorActivityService {
  /**
   * Record a local offline creator action
   */
  static logActivity(action, context = 'General', icon = '⚡') {
    try {
      const logs = this.getActivities();
      const newEntry = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action,
        context,
        icon,
        timestamp: Date.now()
      };

      logs.unshift(newEntry);
      // Enforce max 50 log items
      const trimmed = logs.slice(0, 50);
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmed));
      return newEntry;
    } catch (err) {
      console.error('Failed to log creator activity:', err);
      return null;
    }
  }

  /**
   * Retrieve all local offline activity entries
   */
  static getActivities() {
    try {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Clear local activity history
   */
  static clearActivities() {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  }
}

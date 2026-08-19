/**
 * Birthday Studio - Onboarding Service (Section 1)
 * Tracks First-Time Creator Local Onboarding Completion State
 */

const ONBOARDING_KEY = 'birthday_studio_onboarding_completed';

export class OnboardingService {
  /**
   * Check if user is a first-time creator
   */
  static isFirstTimeCreator() {
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== 'true';
    } catch (err) {
      return false;
    }
  }

  /**
   * Mark onboarding flow as completed
   */
  static markCompleted() {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (err) {
      console.error('Failed to set onboarding state:', err);
    }
  }

  /**
   * Reset onboarding state for testing
   */
  static resetOnboarding() {
    localStorage.removeItem(ONBOARDING_KEY);
  }
}

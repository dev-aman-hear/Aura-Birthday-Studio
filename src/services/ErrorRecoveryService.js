/**
 * Birthday Studio - Global Error Recovery Service (Section 7)
 * Standardizes Recoverable Errors and Toast Notifications
 */

import { Toast } from '../utils/Toast.js';

export class ErrorRecoveryService {
  static handleError(err, context = 'Operation') {
    console.error(`[ErrorRecoveryService] Error during ${context}:`, err);

    const message = err?.message || 'An unexpected error occurred';
    Toast.show(`⚠️ ${context}: ${message}`, 'warning');

    return {
      handled: true,
      context,
      message
    };
  }

  static notifySuccess(message) {
    Toast.show(`✅ ${message}`, 'success');
  }

  static notifyInfo(message) {
    Toast.show(`ℹ️ ${message}`, 'info');
  }
}

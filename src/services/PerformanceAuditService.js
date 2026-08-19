/**
 * Birthday Studio - Performance Audit Service (Section 6 & 8)
 * Lightweight Performance Diagnostic Tracker & Memory Metrics
 */

import { MediaUrlManager } from '../utils/MediaUrlManager.js';

export class PerformanceAuditService {
  /**
   * Return current lightweight memory and asset tracking metrics
   */
  static getMetrics() {
    return {
      activeObjectUrls: MediaUrlManager.getActiveCount(),
      timestamp: Date.now(),
      domNodes: document.querySelectorAll('*').length
    };
  }

  /**
   * Log performance metrics silently
   */
  static logAudit(label = 'System Diagnostic') {
    const metrics = this.getMetrics();
    console.log(`[PerformanceAuditService] ${label}:`, metrics);
    return metrics;
  }
}

/**
 * Birthday Studio - Release Diagnostics Service (Section 12)
 * Lightweight Local Developer Diagnostic Inspector (Zero Recipient Leakage)
 */

import { MediaUrlManager } from '../utils/MediaUrlManager.js';
import { PerformanceAuditService } from './PerformanceAuditService.js';

export class ReleaseDiagnosticsService {
  static getDiagnostics() {
    return {
      version: '3.0.0-production',
      currentHash: window.location.hash || '#dashboard',
      activeObjectUrls: MediaUrlManager.getActiveCount(),
      performanceMetrics: PerformanceAuditService.getMetrics(),
      browserCapabilities: {
        share: typeof navigator.share === 'function',
        clipboard: typeof navigator.clipboard === 'object',
        indexedDB: typeof window.indexedDB === 'object'
      }
    };
  }
}

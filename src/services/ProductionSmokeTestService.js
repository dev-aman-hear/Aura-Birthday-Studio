/**
 * Birthday Studio - Production Smoke Test Service (Section 13)
 * Deterministic Local Production Configuration & Health Verification
 */

import { publishedProjectRepository } from './PublishedProjectRepository.js';
import { MediaUrlManager } from '../utils/MediaUrlManager.js';

export class ProductionSmokeTestService {
  static async runSmokeTest() {
    const results = [];

    // 1. Check Storage
    results.push({ name: 'IndexedDB Availability', pass: typeof window.indexedDB === 'object' });

    // 2. Check Metadata Preflight Gating Contract (TEST H)
    const nullMeta = await publishedProjectRepository.getPublicationMetadata('invalid_pub_test_123');
    results.push({ name: 'Lazy Metadata Preflight Gating', pass: nullMeta === null });

    // 3. Check Object URL Tracker
    results.push({ name: 'Object URL Revocation Tracker', pass: typeof MediaUrlManager.getActiveCount === 'function' });

    return {
      allPassed: results.every(r => r.pass),
      results
    };
  }
}

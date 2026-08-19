/**
 * Birthday Studio - Storage Health Service (Section 14)
 * Safe Diagnostics for IndexedDB Availability & Store Integrity (Zero Private Data Exposure)
 */

import { dbService } from './IndexedDBService.js';

export class StorageHealthService {
  static async checkStorageHealth() {
    try {
      const db = await dbService.openDB();
      const stores = Array.from(db.objectStoreNames);
      return {
        healthy: stores.includes('projects') && stores.includes('published_projects'),
        stores
      };
    } catch (err) {
      return { healthy: false, stores: [] };
    }
  }
}

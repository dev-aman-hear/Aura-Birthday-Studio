/**
 * Birthday Studio - IndexedDB Service (Section 57, Phase 1 Auth, Phase 6 Version History)
 * Handles Projects, Asset Media Blobs, Wishes, Published Projects, Users & Project Versions safely
 */

const DB_NAME = 'BirthdayStudioDB';
const DB_VERSION = 3; // Upgraded to v3 for project_versions store

export class IndexedDBService {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }

        // Assets metadata store
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }

        // Media Blobs store (Section 57: Blob storage for uploaded media)
        if (!db.objectStoreNames.contains('blobs')) {
          db.createObjectStore('blobs', { keyPath: 'key' });
        }

        // Wishes store
        if (!db.objectStoreNames.contains('wishes')) {
          const wishStore = db.createObjectStore('wishes', { keyPath: 'id' });
          wishStore.createIndex('projectId', 'projectId', { unique: false });
          wishStore.createIndex('status', 'status', { unique: false });
        }

        // Published projects store (Section 58)
        if (!db.objectStoreNames.contains('published_projects')) {
          db.createObjectStore('published_projects', { keyPath: 'id' });
        }

        // Users store (Phase 1 Auth)
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
        }

        // Project draft versions store (Phase 6 Version History)
        if (!db.objectStoreNames.contains('project_versions')) {
          const verStore = db.createObjectStore('project_versions', { keyPath: 'id' });
          verStore.createIndex('projectId', 'projectId', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('IndexedDB open error:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  async getStore(storeName, mode = 'readonly') {
    await this.initPromise;
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async get(storeName, key) {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(storeName) {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async put(storeName, item) {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName, key) {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    await this.initPromise;
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}

export const dbService = new IndexedDBService();

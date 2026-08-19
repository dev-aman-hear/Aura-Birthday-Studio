/**
 * Birthday Studio - Autosave Service (Section 12)
 * Debounced Local Persistence to IndexedDB
 */

import { projectRepository } from './ProjectRepository.js';

export class AutosaveService {
  constructor(options = {}) {
    this.debounceMs = options.debounceMs || 800;
    this.onStatusChange = options.onStatusChange || (() => {});
    this.timer = null;
  }

  scheduleSave(project, creatorId = null) {
    if (!project) return;

    this.onStatusChange('Saving...');

    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(async () => {
      try {
        await projectRepository.saveProject(project, creatorId);
        this.onStatusChange('Saved just now');
      } catch (err) {
        console.error('Autosave error:', err);
        this.onStatusChange('Save failed');
      }
    }, this.debounceMs);
  }
}

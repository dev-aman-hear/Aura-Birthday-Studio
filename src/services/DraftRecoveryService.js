/**
 * Birthday Studio - Draft Recovery Service (Section 1)
 * Detects & Restores Unsaved Draft Recovery Snapshots safely from IndexedDB
 */

import { dbService } from './IndexedDBService.js';
import { projectRepository } from './ProjectRepository.js';

export class DraftRecoveryService {
  /**
   * Save a temporary recovery snapshot for an active project
   */
  static async saveRecoverySnapshot(project) {
    if (!project || !project.id) return null;

    const recoveryRecord = {
      id: `rec_${project.id}`,
      projectId: project.id,
      timestamp: Date.now(),
      snapshot: JSON.parse(JSON.stringify(project))
    };

    await dbService.put('project_versions', recoveryRecord);
    return recoveryRecord;
  }

  /**
   * Detect if a valid recovery snapshot exists for a project
   */
  static async getRecoverySnapshot(projectId) {
    if (!projectId) return null;
    const record = await dbService.get('project_versions', `rec_${projectId}`);
    return record || null;
  }

  /**
   * Restore recovery snapshot into creator draft project safely
   */
  static async restoreRecoverySnapshot(projectId, creatorId = null) {
    const record = await this.getRecoverySnapshot(projectId);
    if (!record || !record.snapshot) return null;

    const restoredProject = record.snapshot;
    restoredProject.updatedAt = Date.now();

    await projectRepository.saveProject(restoredProject, creatorId);
    await this.deleteRecoverySnapshot(projectId);
    return restoredProject;
  }

  /**
   * Delete recovery snapshot explicitly
   */
  static async deleteRecoverySnapshot(projectId) {
    if (!projectId) return false;
    await dbService.delete('project_versions', `rec_${projectId}`);
    return true;
  }
}

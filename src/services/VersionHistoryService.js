/**
 * Birthday Studio - Draft Version History Service (Section 18)
 * Local IndexedDB Version History (Max 20 snapshots per project, non-breaking to publications)
 */

import { dbService } from './IndexedDBService.js';
import { projectRepository } from './ProjectRepository.js';

export class VersionHistoryService {
  /**
   * Save a snapshot version of current project draft
   */
  static async saveVersion(project, label = 'Draft Version') {
    if (!project || !project.id) return null;

    const versionRecord = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      projectId: project.id,
      timestamp: Date.now(),
      label,
      snapshot: JSON.parse(JSON.stringify(project)) // Deep copy
    };

    // Retrieve existing versions for project
    const allVersions = await this.getVersionsForProject(project.id);
    allVersions.sort((a, b) => b.timestamp - a.timestamp);

    // Enforce maximum 20 versions limit (Section 18)
    if (allVersions.length >= 20) {
      const oldest = allVersions.slice(19);
      for (const old of oldest) {
        await dbService.delete('project_versions', old.id);
      }
    }

    await dbService.put('project_versions', versionRecord);
    return versionRecord;
  }

  /**
   * Get versions for a specific project
   */
  static async getVersionsForProject(projectId) {
    if (!projectId) return [];
    const all = await dbService.getAll('project_versions');
    return all.filter(v => v.projectId === projectId).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Restore a historical draft version
   */
  static async restoreVersion(versionId, creatorId = null) {
    const versionRecord = await dbService.get('project_versions', versionId);
    if (!versionRecord || !versionRecord.snapshot) return null;

    const restoredProject = versionRecord.snapshot;
    restoredProject.updatedAt = Date.now();

    await projectRepository.saveProject(restoredProject, creatorId);
    return restoredProject;
  }
}

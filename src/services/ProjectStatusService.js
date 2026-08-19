/**
 * Birthday Studio - Project Status Service (Section 3)
 * Deterministic Status Calculator (DRAFT, IN_PROGRESS, READY, PUBLISHED, EXPIRED)
 */

export class ProjectStatusService {
  /**
   * Determine status of a project based on its draft data & publication history
   */
  static getProjectStatus(project, latestPublication = null) {
    if (!project) return { code: 'DRAFT', label: 'Draft', color: 'var(--text-muted)' };

    // 1. Check Publication Status
    if (latestPublication) {
      const isExpired = latestPublication.status === 'expired' || Date.now() >= latestPublication.expiresAt;
      if (isExpired) {
        return { code: 'EXPIRED', label: 'Expired', color: 'var(--danger)' };
      }
      return { code: 'PUBLISHED', label: 'Published', color: 'var(--success)' };
    }

    // 2. Check Draft Readiness
    const scenes = project.scenes || [];
    const hasRecipient = Boolean(project.recipient?.name && project.recipient.name !== 'Someone Special');
    const hasMedia = (project.assetIds || []).length > 0;
    const hasFinale = scenes.some(s => s.template === 'final_wish');

    if (hasRecipient && scenes.length >= 2 && hasFinale) {
      return { code: 'READY', label: 'Ready to Publish', color: 'var(--accent)' };
    }

    if (scenes.length >= 1 || hasMedia) {
      return { code: 'IN_PROGRESS', label: 'In Progress', color: 'var(--accent-gold)' };
    }

    return { code: 'DRAFT', label: 'Draft', color: 'var(--text-muted)' };
  }
}

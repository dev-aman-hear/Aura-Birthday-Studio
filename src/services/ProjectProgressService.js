/**
 * Birthday Studio - Project Progress Service (Section 1)
 * Calculates Deterministic 0-100% Celebration Readiness Score & Actionable Advice
 */

export class ProjectProgressService {
  static calculateProgress(project) {
    if (!project) {
      return {
        score: 0,
        status: 'STARTED',
        completedItems: [],
        missingItems: ['Project data missing'],
        suggestions: ['Start by configuring your recipient name and occasion.']
      };
    }

    let score = 0;
    const completedItems = [];
    const missingItems = [];
    const suggestions = [];

    // 1. Recipient Info (20%)
    if (project.recipient?.name && project.recipient.name !== 'Someone Special') {
      score += 20;
      completedItems.push('Recipient name personalized');
    } else {
      missingItems.push('Recipient name generic');
      suggestions.push('Personalize your recipient name in Settings or Wizard.');
    }

    // 2. Story Scenes (20%)
    const sceneCount = project.scenes?.length || 0;
    if (sceneCount >= 3) {
      score += 20;
      completedItems.push(`${sceneCount} story scenes created`);
    } else if (sceneCount >= 1) {
      score += 10;
      completedItems.push(`${sceneCount} story scene created`);
      missingItems.push('Fewer than 3 scenes');
      suggestions.push('Add a memory gallery or message scene to enrich your story.');
    } else {
      missingItems.push('No story scenes');
      suggestions.push('Add your first story scene using + Add Scene.');
    }

    // 3. Media Memories (20%)
    const assetCount = project.assetIds?.length || 0;
    if (assetCount >= 1) {
      score += 20;
      completedItems.push(`${assetCount} media memory assets attached`);
    } else {
      missingItems.push('No media assets attached');
      suggestions.push('Upload photo or video memories in the Asset Library.');
    }

    // 4. Finale Scene (20%)
    const hasFinale = project.scenes?.some(s => s.template === 'final_wish');
    if (hasFinale) {
      score += 20;
      completedItems.push('Celebration grand finale scene included');
    } else {
      missingItems.push('No grand finale closing scene');
      suggestions.push('Add a final wish closing scene to complete your celebration.');
    }

    // 5. Wish Wall & Style Configuration (20%)
    score += 20;
    completedItems.push('Wish Wall & Visual Theme configured');

    let status = 'STARTED';
    if (score >= 80) status = 'READY';
    else if (score >= 40) status = 'IN_PROGRESS';

    return {
      score: Math.min(100, Math.max(0, score)),
      status,
      completedItems,
      missingItems,
      suggestions
    };
  }
}

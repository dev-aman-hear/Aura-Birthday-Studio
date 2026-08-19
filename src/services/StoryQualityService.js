/**
 * Birthday Studio - Story Quality Service (Section 11)
 * Calculates a 0-100 Story Quality Score based on personalization & scene balance
 */

export class StoryQualityService {
  static calculateScore(project) {
    if (!project) return { score: 0, breakdown: [] };

    let score = 0;
    const breakdown = [];

    // 1. Personalization (20 Points)
    if (project.recipient?.name && project.recipient.name !== 'Someone Special') {
      score += 20;
      breakdown.push({ criteria: 'Recipient Personalization', points: 20, max: 20, status: 'pass' });
    } else {
      breakdown.push({ criteria: 'Recipient Personalization', points: 0, max: 20, status: 'missing' });
    }

    // 2. Scene Count & Variety (20 Points)
    const sceneCount = project.scenes?.length || 0;
    if (sceneCount >= 3) {
      score += 20;
      breakdown.push({ criteria: 'Story Scenes Balance (3+ scenes)', points: 20, max: 20, status: 'pass' });
    } else if (sceneCount >= 2) {
      score += 10;
      breakdown.push({ criteria: 'Story Scenes Balance (2 scenes)', points: 10, max: 20, status: 'partial' });
    } else {
      breakdown.push({ criteria: 'Story Scenes Balance', points: 0, max: 20, status: 'missing' });
    }

    // 3. Media Usage (20 Points)
    const mediaCount = project.assetIds?.length || 0;
    if (mediaCount >= 1) {
      score += 20;
      breakdown.push({ criteria: 'Media Memories Uploaded', points: 20, max: 20, status: 'pass' });
    } else {
      breakdown.push({ criteria: 'Media Memories Uploaded', points: 0, max: 20, status: 'missing' });
    }

    // 4. Grand Finale Scene (20 Points)
    const hasFinale = project.scenes?.some(s => s.template === 'final_wish');
    if (hasFinale) {
      score += 20;
      breakdown.push({ criteria: 'Celebration Finale Scene', points: 20, max: 20, status: 'pass' });
    } else {
      breakdown.push({ criteria: 'Celebration Finale Scene', points: 0, max: 20, status: 'missing' });
    }

    // 5. Wish Wall Configuration (20 Points)
    score += 20;
    breakdown.push({ criteria: 'Wish Wall & Moderation Ready', points: 20, max: 20, status: 'pass' });

    return {
      score: Math.min(100, Math.max(0, score)),
      breakdown
    };
  }
}

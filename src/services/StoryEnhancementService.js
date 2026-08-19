/**
 * Birthday Studio - Story Enhancement Service (Section 10)
 * 100% Free Local Deterministic Story Improvement Parser (Zero Network / AI APIs)
 */

export class StoryEnhancementService {
  /**
   * Deterministically inspects project state and returns actionable suggestions
   */
  static analyzeProject(project) {
    if (!project || !project.scenes) return [];

    const suggestions = [];
    const scenes = project.scenes;
    const occasion = project.occasion || 'birthday';

    // 1. Check Scene Count
    if (scenes.length <= 1) {
      suggestions.push({
        id: 'sug_add_scenes',
        type: 'flow',
        title: 'Add More Story Scenes',
        message: 'Your celebration currently has only 1 scene. Consider adding a memory gallery or message scene.',
        actionType: 'add_scene'
      });
    }

    // 2. Check Personalization
    if (!project.recipient?.name || project.recipient.name === 'Someone Special') {
      suggestions.push({
        id: 'sug_personalize_name',
        type: 'personalization',
        title: 'Personalize Recipient Name',
        message: 'Adding your recipient’s name makes the celebration feel created specifically for them.',
        actionType: 'personalize'
      });
    }

    // 3. Check Ending Scene
    const lastScene = scenes[scenes.length - 1];
    if (lastScene && lastScene.template !== 'final_wish') {
      suggestions.push({
        id: 'sug_add_finale',
        type: 'ending',
        title: 'Add a Grand Finale Scene',
        message: 'Adding a confetti finale scene creates a memorable closing moment.',
        actionType: 'add_finale'
      });
    }

    // 4. Check Media Allocation
    const hasMedia = (project.assetIds || []).length > 0;
    if (!hasMedia) {
      suggestions.push({
        id: 'sug_add_media',
        type: 'media',
        title: 'Add Photos or Videos',
        message: 'Uploading photo memories brings your celebration story to life.',
        actionType: 'add_media'
      });
    }

    return suggestions;
  }
}

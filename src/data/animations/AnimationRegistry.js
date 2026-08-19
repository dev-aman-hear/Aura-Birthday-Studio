/**
 * Birthday Studio - Animation Registry (Section 4 & Requirement 21)
 * Data-driven animation definitions & reduced-motion compliance
 */

export const ANIMATIONS = [
  { id: 'fade', name: 'Fade In', category: 'Basic', safeAlternative: 'fade' },
  { id: 'slide_up', name: 'Slide Up', category: 'Motion', safeAlternative: 'fade' },
  { id: 'slide_down', name: 'Slide Down', category: 'Motion', safeAlternative: 'fade' },
  { id: 'zoom', name: 'Zoom In', category: 'Motion', safeAlternative: 'fade' },
  { id: 'blur_reveal', name: 'Blur Reveal', category: 'Cinematic', safeAlternative: 'fade' },
  { id: 'typewriter', name: 'Typewriter', category: 'Text', safeAlternative: 'fade' },
  { id: 'ken_burns', name: 'Ken Burns Pan', category: 'Cinematic', safeAlternative: 'fade' },
  { id: 'float', name: 'Float Gentle', category: 'Subtle', safeAlternative: 'fade' },
  { id: 'pop', name: 'Pop Bouncy', category: 'Playful', safeAlternative: 'fade' },
  { id: 'cinematic_reveal', name: 'Cinematic Reveal', category: 'Cinematic', safeAlternative: 'fade' }
];

export class AnimationRegistry {
  static getAllAnimations() {
    return ANIMATIONS;
  }

  static getAnimationById(id) {
    return ANIMATIONS.find(a => a.id === id) || ANIMATIONS[0];
  }

  /**
   * Returns safe animation ID when prefers-reduced-motion is active
   */
  static getEffectiveAnimation(id) {
    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anim = this.getAnimationById(id);
    return isReduced ? anim.safeAlternative : anim.id;
  }
}

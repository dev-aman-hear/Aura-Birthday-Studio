/**
 * Birthday Studio - Universal Graduation Presets
 * Reusable Graduation Celebration Blueprints with dynamic placeholders
 */

import { Preset } from '../../../models/Preset.js';

export const GRADUATION_PRESETS = [
  new Preset({
    id: 'graduation_congrats',
    occasion: 'graduation',
    category: 'Achievement',
    title: 'Congratulations Graduate!',
    description: 'A proud celebration honoring academic dedication and future success.',
    icon: '🎓',
    tags: ['Proud', 'Graduation', 'Achievement'],
    availableVariants: ['1-scene', '2-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'dark_gold',
    fallbackContent: {
      recipientName: 'Graduate',
      senderName: 'Sender',
      occasion: 'Graduation',
      message: 'Congratulations on your graduation! So proud of all your hard work and achievements.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Graduation Hero', template: 'hero', duration: 8, titleText: 'Congratulations {{recipientName}}! 🎓', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '2-scene': [
        { name: 'Graduation Hero', template: 'hero', duration: 6, titleText: 'Class of {{date}}! 🎓', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Graduation Wish', template: 'final_wish', duration: 8, titleText: 'The Future is Bright 🌟', subtitleText: '{{message}}' }
      ],
      '3-scene': [
        { name: 'Graduation Hero', template: 'hero', duration: 6, titleText: 'Congratulations {{recipientName}}! 🎓', subtitleText: 'Honoring your achievement' },
        { name: 'Graduation Note', template: 'message', duration: 7, titleText: 'So Proud of You!', subtitleText: '{{message}}' },
        { name: 'Graduation Final Wish', template: 'final_wish', duration: 8, titleText: 'Wishing You Great Success! 🏆', subtitleText: 'From {{senderName}}' }
      ],
      '5-scene': [
        { name: 'Graduation Hero', template: 'hero', duration: 6, titleText: 'Congratulations {{recipientName}}! 🎓', subtitleText: 'Celebrating your graduation' },
        { name: 'Reveal', template: 'reveal', duration: 6, titleText: 'You Did It! 🎉', subtitleText: 'Hard work pays off' },
        { name: 'Journey', template: 'memory_timeline', duration: 8, titleText: 'The Academic Journey', subtitleText: 'Dedication and perseverance' },
        { name: 'Personal Message', template: 'message', duration: 7, titleText: 'A Proud Message', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'On to Great Things! 🚀', subtitleText: 'From {{senderName}}' }
      ]
    }
  })
];

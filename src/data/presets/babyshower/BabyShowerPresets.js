/**
 * Birthday Studio - Universal Baby Shower Presets
 * Reusable Baby Shower Celebration Blueprints with dynamic placeholders
 */

import { Preset } from '../../../models/Preset.js';

export const BABYSHOWER_PRESETS = [
  new Preset({
    id: 'babyshower_welcome',
    occasion: 'babyShower',
    category: 'Welcome',
    title: 'Welcome Little One',
    description: 'A sweet and joyful baby shower celebration welcoming a new bundle of joy.',
    icon: '🍼',
    tags: ['Sweet', 'Joyful', 'Family'],
    availableVariants: ['1-scene', '2-scene', '3-scene'],
    defaultVariant: '2-scene',
    theme: 'pink_rose',
    fallbackContent: {
      recipientName: 'The Growing Family',
      senderName: 'Sender',
      occasion: 'Baby Shower',
      message: 'Wishing your growing family endless love, happiness, and sweet moments.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Baby Shower Hero', template: 'hero', duration: 8, titleText: 'Welcome Little One! 🍼', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '2-scene': [
        { name: 'Baby Shower Hero', template: 'hero', duration: 6, titleText: 'Baby Shower Celebration 👶', subtitleText: 'Welcoming the new arrival' },
        { name: 'Baby Wish', template: 'final_wish', duration: 8, titleText: 'A Beautiful New Beginning 💫', subtitleText: '{{message}}\n\nWith love, {{senderName}}' }
      ],
      '3-scene': [
        { name: 'Baby Shower Hero', template: 'hero', duration: 6, titleText: 'Welcome Little One! 🍼', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Personal Note', template: 'message', duration: 7, titleText: 'Sweetest Wishes', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'May Your Home Be Filled With Joy 💖', subtitleText: 'From {{senderName}}' }
      ]
    }
  })
];

/**
 * Birthday Studio - Universal Wedding Presets
 * Reusable Wedding Celebration Blueprints with dynamic placeholders
 */

import { Preset } from '../../../models/Preset.js';

export const WEDDING_PRESETS = [
  new Preset({
    id: 'wedding_wishes',
    occasion: 'wedding',
    category: 'Celebration',
    title: 'Wedding Wishes',
    description: 'A beautiful wedding celebration experience wishing the couple eternal happiness.',
    icon: '💍',
    tags: ['Romantic', 'Wedding', 'Elegant'],
    availableVariants: ['1-scene', '2-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'pink_rose',
    fallbackContent: {
      recipientName: 'The Happy Couple',
      senderName: 'Sender',
      occasion: 'Wedding Day',
      message: 'Wishing you a lifetime of love, laughter, and happiness together!'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Wedding Wish', template: 'hero', duration: 8, titleText: 'Congratulations {{recipientName}}! 💍', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '2-scene': [
        { name: 'Wedding Opening', template: 'hero', duration: 6, titleText: 'Congratulations on Your Wedding! 💍', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Wedding Wish', template: 'final_wish', duration: 8, titleText: 'Two Hearts, One Journey ❤️', subtitleText: '{{message}}' }
      ],
      '3-scene': [
        { name: 'Wedding Opening', template: 'hero', duration: 6, titleText: 'Happy Wedding Day {{recipientName}}! 💍', subtitleText: 'A beautiful new beginning' },
        { name: 'Wedding Message', template: 'message', duration: 7, titleText: 'Our Blessing', subtitleText: '{{message}}' },
        { name: 'Wedding Final Wish', template: 'final_wish', duration: 8, titleText: 'Wishing You Eternal Love 💫', subtitleText: 'From {{senderName}}' }
      ],
      '5-scene': [
        { name: 'Wedding Opening', template: 'hero', duration: 6, titleText: 'Congratulations {{recipientName}}! 💍', subtitleText: 'Celebrating your love story' },
        { name: 'Special Reveal', template: 'reveal', duration: 6, titleText: 'Just Married! ✨', subtitleText: 'A union of two loving hearts' },
        { name: 'Gallery', template: 'photo_gallery', duration: 8, titleText: 'Beautiful Moments', subtitleText: 'Love in every picture' },
        { name: 'Personal Message', template: 'message', duration: 7, titleText: 'With All Our Love', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Happily Ever After ❤️', subtitleText: 'From {{senderName}}' }
      ]
    }
  }),

  new Preset({
    id: 'wedding_note',
    occasion: 'wedding',
    category: 'Minimal',
    title: 'Wedding Note',
    description: 'An elegant minimal wedding note focusing on heartfelt wishes.',
    icon: '📝',
    tags: ['Minimal', 'Elegant'],
    availableVariants: ['1-scene', '2-scene', '3-scene'],
    defaultVariant: '2-scene',
    theme: 'purple_gold',
    fallbackContent: {
      recipientName: 'The Happy Couple',
      senderName: 'Sender',
      occasion: 'Wedding Day',
      message: 'May the love you share today grow stronger as you grow old together.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Wedding Note', template: 'message', duration: 8, titleText: 'To {{recipientName}} 💍', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '2-scene': [
        { name: 'Wedding Note', template: 'hero', duration: 6, titleText: 'Congratulations {{recipientName}}', subtitleText: 'On your wedding day' },
        { name: 'Personal Message', template: 'message', duration: 8, titleText: 'Warmest Wishes', subtitleText: '{{message}}\n\nWith love, {{senderName}}' }
      ],
      '3-scene': [
        { name: 'Wedding Note', template: 'hero', duration: 6, titleText: 'Celebrating {{recipientName}} 💍', subtitleText: 'Two hearts united' },
        { name: 'Personal Note', template: 'message', duration: 7, titleText: 'Wedding Blessing', subtitleText: '{{message}}' },
        { name: 'Closing', template: 'final_wish', duration: 7, titleText: 'Wishing You Infinite Joy', subtitleText: '— {{senderName}}' }
      ]
    }
  })
];

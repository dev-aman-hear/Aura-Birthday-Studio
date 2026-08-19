/**
 * Birthday Studio - Universal Anniversary Presets
 * Reusable Anniversary Celebration Blueprints with dynamic placeholders
 */

import { Preset } from '../../../models/Preset.js';

export const ANNIVERSARY_PRESETS = [
  new Preset({
    id: 'anniversary_wishes',
    occasion: 'anniversary',
    category: 'Romantic',
    title: 'Anniversary Wishes',
    description: 'A romantic anniversary experience celebrating years of togetherness.',
    icon: '❤️',
    tags: ['Romantic', 'Anniversary', 'Heartfelt'],
    availableVariants: ['1-scene', '2-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'pink_rose',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Anniversary',
      message: 'Wishing us many more wonderful years of love, laughter, and togetherness.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Anniversary Wish', template: 'hero', duration: 8, titleText: 'Happy Anniversary {{recipientName}}! ❤️', subtitleText: '{{message}}' }
      ],
      '2-scene': [
        { name: 'Anniversary Opening', template: 'hero', duration: 6, titleText: 'Happy Anniversary! ❤️', subtitleText: 'Celebrating another beautiful year with {{recipientName}}' },
        { name: 'Anniversary Wish', template: 'final_wish', duration: 8, titleText: 'Here is to Forever 🥂', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '3-scene': [
        { name: 'Anniversary Hero', template: 'hero', duration: 6, titleText: 'Happy Anniversary {{recipientName}}! ❤️', subtitleText: 'Celebrating our journey together' },
        { name: 'Anniversary Message', template: 'message', duration: 7, titleText: 'A Special Message', subtitleText: '{{message}}' },
        { name: 'Anniversary Final Wish', template: 'final_wish', duration: 8, titleText: 'To Many More Years of Love 💫', subtitleText: 'Always & Forever, {{senderName}}' }
      ],
      '5-scene': [
        { name: 'Anniversary Hero', template: 'hero', duration: 6, titleText: 'Happy Anniversary {{recipientName}}! ❤️', subtitleText: 'Celebrating your love story' },
        { name: 'Milestone Reveal', template: 'reveal', duration: 6, titleText: 'Another Year Together! ✨', subtitleText: 'Love grows stronger every day' },
        { name: 'Memories Timeline', template: 'memory_timeline', duration: 8, titleText: 'Our Journey', subtitleText: 'Precious memories shared' },
        { name: 'Personal Message', template: 'message', duration: 7, titleText: 'From the Heart', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Happy Anniversary! 💖', subtitleText: 'Love, {{senderName}}' }
      ]
    }
  })
];

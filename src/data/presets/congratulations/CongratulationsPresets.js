/**
 * Birthday Studio - Universal Congratulations Presets
 * Reusable Congratulations Celebration Blueprints with dynamic placeholders
 */

import { Preset } from '../../../models/Preset.js';

export const CONGRATULATIONS_PRESETS = [
  new Preset({
    id: 'congratulations_message',
    occasion: 'congratulations',
    category: 'Celebration',
    title: 'Congratulations Message',
    description: 'A vibrant celebration for promotions, milestones, and personal triumphs.',
    icon: '🎉',
    tags: ['Festive', 'Success', 'Joy'],
    availableVariants: ['1-scene', '2-scene', '3-scene'],
    defaultVariant: '2-scene',
    theme: 'purple_gold',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Congratulations',
      message: 'Congratulations on this milestone! Wishing you continued success and happiness.'
    },
    sceneBlueprints: {
      '1-scene': [
        { name: 'Congrats Hero', template: 'hero', duration: 8, titleText: 'Congratulations {{recipientName}}! 🎉', subtitleText: '{{message}} — {{senderName}}' }
      ],
      '2-scene': [
        { name: 'Congrats Hero', template: 'hero', duration: 6, titleText: 'Congratulations! 🎉', subtitleText: 'Celebrating {{recipientName}}' },
        { name: 'Congrats Wish', template: 'final_wish', duration: 8, titleText: 'Cheers to Your Success! 🥂', subtitleText: '{{message}}\n\n— {{senderName}}' }
      ],
      '3-scene': [
        { name: 'Congrats Hero', template: 'hero', duration: 6, titleText: 'Congratulations {{recipientName}}! 🎉', subtitleText: 'A moment worth celebrating' },
        { name: 'Personal Note', template: 'message', duration: 7, titleText: 'So Thrilled For You!', subtitleText: '{{message}}' },
        { name: 'Final Wish', template: 'final_wish', duration: 8, titleText: 'Wishing You Even Greater Success! 🌟', subtitleText: 'From {{senderName}}' }
      ]
    }
  })
];

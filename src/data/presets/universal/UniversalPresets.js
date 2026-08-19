/**
 * Birthday Studio - Universal Preset Collection
 * Contains reusable, cinematic scene presets across categories:
 * Birthday, Birthday Memories, Anniversary, Friendship, Wedding, Celebration, Memories, Love, Universal
 */

import { Preset } from '../../../models/Preset.js';

export const UNIVERSAL_PRESETS = [
  // 1. CINEMATIC BIRTHDAY
  new Preset({
    id: 'cinematic_birthday',
    occasion: 'birthday',
    category: 'Birthday',
    title: 'Cinematic Birthday',
    description: 'A luxurious cinematic birthday experience with gold accents and high-impact text reveals.',
    icon: '✨',
    tags: ['Cinematic', 'Gold', 'Premium'],
    availableVariants: ['1-scene', '3-scene', '5-scene', '8-scene'],
    defaultVariant: '8-scene',
    theme: 'purple_gold',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Birthday Celebration',
      message: 'May your day be filled with sparkle, warmth, and boundless joy!'
    },
    sceneBlueprints: {
      '8-scene': [
        {
          id: 'blueprint_scene_01',
          name: 'Grand Cinematic Opening',
          template: 'universal',
          duration: 6,
          transition: 'fade',
          elements: [
            { id: 'scene-01-badge', type: 'text', content: '✨ EXCLUSIVE CELEBRATION ✨', position: { mode: 'dynamic', x: 50, y: 24, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'fadeIn' },
            { id: 'scene-01-title', type: 'text', content: 'Happy Birthday, {{recipientName}}! 🎉', position: { mode: 'dynamic', x: 50, y: 46, anchor: 'center' }, size: { mode: 'dynamic', width: 88 }, fontSize: 42, fontWeight: '900', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'scene-01-sub', type: 'text', content: 'A cinematic celebration created by {{senderName}}', position: { mode: 'dynamic', x: 50, y: 70, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 19, fontWeight: '500', color: '#a29bfe', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          id: 'blueprint_scene_02',
          name: 'The Milestone Spotlight',
          template: 'universal',
          duration: 7,
          transition: 'zoom',
          elements: [
            { id: 'scene-02-badge', type: 'shape', content: '⭐', position: { mode: 'dynamic', x: 50, y: 20, anchor: 'center' }, fontSize: 46, animation: 'pop' },
            { id: 'scene-02-age', type: 'text', content: '{{age}} Milestone Celebration 🌟', position: { mode: 'dynamic', x: 50, y: 38, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 26, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'fadeIn' },
            { id: 'scene-02-title', type: 'text', content: 'A Year of Brilliance & Grace ✨', position: { mode: 'dynamic', x: 50, y: 56, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 34, fontWeight: '800', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'scene-02-sub', type: 'text', content: 'Every triumph, every smile, and every beautiful memory.', position: { mode: 'dynamic', x: 50, y: 74, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 18, color: '#e2e8f0', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          id: 'blueprint_scene_03',
          name: 'Cherished Memories',
          template: 'universal',
          duration: 8,
          transition: 'zoom',
          elements: [
            { id: 'scene-03-photo', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 38, anchor: 'center' }, size: { mode: 'dynamic', width: 68, height: 48 }, borderRadius: 16, animation: 'ken_burns' },
            { id: 'scene-03-title', type: 'text', content: 'Moments to Treasure 📸', position: { mode: 'dynamic', x: 50, y: 74, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 24, fontWeight: '800', color: '#ffffff', align: 'center', animation: 'pop' },
            { id: 'scene-03-sub', type: 'text', content: 'Looking back on our wonderful shared journey.', position: { mode: 'dynamic', x: 50, y: 84, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, color: '#cbd5e1', align: 'center', animation: 'fadeIn' }
          ]
        },
        {
          id: 'blueprint_scene_04',
          name: 'Unforgettable Journey',
          template: 'universal',
          duration: 8,
          transition: 'fade',
          elements: [
            { id: 'scene-04-photo', type: 'image', content: '{{photo2}}', position: { mode: 'dynamic', x: 50, y: 36, anchor: 'center' }, size: { mode: 'dynamic', width: 68, height: 46 }, borderRadius: 16, animation: 'ken_burns' },
            { id: 'scene-04-quote', type: 'text', content: 'Adventures & Laughter ✨', position: { mode: 'dynamic', x: 50, y: 72, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 24, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'slide_up' },
            { id: 'scene-04-sub', type: 'text', content: 'To all the unforgettable stories and ones yet to come.', position: { mode: 'dynamic', x: 50, y: 82, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, color: '#e2e8f0', align: 'center', animation: 'fadeIn' }
          ]
        },
        {
          id: 'blueprint_scene_05',
          name: 'From The Heart',
          template: 'universal',
          duration: 8,
          transition: 'fade',
          elements: [
            { id: 'scene-05-icon', type: 'shape', content: '💌', position: { mode: 'dynamic', x: 50, y: 22, anchor: 'center' }, fontSize: 44, animation: 'pop' },
            { id: 'scene-05-quote', type: 'text', content: '"{{message}}"', position: { mode: 'dynamic', x: 50, y: 48, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 24, fontWeight: '600', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'scene-05-author', type: 'text', content: '— With love, {{senderName}}', position: { mode: 'dynamic', x: 50, y: 74, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 19, fontWeight: '500', color: '#ffd700', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          id: 'blueprint_scene_06',
          name: 'Golden Highlights',
          template: 'universal',
          duration: 8,
          transition: 'zoom',
          elements: [
            { id: 'scene-06-photo', type: 'image', content: '{{photo3}}', position: { mode: 'dynamic', x: 50, y: 38, anchor: 'center' }, size: { mode: 'dynamic', width: 68, height: 48 }, borderRadius: 16, animation: 'ken_burns' },
            { id: 'scene-06-title', type: 'text', content: 'Golden Moments & Endless Smiles 💫', position: { mode: 'dynamic', x: 50, y: 74, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 22, fontWeight: '700', color: '#ffffff', align: 'center', animation: 'fadeIn' },
            { id: 'scene-06-sub', type: 'text', content: 'A year full of brightness, kindness, and magic.', position: { mode: 'dynamic', x: 50, y: 84, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, color: '#cbd5e1', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          id: 'blueprint_scene_07',
          name: 'Milestone Wishes',
          template: 'universal',
          duration: 7,
          transition: 'fade',
          elements: [
            { id: 'scene-07-badge', type: 'shape', content: '🌠', position: { mode: 'dynamic', x: 50, y: 24, anchor: 'center' }, fontSize: 48, animation: 'float' },
            { id: 'scene-07-title', type: 'text', content: 'May All Your Dreams Come True! ✨', position: { mode: 'dynamic', x: 50, y: 46, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 32, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'scene-07-sub', type: 'text', content: 'Health, happiness, success, and boundless joy in your next chapter.', position: { mode: 'dynamic', x: 50, y: 68, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 18, color: '#ffffff', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          id: 'blueprint_scene_08',
          name: 'Grand Finale Celebration',
          template: 'universal',
          duration: 9,
          transition: 'pop',
          elements: [
            { id: 'scene-08-icon', type: 'shape', content: '🎂', position: { mode: 'dynamic', x: 50, y: 22, anchor: 'center' }, fontSize: 52, animation: 'pop' },
            { id: 'scene-08-title', type: 'text', content: 'Happy Birthday, {{recipientName}}! 🍾🥂', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 36, fontWeight: '900', color: '#ffd700', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'scene-08-sub', type: 'text', content: 'Cheers to your greatest year yet! 💖', position: { mode: 'dynamic', x: 50, y: 68, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '600', color: '#ffffff', align: 'center', animation: 'slide_up' }
          ]
        }
      ],
      '5-scene': [
        {
          name: 'Grand Opening',
          template: 'universal',
          duration: 6,
          transition: 'fade',
          elements: [
            { id: 'el_badge', type: 'text', content: '✨ SPECIAL CELEBRATION ✨', position: { mode: 'dynamic', x: 50, y: 25, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'fadeIn' },
            { id: 'el_title', type: 'text', content: 'Happy Birthday, {{recipientName}}! 🎉', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 44, fontWeight: '900', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_sub', type: 'text', content: 'Created with love by {{senderName}}', position: { mode: 'dynamic', x: 50, y: 70, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '400', color: '#a29bfe', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'The Spotlight',
          template: 'universal',
          duration: 7,
          transition: 'zoom',
          elements: [
            { id: 'el_star_badge', type: 'shape', content: '⭐', position: { mode: 'dynamic', x: 50, y: 22, anchor: 'center' }, fontSize: 48, animation: 'pop' },
            { id: 'el_spotlight_title', type: 'text', content: 'Celebrating You Today 🌟', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 38, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'cinematicTextReveal' }
          ]
        },
        {
          name: 'Cherished Memories',
          template: 'universal',
          duration: 8,
          transition: 'zoom',
          elements: [
            { id: 'el_img1', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 40, anchor: 'center' }, size: { mode: 'dynamic', width: 65, height: 48 }, borderRadius: 16, animation: 'ken_burns' },
            { id: 'el_msg_title', type: 'text', content: 'A Moment to Remember 📸', position: { mode: 'dynamic', x: 50, y: 76, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 26, fontWeight: '800', color: '#ffffff', align: 'center', animation: 'pop' }
          ]
        },
        {
          name: 'From The Heart',
          template: 'universal',
          duration: 8,
          transition: 'fade',
          elements: [
            { id: 'el_heart_icon', type: 'shape', content: '💌', position: { mode: 'dynamic', x: 50, y: 22, anchor: 'center' }, fontSize: 44, animation: 'pop' },
            { id: 'el_msg_quote', type: 'text', content: '"{{message}}"', position: { mode: 'dynamic', x: 50, y: 48, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 26, fontWeight: '600', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_msg_author', type: 'text', content: '— With love, {{senderName}}', position: { mode: 'dynamic', x: 50, y: 74, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '400', color: '#ffd700', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'Grand Finale',
          template: 'universal',
          duration: 8,
          transition: 'fade',
          elements: [
            { id: 'el_heart', type: 'shape', content: '💖', position: { mode: 'dynamic', x: 50, y: 25, anchor: 'center' }, size: { mode: 'dynamic', width: 80, height: 80 }, fontSize: 48, animation: 'float' },
            { id: 'el_final_title', type: 'text', content: 'Wishing You Joy Always! 🎂', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 36, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_final_sub', type: 'text', content: '{{message}}', position: { mode: 'dynamic', x: 50, y: 65, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '400', color: '#ffffff', align: 'center', animation: 'slide_up' }
          ]
        }
      ],
      '3-scene': [
        {
          name: 'Grand Opening',
          template: 'universal',
          duration: 6,
          transition: 'fade',
          elements: [
            { id: 'el_badge', type: 'text', content: '✨ SPECIAL CELEBRATION ✨', position: { mode: 'dynamic', x: 50, y: 25, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'fadeIn' },
            { id: 'el_title', type: 'text', content: 'Happy Birthday, {{recipientName}}! 🎉', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 44, fontWeight: '900', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_sub', type: 'text', content: 'Created with love by {{senderName}}', position: { mode: 'dynamic', x: 50, y: 70, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '400', color: '#a29bfe', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'Cherished Memories',
          template: 'universal',
          duration: 8,
          transition: 'zoom',
          elements: [
            { id: 'el_img1', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 40, anchor: 'center' }, size: { mode: 'dynamic', width: 60, height: 45 }, borderRadius: 16, animation: 'ken_burns' },
            { id: 'el_msg_title', type: 'text', content: 'A Moment to Remember', position: { mode: 'dynamic', x: 50, y: 75, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 28, fontWeight: '800', color: '#ffffff', align: 'center', animation: 'pop' }
          ]
        },
        {
          name: 'Warm Wishes',
          template: 'universal',
          duration: 8,
          transition: 'fade',
          elements: [
            { id: 'el_heart', type: 'shape', content: '💖', position: { mode: 'dynamic', x: 50, y: 25, anchor: 'center' }, size: { mode: 'dynamic', width: 80, height: 80 }, fontSize: 48, animation: 'float' },
            { id: 'el_final_title', type: 'text', content: 'Wishing You Joy Always! 🎂', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 36, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_final_sub', type: 'text', content: '{{message}}', position: { mode: 'dynamic', x: 50, y: 65, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '400', color: '#ffffff', align: 'center', animation: 'slide_up' }
          ]
        }
      ],
      '1-scene': [
        {
          name: 'Grand Opening',
          template: 'universal',
          duration: 8,
          transition: 'fade',
          elements: [
            { id: 'el_badge', type: 'text', content: '✨ SPECIAL CELEBRATION ✨', position: { mode: 'dynamic', x: 50, y: 25, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 16, fontWeight: '800', color: '#ffd700', align: 'center', animation: 'fadeIn' },
            { id: 'el_title', type: 'text', content: 'Happy Birthday, {{recipientName}}! 🎉', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 44, fontWeight: '900', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_sub', type: 'text', content: '{{message}} — With love from {{senderName}}', position: { mode: 'dynamic', x: 50, y: 70, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, fontWeight: '400', color: '#a29bfe', align: 'center', animation: 'slide_up' }
          ]
        }
      ]
    }
  }),

  // 2. ROMANTIC ANNIVERSARY
  new Preset({
    id: 'romantic_anniversary',
    occasion: 'anniversary',
    category: 'Anniversary',
    title: 'Eternal Love Anniversary',
    description: 'Elegant rose-gold theme crafted to honor timeless love and romantic milestones.',
    icon: '💍',
    tags: ['Romantic', 'Rose Gold', 'Elegant'],
    availableVariants: ['1-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'pink_rose',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Happy Anniversary',
      message: 'Thank you for every smile, every memory, and a lifetime of love.'
    },
    sceneBlueprints: {
      '3-scene': [
        {
          name: 'Anniversary Intro',
          template: 'universal',
          duration: 7,
          elements: [
            { id: 'el_intro_badge', type: 'text', content: '🌹 HAPPY ANNIVERSARY 🌹', position: { mode: 'dynamic', x: 50, y: 30, anchor: 'center' }, fontSize: 18, fontWeight: '700', color: '#ff7675', align: 'center', animation: 'blur_reveal' },
            { id: 'el_intro_title', type: 'text', content: 'To {{recipientName}}', position: { mode: 'dynamic', x: 50, y: 48, anchor: 'center' }, fontSize: 48, fontWeight: '800', fontFamily: 'Playfair Display, serif', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_intro_sub', type: 'text', content: 'Forever & Always with {{senderName}}', position: { mode: 'dynamic', x: 50, y: 70, anchor: 'center' }, fontSize: 20, fontWeight: '400', color: '#fd79a8', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'Our Journey',
          template: 'universal',
          duration: 8,
          elements: [
            { id: 'el_anniv_img', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 42, anchor: 'center' }, size: { mode: 'dynamic', width: 65, height: 48 }, borderRadius: 20, animation: 'ken_burns' },
            { id: 'el_anniv_caption', type: 'text', content: 'Every day with you is a gift 💕', position: { mode: 'dynamic', x: 50, y: 78, anchor: 'center' }, fontSize: 24, fontWeight: '600', color: '#ffffff', align: 'center', animation: 'fadeIn' }
          ]
        },
        {
          name: 'Forever Wish',
          template: 'universal',
          duration: 8,
          elements: [
            { id: 'el_love_msg', type: 'text', content: '"{{message}}"', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 28, fontWeight: '600', fontFamily: 'Playfair Display, serif', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_love_sign', type: 'text', content: 'With all my heart, {{senderName}}', position: { mode: 'dynamic', x: 50, y: 72, anchor: 'center' }, fontSize: 20, fontWeight: '400', color: '#ff7675', align: 'center', animation: 'slide_up' }
          ]
        }
      ]
    }
  }),

  // 3. BEST FRIENDS FOREVER (FRIENDSHIP)
  new Preset({
    id: 'friendship_celebration',
    occasion: 'friendship',
    category: 'Friendship',
    title: 'Best Friends Forever',
    description: 'Vibrant, fun, and energetic blueprint celebrating unforgettable friend moments.',
    icon: '🌟',
    tags: ['Fun', 'Vibrant', 'Memories'],
    availableVariants: ['1-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'teal_dark',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Friendship Day',
      message: 'Cheers to all the crazy adventures, endless laughter, and lifelong friendship!'
    },
    sceneBlueprints: {
      '3-scene': [
        {
          name: 'Friendship Intro',
          template: 'universal',
          duration: 6,
          elements: [
            { id: 'el_star', type: 'shape', content: '⭐', position: { mode: 'dynamic', x: 50, y: 25, anchor: 'center' }, fontSize: 44, animation: 'pop' },
            { id: 'el_title', type: 'text', content: 'To My Best Friend, {{recipientName}}! 🚀', position: { mode: 'dynamic', x: 50, y: 48, anchor: 'center' }, size: { mode: 'dynamic', width: 85 }, fontSize: 38, fontWeight: '800', color: '#55e6c1', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_sub', type: 'text', content: 'From {{senderName}}', position: { mode: 'dynamic', x: 50, y: 70, anchor: 'center' }, fontSize: 22, color: '#ffffff', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'Fun Snapshot',
          template: 'universal',
          duration: 7,
          elements: [
            { id: 'el_friend_img', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 40, anchor: 'center' }, size: { mode: 'dynamic', width: 60, height: 45 }, borderRadius: 16, animation: 'pop' },
            { id: 'el_friend_txt', type: 'text', content: 'Unstoppable Duo 🤜🤛', position: { mode: 'dynamic', x: 50, y: 76, anchor: 'center' }, fontSize: 26, fontWeight: '700', color: '#ffffff', align: 'center', animation: 'fadeIn' }
          ]
        },
        {
          name: 'Friendship Wish',
          template: 'universal',
          duration: 8,
          elements: [
            { id: 'el_wish_text', type: 'text', content: '{{message}}', position: { mode: 'dynamic', x: 50, y: 50, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 26, color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' }
          ]
        }
      ]
    }
  }),

  // 4. DREAM WEDDING
  new Preset({
    id: 'dream_wedding',
    occasion: 'wedding',
    category: 'Wedding',
    title: 'Dream Wedding Celebration',
    description: 'Pure white and gold aesthetic designed to share wedding joy and congratulatory wishes.',
    icon: '💒',
    tags: ['Wedding', 'Pure', 'Gold'],
    availableVariants: ['1-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'dark_gold',
    fallbackContent: {
      recipientName: 'The Happy Couple',
      senderName: 'Sender',
      occasion: 'Wedding Day',
      message: 'May your union be blessed with eternal peace, profound joy, and endless harmony.'
    },
    sceneBlueprints: {
      '3-scene': [
        {
          name: 'Wedding Opening',
          template: 'universal',
          duration: 7,
          elements: [
            { id: 'el_badge', type: 'text', content: '✨ CELEBRATING THE WEDDING OF ✨', position: { mode: 'dynamic', x: 50, y: 28, anchor: 'center' }, fontSize: 16, color: '#ffd700', align: 'center', animation: 'blur_reveal' },
            { id: 'el_title', type: 'text', content: '{{recipientName}}', position: { mode: 'dynamic', x: 50, y: 48, anchor: 'center' }, fontSize: 46, fontWeight: '800', fontFamily: 'Cinzel, serif', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_sub', type: 'text', content: 'With Love from {{senderName}}', position: { mode: 'dynamic', x: 50, y: 72, anchor: 'center' }, fontSize: 18, color: '#dcdde1', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'Cherished Portrait',
          template: 'universal',
          duration: 8,
          elements: [
            { id: 'el_img', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 65, height: 50 }, borderRadius: 12, animation: 'ken_burns' }
          ]
        },
        {
          name: 'Blessings & Wish',
          template: 'universal',
          duration: 8,
          elements: [
            { id: 'el_msg', type: 'text', content: '{{message}}', position: { mode: 'dynamic', x: 50, y: 50, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 26, fontFamily: 'Playfair Display, serif', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' }
          ]
        }
      ]
    }
  }),

  // 5. UNIVERSAL MEMORIES
  new Preset({
    id: 'universal_memories',
    occasion: 'universal',
    category: 'Memories',
    title: 'Memories Spotlight',
    description: 'A timeless gallery spotlight suitable for any personal story, trip, or milestone.',
    icon: '📸',
    tags: ['Gallery', 'Memories', 'Highlights'],
    availableVariants: ['1-scene', '3-scene', '5-scene'],
    defaultVariant: '3-scene',
    theme: 'purple_gold',
    fallbackContent: {
      recipientName: 'Recipient',
      senderName: 'Sender',
      occasion: 'Memories',
      message: 'Collecting moments, not just things. Here is to unforgettable memories.'
    },
    sceneBlueprints: {
      '3-scene': [
        {
          name: 'Memories Intro',
          template: 'universal',
          duration: 6,
          elements: [
            { id: 'el_title', type: 'text', content: 'Unforgettable Memories 📸', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, fontSize: 40, fontWeight: '800', color: '#ffffff', align: 'center', animation: 'cinematicTextReveal' },
            { id: 'el_sub', type: 'text', content: 'Dedicated to {{recipientName}}', position: { mode: 'dynamic', x: 50, y: 68, anchor: 'center' }, fontSize: 22, color: '#a29bfe', align: 'center', animation: 'slide_up' }
          ]
        },
        {
          name: 'Photo Spotlight 1',
          template: 'universal',
          duration: 7,
          elements: [
            { id: 'el_img1', type: 'image', content: '{{photo1}}', position: { mode: 'dynamic', x: 50, y: 45, anchor: 'center' }, size: { mode: 'dynamic', width: 65, height: 48 }, borderRadius: 16, animation: 'pop' }
          ]
        },
        {
          name: 'Photo Spotlight 2',
          template: 'universal',
          duration: 7,
          elements: [
            { id: 'el_img2', type: 'image', content: '{{photo2}}', position: { mode: 'dynamic', x: 50, y: 42, anchor: 'center' }, size: { mode: 'dynamic', width: 65, height: 48 }, borderRadius: 16, animation: 'ken_burns' },
            { id: 'el_note', type: 'text', content: '{{message}}', position: { mode: 'dynamic', x: 50, y: 78, anchor: 'center' }, size: { mode: 'dynamic', width: 80 }, fontSize: 20, color: '#ffffff', align: 'center', animation: 'fadeIn' }
          ]
        }
      ]
    }
  })
];

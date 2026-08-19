/**
 * Birthday Studio - Universal Scene Templates Catalog
 * Prebuilt scenes independent of occasion for Birthday, Wedding, Anniversary, etc.
 */

export const UNIVERSAL_SCENE_TEMPLATES = [
  {
    id: 'uni_title_intro',
    name: 'Title Opening',
    category: 'Featured',
    icon: '✨',
    description: 'Versatile title intro opening scene suitable for any celebration.',
    recommendedDuration: 6,
    template: 'hero',
    defaultText: { title: 'Welcome to the Celebration!', subtitle: 'A special experience created with love.', badge: '✨ CELEBRATION INTRO ✨' }
  },
  {
    id: 'uni_fullscreen_photo',
    name: 'Fullscreen Photo',
    category: 'Featured',
    icon: '📸',
    description: 'Full-bleed high-impact photo showcase with text overlay.',
    recommendedDuration: 6,
    template: 'fullscreen_photo',
    defaultText: { title: 'Forever Cherished', subtitle: 'Capturing unforgettable moments.' }
  },
  {
    id: 'uni_photo_text',
    name: 'Photo & Note',
    category: 'Featured',
    icon: '🖼️',
    description: 'Balanced photo layout paired with custom typography.',
    recommendedDuration: 7,
    template: 'message',
    defaultText: { title: 'Special Moments', subtitle: 'Every picture tells a story worth remembering.' }
  },
  {
    id: 'uni_memory_timeline',
    name: 'Memory Timeline',
    category: 'Featured',
    icon: '⏳',
    description: 'Horizontal step-by-step chronological story timeline.',
    recommendedDuration: 8,
    template: 'memory_timeline',
    defaultText: { title: 'Memory Timeline', subtitle: 'Journey through special milestones.' }
  },
  {
    id: 'uni_quote',
    name: 'Heartfelt Quote',
    category: 'Featured',
    icon: '💬',
    description: 'Focused quote card for meaningful text & messages.',
    recommendedDuration: 7,
    template: 'message',
    defaultText: { title: 'Heartfelt Words', subtitle: 'Celebrate the past, cherish the present, and embrace the future.' }
  },
  {
    id: 'uni_video',
    name: 'Video Showcase',
    category: 'Featured',
    icon: '🎬',
    description: 'Embedded video showcase player with backdrop overlay.',
    recommendedDuration: 10,
    template: 'video_showcase',
    defaultText: { title: 'Video Highlight', subtitle: 'Press play to watch special video moments.' }
  },
  {
    id: 'uni_thankyou',
    name: 'Thank You Note',
    category: 'Featured',
    icon: '🙏',
    description: 'Express gratitude and appreciation to guests.',
    recommendedDuration: 6,
    template: 'hero',
    defaultText: { title: 'Thank You!', subtitle: 'Thank you for being part of this special milestone.', badge: '🙏 GRATITUDE & LOVE 🙏' }
  },
  {
    id: 'uni_outro',
    name: 'Closing Message',
    category: 'Featured',
    icon: '🌟',
    description: 'Grand closing finale scene with replay controls.',
    recommendedDuration: 6,
    template: 'final_wish',
    defaultText: { title: 'Warmest Wishes!', subtitle: 'Wishing you continuous happiness, success, and love!' }
  },
  {
    id: 'uni_celebration',
    name: 'Celebration Burst',
    category: 'Featured',
    icon: '🎉',
    description: 'High-energy celebration burst reveal screen.',
    recommendedDuration: 6,
    template: 'reveal',
    defaultText: { title: 'Cheers to the Moment!', subtitle: 'Celebrating incredible achievements and milestones!' }
  },
  {
    id: 'uni_photo_gallery',
    name: 'Photo Gallery',
    category: 'Featured',
    icon: '🖼️',
    description: 'Grid layout displaying multiple curated photos together.',
    recommendedDuration: 8,
    template: 'photo_gallery',
    defaultText: { title: 'Precious Memories', subtitle: 'A collection of beautiful moments shared together.' }
  },
  {
    id: 'uni_collage',
    name: 'Photo Collage',
    category: 'Featured',
    icon: '🎨',
    description: 'Dynamic multi-photo mesh collage with variable card tilt.',
    recommendedDuration: 7,
    template: 'collage',
    defaultText: { title: 'Photo Collage', subtitle: 'Memories woven together in style.' }
  },
  {
    id: 'uni_wish_wall',
    name: 'Wish Wall',
    category: 'Featured',
    icon: '💌',
    description: 'Interactive guestbook wish wall with dynamic visitor greetings and reactions.',
    recommendedDuration: 8,
    template: 'wish-wall',
    defaultText: { title: 'Wishes & Greetings', subtitle: 'Leave your warmest thoughts and congratulations below.' }
  },
  {
    id: 'uni_blank',
    name: 'Custom Blank Canvas',
    category: 'Featured',
    icon: '📄',
    description: 'Clean customizable canvas for custom photos, videos, and text.',
    recommendedDuration: 6,
    template: 'hero',
    defaultText: { title: 'Custom Scene', subtitle: 'Add your own text and media elements here.' }
  },
  // 11 Canonical Special Story Scenes
  {
    id: 'special_cinematic_intro',
    name: 'Cinematic Story Intro',
    category: 'Cinematic',
    icon: '🎬',
    description: 'Dramatic cinematic opening with glowing date header, multi-line buildup and glowing BEGIN CTA.',
    recommendedDuration: 8,
    template: 'special_cinematic_intro'
  },
  {
    id: 'special_childhood_memories',
    name: 'Early Years Memories',
    category: 'Cinematic',
    icon: '👶',
    description: 'Multi-step childhood photo showcase with year badges, step dots, and blur transitions.',
    recommendedDuration: 10,
    template: 'special_childhood_memories'
  },
  {
    id: 'special_memory_sequence',
    name: 'Memory Journey',
    category: 'Cinematic',
    icon: '🎞️',
    description: 'Interactive memory sequence with Ken Burns camera drift, year badges, and step dots.',
    recommendedDuration: 10,
    template: 'special_memory_sequence'
  },
  {
    id: 'special_collage_gallery',
    name: 'Collage Gallery',
    category: 'Cinematic',
    icon: '🖼️',
    description: 'Uncropped full-view photo collages with background blur padding and click-to-zoom modal.',
    recommendedDuration: 8,
    template: 'special_collage_gallery'
  },
  {
    id: 'special_chaos_montage',
    name: 'Humor & Highlights',
    category: 'Cinematic',
    icon: '😜',
    description: 'Fun comedic montage with alternating card tilt, punchy text entrance, and laughter.',
    recommendedDuration: 8,
    template: 'special_chaos_montage'
  },
  {
    id: 'special_letter_reveal',
    name: 'Celebration Letter',
    category: 'Cinematic',
    icon: '💌',
    description: 'Tactile 3D envelope opening with letter extraction, handwriting flourish, and signature.',
    recommendedDuration: 8,
    template: 'special_letter_reveal'
  },
  {
    id: 'special_fake_ending',
    name: 'Surprise Twist',
    category: 'Cinematic',
    icon: '🎭',
    description: 'Dramatic emotional conclusion twist leading into surprise secret reveal.',
    recommendedDuration: 6,
    template: 'special_fake_ending'
  },
  {
    id: 'special_3d_gift_reveal',
    name: 'Gift Box Reveal',
    category: 'Cinematic',
    icon: '🎁',
    description: '3D gift box unboxing with lid lift, floating memory card, and golden particle fountain.',
    recommendedDuration: 8,
    template: 'special_3d_gift_reveal'
  },
  {
    id: 'special_birthday_reveal',
    name: 'Celebration Climax',
    category: 'Cinematic',
    icon: '🌟',
    description: 'Grand multi-line typography reveal with dual fireworks & confetti particle physics.',
    recommendedDuration: 8,
    template: 'special_birthday_reveal'
  },
  {
    id: 'special_bonus_memories',
    name: 'Bonus Memories',
    category: 'Cinematic',
    icon: '📸',
    description: 'Bonus adventure collages and funny highlight moments with step navigation.',
    recommendedDuration: 8,
    template: 'special_bonus_memories'
  },
  {
    id: 'special_emotional_finale',
    name: 'Emotional Finale',
    category: 'Cinematic',
    icon: '💖',
    description: 'Multi-stage emotional closing with opening quote, hero photo, message, and Replay button.',
    recommendedDuration: 10,
    template: 'special_emotional_finale'
  }
];

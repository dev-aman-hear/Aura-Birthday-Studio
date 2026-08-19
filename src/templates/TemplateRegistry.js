/**
 * Birthday Studio - Scene Template Registry
 * Central Config-driven Registry for Universal and Special Cinematic Scene Templates
 */

import { UniversalSceneRenderer } from './UniversalSceneRenderer.js';

export const SCENE_TEMPLATES = [
  { id: 'universal', name: 'Custom Canvas Scene', icon: '✨', description: 'Fully customizable elements canvas (text, images, shapes, videos)' },
  { id: 'hero', name: 'Hero Opening', icon: '🌟', description: 'Opening title, recipient highlight & celebratory subtitle' },
  { id: 'reveal', name: 'Occasion Reveal', icon: '🎁', description: 'Confetti burst, age/date highlight & big reveal message' },
  { id: 'photo_gallery', name: 'Photo Gallery', icon: '🖼️', description: 'Grid or carousel layout for 2-10 photos' },
  { id: 'video_showcase', name: 'Video Showcase', icon: '🎬', description: 'Embedded video player card with background overlay' },
  { id: 'memory_timeline', name: 'Memory Timeline', icon: '⏳', description: 'Chronological photo cards with date tags & memories' },
  { id: 'message', name: 'Personal Message', icon: '💌', description: 'Focused typography card with avatar & backdrop' },
  { id: 'collage', name: 'Photo Collage', icon: '🎨', description: 'Multi-photo dynamic layout with variable card tilt' },
  { id: 'fullscreen_photo', name: 'Fullscreen Photo', icon: '📸', description: 'Full-bleed hero photo with pan-zoom & text overlay' },
  { id: 'final_wish', name: 'Closing Message', icon: '🎂', description: 'Warm closing scene with celebration cake & replay button' },
  { id: 'wish-wall', name: 'Wish Wall', icon: '🌟', description: 'Live Wish Wall with counter & visitor wish cards' },
  
  // Cinematic Story & Interactive Scene Presets
  { id: 'special_cinematic_intro', name: 'Cinematic Story Intro', icon: '🎬', description: 'Dramatic cinematic opening with glowing date header, multi-line buildup and glowing BEGIN CTA.' },
  { id: 'special_childhood_memories', name: 'Early Years Memories', icon: '👶', description: 'Multi-step childhood photo showcase with year badges, step dots, and blur transitions.' },
  { id: 'special_memory_sequence', name: 'Memory Journey', icon: '🎞️', description: 'Interactive memory sequence with Ken Burns camera drift, year badges, and step dots.' },
  { id: 'special_collage_gallery', name: 'Collage Gallery', icon: '🖼️', description: 'Uncropped full-view photo collages with background blur padding and click-to-zoom modal.' },
  { id: 'special_chaos_montage', name: 'Humor & Highlights', icon: '😜', description: 'Fun comedic montage with alternating card tilt, punchy text entrance, and laughter.' },
  { id: 'special_letter_reveal', name: 'Celebration Letter', icon: '💌', description: 'Tactile 3D envelope opening with letter extraction, handwriting flourish, and signature.' },
  { id: 'special_fake_ending', name: 'Surprise Twist', icon: '🎭', description: 'Dramatic emotional conclusion twist ("THE END... Wait, I forgot something.") leading into secret reveal.' },
  { id: 'special_3d_gift_reveal', name: 'Gift Box Reveal', icon: '🎁', description: '3D gift box unboxing with lid lift, floating memory card, and golden particle fountain.' },
  { id: 'special_birthday_reveal', name: 'Celebration Climax', icon: '🌟', description: 'Grand multi-line typography reveal with dual fireworks & confetti particle physics.' },
  { id: 'special_bonus_memories', name: 'Bonus Memories', icon: '📸', description: 'Bonus adventure collages and funny highlight moments with navigation.' },
  { id: 'special_emotional_finale', name: 'Emotional Finale', icon: '💖', description: 'Multi-stage emotional closing with opening quote, hero photo, message, and Replay button.' },
  { id: 'special_text_reveal', name: 'Dramatic Text Reveal', icon: '📜', description: 'Photographic blur-to-focus typography with focal word highlight and thought sequence.' },
  { id: 'special_memory_reveal', name: 'Photo Spotlight', icon: '🖼️', description: 'Photographic spotlight with zero-crop container and ambient background glow.' },
  { id: 'special_ken_burns', name: 'Story Photo Pan', icon: '🎞️', description: 'Slow documentary-style camera pan and zoom drift over featured photograph.' },
  { id: 'special_particle_reveal', name: 'Particle Glow Reveal', icon: '🌟', description: 'Luminous particle burst coalescing into a milestone badge or celebratory name.' },
  { id: 'special_fireworks', name: 'Fireworks Celebration', icon: '🎆', description: 'High-energy multi-burst radial fireworks explosion canvas with celebration headline.' },
  { id: 'special_confetti', name: 'Confetti Burst', icon: '🎊', description: 'Festive tumbling 2D/3D confetti shower with celebration title.' }
];

export const TEMPLATE_ALIASES = {
  'special_text_reveal': 'special_cinematic_intro',
  'special_memory_reveal': 'special_childhood_memories',
  'special_ken_burns': 'special_memory_sequence',
  'special_particle_reveal': 'special_birthday_reveal',
  'special_fireworks': 'special_birthday_reveal',
  'special_confetti': 'special_birthday_reveal',
  'wish_wall': 'wish-wall'
};

export function resolveTemplateId(id) {
  if (!id) return 'hero';
  return TEMPLATE_ALIASES[id] || id;
}

export class TemplateRegistry {
  static getTemplate(templateId) {
    const resolved = resolveTemplateId(templateId);
    return SCENE_TEMPLATES.find(t => t.id === resolved) || SCENE_TEMPLATES[0];
  }

  static renderTemplate(scene, arg2 = [], arg3 = {}, options = {}) {
    let project = {};
    let assets = [];

    if (Array.isArray(arg2)) {
      assets = arg2;
      project = arg3 || {};
    } else {
      project = arg2 || {};
      assets = Array.isArray(arg3) ? arg3 : [];
    }

    return this.renderScene(scene, project, assets, options);
  }

  static renderScene(scene, project = {}, resolvedAssets = [], options = {}) {
    return UniversalSceneRenderer.renderScene(scene, project, resolvedAssets, options);
  }
}

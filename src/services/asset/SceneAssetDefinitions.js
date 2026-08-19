/**
 * Birthday Studio - Universal Scene Asset Definitions Catalog
 * Central, machine-readable asset rules, limits, slots, and formats for all scenes.
 * Eliminates scene-specific hardcoding in UI components.
 */

export const SCENE_ASSET_DEFINITIONS = {
  // 1. Hero Opening
  hero: {
    sceneType: 'hero',
    name: 'Hero Opening',
    description: 'Opening title, recipient portrait highlight & celebratory subtitle',
    icon: '🌟',
    assetRules: {
      image: {
        min: 1,
        max: 3,
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatios: ['1:1', '4:3', '16:9', 'any'],
        recommendedDimensions: { width: 1200, height: 1200 }
      },
      audio: {
        min: 0,
        max: 1,
        required: false,
        formats: ['mp3', 'wav', 'm4a', 'aac'],
        maxSizeMB: 20
      },
      sticker: {
        min: 0,
        max: 6,
        required: false,
        formats: ['png', 'webp', 'svg', 'gif'],
        maxSizeMB: 5
      }
    },
    slots: [
      {
        id: 'hero_image',
        name: 'Hero Portrait',
        description: 'Main celebratory spotlight photo',
        acceptedTypes: ['image'],
        required: true,
        min: 1,
        max: 1,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatio: '1:1',
        recommendedDimensions: { width: 1200, height: 1200 },
        allowMultiple: false,
        canReplace: true
      },
      {
        id: 'bg_music',
        name: 'Background Music',
        description: 'Atmospheric audio track for scene',
        acceptedTypes: ['audio'],
        required: false,
        min: 0,
        max: 1,
        formats: ['mp3', 'wav', 'm4a'],
        maxSizeMB: 20,
        allowMultiple: false,
        canReplace: true
      },
      {
        id: 'stickers',
        name: 'Celebration Badges',
        description: 'Floating stickers, badges & decorative icons',
        acceptedTypes: ['sticker', 'image'],
        required: false,
        min: 0,
        max: 5,
        formats: ['png', 'webp', 'svg'],
        maxSizeMB: 5,
        allowMultiple: true,
        canReplace: true
      }
    ]
  },

  // 2. Occasion Reveal
  reveal: {
    sceneType: 'reveal',
    name: 'Occasion Reveal',
    description: 'Confetti burst, age/date highlight & big reveal message',
    icon: '🎁',
    assetRules: {
      image: {
        min: 0,
        max: 2,
        required: false,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatios: ['1:1', '4:3', '16:9', 'any']
      },
      sticker: {
        min: 0,
        max: 8,
        required: false,
        formats: ['png', 'webp', 'svg', 'gif'],
        maxSizeMB: 5
      }
    },
    slots: [
      {
        id: 'reveal_photo',
        name: 'Reveal Badge Photo',
        description: 'Optional center photo inside badge frame',
        acceptedTypes: ['image'],
        required: false,
        min: 0,
        max: 1,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatio: '1:1',
        allowMultiple: false,
        canReplace: true
      },
      {
        id: 'stickers',
        name: 'Confetti & Embellishments',
        description: 'Burst particles and celebration graphics',
        acceptedTypes: ['sticker', 'image'],
        required: false,
        min: 0,
        max: 6,
        formats: ['png', 'webp', 'svg', 'gif'],
        maxSizeMB: 5,
        allowMultiple: true,
        canReplace: true
      }
    ]
  },

  // 3. Photo Gallery
  photo_gallery: {
    sceneType: 'photo_gallery',
    name: 'Photo Gallery',
    description: 'Grid or carousel layout for multiple memorable photos',
    icon: '🖼️',
    assetRules: {
      image: {
        min: 2,
        max: 12,
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 20,
        aspectRatios: ['any', '1:1', '4:3', '16:9', '9:16'],
        recommendedDimensions: { width: 1200, height: 900 }
      },
      audio: {
        min: 0,
        max: 1,
        required: false,
        formats: ['mp3', 'wav', 'm4a'],
        maxSizeMB: 20
      }
    },
    slots: [
      {
        id: 'gallery_photos',
        name: 'Gallery Photos',
        description: 'Collection of 2 to 12 showcase photos',
        acceptedTypes: ['image'],
        required: true,
        min: 2,
        max: 12,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 20,
        allowMultiple: true,
        canReplace: true,
        canDuplicate: true
      },
      {
        id: 'bg_music',
        name: 'Background Music',
        acceptedTypes: ['audio'],
        required: false,
        min: 0,
        max: 1,
        formats: ['mp3', 'wav', 'm4a'],
        maxSizeMB: 20,
        allowMultiple: false,
        canReplace: true
      }
    ]
  },

  // 4. Video Showcase
  video_showcase: {
    sceneType: 'video_showcase',
    name: 'Video Showcase',
    description: 'Embedded video player card with background overlay',
    icon: '🎬',
    assetRules: {
      video: {
        min: 1,
        max: 3,
        required: true,
        formats: ['mp4', 'webm'],
        maxSizeMB: 100,
        maxDurationSec: 300,
        aspectRatios: ['16:9', '9:16', '1:1', 'any'],
        recommendedDimensions: { width: 1920, height: 1080 }
      },
      image: {
        min: 0,
        max: 2,
        required: false,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15
      }
    },
    slots: [
      {
        id: 'main_video',
        name: 'Showcase Video',
        description: 'Primary high-definition video message',
        acceptedTypes: ['video'],
        required: true,
        min: 1,
        max: 1,
        formats: ['mp4', 'webm'],
        maxSizeMB: 100,
        maxDurationSec: 300,
        aspectRatio: '16:9',
        recommendedDimensions: { width: 1920, height: 1080 },
        allowMultiple: false,
        canReplace: true
      },
      {
        id: 'video_poster',
        name: 'Video Poster Thumbnail',
        description: 'Cover photo displayed before playback',
        acceptedTypes: ['image'],
        required: false,
        min: 0,
        max: 1,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 10,
        allowMultiple: false,
        canReplace: true
      }
    ]
  },

  // 5. Memory Timeline
  memory_timeline: {
    sceneType: 'memory_timeline',
    name: 'Memory Timeline',
    description: 'Chronological photo cards with date tags & memories',
    icon: '⏳',
    assetRules: {
      image: {
        min: 1,
        max: 10,
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatios: ['1:1', '4:3', '16:9', 'any']
      }
    },
    slots: [
      {
        id: 'timeline_photos',
        name: 'Timeline Milestone Photos',
        description: 'Photos mapped along life milestone checkpoints',
        acceptedTypes: ['image'],
        required: true,
        min: 1,
        max: 10,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        allowMultiple: true,
        canReplace: true,
        canDuplicate: true
      }
    ]
  },

  // 6. Personal Message
  message: {
    sceneType: 'message',
    name: 'Personal Message',
    description: 'Focused typography card with avatar & backdrop',
    icon: '💌',
    assetRules: {
      image: {
        min: 0,
        max: 2,
        required: false,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatios: ['1:1', '4:3', 'any']
      },
      audio: {
        min: 0,
        max: 1,
        required: false,
        formats: ['mp3', 'wav', 'm4a'],
        maxSizeMB: 15
      }
    },
    slots: [
      {
        id: 'sender_avatar',
        name: 'Sender Avatar / Photo',
        description: 'Portrait icon of the sender or friend',
        acceptedTypes: ['image'],
        required: false,
        min: 0,
        max: 1,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 10,
        aspectRatio: '1:1',
        allowMultiple: false,
        canReplace: true
      },
      {
        id: 'voice_note',
        name: 'Voice Note Audio',
        description: 'Personal spoken wish or recording',
        acceptedTypes: ['audio'],
        required: false,
        min: 0,
        max: 1,
        formats: ['mp3', 'wav', 'm4a'],
        maxSizeMB: 20,
        allowMultiple: false,
        canReplace: true
      }
    ]
  },

  // 7. Dynamic Collage
  collage: {
  // 7. Photo Collage
  collage: {
    sceneType: 'collage',
    name: 'Photo Collage',
    description: 'Multi-photo dynamic layout with variable card tilt',
    icon: '🎨',
    assetRules: {
      image: {
        min: 2,
        max: 8,
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        aspectRatios: ['any', '1:1', '4:3', '16:9']
      }
    },
    slots: [
      {
        id: 'collage_photos',
        name: 'Collage Photos',
        description: 'Collection of 2 to 8 polaroid/tilted photos',
        acceptedTypes: ['image'],
        required: true,
        min: 2,
        max: 8,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        allowMultiple: true,
        canReplace: true,
        canDuplicate: true
      }
    ]
  },

  // 8. Fullscreen Photo
  fullscreen_photo: {
    sceneType: 'fullscreen_photo',
    name: 'Fullscreen Photo',
    description: 'Full-bleed hero photo with pan-zoom & text overlay',
    icon: '📸',
    assetRules: {
      image: {
        min: 1,
        max: 1,
        required: true,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 25,
        aspectRatios: ['16:9', '9:16', '4:3', 'any'],
        recommendedDimensions: { width: 1920, height: 1080 }
      }
    },
    slots: [
      {
        id: 'fullscreen_image',
        name: 'Full Bleed Background Photo',
        description: 'High-resolution full viewport background photo',
        acceptedTypes: ['image'],
        required: true,
        min: 1,
        max: 1,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 25,
        aspectRatio: '16:9',
        recommendedDimensions: { width: 1920, height: 1080 },
        allowMultiple: false,
        canReplace: true
      }
    ]
  },

  // 9. Closing Message / Outro
  final_wish: {
    sceneType: 'final_wish',
    name: 'Closing Message',
    description: 'Warm closing scene with celebration cake & replay button',
    icon: '🎂',
    assetRules: {
      image: {
        min: 0,
        max: 3,
        required: false,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15
      },
      sticker: {
        min: 0,
        max: 6,
        required: false,
        formats: ['png', 'webp', 'svg', 'gif'],
        maxSizeMB: 5
      }
    },
    slots: [
      {
        id: 'celebration_photo',
        name: 'Finale Photo',
        description: 'Closing celebratory photo',
        acceptedTypes: ['image'],
        required: false,
        min: 0,
        max: 1,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 15,
        allowMultiple: false,
        canReplace: true
      },
      {
        id: 'stickers',
        name: 'Closing Sparkles & Cake',
        description: 'Decorative celebratory elements',
        acceptedTypes: ['sticker', 'image'],
        required: false,
        min: 0,
        max: 6,
        formats: ['png', 'webp', 'svg', 'gif'],
        maxSizeMB: 5,
        allowMultiple: true,
        canReplace: true
      }
    ]
  },

  // 10. Wish Wall
  'wish-wall': {
    sceneType: 'wish-wall',
    name: 'Wish Wall',
    description: 'Live Wish Wall with counter & visitor wish cards',
    icon: '🌟',
    assetRules: {
      image: {
        min: 0,
        max: 2,
        required: false,
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSizeMB: 10
      }
    },
    slots: [
      {
        id: 'wish_wall_badge',
        name: 'Wall Header Badge',
        acceptedTypes: ['image', 'sticker'],
        required: false,
        min: 0,
        max: 1,
        formats: ['png', 'webp', 'jpg'],
        maxSizeMB: 10,
        allowMultiple: false,
        canReplace: true
      }
    ]
  },

  // 11. Custom Canvas Scene
  universal: {
    sceneType: 'universal',
    name: 'Custom Canvas Scene',
    description: 'Completely customizable canvas with freeform text, images, videos, shapes & stickers',
    icon: '✨',
    assetRules: {
      image: {
        min: 0,
        max: 15,
        required: false,
        formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
        maxSizeMB: 30,
        aspectRatios: ['any']
      },
      video: {
        min: 0,
        max: 5,
        required: false,
        formats: ['mp4', 'webm'],
        maxSizeMB: 100,
        maxDurationSec: 600,
        aspectRatios: ['any']
      },
      audio: {
        min: 0,
        max: 2,
        required: false,
        formats: ['mp3', 'wav', 'm4a', 'aac'],
        maxSizeMB: 30
      },
      sticker: {
        min: 0,
        max: 20,
        required: false,
        formats: ['png', 'webp', 'svg', 'gif'],
        maxSizeMB: 10
      }
    },
    slots: [
      {
        id: 'custom_media',
        name: 'Canvas Media Elements',
        description: 'Dynamic photos, videos, and stickers placed on the canvas',
        acceptedTypes: ['image', 'video', 'sticker', 'audio'],
        required: false,
        min: 0,
        max: 15,
        formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mp3', 'wav', 'svg', 'gif'],
        maxSizeMB: 100,
        allowMultiple: true,
        canReplace: true,
        canDuplicate: true
      }
    ]
  },
  special_cinematic_intro: {
    name: 'Cinematic Story Intro',
    description: 'Dramatic cinematic opening with glowing date header, multi-line buildup and glowing CTA.',
    icon: '✨',
    assetRules: {
      image: { min: 0, max: 1, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 15 },
      audio: { min: 0, max: 1, required: false, formats: ['mp3', 'm4a', 'wav'], maxSizeMB: 20 }
    },
    slots: [
      { id: 'bg_music', name: 'Background Audio', type: 'audio', required: false, acceptedTypes: ['audio'], formats: ['mp3', 'm4a', 'wav'] }
    ]
  },
  special_text_reveal: {
    name: 'Dramatic Text Reveal',
    description: 'Photographic blur-to-focus typography with focal word highlight and thought sequence.',
    icon: '📜',
    assetRules: {
      image: { min: 0, max: 1, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'bg_image', name: 'Ambient Background', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'png', 'webp'] }
    ]
  },
  special_memory_reveal: {
    name: 'Photo Spotlight',
    description: 'Photographic spotlight with zero-crop container and ambient background glow.',
    icon: '🖼️',
    assetRules: {
      image: { min: 1, max: 1, required: true, formats: ['jpg', 'jpeg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'hero_photo', name: 'Featured Photo', type: 'image', required: true, acceptedTypes: ['image'], formats: ['jpg', 'jpeg', 'png', 'webp'] }
    ]
  },
  special_ken_burns: {
    name: 'Story Photo Pan',
    description: 'Slow documentary-style camera pan and zoom drift over featured photograph.',
    icon: '🎞️',
    assetRules: {
      image: { min: 1, max: 1, required: true, formats: ['jpg', 'jpeg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'photo', name: 'Ken Burns Photograph', type: 'image', required: true, acceptedTypes: ['image'], formats: ['jpg', 'jpeg', 'png', 'webp'] }
    ]
  },
  special_chaos_montage: {
    name: 'Humor & Highlights',
    description: 'Fun comedic montage with tactile card tilt, spring text entrance and laughter.',
    icon: '😜',
    assetRules: {
      image: { min: 0, max: 3, required: false, formats: ['jpg', 'jpeg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'funny_photo', name: 'Montage Photo', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'jpeg', 'png', 'webp'] }
    ]
  },
  special_fake_ending: {
    name: 'Surprise Twist',
    description: 'Dramatic emotional conclusion twist leading into final reveal and celebration.',
    icon: '🎭',
    assetRules: {},
    slots: []
  },
  special_letter_reveal: {
    name: 'Celebration Letter',
    description: 'Tactile 3D envelope opening with vertical letter extraction and handwriting flourish.',
    icon: '💌',
    assetRules: {
      image: { min: 0, max: 2, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 10 }
    },
    slots: [
      { id: 'sender_avatar', name: 'Sender Avatar', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'png', 'webp'] }
    ]
  },
  special_3d_gift_reveal: {
    name: 'Gift Box Reveal',
    description: '3D gift box unboxing with lid rotation, inner golden bloom and particle fountain.',
    icon: '🎁',
    assetRules: {
      image: { min: 0, max: 1, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'gift_content', name: 'Gift Photo / Voucher', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'png', 'webp'] }
    ]
  },
  special_particle_reveal: {
    name: 'Particle Glow Reveal',
    description: 'Luminous particle burst coalescing into a milestone badge or celebratory name.',
    icon: '🌟',
    assetRules: {
      image: { min: 0, max: 1, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'reveal_target', name: 'Reveal Target Image', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'png', 'webp'] }
    ]
  },
  special_fireworks: {
    name: 'Fireworks Celebration',
    description: 'High-energy multi-burst radial fireworks explosion canvas with celebration headline.',
    icon: '🎆',
    assetRules: {
      image: { min: 0, max: 1, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 15 },
      audio: { min: 0, max: 1, required: false, formats: ['mp3', 'wav'], maxSizeMB: 20 }
    },
    slots: [
      { id: 'bg_image', name: 'Background Image', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'png', 'webp'] }
    ]
  },
  special_confetti: {
    name: 'Confetti Burst',
    description: 'Festive tumbling 2D/3D confetti shower with celebration title.',
    icon: '🎊',
    assetRules: {
      image: { min: 0, max: 1, required: false, formats: ['jpg', 'png', 'webp'], maxSizeMB: 15 }
    },
    slots: [
      { id: 'portrait', name: 'Hero Portrait', type: 'image', required: false, acceptedTypes: ['image'], formats: ['jpg', 'png', 'webp'] }
    ]
  },
  special_emotional_finale: {
    name: 'Emotional Finale',
    description: 'Multi-stage emotional closing with opening quote, hero photo, message, and Replay button.',
    icon: '💖',
    assetRules: {
      image: { min: 1, max: 2, required: true, formats: ['jpg', 'jpeg', 'png', 'webp'], maxSizeMB: 15 },
      audio: { min: 0, max: 1, required: false, formats: ['mp3', 'wav'], maxSizeMB: 20 }
    },
    slots: [
      { id: 'final_photo', name: 'Final Memory Photo', type: 'image', required: true, acceptedTypes: ['image'], formats: ['jpg', 'jpeg', 'png', 'webp'] }
    ]
  }
};

export class SceneAssetDefinitionService {
  /**
   * Retrieve machine-readable asset definition for any scene template
   */
  static getDefinition(templateId = 'universal') {
    const key = (templateId || 'universal').replace('-', '_');
    return SCENE_ASSET_DEFINITIONS[templateId] || SCENE_ASSET_DEFINITIONS[key] || SCENE_ASSET_DEFINITIONS.universal;
  }

  /**
   * Get all semantic slots defined for a scene
   */
  static getSlotsForScene(scene) {
    if (!scene) return [];
    const def = this.getDefinition(scene.template);
    return def.slots || [];
  }

  /**
   * Get maximum allowed assets for a scene
   */
  static getMaxCapacity(scene) {
    if (!scene) return 15;
    const def = this.getDefinition(scene.template);
    let totalMax = 0;
    if (def.slots) {
      def.slots.forEach(slot => {
        totalMax += slot.max || 1;
      });
    }
    return Math.min(15, Math.max(1, totalMax));
  }

  /**
   * Get formatted summary of scene asset requirements for inspection dialogs
   */
  static getRequirementsSummary(templateId) {
    const def = this.getDefinition(templateId);
    const rules = def.assetRules || {};

    const summary = [];
    if (rules.image) {
      summary.push({
        type: 'Images / Photos',
        icon: '🖼️',
        range: `${rules.image.min} – ${rules.image.max}`,
        required: !!rules.image.required,
        formats: (rules.image.formats || []).map(f => f.toUpperCase()).join(', '),
        maxSize: `${rules.image.maxSizeMB || 15} MB`
      });
    }

    if (rules.video) {
      summary.push({
        type: 'Videos',
        icon: '🎬',
        range: `${rules.video.min} – ${rules.video.max}`,
        required: !!rules.video.required,
        formats: (rules.video.formats || []).map(f => f.toUpperCase()).join(', '),
        maxSize: `${rules.video.maxSizeMB || 100} MB`,
        maxDuration: rules.video.maxDurationSec ? `${Math.round(rules.video.maxDurationSec / 60)} min` : undefined
      });
    }

    if (rules.audio) {
      summary.push({
        type: 'Audio / Music',
        icon: '🎵',
        range: `${rules.audio.min} – ${rules.audio.max}`,
        required: !!rules.audio.required,
        formats: (rules.audio.formats || []).map(f => f.toUpperCase()).join(', '),
        maxSize: `${rules.audio.maxSizeMB || 20} MB`
      });
    }

    if (rules.sticker) {
      summary.push({
        type: 'Stickers & Graphics',
        icon: '✨',
        range: `${rules.sticker.min} – ${rules.sticker.max}`,
        required: !!rules.sticker.required,
        formats: (rules.sticker.formats || []).map(f => f.toUpperCase()).join(', '),
        maxSize: `${rules.sticker.maxSizeMB || 5} MB`
      });
    }

    return {
      templateName: def.name,
      description: def.description,
      icon: def.icon,
      summary,
      slots: def.slots || []
    };
  }
}

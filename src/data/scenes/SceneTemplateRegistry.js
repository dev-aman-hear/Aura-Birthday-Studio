import { UNIVERSAL_SCENE_TEMPLATES } from './UniversalSceneTemplates.js';

export const ALL_SCENE_TEMPLATES = UNIVERSAL_SCENE_TEMPLATES;

export const SCENE_ID_ALIASES = {
  // Birthday legacy IDs
  'bday_hero': 'uni_title_intro',
  'bday_reveal': 'uni_celebration',
  'bday_timeline': 'uni_memory_timeline',
  'bday_wish': 'uni_outro',
  // Wedding legacy IDs
  'wed_welcome': 'uni_title_intro',
  'wed_journey': 'uni_memory_timeline',
  'wed_blessings': 'uni_wish_wall',
  'wed_everafter': 'uni_outro',
  // Anniversary legacy IDs
  'ann_welcome': 'uni_title_intro',
  'ann_memories': 'uni_memory_timeline',
  'ann_closing': 'uni_outro',
  // Generic legacy IDs
  'gen_opening': 'uni_title_intro',
  'gen_note': 'uni_photo_text',
  'gen_wall': 'uni_wish_wall',
  // Special legacy IDs
  'special_text_reveal': 'special_cinematic_intro',
  'special_memory_reveal': 'special_childhood_memories',
  'special_ken_burns': 'special_memory_sequence',
  'special_particle_reveal': 'special_birthday_reveal',
  'special_fireworks': 'special_birthday_reveal',
  'special_confetti': 'special_birthday_reveal'
};

export class SceneTemplateRegistry {
  static getAllTemplates() {
    return ALL_SCENE_TEMPLATES;
  }

  static getUniversalTemplates() {
    return ALL_SCENE_TEMPLATES;
  }

  static getTemplatesByOccasion(occasion = 'birthday') {
    return ALL_SCENE_TEMPLATES;
  }

  static getTemplateById(id) {
    if (!id) return UNIVERSAL_SCENE_TEMPLATES[0];
    const canonicalId = SCENE_ID_ALIASES[id] || id;
    return ALL_SCENE_TEMPLATES.find(t => t.id === canonicalId) || ALL_SCENE_TEMPLATES.find(t => t.id === id) || UNIVERSAL_SCENE_TEMPLATES[0];
  }
}

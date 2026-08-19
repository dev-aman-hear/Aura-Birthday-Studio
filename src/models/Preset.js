/**
 * Birthday Studio - Preset Model
 * Blueprint specification for generating Projects & Scenes with Universal Variables
 */

export class Preset {
  constructor(data = {}) {
    this.id = data.id;
    this.occasion = data.occasion || 'birthday'; // birthday, wedding, anniversary, friendship, celebration, memories, love, universal
    this.category = data.category || 'Universal'; // Birthday, Birthday Memories, Anniversary, Friendship, Wedding, Celebration, Memories, Love, Universal
    this.title = data.title || 'Celebration Preset';
    this.description = data.description || '';
    this.icon = data.icon || '🎁';
    this.tags = Array.isArray(data.tags) ? data.tags : ['Cinematic', 'Personal'];
    this.availableVariants = Array.isArray(data.availableVariants) ? data.availableVariants : ['1-scene', '3-scene', '5-scene'];
    this.defaultVariant = data.defaultVariant || '3-scene';
    this.theme = data.theme || 'purple_gold';

    // Supported optional personalization fields & variables
    this.supportedPersonalizationFields = Array.isArray(data.supportedPersonalizationFields)
      ? data.supportedPersonalizationFields
      : ['recipientName', 'senderName', 'occasion', 'message', 'photo1', 'photo2', 'photo3', 'video1', 'music', 'age', 'date'];

    // Fallback Content when fields are omitted
    this.fallbackContent = {
      recipientName: 'Someone Special',
      senderName: 'A Dear Friend',
      creatorName: 'A Dear Friend',
      occasion: 'Special Celebration',
      message: 'Wishing you a bright day filled with love, laughter, and endless happiness!',
      customMessage: 'Wishing you a bright day filled with love, laughter, and endless happiness!',
      photo1: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
      photo2: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      photo3: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      video1: '',
      music: '',
      age: '',
      date: 'Today',
      ...data.fallbackContent
    };

    // Blueprint mapping of variants -> scene definitions
    this.sceneBlueprints = data.sceneBlueprints || {};
  }
}


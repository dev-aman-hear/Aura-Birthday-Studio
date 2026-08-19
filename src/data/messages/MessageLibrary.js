/**
 * Birthday Studio - Central Occasion-Aware Message Library
 * Strict Occasion + Relationship Safety (Section 43 & 60)
 */

import { BIRTHDAY_MESSAGES } from './birthday.js';
import { ANNIVERSARY_MESSAGES } from './anniversary.js';
import { WEDDING_MESSAGES } from './wedding.js';
import { GRADUATION_MESSAGES, CONGRATULATIONS_MESSAGES, BABY_SHOWER_MESSAGES } from './congratulations.js';

export class MessageLibrary {
  static getAllMessages() {
    return [
      ...BIRTHDAY_MESSAGES,
      ...ANNIVERSARY_MESSAGES,
      ...WEDDING_MESSAGES,
      ...GRADUATION_MESSAGES,
      ...CONGRATULATIONS_MESSAGES,
      ...BABY_SHOWER_MESSAGES
    ];
  }

  /**
   * Get preset messages matching project occasion and optionally relationship
   * Case-insensitive matching so 'Birthday' and 'birthday' both match reliably
   */
  static getMessagesForOccasion(occasion, relationship = null) {
    const all = MessageLibrary.getAllMessages();
    const normOcc = (occasion || 'birthday').toLowerCase().trim();
    const occasionMessages = all.filter(m => (m.occasion || '').toLowerCase() === normOcc);

    if (occasionMessages.length === 0) {
      return all.filter(m => m.occasion === 'birthday');
    }

    if (!relationship) return occasionMessages;

    // Filter by specific relationship first, fallback to 'all' relationship presets
    const normRel = relationship.toLowerCase().trim();
    const specific = occasionMessages.filter(m => (m.relationship || '').toLowerCase() === normRel);
    const generic = occasionMessages.filter(m => (m.relationship || '').toLowerCase() === 'all');

    const result = [...specific, ...generic];
    return result.length > 0 ? result : occasionMessages;
  }

  static getMessageById(presetId) {
    if (!presetId) return null;
    return MessageLibrary.getAllMessages().find(m => m.id === presetId) || null;
  }
}

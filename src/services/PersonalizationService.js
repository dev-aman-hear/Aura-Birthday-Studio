/**
 * Birthday Studio - Personalization Service & Local "Create it for me" Parser (Section 4)
 * 100% Free Local Deterministic Natural Language Parser (Zero External APIs)
 */

export class PersonalizationService {
  /**
   * Deterministic local text prompt parser (Section 4)
   * Infers occasion, recipient, age, relationship, style, and tone from text
   */
  static parsePrompt(textPrompt) {
    if (!textPrompt || typeof textPrompt !== 'string') {
      return null;
    }

    const text = textPrompt.trim();
    const lower = text.toLowerCase();

    // Occasion Detection
    let occasion = 'birthday';
    if (lower.includes('wedding') || lower.includes('marriage') || lower.includes('married')) occasion = 'wedding';
    else if (lower.includes('anniversary')) occasion = 'anniversary';
    else if (lower.includes('graduat') || lower.includes('degree') || lower.includes('class of')) occasion = 'graduation';
    else if (lower.includes('congrat') || lower.includes('promotion') || lower.includes('triumph')) occasion = 'congratulations';
    else if (lower.includes('baby') || lower.includes('shower') || lower.includes('newborn')) occasion = 'babyShower';

    // Recipient Name Detection
    let recipient = '';
    const nameMatch = text.match(/(?:for|sister|brother|friend|partner|named)\s+([A-Z][a-z]+)/i) ||
                      text.match(/([A-Z][a-z]+)'s/);
    if (nameMatch) {
      recipient = nameMatch[1];
    }

    // Sender / Creator Name Detection
    let creator = '';
    const creatorMatch = text.match(/(?:i'm|im|from|by)\s+([A-Z][a-z]+)/i);
    if (creatorMatch) {
      creator = creatorMatch[1];
    }

    // Age / Milestone Detection (e.g. "24th", "24 year", "24 birthday")
    let age = '';
    const ageMatch = lower.match(/(\d{1,3})(?:st|nd|rd|th)?\s*(?:th|yr|year|birthday)?/);
    if (ageMatch && parseInt(ageMatch[1], 10) > 0 && parseInt(ageMatch[1], 10) < 120) {
      age = ageMatch[1];
    }

    // Relationship Detection
    let relationship = 'Friend';
    if (lower.includes('sister')) relationship = 'Sister';
    else if (lower.includes('brother')) relationship = 'Brother';
    else if (lower.includes('friend') || lower.includes('best friend')) relationship = 'Friend';
    else if (lower.includes('wife') || lower.includes('husband') || lower.includes('partner')) relationship = 'Partner';
    else if (lower.includes('mom') || lower.includes('dad') || lower.includes('parent')) relationship = 'Parent';

    // Style & Tone Detection
    let styleId = 'style_party';
    let tone = 'Fun & Energetic';

    if (lower.includes('emotional') || lower.includes('touching') || lower.includes('romantic') || lower.includes('love')) {
      styleId = lower.includes('anniversary') || lower.includes('romantic') ? 'style_romantic' : 'style_cinematic';
      tone = 'Emotional & Warm';
    } else if (lower.includes('minimal') || lower.includes('clean') || lower.includes('soft') || lower.includes('elegant')) {
      styleId = 'style_elegant';
      tone = 'Soft & Refined';
    }

    return {
      occasion,
      recipientName: recipient || 'Someone Special',
      creatorName: creator || 'A Friend',
      age,
      relationship,
      styleId,
      tone,
      presetId: `${occasion}_wisher` || 'birthday_wisher',
      rawPrompt: text
    };
  }
}

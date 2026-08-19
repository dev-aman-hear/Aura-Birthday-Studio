/**
 * Birthday Studio - Universal Style Registry (Section 5 & 6)
 * Central index of all 10 Universal Celebration Visual Themes
 */

import { UNIVERSAL_STYLES } from './UniversalStyleDefinitions.js';

export const ALL_STYLES = UNIVERSAL_STYLES;

export class StyleRegistry {
  /**
   * Returns all available universal styles
   */
  static getAllStyles() {
    return UNIVERSAL_STYLES;
  }

  /**
   * Retrieves a style definition by ID or alias
   */
  static getStyleById(id) {
    if (!id) return UNIVERSAL_STYLES[0];

    const cleanId = id.toLowerCase().trim();

    // Direct ID match
    const directMatch = UNIVERSAL_STYLES.find(s => s.id === cleanId);
    if (directMatch) return directMatch;

    // Alias and legacy mapping table
    const aliases = {
      'party': 'style_birthday',
      'style_party': 'style_birthday',
      'birthday': 'style_birthday',
      'elegant': 'style_elegant',
      'romantic': 'style_romantic',
      'cinematic': 'style_cinematic',
      'soft': 'style_soft_cute',
      'cute': 'style_soft_cute',
      'soft_cute': 'style_soft_cute',
      'style_soft': 'style_soft_cute',
      'minimal': 'style_minimal',
      'luxury': 'style_luxury',
      'gold': 'style_luxury',
      'colorful': 'style_colorful',
      'vibrant': 'style_colorful',
      'dark': 'style_dark',
      'midnight': 'style_dark',
      'playful': 'style_playful',
      'pop': 'style_playful'
    };

    const targetId = aliases[cleanId] || aliases[cleanId.replace(/^style_/, '')];
    if (targetId) {
      return UNIVERSAL_STYLES.find(s => s.id === targetId) || UNIVERSAL_STYLES[0];
    }

    // Name matching fallback
    const nameMatch = UNIVERSAL_STYLES.find(s => s.name.toLowerCase().includes(cleanId));
    if (nameMatch) return nameMatch;

    return UNIVERSAL_STYLES[0];
  }

  /**
   * Generates inline CSS custom properties dictionary for a style
   */
  static getStyleCssVariables(styleOrId) {
    const style = typeof styleOrId === 'object' && styleOrId !== null
      ? styleOrId
      : this.getStyleById(styleOrId);

    return {
      '--style-bg': style.colors.bg,
      '--style-surface': style.colors.surface,
      '--style-accent': style.colors.accent,
      '--style-accent-sec': style.colors.accentSecondary || style.colors.accent,
      '--style-text': style.colors.text,
      '--style-text-muted': style.colors.textMuted || '#a0a0b8',
      '--style-border': style.colors.border,
      '--style-glow': style.colors.glow || 'rgba(127, 90, 240, 0.4)',
      '--style-heading-font': style.typography.headingFont,
      '--style-body-font': style.typography.bodyFont,
      '--style-heading-spacing': style.typography.headingLetterSpacing || '0px',
      '--style-radius': style.elements?.cardRadius || '16px',
      '--style-gradient': style.background?.gradient || style.colors.bg,
      '--style-overlay': style.background?.overlayPattern || 'none'
    };
  }

  /**
   * Formats style CSS variables as an inline style string
   */
  static getStyleInlineCssString(styleOrId) {
    const vars = this.getStyleCssVariables(styleOrId);
    return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join(' ');
  }
}

/**
 * Birthday Studio - Universal Countdown Style Definitions
 * 7 Generic, Reusable Countdown Timer Themes
 */

export const COUNTDOWN_STYLES = [
  {
    id: 'countdown_minimal',
    name: 'Minimal Clean',
    icon: '⚪',
    mood: 'Modern & Simple',
    description: 'Clean monochrome digit boxes, razor-sharp outlines, and crisp typography.',
    colors: {
      bg: '#0a0a0f',
      surface: 'rgba(20, 20, 30, 0.85)',
      accent: '#ffffff',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.15)'
    },
    layoutClass: 'style-countdown-minimal'
  },
  {
    id: 'countdown_elegant',
    name: 'Elegant Gold',
    icon: '✨',
    mood: 'Refined & Luxurious',
    description: 'Champagne gold accents, rich serif headers, and subtle warm glow borders.',
    colors: {
      bg: '#0e0c18',
      surface: 'rgba(26, 22, 44, 0.85)',
      accent: '#dfb15b',
      text: '#f8f9fa',
      border: 'rgba(223, 177, 91, 0.3)'
    },
    layoutClass: 'style-countdown-elegant'
  },
  {
    id: 'countdown_cinematic',
    name: 'Cinematic',
    icon: '🎬',
    mood: 'Epic & Dramatic',
    description: 'Deep obsidian widescreen, amber/cyan glowing accents, and theatrical blur reveals.',
    colors: {
      bg: '#05070d',
      surface: 'rgba(10, 16, 28, 0.9)',
      accent: '#00f2fe',
      text: '#ffffff',
      border: 'rgba(0, 242, 254, 0.3)'
    },
    layoutClass: 'style-countdown-cinematic'
  },
  {
    id: 'countdown_glass',
    name: 'Glassmorphism',
    icon: '💎',
    mood: 'Translucent & Modern',
    description: 'Frosted glass panels with backdrop blur, soft reflections, and modern aesthetic.',
    colors: {
      bg: '#120f24',
      surface: 'rgba(255, 255, 255, 0.08)',
      accent: '#a29bfe',
      text: '#ffffff',
      border: 'rgba(255, 255, 255, 0.18)'
    },
    layoutClass: 'style-countdown-glass'
  },
  {
    id: 'countdown_neon',
    name: 'Neon Glow',
    icon: '⚡',
    mood: 'Vibrant & Electric',
    description: 'Pulsating electric magenta and violet neon tubes with high-energy party vibes.',
    colors: {
      bg: '#090814',
      surface: 'rgba(24, 14, 46, 0.85)',
      accent: '#ff007f',
      text: '#ffffff',
      border: 'rgba(255, 0, 127, 0.4)'
    },
    layoutClass: 'style-countdown-neon'
  },
  {
    id: 'countdown_flip',
    name: 'Flip Clock',
    icon: '📟',
    mood: 'Retro & Mechanical',
    description: 'Classic airport split-flap countdown cards with center divider groove and shadow.',
    colors: {
      bg: '#0c0c12',
      surface: '#1a1926',
      accent: '#ffd700',
      text: '#f1f2f6',
      border: '#2c2b3d'
    },
    layoutClass: 'style-countdown-flip'
  },
  {
    id: 'countdown_fullscreen',
    name: 'Full Screen Immersive',
    icon: '🌌',
    mood: 'Bold & Impactful',
    description: 'Massive full-bleed numerals with animated gradient background and celebration dust.',
    colors: {
      bg: 'linear-gradient(135deg, #1b0a2a 0%, #08060f 60%, #150921 100%)',
      surface: 'transparent',
      accent: '#7f5af0',
      text: '#ffffff',
      border: 'transparent'
    },
    layoutClass: 'style-countdown-fullscreen'
  }
];

export class CountdownStyleRegistry {
  static getAllStyles() {
    return COUNTDOWN_STYLES;
  }

  static getStyleById(id) {
    if (!id) return COUNTDOWN_STYLES[0];
    const clean = id.toLowerCase().trim();
    return COUNTDOWN_STYLES.find(s => s.id === clean || s.id === `countdown_${clean}`) || COUNTDOWN_STYLES[0];
  }
}

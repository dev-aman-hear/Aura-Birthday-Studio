/**
 * Birthday Studio - Universal Style Definitions
 * 10 Reusable, Content-Agnostic Celebration Themes
 * Separates visual design, typography, palettes & motion from user content
 */

export const UNIVERSAL_STYLES = [
  {
    id: 'style_luxury',
    name: 'Luxury Gold',
    icon: '👑',
    mood: 'Opulent & Prestige',
    description: 'Polished 24k gold gradients, velvet black backdrop, and majestic Roman serif titles.',
    colors: {
      bg: '#0b0a08',
      surface: 'rgba(26, 23, 18, 0.9)',
      accent: '#ffd700',
      accentSecondary: '#f39c12',
      text: '#fffdf9',
      textMuted: '#b3a792',
      border: 'rgba(255, 215, 0, 0.35)',
      glow: 'rgba(255, 215, 0, 0.45)'
    },
    typography: {
      headingFont: "'Cinzel', serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '2px'
    },
    background: {
      gradient: 'radial-gradient(circle at 50% 30%, #201a10 0%, #0b0a08 60%, #000000 100%)',
      overlayPattern: 'radial-gradient(circle at 50% 20%, rgba(255, 215, 0, 0.18) 0%, transparent 60%)'
    },
    transition: 'pop',
    animation: 'cinematicTextReveal',
    elements: {
      cardRadius: '14px',
      confettiColors: ['#ffd700', '#e6c200', '#fff4a3', '#f39c12']
    }
  },
  {
    id: 'style_colorful',
    name: 'Vibrant Colorful',
    icon: '🌈',
    mood: 'Energetic & Radiant',
    description: 'Multi-spectrum neon gradients, electric violet and cyan hues with radiant energy.',
    colors: {
      bg: '#0e0b1f',
      surface: 'rgba(28, 20, 56, 0.85)',
      accent: '#00f2fe',
      accentSecondary: '#fe0979',
      text: '#ffffff',
      textMuted: '#a59ec9',
      border: 'rgba(0, 242, 254, 0.3)',
      glow: 'rgba(254, 9, 121, 0.4)'
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '0.5px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #31104e 0%, #0e0b1f 40%, #0a2540 100%)',
      overlayPattern: 'radial-gradient(circle at 80% 80%, rgba(254, 9, 121, 0.2) 0%, transparent 50%)'
    },
    transition: 'pop',
    animation: 'slide_up',
    elements: {
      cardRadius: '18px',
      confettiColors: ['#fe0979', '#00f2fe', '#ffd700', '#7f5af0', '#00ff88']
    }
  },
  {
    id: 'style_romantic',
    name: 'Romantic',
    icon: '💖',
    mood: 'Warm & Heartfelt',
    description: 'Soft blush gradients, warm lighting, and elegant calligraphy for heartfelt moments.',
    colors: {
      bg: '#140c10',
      surface: 'rgba(38, 20, 30, 0.85)',
      accent: '#ff4d6d',
      accentSecondary: '#ffb3c1',
      text: '#fff0f3',
      textMuted: '#c9a0af',
      border: 'rgba(255, 77, 109, 0.28)',
      glow: 'rgba(255, 77, 109, 0.38)'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Poppins', sans-serif",
      headingLetterSpacing: '0.5px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #2b111c 0%, #140c10 60%, #3a1526 100%)',
      overlayPattern: 'radial-gradient(circle at 50% 50%, rgba(255, 77, 109, 0.15) 0%, transparent 70%)'
    },
    transition: 'blur',
    animation: 'blur_reveal',
    elements: {
      cardRadius: '18px',
      confettiColors: ['#ff4d6d', '#ffb3c1', '#c9184a', '#fff0f3']
    }
  },
  {
    id: 'style_elegant',
    name: 'Elegant',
    icon: '✨',
    mood: 'Refined & Classy',
    description: 'Soft champagne gold, deep indigo tones, and timeless serif typography.',
    colors: {
      bg: '#0d0c15',
      surface: 'rgba(24, 22, 40, 0.85)',
      accent: '#dfb15b',
      accentSecondary: '#a29bfe',
      text: '#f8f9fa',
      textMuted: '#a0a0b8',
      border: 'rgba(223, 177, 91, 0.25)',
      glow: 'rgba(223, 177, 91, 0.35)'
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '0.5px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #120e24 0%, #0d0c15 50%, #1a162b 100%)',
      overlayPattern: 'radial-gradient(circle at 50% 20%, rgba(223, 177, 91, 0.12) 0%, transparent 60%)'
    },
    transition: 'fade',
    animation: 'cinematicTextReveal',
    elements: {
      cardRadius: '16px',
      confettiColors: ['#dfb15b', '#f8f9fa', '#a29bfe', '#e0c097']
    }
  },
  {
    id: 'style_birthday',
    name: 'Birthday Party',
    icon: '🎂',
    mood: 'Festive & Joyful',
    description: 'Vibrant party purples, neon magenta accents, bouncy pop animations, and celebration confetti.',
    colors: {
      bg: '#0f0e17',
      surface: 'rgba(30, 27, 46, 0.85)',
      accent: '#ff007f',
      accentSecondary: '#7f5af0',
      text: '#fffffe',
      textMuted: '#94a1b2',
      border: 'rgba(255, 0, 127, 0.3)',
      glow: 'rgba(255, 0, 127, 0.4)'
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '0px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #2a1147 0%, #0f0e17 60%, #1e1035 100%)',
      overlayPattern: 'radial-gradient(circle at 80% 20%, rgba(255, 0, 127, 0.18) 0%, transparent 50%)'
    },
    transition: 'pop',
    animation: 'pop',
    elements: {
      cardRadius: '20px',
      confettiColors: ['#ff007f', '#7f5af0', '#ffd700', '#2cb67d', '#00f2fe']
    }
  },
  {
    id: 'style_soft_cute',
    name: 'Soft & Cute',
    icon: '🌸',
    mood: 'Sweet & Charming',
    description: 'Pastel peaches, soft lavender gradients, bubbly rounded cards, and gentle floating motions.',
    colors: {
      bg: '#161426',
      surface: 'rgba(35, 32, 58, 0.85)',
      accent: '#ff9a9e',
      accentSecondary: '#fecfef',
      text: '#ffffff',
      textMuted: '#b8b4d8',
      border: 'rgba(255, 154, 158, 0.3)',
      glow: 'rgba(255, 154, 158, 0.35)'
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Poppins', sans-serif",
      headingLetterSpacing: '0px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #2d2448 0%, #161426 50%, #36294c 100%)',
      overlayPattern: 'radial-gradient(circle at 30% 30%, rgba(254, 207, 239, 0.2) 0%, transparent 60%)'
    },
    transition: 'pop',
    animation: 'pop',
    elements: {
      cardRadius: '24px',
      confettiColors: ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb', '#fbc2eb']
    }
  },
  {
    id: 'style_cinematic',
    name: 'Cinematic',
    icon: '🎬',
    mood: 'Epic & Dramatic',
    description: 'Deep obsidian widescreen tone, neon amber & cyan highlights, and theatrical blur reveals.',
    colors: {
      bg: '#05070d',
      surface: 'rgba(10, 16, 28, 0.85)',
      accent: '#00f2fe',
      accentSecondary: '#4facfe',
      text: '#ffffff',
      textMuted: '#7f9ab8',
      border: 'rgba(0, 242, 254, 0.25)',
      glow: 'rgba(0, 242, 254, 0.35)'
    },
    typography: {
      headingFont: "'Montserrat', sans-serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '2px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #071326 0%, #05070d 60%, #0c1a30 100%)',
      overlayPattern: 'radial-gradient(circle at 50% 0%, rgba(0, 242, 254, 0.15) 0%, transparent 60%)'
    },
    transition: 'blur',
    animation: 'cinematicTextReveal',
    elements: {
      cardRadius: '12px',
      confettiColors: ['#00f2fe', '#4facfe', '#ffd700', '#ffffff']
    }
  },
  {
    id: 'style_minimal',
    name: 'Minimal Clean',
    icon: '⚪',
    mood: 'Modern & Crisp',
    description: 'Sleek monochromatic dark theme, high-contrast typography, and razor-sharp border lines.',
    colors: {
      bg: '#0a0a0a',
      surface: 'rgba(20, 20, 20, 0.9)',
      accent: '#ffffff',
      accentSecondary: '#888888',
      text: '#ffffff',
      textMuted: '#888888',
      border: 'rgba(255, 255, 255, 0.15)',
      glow: 'rgba(255, 255, 255, 0.15)'
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '-0.5px'
    },
    background: {
      gradient: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
      overlayPattern: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)'
    },
    transition: 'fade',
    animation: 'fadeIn',
    elements: {
      cardRadius: '8px',
      confettiColors: ['#ffffff', '#bbbbbb', '#666666', '#333333']
    }
  },
  {
    id: 'style_dark',
    name: 'Midnight Dark',
    icon: '🌙',
    mood: 'Mysterious & Deep',
    description: 'Deep cosmic slate black, subtle bioluminescent purple glow, and stellar contrast.',
    colors: {
      bg: '#08080f',
      surface: 'rgba(18, 18, 30, 0.85)',
      accent: '#8a2be2',
      accentSecondary: '#4158d0',
      text: '#e2e8f0',
      textMuted: '#718096',
      border: 'rgba(138, 43, 226, 0.25)',
      glow: 'rgba(138, 43, 226, 0.35)'
    },
    typography: {
      headingFont: "'Poppins', sans-serif",
      bodyFont: "'Inter', sans-serif",
      headingLetterSpacing: '0.5px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #100e24 0%, #08080f 60%, #15102a 100%)',
      overlayPattern: 'radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.12) 0%, transparent 65%)'
    },
    transition: 'fade',
    animation: 'fadeIn',
    elements: {
      cardRadius: '16px',
      confettiColors: ['#8a2be2', '#4158d0', '#c850c0', '#ffffff']
    }
  },
  {
    id: 'style_playful',
    name: 'Playful Pop',
    icon: '🎈',
    mood: 'Fun & Cheerful',
    description: 'Warm mango and coral tones, bubbly bouncy elements, and joyous celebration energy.',
    colors: {
      bg: '#14120e',
      surface: 'rgba(38, 32, 22, 0.85)',
      accent: '#ff9f43',
      accentSecondary: '#ee5253',
      text: '#fffcf7',
      textMuted: '#c4b59f',
      border: 'rgba(255, 159, 67, 0.3)',
      glow: 'rgba(255, 159, 67, 0.4)'
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Poppins', sans-serif",
      headingLetterSpacing: '0px'
    },
    background: {
      gradient: 'linear-gradient(135deg, #38240f 0%, #14120e 55%, #421e14 100%)',
      overlayPattern: 'radial-gradient(circle at 50% 20%, rgba(255, 159, 67, 0.2) 0%, transparent 60%)'
    },
    transition: 'pop',
    animation: 'pop',
    elements: {
      cardRadius: '22px',
      confettiColors: ['#ff9f43', '#ee5253', '#10ac84', '#54a0ff', '#feca57']
    }
  }
];


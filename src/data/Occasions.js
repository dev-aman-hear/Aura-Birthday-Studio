/**
 * Birthday Studio - Occasion Definitions
 */

export const OCCASIONS = [
  { id: 'birthday', label: 'Birthday', icon: '🎂', defaultTitle: 'Happy Birthday!' },
  { id: 'anniversary', label: 'Anniversary', icon: '❤️', defaultTitle: 'Happy Anniversary!' },
  { id: 'wedding', label: 'Wedding', icon: '💍', defaultTitle: 'Congratulations on Your Wedding!' },
  { id: 'engagement', label: 'Engagement', icon: '💎', defaultTitle: 'Happy Engagement!' },
  { id: 'graduation', label: 'Graduation', icon: '🎓', defaultTitle: 'Congratulations Graduate!' },
  { id: 'congratulations', label: 'Congratulations', icon: '🎉', defaultTitle: 'Congratulations!' },
  { id: 'babyShower', label: 'Baby Shower', icon: '👶', defaultTitle: 'Welcome Little One!' },
  { id: 'farewell', label: 'Farewell', icon: '✈️', defaultTitle: 'Wishing You All The Best!' },
  { id: 'achievement', label: 'Achievement', icon: '🏆', defaultTitle: 'Celebrating Your Success!' },
  { id: 'custom', label: 'Custom Celebration', icon: '✨', defaultTitle: 'Celebration!' }
];

export function getOccasionById(id) {
  return OCCASIONS.find(o => o.id === id) || OCCASIONS[0];
}

export function getOccasionThemeDetails(occasionInput = 'birthday') {
  const occ = (occasionInput || 'birthday').toLowerCase();

  if (occ === 'wedding') {
    return {
      occasion: 'wedding',
      icon: '💍',
      titlePrefix: 'Happy Wedding Day',
      badgeText: '💍 WEDDING CELEBRATION 💍',
      defaultMessage: 'Wishing you a lifetime of love, laughter, and happiness together!',
      heroStockPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      revealStockPhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'linear-gradient(135deg, #2c1627 0%, #150a18 100%)',
      revealGradient: 'linear-gradient(135deg, #4a1936 0%, #e8a598 100%)',
      accentColor: '#ff7675',
      wishTitle: 'Happily Ever After! 💍',
      wishSubtitle: 'Wishing you a lifetime of love, laughter, and happiness together!'
    };
  }

  if (occ === 'anniversary') {
    return {
      occasion: 'anniversary',
      icon: '❤️',
      titlePrefix: 'Happy Anniversary',
      badgeText: '❤️ ANNIVERSARY CELEBRATION ❤️',
      defaultMessage: 'Wishing us many more wonderful years of love, laughter, and togetherness.',
      heroStockPhoto: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      revealStockPhoto: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'linear-gradient(135deg, #32101e 0%, #18060f 100%)',
      revealGradient: 'linear-gradient(135deg, #5c1d38 0%, #ff7675 100%)',
      accentColor: '#fd79a8',
      wishTitle: 'Here is to Forever! ❤️',
      wishSubtitle: 'Wishing you many more years of love, laughter, and togetherness!'
    };
  }

  if (occ === 'graduation') {
    return {
      occasion: 'graduation',
      icon: '🎓',
      titlePrefix: 'Congratulations',
      badgeText: '🎓 ACADEMIC CELEBRATION 🎓',
      defaultMessage: 'Congratulations on your graduation! So proud of all your hard work and achievements.',
      heroStockPhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      revealStockPhoto: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'linear-gradient(135deg, #101c2e 0%, #080d18 100%)',
      revealGradient: 'linear-gradient(135deg, #1b385a 0%, #f7b731 100%)',
      accentColor: '#f7b731',
      wishTitle: 'On to Great Things! 🎓',
      wishSubtitle: 'Congratulations on your graduation and best wishes for your next chapter!'
    };
  }

  if (occ === 'congratulations') {
    return {
      occasion: 'congratulations',
      icon: '🎉',
      titlePrefix: 'Congratulations',
      badgeText: '🎉 CELEBRATING YOUR TRIUMPH 🎉',
      defaultMessage: 'Congratulations on this milestone! Wishing you continued success and happiness.',
      heroStockPhoto: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
      revealStockPhoto: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'linear-gradient(135deg, #2a153b 0%, #12071c 100%)',
      revealGradient: 'linear-gradient(135deg, #5e2a84 0%, #a29bfe 100%)',
      accentColor: '#a29bfe',
      wishTitle: 'Cheers to Your Success! 🎉',
      wishSubtitle: 'Wishing you continued success and happiness in all that you do!'
    };
  }

  if (occ === 'babyshower' || occ === 'baby_shower') {
    return {
      occasion: 'babyShower',
      icon: '🍼',
      titlePrefix: 'Welcome Little One',
      badgeText: '🍼 BABY SHOWER CELEBRATION 🍼',
      defaultMessage: 'Wishing your growing family endless love, happiness, and sweet moments.',
      heroStockPhoto: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
      revealStockPhoto: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'linear-gradient(135deg, #1a233a 0%, #0d121f 100%)',
      revealGradient: 'linear-gradient(135deg, #2b4566 0%, #74b9ff 100%)',
      accentColor: '#74b9ff',
      wishTitle: 'Welcome Little One! 🍼',
      wishSubtitle: 'Wishing your growing family endless love, peace, and sweet moments!'
    };
  }

  if (occ === 'birthday') {
    return {
      occasion: 'birthday',
      icon: '🎂',
      titlePrefix: 'Happy Birthday',
      badgeText: '✨ A SPECIAL BIRTHDAY CELEBRATION ✨',
      defaultMessage: 'Wishing you endless joy, laughter, and magical moments today and always!',
      heroStockPhoto: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      revealStockPhoto: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'linear-gradient(135deg, #1e1b2e 0%, #0f0c1b 100%)',
      revealGradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 100%)',
      accentColor: '#ff7675',
      wishTitle: 'Make A Wish! 🎂',
      wishSubtitle: 'May every candle on your cake turn into a wish come true!'
    };
  }

  const cap = occasionInput ? (occasionInput.charAt(0).toUpperCase() + occasionInput.slice(1)) : 'Celebration';
  return {
    occasion: occ,
    icon: '✨',
    titlePrefix: `Happy ${cap}`,
    badgeText: `✨ ${cap.toUpperCase()} CELEBRATION ✨`,
    defaultMessage: `Wishing you endless joy, happiness, and success in this ${cap} celebration!`,
    heroStockPhoto: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    revealStockPhoto: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    bgGradient: 'linear-gradient(135deg, #1c1f2b 0%, #0e1017 100%)',
    revealGradient: 'linear-gradient(135deg, #33394d 0%, #fd79a8 100%)',
    accentColor: '#a29bfe',
    wishTitle: `${cap} Wishes! ✨`,
    wishSubtitle: `Wishing you endless joy and happiness!`
  };
}

/**
 * Birthday Studio - Centralized Application Configuration (Section 3)
 * Release Candidate 1.0.0
 */

export const APP_CONFIG = {
  APP_NAME: 'Aura Birthday Studio',
  APP_VERSION: '1.0.0',
  RELEASE_STAGE: 'production',
  PUBLICATION_EXPIRATION_DAYS: null, // null = permanent publication by default
  MAX_WISH_LENGTH: 500,
  SUPPORTED_OCCASIONS: [
    'birthday',
    'wedding',
    'anniversary',
    'graduation',
    'congratulations',
    'babyShower'
  ],
  // Supabase Configuration
  // Values can also be set via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or window.__ENV__
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPABASE_STORAGE_BUCKET: 'published-assets'
};


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
  SUPABASE_URL: 'https://ygvmpsynlrxlaenketks.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_Lqt8W7luDHmNgTJaSn7Qvw_JX2GUDxy',
  SUPABASE_STORAGE_BUCKET: 'published-assets'
};


/**
 * Birthday Studio - Supabase Client & Remote Publishing Gateway
 * Public Anonymous Client for Global Publication Storage & Asset CDN
 * Safe for Client-Side Browser Usage (Public Anon Key ONLY)
 */

import { APP_CONFIG } from '../config/AppConfig.js';

// Dynamically or statically resolve createClient from ESM CDN or window.supabase
let createClientFn = null;

async function getCreateClient() {
  if (createClientFn) return createClientFn;

  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    createClientFn = window.supabase.createClient;
    return createClientFn;
  }

  // CDN 1: jsdelivr ESM
  try {
    const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    if (module && module.createClient) {
      createClientFn = module.createClient;
      return createClientFn;
    }
  } catch (err) {}

  // CDN 2: esm.sh
  try {
    const module2 = await import('https://esm.sh/@supabase/supabase-js@2');
    if (module2 && module2.createClient) {
      createClientFn = module2.createClient;
      return createClientFn;
    }
  } catch (err) {}

  console.warn('[SupabaseClient] Failed to load Supabase module from ESM CDN endpoints.');
  return null;
}

export class SupabaseService {
  constructor() {
    this.client = null;
    this.initPromise = null;
  }

  /**
   * Resolve Supabase URL from environment or configuration
   */
  getSupabaseUrl() {
    // 1. window.__ENV__
    if (typeof window !== 'undefined' && window.__ENV__) {
      if (window.__ENV__.VITE_SUPABASE_URL) return window.__ENV__.VITE_SUPABASE_URL.trim();
      if (window.__ENV__.NEXT_PUBLIC_SUPABASE_URL) return window.__ENV__.NEXT_PUBLIC_SUPABASE_URL.trim();
      if (window.__ENV__.SUPABASE_URL) return window.__ENV__.SUPABASE_URL.trim();
    }

    // 2. Vite import.meta.env
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_SUPABASE_URL) return import.meta.env.VITE_SUPABASE_URL.trim();
        if (import.meta.env.NEXT_PUBLIC_SUPABASE_URL) return import.meta.env.NEXT_PUBLIC_SUPABASE_URL.trim();
        if (import.meta.env.SUPABASE_URL) return import.meta.env.SUPABASE_URL.trim();
      }
    } catch (e) {}

    // 3. localStorage override (useful for developer testing in browser)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const localUrl = window.localStorage.getItem('VITE_SUPABASE_URL') || window.localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') || window.localStorage.getItem('SUPABASE_URL');
        if (localUrl && localUrl.trim().length > 0) return localUrl.trim();
      }
    } catch (e) {}

    // 4. AppConfig fallback
    return (APP_CONFIG.SUPABASE_URL || '').trim();
  }

  /**
   * Resolve Supabase Anon/Public Key from environment or configuration
   */
  getSupabaseAnonKey() {
    // 1. window.__ENV__
    if (typeof window !== 'undefined' && window.__ENV__) {
      if (window.__ENV__.VITE_SUPABASE_ANON_KEY) return window.__ENV__.VITE_SUPABASE_ANON_KEY.trim();
      if (window.__ENV__.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return window.__ENV__.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim();
      if (window.__ENV__.NEXT_PUBLIC_SUPABASE_ANON_KEY) return window.__ENV__.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();
      if (window.__ENV__.SUPABASE_ANON_KEY) return window.__ENV__.SUPABASE_ANON_KEY.trim();
      if (window.__ENV__.VITE_SUPABASE_KEY) return window.__ENV__.VITE_SUPABASE_KEY.trim();
    }

    // 2. Vite import.meta.env
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_SUPABASE_ANON_KEY) return import.meta.env.VITE_SUPABASE_ANON_KEY.trim();
        if (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim();
        if (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim();
        if (import.meta.env.SUPABASE_ANON_KEY) return import.meta.env.SUPABASE_ANON_KEY.trim();
        if (import.meta.env.VITE_SUPABASE_KEY) return import.meta.env.VITE_SUPABASE_KEY.trim();
      }
    } catch (e) {}

    // 3. localStorage override
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const localKey = window.localStorage.getItem('VITE_SUPABASE_ANON_KEY') || window.localStorage.getItem('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || window.localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') || window.localStorage.getItem('SUPABASE_ANON_KEY') || window.localStorage.getItem('VITE_SUPABASE_KEY');
        if (localKey && localKey.trim().length > 0) return localKey.trim();
      }
    } catch (e) {}

    // 4. AppConfig fallback
    return (APP_CONFIG.SUPABASE_ANON_KEY || '').trim();
  }

  /**
   * Returns true if Supabase URL and Anon key are configured
   */
  isConfigured() {
    const url = this.getSupabaseUrl();
    const key = this.getSupabaseAnonKey();
    return Boolean(
      url &&
      key &&
      url.length > 0 &&
      key.length > 0 &&
      !url.includes('YOUR_SUPABASE') &&
      !key.includes('YOUR_SUPABASE')
    );
  }

  /**
   * Reset client instance (used for testing or dynamic config changes)
   */
  resetClient() {
    this.client = null;
    this.initPromise = null;
  }

  /**
   * Get or initialize the Supabase client instance
   */
  async getClient() {
    if (this.client) return this.client;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!this.isConfigured()) {
        console.warn('[SupabaseClient] Supabase credentials not configured.');
        return null;
      }

      const createClient = await getCreateClient();
      if (!createClient) {
        console.warn('[SupabaseClient] createClient function could not be loaded from ESM CDN or window.');
        return null;
      }

      const url = this.getSupabaseUrl();
      const key = this.getSupabaseAnonKey();

      try {
        this.client = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storageKey: null,
            storage: {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {}
            }
          }
        });
        console.log('[SupabaseClient] Supabase client initialized successfully with endpoint:', url);
        return this.client;
      } catch (err) {
        console.error('[SupabaseClient] Initialization error:', err);
        return null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Classify an error from Supabase
   */
  classifyError(error) {
    if (!error) return { type: 'none', message: '' };

    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    const status = error.status || error.statusCode || 0;

    // Permission / RLS errors
    if (
      code === '42501' ||
      status === 401 ||
      status === 403 ||
      msg.includes('permission') ||
      msg.includes('jwt') ||
      msg.includes('row-level security') ||
      msg.includes('policy')
    ) {
      return {
        type: 'permission',
        message: 'Permission denied by database security policy. Please verify Supabase RLS configuration.',
        originalError: error
      };
    }

    // Network / connection errors
    if (
      msg.includes('fetch') ||
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('timeout') ||
      msg.includes('connection') ||
      status === 0 ||
      status >= 500
    ) {
      return {
        type: 'network',
        message: 'Unable to connect to celebration database. Please check your internet connection and try again.',
        originalError: error
      };
    }

    // Generic DB error
    return {
      type: 'database',
      message: error.message || 'Database operation failed.',
      originalError: error
    };
  }

  /**
   * Upload an asset file or blob to Supabase Storage 'published-assets' bucket
   * Returns the stable public CDN URL
   */
  async uploadPublishedAsset(pubId, assetId, blobOrFile, originalName = 'asset') {
    const client = await this.getClient();
    if (!client) return null;

    const bucketName = APP_CONFIG.SUPABASE_STORAGE_BUCKET || 'published-assets';
    
    // Determine safe file extension
    let ext = 'bin';
    if (originalName && originalName.includes('.')) {
      ext = originalName.split('.').pop().toLowerCase();
    } else if (blobOrFile.type) {
      const mime = blobOrFile.type.toLowerCase();
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('mp3')) ext = 'mp3';
      else if (mime.includes('wav')) ext = 'wav';
      else if (mime.includes('mp4')) ext = 'mp4';
      else if (mime.includes('webm')) ext = 'webm';
      else if (mime.includes('svg')) ext = 'svg';
    }

    const safeAssetId = (assetId || `asset_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `${pubId}/${safeAssetId}.${ext}`;

    try {
      console.log(`[SupabaseClient] Uploading asset ${filePath} to bucket ${bucketName}...`);
      const { data, error } = await client.storage
        .from(bucketName)
        .upload(filePath, blobOrFile, {
          contentType: blobOrFile.type || 'application/octet-stream',
          upsert: true
        });

      if (error) {
        console.error('[SupabaseClient] Asset upload error:', error);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = client.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl || null;
      console.log(`[SupabaseClient] Asset uploaded successfully. Public CDN URL: ${publicUrl}`);
      return publicUrl;
    } catch (err) {
      console.error('[SupabaseClient] Asset upload exception:', err);
      return null;
    }
  }

  /**
   * Save publication record into Supabase Postgres
   * Throws on error so the caller knows whether the database record was actually created.
   */
  async savePublication(record) {
    const client = await this.getClient();
    if (!client) {
      throw new Error('Supabase client is not available. Please verify credentials.');
    }

    const payload = {
      id: record.id,
      project_id: record.project_id || record.projectId || '',
      project_data: record.project_data || record.snapshot || {},
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: record.expires_at || null,
      is_public: record.is_public !== undefined ? record.is_public : (record.isPublic !== undefined ? record.isPublic : true),
      version: record.version || 1
    };

    console.log(`[SupabaseClient] Saving publication ${record.id} to Supabase...`, {
      id: payload.id,
      projectId: payload.project_id,
      expiresAt: payload.expires_at,
      isPublic: payload.is_public
    });

    const { data, error } = await client
      .from('published_projects')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      const classified = this.classifyError(error);
      console.error('[SupabaseClient] savePublication error:', {
        pubId: record.id,
        error,
        classified
      });
      const err = new Error(classified.message);
      err.type = classified.type;
      err.originalError = error;
      throw err;
    }

    console.log(`[SupabaseClient] Publication ${record.id} saved successfully in Supabase:`, data);
    return data;
  }

  /**
   * Fetch publication by ID from Supabase Postgres
   */
  async getPublication(pubId) {
    const client = await this.getClient();
    if (!client) return null;

    console.log(`[SupabaseClient] Querying celebration snapshot for public ID: "${pubId}"`);
    const { data, error } = await client
      .from('published_projects')
      .select('*')
      .eq('id', pubId)
      .maybeSingle();

    if (error) {
      const classified = this.classifyError(error);
      console.error('[SupabaseClient] getPublication error:', {
        pubId,
        error,
        classified
      });
      const err = new Error(classified.message);
      err.type = classified.type;
      err.originalError = error;
      throw err;
    }

    console.log(`[SupabaseClient] getPublication result for "${pubId}":`, {
      exists: Boolean(data),
      id: data?.id,
      is_public: data?.is_public,
      expires_at: data?.expires_at
    });

    return data;
  }

  /**
   * Fetch publication metadata only from Supabase Postgres
   */
  async getPublicationMetadata(pubId) {
    const client = await this.getClient();
    if (!client) return null;

    console.log(`[SupabaseClient] Querying publication metadata for public ID: "${pubId}"`);
    const { data, error } = await client
      .from('published_projects')
      .select('id, project_id, created_at, updated_at, expires_at, is_public')
      .eq('id', pubId)
      .maybeSingle();

    if (error) {
      const classified = this.classifyError(error);
      console.error('[SupabaseClient] getPublicationMetadata error:', {
        pubId,
        error,
        classified
      });
      const err = new Error(classified.message);
      err.type = classified.type;
      err.originalError = error;
      throw err;
    }

    console.log(`[SupabaseClient] getPublicationMetadata result for "${pubId}":`, {
      exists: Boolean(data),
      id: data?.id,
      is_public: data?.is_public,
      expires_at: data?.expires_at
    });

    return data;
  }

  /**
   * Fetch canonical publication for a project by its project_id from Supabase Postgres
   */
  async getPublicationByProjectId(projectId) {
    if (!projectId) return null;
    const client = await this.getClient();
    if (!client) return null;

    console.log(`[SupabaseClient] Querying celebration publication for project ID: "${projectId}"`);
    const { data, error } = await client
      .from('published_projects')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      const classified = this.classifyError(error);
      console.warn('[SupabaseClient] getPublicationByProjectId error:', {
        projectId,
        error,
        classified
      });
      return null;
    }

    return data;
  }

  /**
   * Save a community wish to Supabase
   */
  async saveWish(wishData) {
    const client = await this.getClient();
    if (!client) return null;

    const payload = {
      id: wishData.id,
      project_id: wishData.projectId || wishData.project_id || '',
      occasion: wishData.occasion || 'birthday',
      name: wishData.isAnonymous ? 'Anonymous' : (wishData.name || 'Friend'),
      is_anonymous: Boolean(wishData.isAnonymous),
      message: wishData.message || '',
      message_source: wishData.messageSource || 'custom',
      preset_message_id: wishData.presetMessageId || null,
      status: wishData.status || 'approved',
      created_at: wishData.createdAt || Date.now()
    };

    try {
      const { data, error } = await client
        .from('wishes')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.warn('[SupabaseClient] saveWish error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('[SupabaseClient] saveWish exception:', e);
      return null;
    }
  }

  /**
   * Fetch approved wishes for a project from Supabase
   */
  async getApprovedWishes(projectId) {
    const client = await this.getClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('wishes')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[SupabaseClient] getApprovedWishes error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('[SupabaseClient] getApprovedWishes exception:', e);
      return [];
    }
  }

  /**
   * Fetch all wishes (pending, approved, rejected) for a project from Supabase
   */
  async getAllWishesForProject(projectId) {
    const client = await this.getClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('wishes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[SupabaseClient] getAllWishesForProject error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('[SupabaseClient] getAllWishesForProject exception:', e);
      return [];
    }
  }

  /**
   * Delete a specific wish by ID from Supabase
   */
  async deleteWish(wishId) {
    if (!wishId) return false;
    const client = await this.getClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('wishes')
        .delete()
        .eq('id', wishId);

      if (error) {
        console.warn('[SupabaseClient] deleteWish error:', error);
        return false;
      }
      console.log(`[SupabaseClient] Wish ${wishId} successfully deleted from remote database.`);
      return true;
    } catch (e) {
      console.warn('[SupabaseClient] deleteWish exception:', e);
      return false;
    }
  }

  /**
   * Delete all wishes for a project from Supabase
   */
  async deleteWishesByProjectId(projectId) {
    if (!projectId) return false;
    const client = await this.getClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('wishes')
        .delete()
        .eq('project_id', projectId);

      if (error) {
        console.warn('[SupabaseClient] deleteWishesByProjectId error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[SupabaseClient] deleteWishesByProjectId exception:', e);
      return false;
    }
  }

  /**
   * Live test connection against Supabase instance and verify published_projects table
   */
  async testConnection(customUrl, customKey) {
    const url = customUrl || this.getSupabaseUrl();
    const key = customKey || this.getSupabaseAnonKey();

    if (!url || !key) {
      return {
        success: false,
        message: 'Supabase URL and Public Anon Key are required.'
      };
    }

    const createClient = await getCreateClient();
    if (!createClient) {
      return {
        success: false,
        message: 'Unable to load Supabase SDK from CDN or window.'
      };
    }

    try {
      const testClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: null,
          storage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          }
        }
      });
      const { data, error } = await testClient
        .from('published_projects')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'Connected to Supabase, but "published_projects" table is missing. Run the schema in supabase/schema.sql in your Supabase SQL Editor.'
          };
        }
        return {
          success: false,
          message: `Database query error: ${error.message || 'Check RLS permissions'}`
        };
      }

      return {
        success: true,
        message: 'Connected successfully to Supabase! Remote persistence is active.'
      };
    } catch (e) {
      return {
        success: false,
        message: `Connection failed: ${e.message}`
      };
    }
  }

  /**
   * Set and persist Supabase credentials at runtime
   */
  setCredentials(url, key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (url !== undefined) window.localStorage.setItem('VITE_SUPABASE_URL', url.trim());
      if (key !== undefined) window.localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    }
    APP_CONFIG.SUPABASE_URL = url !== undefined ? url.trim() : (APP_CONFIG.SUPABASE_URL || '');
    APP_CONFIG.SUPABASE_ANON_KEY = key !== undefined ? key.trim() : (APP_CONFIG.SUPABASE_ANON_KEY || '');
    this.resetClient();
  }
}

export const supabaseService = new SupabaseService();


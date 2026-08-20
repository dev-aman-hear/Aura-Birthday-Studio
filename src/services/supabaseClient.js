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

  try {
    const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    createClientFn = module.createClient;
    return createClientFn;
  } catch (err) {
    console.warn('[SupabaseClient] Failed to load Supabase module from ESM CDN:', err);
    return null;
  }
}

class SupabaseService {
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
      if (window.__ENV__.VITE_SUPABASE_URL) return window.__ENV__.VITE_SUPABASE_URL;
      if (window.__ENV__.SUPABASE_URL) return window.__ENV__.SUPABASE_URL;
    }

    // 2. Vite import.meta.env
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_SUPABASE_URL) return import.meta.env.VITE_SUPABASE_URL;
        if (import.meta.env.SUPABASE_URL) return import.meta.env.SUPABASE_URL;
      }
    } catch (e) {}

    // 3. AppConfig fallback
    return APP_CONFIG.SUPABASE_URL || '';
  }

  /**
   * Resolve Supabase Anon/Public Key from environment or configuration
   */
  getSupabaseAnonKey() {
    // 1. window.__ENV__
    if (typeof window !== 'undefined' && window.__ENV__) {
      if (window.__ENV__.VITE_SUPABASE_ANON_KEY) return window.__ENV__.VITE_SUPABASE_ANON_KEY;
      if (window.__ENV__.SUPABASE_ANON_KEY) return window.__ENV__.SUPABASE_ANON_KEY;
      if (window.__ENV__.VITE_SUPABASE_KEY) return window.__ENV__.VITE_SUPABASE_KEY;
    }

    // 2. Vite import.meta.env
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_SUPABASE_ANON_KEY) return import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (import.meta.env.SUPABASE_ANON_KEY) return import.meta.env.SUPABASE_ANON_KEY;
      }
    } catch (e) {}

    // 3. AppConfig fallback
    return APP_CONFIG.SUPABASE_ANON_KEY || '';
  }

  /**
   * Returns true if Supabase URL and Anon key are configured
   */
  isConfigured() {
    const url = this.getSupabaseUrl();
    const key = this.getSupabaseAnonKey();
    return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0 && !url.includes('YOUR_SUPABASE'));
  }

  /**
   * Get or initialize the Supabase client instance
   */
  async getClient() {
    if (this.client) return this.client;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!this.isConfigured()) {
        console.warn('[SupabaseClient] Supabase credentials not configured. Using local fallback.');
        return null;
      }

      const createClient = await getCreateClient();
      if (!createClient) {
        console.warn('[SupabaseClient] createClient function could not be loaded.');
        return null;
      }

      const url = this.getSupabaseUrl();
      const key = this.getSupabaseAnonKey();

      try {
        this.client = createClient(url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        return this.client;
      } catch (err) {
        console.error('[SupabaseClient] Initialization error:', err);
        return null;
      }
    })();

    return this.initPromise;
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

      return publicUrlData?.publicUrl || null;
    } catch (err) {
      console.error('[SupabaseClient] Asset upload exception:', err);
      return null;
    }
  }

  /**
   * Save publication record into Supabase Postgres
   */
  async savePublication(record) {
    const client = await this.getClient();
    if (!client) throw new Error('Supabase client not available');

    const payload = {
      id: record.id,
      project_data: record.project_data || record.snapshot || {},
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: record.expires_at || null,
      is_public: record.is_public !== undefined ? record.is_public : true
    };

    const { data, error } = await client
      .from('published_projects')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('[SupabaseClient] savePublication error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Fetch publication by ID from Supabase Postgres
   */
  async getPublication(pubId) {
    const client = await this.getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('published_projects')
      .select('*')
      .eq('id', pubId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseClient] getPublication error:', error);
      throw error;
    }

    return data;
  }

  /**
   * Fetch publication metadata only from Supabase Postgres
   */
  async getPublicationMetadata(pubId) {
    const client = await this.getClient();
    if (!client) return null;

    const { data, error } = await client
      .from('published_projects')
      .select('id, created_at, updated_at, expires_at, is_public')
      .eq('id', pubId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseClient] getPublicationMetadata error:', error);
      throw error;
    }

    return data;
  }
}

export const supabaseService = new SupabaseService();

-- ==============================================================================
-- Aura Birthday Studio - Supabase Database Schema & Row Level Security (RLS)
-- Authoritative Remote Storage for Published Celebrations, Assets, and Wishes
-- ==============================================================================

-- 1. PUBLISHED PROJECTS TABLE
-- Stores immutable celebration snapshots accessible to public recipients
CREATE TABLE IF NOT EXISTS public.published_projects (
    id TEXT PRIMARY KEY,                       -- e.g. "pub_abc123"
    project_id TEXT,                          -- internal creator project reference ID
    project_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- complete celebration snapshot (scenes, assets, theme, settings)
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,                   -- NULL for permanent links, timestamp for timed links
    is_public BOOLEAN NOT NULL DEFAULT true,  -- false for private celebrations
    version INTEGER NOT NULL DEFAULT 1
);

-- Indices for rapid public lookups
CREATE INDEX IF NOT EXISTS idx_published_projects_is_public ON public.published_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_published_projects_project_id ON public.published_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_published_projects_expires_at ON public.published_projects(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.published_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public celebrations are viewable by everyone" ON public.published_projects;
DROP POLICY IF EXISTS "Allow anonymous publication insert" ON public.published_projects;
DROP POLICY IF EXISTS "Allow anonymous publication update" ON public.published_projects;

-- Policy 1: Public SELECT (Any anonymous or authenticated visitor can read public celebrations)
CREATE POLICY "Public celebrations are viewable by everyone"
    ON public.published_projects
    FOR SELECT
    USING (is_public = true);

-- Policy 2: INSERT (Allow creator client to insert new publications)
CREATE POLICY "Allow anonymous publication insert"
    ON public.published_projects
    FOR INSERT
    WITH CHECK (true);

-- Policy 3: UPDATE (Allow updating expiration or syncing snapshot for existing publications)
CREATE POLICY "Allow anonymous publication update"
    ON public.published_projects
    FOR UPDATE
    USING (true)
    WITH CHECK (true);


-- 2. COMMUNITY WISHES TABLE
-- Stores guest wishes submitted to the live Wish Wall
CREATE TABLE IF NOT EXISTS public.wishes (
    id TEXT PRIMARY KEY,                       -- e.g. "wish_12345"
    project_id TEXT NOT NULL,                 -- publication or project ID
    occasion TEXT DEFAULT 'birthday',
    name TEXT NOT NULL DEFAULT 'Friend',
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    message TEXT NOT NULL,
    message_source TEXT DEFAULT 'custom',
    preset_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'approved',  -- 'approved', 'pending', 'rejected'
    created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- Indices for wish retrieval
CREATE INDEX IF NOT EXISTS idx_wishes_project_id ON public.wishes(project_id);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON public.wishes(status);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON public.wishes(created_at DESC);

-- Enable RLS for Wishes
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved wishes are viewable by everyone" ON public.wishes;
DROP POLICY IF EXISTS "Allow anonymous wish submission" ON public.wishes;
DROP POLICY IF EXISTS "Allow wish moderation updates" ON public.wishes;

-- Policy 1: Public SELECT for approved wishes
CREATE POLICY "Approved wishes are viewable by everyone"
    ON public.wishes
    FOR SELECT
    USING (status = 'approved');

-- Policy 2: Allow guests to submit wishes
CREATE POLICY "Allow anonymous wish submission"
    ON public.wishes
    FOR INSERT
    WITH CHECK (true);

-- Policy 3: Allow wish updates (moderation, likes, pinning)
CREATE POLICY "Allow wish moderation updates"
    ON public.wishes
    FOR UPDATE
    USING (true)
    WITH CHECK (true);


-- 3. STORAGE BUCKET CONFIGURATION (published-assets)
-- Run this in Supabase SQL editor to create the public assets bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('published-assets', 'published-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for published-assets bucket
DROP POLICY IF EXISTS "Public Asset CDN Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Asset Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Asset Updates" ON storage.objects;

CREATE POLICY "Public Asset CDN Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'published-assets');

CREATE POLICY "Allow Public Asset Uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'published-assets');

CREATE POLICY "Allow Public Asset Updates"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'published-assets');

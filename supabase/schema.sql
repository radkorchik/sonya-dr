-- ============================================================
-- СОНЕ — полная схема Supabase (SQL Editor → New query → Run)
-- ============================================================
-- После выполнения:
-- 1. Storage → создайте buckets (если скрипт storage не сработал):
--    tales-audio (public), tales-covers (public)
-- 2. Settings → API → скопируйте URL и anon key в app/.env
-- ============================================================

-- Таблица сказок
CREATE TABLE IF NOT EXISTS public.tales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  cover_path    TEXT,
  audio_path    TEXT NOT NULL,
  audio_format  TEXT NOT NULL DEFAULT 'mp3',
  duration_sec  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tales_created_at_idx ON public.tales (created_at DESC);
CREATE INDEX IF NOT EXISTS tales_title_idx ON public.tales USING gin (to_tsvector('russian', title));

-- Авто-обновление updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tales_updated_at ON public.tales;
CREATE TRIGGER tales_updated_at
  BEFORE UPDATE ON public.tales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: приложение закрыто паролем на фронте; для двух человек — открытый доступ по anon key
ALTER TABLE public.tales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tales_select" ON public.tales;
DROP POLICY IF EXISTS "tales_insert" ON public.tales;
DROP POLICY IF EXISTS "tales_update" ON public.tales;
DROP POLICY IF EXISTS "tales_delete" ON public.tales;

CREATE POLICY "tales_select" ON public.tales FOR SELECT USING (true);
CREATE POLICY "tales_insert" ON public.tales FOR INSERT WITH CHECK (true);
CREATE POLICY "tales_update" ON public.tales FOR UPDATE USING (true);
CREATE POLICY "tales_delete" ON public.tales FOR DELETE USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('tales-audio', 'tales-audio', true, 52428800, ARRAY[
    'audio/mpeg','audio/mp4','audio/x-m4a','audio/m4a','audio/wav',
    'audio/ogg','audio/flac','audio/aac','audio/webm'
  ]),
  ('tales-covers', 'tales-covers', true, 5242880, ARRAY[
    'image/jpeg','image/png','image/webp','image/gif'
  ])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- Политики Storage
DROP POLICY IF EXISTS "audio_public_read" ON storage.objects;
DROP POLICY IF EXISTS "audio_public_write" ON storage.objects;
DROP POLICY IF EXISTS "covers_public_read" ON storage.objects;
DROP POLICY IF EXISTS "covers_public_write" ON storage.objects;

CREATE POLICY "audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tales-audio');

CREATE POLICY "audio_public_write" ON storage.objects
  FOR ALL USING (bucket_id = 'tales-audio') WITH CHECK (bucket_id = 'tales-audio');

CREATE POLICY "covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tales-covers');

CREATE POLICY "covers_public_write" ON storage.objects
  FOR ALL USING (bucket_id = 'tales-covers') WITH CHECK (bucket_id = 'tales-covers');

-- Публичные URL (для фронтенда):
-- audio:  {SUPABASE_URL}/storage/v1/object/public/tales-audio/{path}
-- cover:  {SUPABASE_URL}/storage/v1/object/public/tales-covers/{path}

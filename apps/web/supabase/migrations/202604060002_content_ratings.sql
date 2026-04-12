-- Migration: Add content ratings for templates and AI agents
-- Date: 2026-04-06
-- Purpose: Persist per-user ratings that are unlocked only after the related workflow milestone.

CREATE TABLE IF NOT EXISTS public.content_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id text NOT NULL,
  rating numeric(2,1) NOT NULL,
  rated_after text NOT NULL,
  context_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_content_ratings_target_type CHECK (target_type IN ('pdf_template', 'agent_library', 'agent_request')),
  CONSTRAINT chk_content_ratings_rating CHECK (rating >= 0.5 AND rating <= 5 AND rating * 2 = floor(rating * 2)),
  CONSTRAINT chk_content_ratings_rated_after CHECK (rated_after IN ('audit_sent', 'mission_completed')),
  CONSTRAINT uq_content_ratings_user_target UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_content_ratings_target
  ON public.content_ratings(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_content_ratings_user
  ON public.content_ratings(user_id);

ALTER TABLE public.content_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ratings" ON public.content_ratings;
DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.content_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.content_ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.content_ratings;
DROP POLICY IF EXISTS "Admins have full access to content ratings" ON public.content_ratings;

CREATE POLICY "Users can view their own ratings"
  ON public.content_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
  ON public.content_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.content_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.content_ratings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to content ratings"
  ON public.content_ratings FOR ALL
  USING (get_my_role() = 'admin');

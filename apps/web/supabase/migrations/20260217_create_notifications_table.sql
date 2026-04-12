-- Migration: create notifications table
-- Run this in Supabase SQL editor or via migration tooling

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  category text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: allow anon select/insert only if you want public access — otherwise manage via RLS
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon;

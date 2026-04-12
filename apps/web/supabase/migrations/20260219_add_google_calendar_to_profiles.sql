-- Migration: add Google Calendar integration fields to profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_calendar_connected boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_refresh_token text;

-- (Optional) keep refresh token nullable. For production, consider storing tokens in a separate, encrypted table.

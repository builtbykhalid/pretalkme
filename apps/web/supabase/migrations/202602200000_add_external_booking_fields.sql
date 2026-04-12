-- Add external booking fields to forms table
-- Allows storing an external booking URL and display mode for BYOC integration
-- Run as a separate migration to be safe for existing DBs

ALTER TABLE IF EXISTS forms
  ADD COLUMN IF NOT EXISTS external_booking_url TEXT;

ALTER TABLE IF EXISTS forms
  ADD COLUMN IF NOT EXISTS booking_display_mode TEXT DEFAULT 'external';

-- Note: frontend stores these values inside booking_config as well for backward compatibility.
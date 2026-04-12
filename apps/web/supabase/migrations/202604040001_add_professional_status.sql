-- Migration to add professional_status to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_status TEXT;

-- Update existing column for job_title to be more descriptive in comments if needed
COMMENT ON COLUMN profiles.professional_status IS 'User professional status selected during onboarding (Consultant, Freelancer, etc.)';

-- Add custom domain and notification preferences to profiles
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"newLead": true, "weeklyReport": true, "marketing": false}'::jsonb;

-- Create partial unique index for custom_domain to prevent duplicates (non-null values only)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_custom_domain ON public.profiles(custom_domain) WHERE custom_domain IS NOT NULL;

-- Create index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON public.profiles(custom_domain) WHERE custom_domain IS NOT NULL;

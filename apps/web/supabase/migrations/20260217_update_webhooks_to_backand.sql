-- Migration: replace old n8n domain with backand.pretalk.me
-- This migration is defensive: it checks for the presence of columns before attempting updates.

BEGIN;

-- 1) Workflows: if there is a `webhook_url` column, update it; otherwise try `payload_config` JSON
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'workflows' AND column_name = 'webhook_url'
	) THEN
		UPDATE public.workflows
		SET webhook_url = replace(webhook_url, 'https://workflow.khalidhajji.me', 'https://backand.pretalk.me')
		WHERE webhook_url LIKE '%workflow.khalidhajji.me%';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'workflows' AND column_name = 'payload_config'
	) THEN
		UPDATE public.workflows
		SET payload_config = replace(payload_config::text, 'https://workflow.khalidhajji.me', 'https://backand.pretalk.me')::jsonb
		WHERE payload_config::text LIKE '%workflow.khalidhajji.me%';
	END IF;
END$$;

-- 2) Integrations.settings (JSON) if present
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'integrations' AND column_name = 'settings'
	) THEN
		UPDATE public.integrations
		SET settings = replace(settings::text, 'https://workflow.khalidhajji.me', 'https://backand.pretalk.me')::jsonb
		WHERE settings::text LIKE '%workflow.khalidhajji.me%';
	END IF;
END$$;

-- 3) Forms.settings (JSON) if present
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'settings'
	) THEN
		UPDATE public.forms
		SET settings = replace(settings::text, 'https://workflow.khalidhajji.me', 'https://backand.pretalk.me')::jsonb
		WHERE settings::text LIKE '%workflow.khalidhajji.me%';
	END IF;
END$$;

-- 4) Profiles.metadata (JSON) if present
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'metadata'
	) THEN
		UPDATE public.profiles
		SET metadata = replace(metadata::text, 'https://workflow.khalidhajji.me', 'https://backand.pretalk.me')::jsonb
		WHERE metadata::text LIKE '%workflow.khalidhajji.me%';
	END IF;
END$$;

-- 5) Automation logs response_payload (JSON) if present
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'automation_logs' AND column_name = 'response_payload'
	) THEN
		UPDATE public.automation_logs
		SET response_payload = replace(response_payload::text, 'https://workflow.khalidhajji.me', 'https://backand.pretalk.me')::jsonb
		WHERE response_payload::text LIKE '%workflow.khalidhajji.me%';
	END IF;
END$$;

COMMIT;

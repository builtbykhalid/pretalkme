-- ============================================================
-- Migration: Create user_integrations table
-- Purpose: Store per-consultant integration credentials for
--          Telegram, WhatsApp, Email (SMTP), and Custom Domains
-- ============================================================

-- 1. Create the user_integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('telegram', 'whatsapp', 'smtp', 'domain')),
    label text, -- friendly name, e.g. "Mon Bot Telegram"
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    -- config examples:
    --   telegram : { "bot_token": "123:ABC…" }
    --   whatsapp : { "phone_number_id": "...", "waba_id": "...", "access_token": "..." }
    --   smtp     : { "host": "smtp.gmail.com", "port": 587, "user": "x@y.com", "pass_encrypted": "..." }
    --   domain   : { "domain": "audit.agency.com", "cname_target": "cname.pretalk.me", "verified": false }
    
    -- Phase 2: Client Outreach & AI Proxy
    enable_outreach boolean NOT NULL DEFAULT false,
    ai_agent_id integer REFERENCES agents_library(id) ON DELETE SET NULL,
    message_template text,

    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'error', 'pending', 'disabled')),
    last_validated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Unique constraint: one integration per type per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_integrations_type_user
    ON user_integrations(user_id, type);

-- 3. RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own integrations
DROP POLICY IF EXISTS "Users manage own integrations" ON user_integrations;
CREATE POLICY "Users manage own integrations" ON user_integrations
    FOR ALL USING (auth.uid() = user_id);

-- 4. Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_integrations_updated_at ON user_integrations;
CREATE TRIGGER trg_user_integrations_updated_at
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_integrations_updated_at();

-- ═══════════════════════════════════════════════════════
-- AGENT 08 — SCHEMA COMPLET SUPABASE (Pretalk Hub)
-- ═══════════════════════════════════════════════════════

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TENANTS & USERS
CREATE TABLE IF NOT EXISTS tenants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  plan                  TEXT NOT NULL DEFAULT 'trial',
  wa_phone_id           TEXT,
  wa_number             TEXT,
  meta_token            TEXT,
  waba_id               TEXT,
  ai_enabled            BOOLEAN DEFAULT false,
  ai_voice_enabled      BOOLEAN DEFAULT false,
  ai_voice_id           TEXT DEFAULT 'rachel',
  ai_language           TEXT DEFAULT 'fr',
  ai_hitl_threshold     FLOAT DEFAULT 0.70,
  ai_safety_mode        BOOLEAN DEFAULT true,
  ai_system_prompt      TEXT,
  ai_hitl_keywords      TEXT[] DEFAULT ARRAY['remboursement', 'arnaque', 'problème grave'],
  created_at            TIMESTAMPTZ DEFAULT now(),
  trial_ends_at         TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days')
);

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT,
  role          TEXT DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
  name          TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- 3. WHATSAPP & CRM
CREATE TABLE IF NOT EXISTS contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  wa_id           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  name            TEXT,
  tags            TEXT[] DEFAULT '{}',
  pipeline_stage  TEXT DEFAULT 'new' CHECK (pipeline_stage IN ('new','qualified','proposed','negotiating','won','lost')),
  source          TEXT DEFAULT 'whatsapp',
  opt_out         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, wa_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id          UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status              TEXT DEFAULT 'open' CHECK (status IN ('open','pending_human','resolved','closed')),
  assigned_agent_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  ai_active           BOOLEAN DEFAULT true,
  last_message_at     TIMESTAMPTZ DEFAULT now(),
  unread_count        INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction           TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type                TEXT NOT NULL CHECK (type IN ('text','audio','image','video','document','template')),
  content             TEXT,
  media_url           TEXT,
  is_ai_generated     BOOLEAN DEFAULT false,
  ai_confidence       FLOAT,
  wamid               TEXT,
  status              TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','read','failed')),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS internal_notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  content             TEXT NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status ON conversations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(tenant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);

-- 4. E-COMMERCE
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('youcan','shopify','woocommerce')),
  name          TEXT NOT NULL,
  sku           TEXT,
  price         NUMERIC(10,2),
  stock         INTEGER DEFAULT 0,
  category      TEXT,
  tags          TEXT[] DEFAULT '{}',
  image_url     TEXT,
  synced_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform, external_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('youcan','shopify','woocommerce')),
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'new' CHECK (status IN ('new','confirmed','shipped','delivered','returned','cancelled')),
  total         NUMERIC(10,2),
  items_json    JSONB DEFAULT '[]',
  address_json  JSONB DEFAULT '{}',
  tracking_url  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform, external_id)
);

CREATE TABLE IF NOT EXISTS integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('youcan','shopify','woocommerce')),
  access_token    TEXT,
  store_url       TEXT,
  webhook_secret  TEXT,
  active          BOOLEAN DEFAULT true,
  last_sync_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id, platform);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(contact_id);

-- 5. IA & FLOWS
CREATE TABLE IF NOT EXISTS ai_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id     UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id          UUID REFERENCES messages(id) ON DELETE SET NULL,
  stt_text            TEXT,
  llm_response        TEXT,
  tts_url             TEXT,
  function_calls      JSONB DEFAULT '[]',
  confidence_score    FLOAT,
  hitl_triggered      BOOLEAN DEFAULT false,
  hitl_reason         TEXT,
  model_used          TEXT DEFAULT 'gpt-4o',
  latency_ms          INTEGER,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flows (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  trigger_type  TEXT CHECK (trigger_type IN ('message_received','order_created','order_shipped','scheduled','keyword')),
  nodes_json    JSONB NOT NULL DEFAULT '[]',
  edges_json    JSONB NOT NULL DEFAULT '[]',
  active        BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flow_executions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flow_id           UUID REFERENCES flows(id) ON DELETE CASCADE,
  contact_id        UUID REFERENCES contacts(id) ON DELETE CASCADE,
  current_node_id   TEXT,
  state_json        JSONB DEFAULT '{}',
  status            TEXT DEFAULT 'running' CHECK (status IN ('running','completed','failed','paused')),
  started_at        TIMESTAMPTZ DEFAULT now(),
  ended_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_runs_tenant ON ai_runs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flow_executions_active ON flow_executions(tenant_id, status) WHERE status = 'running';

-- 6. CAMPAGNES & BILLING
CREATE TABLE IF NOT EXISTS campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  template_id         TEXT,
  audience_filter     JSONB DEFAULT '{}',
  status              TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','running','completed','paused')),
  scheduled_at        TIMESTAMPTZ,
  sent_count          INTEGER DEFAULT 0,
  delivered_count     INTEGER DEFAULT 0,
  read_count          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','failed')),
  sent_at     TIMESTAMPTZ,
  UNIQUE(campaign_id, contact_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_customer_id      TEXT,
  plan                    TEXT DEFAULT 'trial',
  status                  TEXT DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled','trialing')),
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT false,
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  quantity    INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_month ON usage_logs(tenant_id, type, created_at DESC);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Simple isolation policies
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename NOT IN ('tenants', 'users')
  LOOP
    EXECUTE 'CREATE POLICY "Tenant isolation ' || t || '" ON ' || t || ' FOR ALL USING (tenant_id = get_my_tenant_id())';
  END LOOP;
END $$;

-- 8. RPC FUNCTIONS
CREATE OR REPLACE FUNCTION check_plan_limit(p_tenant_id UUID, p_metric TEXT)
RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM tenants WHERE id = p_tenant_id;
  SELECT COALESCE(SUM(quantity), 0) INTO v_used FROM usage_logs WHERE tenant_id = p_tenant_id AND type = p_metric AND created_at >= date_trunc('month', now());
  v_limit := CASE WHEN v_plan = 'trial' AND p_metric = 'conversation' THEN 100 WHEN v_plan = 'trial' AND p_metric = 'ai_credit' THEN 50 ELSE -1 END;
  RETURN jsonb_build_object('allowed', v_limit = -1 OR v_used < v_limit, 'used', v_used, 'limit', v_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_inbox_stats(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object('total', COUNT(*), 'open', COUNT(*) FILTER (WHERE status = 'open'), 'pending', COUNT(*) FILTER (WHERE status = 'pending_human')) INTO v_result FROM conversations WHERE tenant_id = p_tenant_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TRIGGERS
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at, unread_count = CASE WHEN NEW.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (tenant_id, plan, status) VALUES (NEW.id, 'trial', 'trialing');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_trial_subscription ON tenants;
CREATE TRIGGER trigger_create_trial_subscription AFTER INSERT ON tenants FOR EACH ROW EXECUTE FUNCTION create_trial_subscription();

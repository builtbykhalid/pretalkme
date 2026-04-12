# AGENT 08 — Base de Données Supabase (Schema + RLS + RPC)
> Mission : Créer le schéma complet de la base de données pretalkme sur Supabase.
> **Travail dans l'éditeur SQL de Supabase (Dashboard → SQL Editor)**

---

## Contexte

pretalkme utilise **Supabase** (PostgreSQL hébergé) pour toutes ses données.
Le schéma est multi-tenant : chaque table a un `tenant_id` et le RLS garantit l'isolation.
Le NestJS backend accède avec le **service role key** (bypass RLS), mais le RLS reste actif pour protéger des accès directs non autorisés.

**Exécuter ces scripts dans l'ordre numéroté dans le SQL Editor de Supabase.**

---

## Script 01 — Extension et Tables Core

```sql
-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════
-- TENANTS & USERS
-- ═══════════════════════════════════════════════════════

CREATE TABLE tenants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  plan                  TEXT NOT NULL DEFAULT 'trial',
  -- WhatsApp Business
  wa_phone_id           TEXT,
  wa_number             TEXT,
  meta_token            TEXT,         -- Stocké chiffré (AES-256 via NestJS)
  waba_id               TEXT,
  -- Config Agent IA
  ai_enabled            BOOLEAN DEFAULT false,
  ai_voice_enabled      BOOLEAN DEFAULT false,
  ai_voice_id           TEXT DEFAULT 'rachel',
  ai_language           TEXT DEFAULT 'fr',
  ai_hitl_threshold     FLOAT DEFAULT 0.70,
  ai_safety_mode        BOOLEAN DEFAULT true,
  ai_system_prompt      TEXT,
  ai_hitl_keywords      TEXT[] DEFAULT ARRAY['remboursement', 'arnaque', 'problème grave'],
  -- Meta
  created_at            TIMESTAMPTZ DEFAULT now(),
  trial_ends_at         TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days')
);

CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT,
  role          TEXT DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
  name          TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index performances
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
```

---

## Script 02 — WhatsApp & CRM

```sql
CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  wa_id           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  name            TEXT,
  tags            TEXT[] DEFAULT '{}',
  pipeline_stage  TEXT DEFAULT 'new'
                  CHECK (pipeline_stage IN ('new','qualified','proposed','negotiating','won','lost')),
  source          TEXT DEFAULT 'whatsapp',
  opt_out         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, wa_id)
);

CREATE TABLE conversations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id          UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status              TEXT DEFAULT 'open'
                      CHECK (status IN ('open','pending_human','resolved','closed')),
  assigned_agent_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  ai_active           BOOLEAN DEFAULT true,
  last_message_at     TIMESTAMPTZ DEFAULT now(),
  unread_count        INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction           TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type                TEXT NOT NULL CHECK (type IN ('text','audio','image','video','document','template')),
  content             TEXT,
  media_url           TEXT,
  is_ai_generated     BOOLEAN DEFAULT false,
  ai_confidence       FLOAT,
  wamid               TEXT,                -- Meta message ID (pour statut livraison)
  status              TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','read','failed')),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE internal_notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  content             TEXT NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Index performances inbox
CREATE INDEX idx_conversations_tenant_status ON conversations(tenant_id, status);
CREATE INDEX idx_conversations_last_message ON conversations(tenant_id, last_message_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
```

---

## Script 03 — E-Commerce

```sql
CREATE TABLE products (
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

CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_id   TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('youcan','shopify','woocommerce')),
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'new'
                CHECK (status IN ('new','confirmed','shipped','delivered','returned','cancelled')),
  total         NUMERIC(10,2),
  items_json    JSONB DEFAULT '[]',
  address_json  JSONB DEFAULT '{}',
  tracking_url  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform, external_id)
);

CREATE TABLE integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('youcan','shopify','woocommerce')),
  access_token    TEXT,             -- Chiffré
  store_url       TEXT,
  webhook_secret  TEXT,
  active          BOOLEAN DEFAULT true,
  last_sync_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, platform)
);

CREATE INDEX idx_products_tenant ON products(tenant_id, platform);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_contact ON orders(contact_id);
```

---

## Script 04 — IA & Flows

```sql
CREATE TABLE ai_runs (
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

CREATE TABLE flows (
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

CREATE TABLE flow_executions (
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

CREATE INDEX idx_ai_runs_tenant ON ai_runs(tenant_id, created_at DESC);
CREATE INDEX idx_ai_runs_conversation ON ai_runs(conversation_id);
CREATE INDEX idx_flow_executions_active ON flow_executions(tenant_id, status) WHERE status = 'running';
```

---

## Script 05 — Campagnes & Billing

```sql
CREATE TABLE campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  template_id         TEXT,
  audience_filter     JSONB DEFAULT '{}',
  status              TEXT DEFAULT 'draft'
                      CHECK (status IN ('draft','scheduled','running','completed','paused')),
  scheduled_at        TIMESTAMPTZ,
  sent_count          INTEGER DEFAULT 0,
  delivered_count     INTEGER DEFAULT 0,
  read_count          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE campaign_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','failed')),
  sent_at     TIMESTAMPTZ,
  UNIQUE(campaign_id, contact_id)
);

CREATE TABLE subscriptions (
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

CREATE TABLE usage_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,   -- conversation | ai_credit | broadcast | team_member
  quantity    INTEGER DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_logs_tenant_month ON usage_logs(tenant_id, type, created_at DESC);
```

---

## Script 06 — Row Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables
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

-- Fonction helper : récupérer le tenant_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Politiques RLS (un user ne voit que son tenant)
CREATE POLICY "Tenant isolation — contacts"
  ON contacts FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — conversations"
  ON conversations FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — messages"
  ON messages FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — products"
  ON products FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — orders"
  ON orders FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — ai_runs"
  ON ai_runs FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — flows"
  ON flows FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — campaigns"
  ON campaigns FOR ALL
  USING (tenant_id = get_my_tenant_id());

CREATE POLICY "Tenant isolation — usage_logs"
  ON usage_logs FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- Note : Le service role key de NestJS bypass le RLS — c'est intentionnel
```

---

## Script 07 — Fonctions RPC

```sql
-- Vérifier quota plan
CREATE OR REPLACE FUNCTION check_plan_limit(p_tenant_id UUID, p_metric TEXT)
RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM tenants WHERE id = p_tenant_id;

  -- Compter l'usage du mois courant
  SELECT COALESCE(SUM(quantity), 0) INTO v_used
  FROM usage_logs
  WHERE tenant_id = p_tenant_id
    AND type = p_metric
    AND created_at >= date_trunc('month', now());

  -- Limites selon plan
  v_limit := CASE
    WHEN v_plan = 'trial'  AND p_metric = 'conversation'  THEN 100
    WHEN v_plan = 'trial'  AND p_metric = 'ai_credit'     THEN 50
    WHEN v_plan = 'solo'   AND p_metric = 'conversation'  THEN 300
    WHEN v_plan = 'solo'   AND p_metric = 'ai_credit'     THEN 200
    WHEN v_plan = 'pro'    AND p_metric = 'conversation'  THEN 1000
    WHEN v_plan = 'pro'    AND p_metric = 'ai_credit'     THEN 1000
    WHEN v_plan = 'agence' THEN -1  -- Illimité
    ELSE 0
  END;

  -- -1 = illimité
  IF v_limit = -1 THEN
    RETURN jsonb_build_object('allowed', true, 'used', v_used, 'limit', -1);
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_used < v_limit,
    'used', v_used,
    'limit', v_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrémenter usage
CREATE OR REPLACE FUNCTION increment_usage(p_tenant_id UUID, p_metric TEXT, p_quantity INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_logs (tenant_id, type, quantity)
  VALUES (p_tenant_id, p_metric, p_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Récupérer stats inbox
CREATE OR REPLACE FUNCTION get_inbox_stats(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_conversations', COUNT(*),
    'open', COUNT(*) FILTER (WHERE status = 'open'),
    'pending_human', COUNT(*) FILTER (WHERE status = 'pending_human'),
    'ai_active', COUNT(*) FILTER (WHERE ai_active = true),
    'resolved_today', COUNT(*) FILTER (WHERE status = 'resolved' AND DATE(last_message_at) = CURRENT_DATE)
  ) INTO v_result
  FROM conversations
  WHERE tenant_id = p_tenant_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Script 08 — Triggers automatiques

```sql
-- Trigger : mettre à jour last_message_at sur conversations quand nouveau message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    unread_count = CASE
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Trigger : créer subscription trial lors de création tenant
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (tenant_id, plan, status)
  VALUES (NEW.id, 'trial', 'trialing');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_trial_subscription
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION create_trial_subscription();

-- Trigger : updated_at automatique sur flows
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flows_updated_at
  BEFORE UPDATE ON flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Résultat attendu

- Toutes les tables créées sans erreur
- RLS activé sur toutes les tables
- Les fonctions RPC fonctionnent (testables depuis SQL Editor)
- Triggers actifs (vérifier avec un INSERT test)

## Vérification

```sql
-- Tester check_plan_limit
SELECT check_plan_limit(
  (SELECT id FROM tenants LIMIT 1),
  'conversation'
);
-- → { "allowed": true, "used": 0, "limit": 100 }

-- Tester que RLS bloque sans auth
SET ROLE anon;
SELECT * FROM contacts;
-- → 0 lignes (RLS bloque)

-- Vérifier les triggers
INSERT INTO tenants (name, slug) VALUES ('Test Boutique', 'test-boutique');
SELECT * FROM subscriptions WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-boutique');
-- → 1 ligne avec plan=trial (trigger a fonctionné)
```

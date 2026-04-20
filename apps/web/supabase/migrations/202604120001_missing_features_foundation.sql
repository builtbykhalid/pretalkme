-- Migration 09 — Complements Features Manquantes

-- 1) WhatsApp QR Sessions
CREATE TABLE IF NOT EXISTS wa_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'disconnected'
                  CHECK (status IN ('disconnected','scanning','connected','expired','error')),
  connection_type TEXT DEFAULT 'qr' CHECK (connection_type IN ('qr','meta_api')),
  connected_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  qr_generated_at TIMESTAMPTZ,
  error_message   TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_sessions_tenant ON wa_sessions(tenant_id);

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS wa_session_type TEXT DEFAULT 'meta_api'
  CHECK (wa_session_type IN ('meta_api', 'qr'));

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS wa_qr_session_id UUID REFERENCES wa_sessions(id);

-- 2) IA media enrichments
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_description TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pdf_extracted_text TEXT;

-- 3) Orders enrichments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ecommerce'
  CHECK (source IN ('ecommerce', 'chat', 'api', 'webhook'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('draft','pending','new','confirmed','shipped','delivered','returned','cancelled','failed'));

CREATE INDEX IF NOT EXISTS idx_orders_conversation ON orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(tenant_id, source);

-- 4) Google Sheets
CREATE TABLE IF NOT EXISTS google_sheets_integrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  spreadsheet_id      TEXT NOT NULL,
  spreadsheet_name    TEXT,
  sheet_tab_name      TEXT DEFAULT 'Commandes',
  access_token        TEXT,
  refresh_token       TEXT,
  token_expiry        TIMESTAMPTZ,
  column_mapping      JSONB DEFAULT '{
    "order_id": "A",
    "contact_name": "B",
    "phone": "C",
    "status": "D",
    "total": "E",
    "items": "F",
    "created_at": "G"
  }',
  active              BOOLEAN DEFAULT true,
  last_sync_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  integration     TEXT NOT NULL CHECK (integration IN ('google_sheets', 'youcan', 'shopify', 'woocommerce')),
  event_type      TEXT NOT NULL,
  entity_id       UUID,
  status          TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message   TEXT,
  payload         JSONB,
  retries         INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  retried_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant ON sync_logs(tenant_id, integration, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_failed ON sync_logs(tenant_id, status) WHERE status = 'failed';

-- 5) Confirmations e-commerce + LightFunnel
ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_platform_check;
ALTER TABLE integrations ADD CONSTRAINT integrations_platform_check
  CHECK (platform IN ('youcan','shopify','woocommerce','lightfunnel'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_platform_check;
ALTER TABLE products ADD CONSTRAINT products_platform_check
  CHECK (platform IN ('youcan','shopify','woocommerce','lightfunnel'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_platform_check;
ALTER TABLE orders ADD CONSTRAINT orders_platform_check
  CHECK (platform IN ('youcan','shopify','woocommerce','lightfunnel','chat'));

CREATE TABLE IF NOT EXISTS order_confirmation_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform         TEXT,
  trigger_status   TEXT NOT NULL DEFAULT 'new'
                   CHECK (trigger_status IN ('new','confirmed','shipped','delivered')),
  message_template TEXT NOT NULL,
  active           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_confirmations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL,
  template_id   UUID REFERENCES order_confirmation_templates(id) ON DELETE SET NULL,
  message_sent  TEXT NOT NULL,
  wamid         TEXT,
  status        TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed')),
  sent_at       TIMESTAMPTZ DEFAULT now(),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_confirmations_order ON order_confirmations(order_id);
CREATE INDEX IF NOT EXISTS idx_confirmations_tenant ON order_confirmations(tenant_id, sent_at DESC);

-- 6) Campagnes robustes
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE campaign_contacts ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE campaign_contacts ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

ALTER TABLE campaign_contacts DROP CONSTRAINT IF EXISTS campaign_contacts_status_check;
ALTER TABLE campaign_contacts ADD CONSTRAINT campaign_contacts_status_check
  CHECK (status IN ('pending','sent','delivered','failed','skipped'));

-- 7) Widget
CREATE TABLE IF NOT EXISTS widget_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  visitor_id       TEXT NOT NULL,
  contact_id       UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE SET NULL,
  page_url         TEXT,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  last_seen_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, visitor_id)
);

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS widget_public_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex');
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS widget_enabled BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS widget_brand_color TEXT DEFAULT '#16a34a';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS widget_greeting TEXT DEFAULT 'Bonjour ! Comment puis-je vous aider ?';

-- 8) Multicanal
ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'whatsapp'
  CHECK (channel IN ('whatsapp', 'facebook', 'instagram'));
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'whatsapp'
  CHECK (channel IN ('whatsapp', 'facebook', 'instagram'));

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS facebook_id TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instagram_id TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS channel_ids JSONB DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_facebook_id
  ON contacts(tenant_id, facebook_id) WHERE facebook_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_instagram_id
  ON contacts(tenant_id, instagram_id) WHERE instagram_id IS NOT NULL;

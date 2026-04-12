-- ============================================================
-- Migration: Create email_send_logs table with correct RLS
-- ============================================================

-- 1. Create email_send_logs table
CREATE TABLE IF NOT EXISTS email_send_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  message_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  template_locale VARCHAR(10),
  template_params JSONB,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_email_send_logs_lead_id ON email_send_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_send_logs_event_type ON email_send_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_email_send_logs_created_at ON email_send_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_logs_status ON email_send_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_send_logs_message_id ON email_send_logs(message_id);

-- 3. Enable RLS
ALTER TABLE email_send_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Service Role (Backend) can do anything
CREATE POLICY "Service role bypass for email_send_logs" ON email_send_logs
AS PERMISSIVE FOR ALL
TO service_role
USING (true);

-- 5. RLS Policy: Authenticated users can read logs for their own leads
-- (Leads belong to user_id in profiles table)
CREATE POLICY "Users can read email logs for their leads" ON email_send_logs
FOR SELECT TO authenticated
USING (
  lead_id IN (
    SELECT l.id FROM leads l 
    WHERE l.user_id = auth.uid()
  )
);

-- 6. RLS Policy: Authenticated users can insert their own logs (optional, backend usually handles)
CREATE POLICY "Users can insert email logs for their leads" ON email_send_logs
FOR INSERT TO authenticated
WITH CHECK (
  lead_id IN (
    SELECT l.id FROM leads l 
    WHERE l.user_id = auth.uid()
  )
);

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE ON email_send_logs TO authenticated;
GRANT ALL ON email_send_logs TO service_role;
GRANT USAGE ON SEQUENCE email_send_logs_id_seq TO authenticated, service_role;

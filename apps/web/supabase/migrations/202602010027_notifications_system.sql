-- Migration: Notifications System for Real-time Updates
-- Date: 2026-02-09

-- ==========================
-- Table: notifications
-- ==========================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'lead', 'agent', 'workflow', 'billing', 'system')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Disable RLS for development
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ==========================
-- Function: Create notification
-- ==========================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'general',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, category, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_category, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================
-- Function: Create admin notification (for all admins)
-- ==========================
CREATE OR REPLACE FUNCTION create_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'system',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, category, metadata)
  SELECT id, p_title, p_message, p_type, p_category, p_metadata
  FROM profiles
  WHERE role = 'admin';
END;
$$ LANGUAGE plpgsql;

-- ==========================
-- Trigger: New lead notification
-- ==========================
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  v_form_title TEXT;
  v_lead_name TEXT;
BEGIN
  -- Get form title
  SELECT title INTO v_form_title FROM forms WHERE id = NEW.form_id;
  
  -- Get lead name from respondent_info
  v_lead_name := COALESCE(NEW.respondent_info->>'name', NEW.respondent_info->>'email', 'Unknown');
  
  -- Create notification for the form owner
  PERFORM create_notification(
    NEW.user_id,
    'Nouveau Lead reçu',
    format('Un nouveau lead "%s" a répondu au formulaire "%s"', v_lead_name, COALESCE(v_form_title, 'Formulaire')),
    'success',
    'lead',
    jsonb_build_object('lead_id', NEW.id, 'form_id', NEW.form_id, 'score', NEW.score)
  );
  
  -- Also notify admins
  PERFORM create_admin_notification(
    'Nouveau Lead',
    format('Lead "%s" - Score: %s', v_lead_name, COALESCE(NEW.score::text, 'N/A')),
    'info',
    'lead',
    jsonb_build_object('lead_id', NEW.id, 'user_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_lead_notification ON leads;
CREATE TRIGGER trigger_new_lead_notification
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();

-- ==========================
-- Trigger: Agent installed notification
-- ==========================
CREATE OR REPLACE FUNCTION notify_agent_installed()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_name TEXT;
BEGIN
  -- Get agent name
  SELECT name INTO v_agent_name FROM agents_library WHERE id = NEW.agent_id;
  
  -- Notify user
  PERFORM create_notification(
    NEW.user_id,
    'Agent installé',
    format('L''agent "%s" a été installé avec succès', COALESCE(v_agent_name, 'Agent')),
    'success',
    'agent',
    jsonb_build_object('agent_id', NEW.agent_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agent_installed_notification ON user_installed_agents;
CREATE TRIGGER trigger_agent_installed_notification
  AFTER INSERT ON user_installed_agents
  FOR EACH ROW
  EXECUTE FUNCTION notify_agent_installed();

-- ==========================
-- Trigger: Custom agent request notification (for admins)
-- ==========================
CREATE OR REPLACE FUNCTION notify_agent_request()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_admin_notification(
    'Nouvelle demande d''agent',
    format('Demande d''agent custom: "%s"', COALESCE(NEW.agent_name, 'Sans nom')),
    'info',
    'agent',
    jsonb_build_object('request_id', NEW.id, 'user_id', NEW.user_id, 'budget', NEW.budget_range)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agent_request_notification ON agent_requests;
CREATE TRIGGER trigger_agent_request_notification
  AFTER INSERT ON agent_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_agent_request();

-- ==========================
-- Trigger: Workflow status change notification
-- ==========================
CREATE OR REPLACE FUNCTION notify_workflow_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM create_notification(
      NEW.user_id,
      'Statut de workflow modifié',
      format('Le workflow "%s" est maintenant %s', NEW.title, NEW.status),
      CASE NEW.status 
        WHEN 'active' THEN 'success'
        WHEN 'paused' THEN 'warning'
        ELSE 'info'
      END,
      'workflow',
      jsonb_build_object('workflow_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workflow_status_notification ON workflows;
CREATE TRIGGER trigger_workflow_status_notification
  AFTER UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION notify_workflow_status_change();

-- ==========================
-- Seed some test notifications for dev user
-- ==========================
INSERT INTO notifications (user_id, title, message, type, category, is_read, created_at) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Bienvenue sur Pretalk!', 'Votre compte a été créé avec succès. Explorez les fonctionnalités disponibles.', 'success', 'system', false, now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000000', 'Nouveau Lead reçu', 'Alice Martin a répondu à votre formulaire "Contact". Score: 92/100', 'success', 'lead', false, now() - interval '10 minutes'),
  ('00000000-0000-0000-0000-000000000000', 'Agent installé', 'L''agent "Agent Audit SEO" a été installé avec succès', 'success', 'agent', true, now() - interval '1 hour'),
  ('00000000-0000-0000-0000-000000000000', 'Rapport hebdomadaire', 'Votre rapport de la semaine est disponible. 5 nouveaux leads, taux de conversion 24%.', 'info', 'general', true, now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- Enable Supabase Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

SELECT 'Notifications system created successfully' as status;

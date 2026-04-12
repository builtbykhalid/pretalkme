-- ============================================
-- TRIGGER WEBHOOK N8N - Nouveau Lead
-- ============================================
-- Ce trigger appelle le webhook n8n quand un nouveau lead est créé

-- 1. Activer l'extension http si pas déjà fait
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Fonction qui envoie le webhook
CREATE OR REPLACE FUNCTION public.notify_n8n_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://backand.pretalk.me/webhook/38221c34-913d-4f8e-8594-f7861b463821';
  payload JSONB;
  response extensions.http_response;
BEGIN
  -- Construire le payload avec les données du nouveau lead
  payload := jsonb_build_object(
    'event', 'INSERT',
    'table', 'leads',
    'record', jsonb_build_object(
      'id', NEW.id,
      'form_id', NEW.form_id,
      'respondent_info', NEW.respondent_info,
      'static_answers', NEW.static_answers,
      'dynamic_answers', NEW.dynamic_answers,
      'status', NEW.status,
      'score', NEW.score,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at
    ),
    'timestamp', NOW()
  );

  -- Envoyer la requête HTTP POST au webhook n8n
  BEGIN
    SELECT * INTO response FROM extensions.http((
      'POST',
      webhook_url,
      ARRAY[extensions.http_header('Content-Type', 'application/json')],
      'application/json',
      payload::TEXT
    )::extensions.http_request);
    
    -- Log optionnel (décommenter pour debug)
    -- RAISE NOTICE 'Webhook sent: status=%, body=%', response.status, response.content;
  EXCEPTION WHEN OTHERS THEN
    -- En cas d'erreur, on log mais on ne bloque pas l'insertion
    RAISE WARNING 'Webhook failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS trigger_n8n_new_lead ON public.leads;

-- 4. Créer le trigger
CREATE TRIGGER trigger_n8n_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_n8n_new_lead();

-- 5. Commenter pour documentation
COMMENT ON FUNCTION public.notify_n8n_new_lead() IS 'Envoie un webhook à n8n quand un nouveau lead est créé';
COMMENT ON TRIGGER trigger_n8n_new_lead ON public.leads IS 'Déclenche le workflow n8n Analyste sur nouveau lead';

-- ============================================
-- VÉRIFICATION
-- ============================================
-- SELECT tgname, tgtype, tgenabled FROM pg_trigger WHERE tgname = 'trigger_n8n_new_lead';

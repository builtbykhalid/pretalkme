-- ==============================================================================
-- 🛡️ AUDIT CORRECTIF DE SÉCURITÉ - POLITIQUES RLS MANQUANTES
-- ==============================================================================

-- 1. admin_audit_logs : Uniquement pour les administrateurs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view all audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (get_my_role() = 'admin');

-- 2. agents_library : Lecture publique pour les agents actifs
DROP POLICY IF EXISTS "Anyone can view public agents" ON public.agents_library;
CREATE POLICY "Anyone can view public agents" 
ON public.agents_library FOR SELECT 
USING (is_public = true);

-- 3. automation_logs : Les utilisateurs voient les logs de leurs propres workflows
DROP POLICY IF EXISTS "Users can view their own automation logs" ON public.automation_logs;
CREATE POLICY "Users can view their own automation logs" 
ON public.automation_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM workflows 
    WHERE workflows.id = automation_logs.workflow_id 
    AND workflows.user_id = auth.uid()
  )
);

-- 4. n8n_webhook_logs : Uniquement pour les administrateurs (Schéma supposé)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'n8n_webhook_logs' AND schemaname = 'public') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.n8n_webhook_logs';
        EXECUTE 'CREATE POLICY "Admins can view webhook logs" ON public.n8n_webhook_logs FOR SELECT USING (get_my_role() = ''admin'')';
    END IF;
END $$;

-- 5. notifications : Isolation par utilisateur (Lecture et Mise à jour pour "Marquer comme lu")
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id);

-- 6. pdf_templates : Lecture publique pour les templates actifs
DROP POLICY IF EXISTS "Anyone can view active pdf templates" ON public.pdf_templates;
CREATE POLICY "Anyone can view active pdf templates" 
ON public.pdf_templates FOR SELECT 
USING (true);

-- 7. platform_settings : Lecture publique, Modification Admin uniquement
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can view platform settings" 
ON public.platform_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins can manage platform settings" 
ON public.platform_settings FOR ALL 
USING (get_my_role() = 'admin');

-- 8. reserved_usernames : Lecture publique pour vérification lors de l'inscription
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reserved_usernames' AND schemaname = 'public') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can check reserved usernames" ON public.reserved_usernames';
        EXECUTE 'CREATE POLICY "Anyone can check reserved usernames" ON public.reserved_usernames FOR SELECT USING (true)';
    END IF;
END $$;

-- ==============================================================================
-- FIN DE L'AUDIT - SÉCURITÉ INFO (RLS POLICIES)
-- ==============================================================================

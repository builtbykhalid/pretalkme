-- =============================================================================
-- MIGRATION UNIFIÉE: Fix workflow n8n #2 compatibility
-- Date: 2026-02-02
-- Purpose: Corriger toutes les incohérences de schéma pour le workflow Analyste
-- =============================================================================

-- 1. S'assurer que la colonne dynamic_answers existe (alias de dynamic_dialogue pour compatibilité)
-- Note: On garde dynamic_dialogue comme colonne principale, on ajoute dynamic_answers comme alias
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS dynamic_answers jsonb;

-- 2. Synchroniser dynamic_answers avec dynamic_dialogue (pour données existantes)
-- SKIPPED: dynamic_dialogue column does not exist in Cloud instance
-- UPDATE public.leads 
-- SET dynamic_answers = dynamic_dialogue 
-- WHERE dynamic_answers IS NULL AND dynamic_dialogue IS NOT NULL;

-- 3. Créer un trigger pour synchroniser automatiquement les deux colonnes
CREATE OR REPLACE FUNCTION sync_dynamic_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Si dynamic_dialogue est mis à jour, synchroniser vers dynamic_answers
    IF NEW.dynamic_dialogue IS DISTINCT FROM OLD.dynamic_dialogue THEN
        NEW.dynamic_answers := NEW.dynamic_dialogue;
    END IF;
    -- Si dynamic_answers est mis à jour, synchroniser vers dynamic_dialogue  
    IF NEW.dynamic_answers IS DISTINCT FROM OLD.dynamic_answers THEN
        NEW.dynamic_dialogue := NEW.dynamic_answers;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_dynamic_data ON leads;
CREATE TRIGGER trg_sync_dynamic_data
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION sync_dynamic_data();

-- 4. S'assurer que les colonnes consultant existent dans forms
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS consultant_email text,
ADD COLUMN IF NOT EXISTS consultant_name text, 
ADD COLUMN IF NOT EXISTS consultant_role text DEFAULT 'consultant expert',
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS description text;

-- 5. Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_forms_consultant_email ON forms(consultant_email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 6. Peupler consultant_email/consultant_name depuis le profil propriétaire
UPDATE forms f
SET 
    consultant_email = COALESCE(f.consultant_email, p.email),
    consultant_name = COALESCE(f.consultant_name, p.full_name, 'Consultant'),
    consultant_role = COALESCE(f.consultant_role, p.job_title, 'Expert consultant')
FROM profiles p
WHERE f.user_id = p.id
AND (f.consultant_email IS NULL OR f.consultant_name IS NULL);

-- 7. Valeurs par défaut pour les forms sans profil associé
UPDATE forms 
SET 
    consultant_email = COALESCE(consultant_email, 'admin@pretalk.me'),
    consultant_name = COALESCE(consultant_name, 'Équipe Pretalk'),
    consultant_role = COALESCE(consultant_role, 'Expert consultant')
WHERE consultant_email IS NULL;

-- 8. S'assurer que updated_at est automatiquement mis à jour
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Créer une vue pour faciliter l'accès aux données du lead (pour n8n)
CREATE OR REPLACE VIEW v_leads_for_analysis AS
SELECT 
    l.id,
    l.form_id,
    l.user_id,
    -- Extraire les infos du respondent_info JSONB
    l.respondent_info->>'email' as email,
    l.respondent_info->>'name' as name,
    l.respondent_info->>'company' as company,
    l.respondent_info->>'phone' as phone,
    l.respondent_info as respondent_info,
    l.static_answers,
    l.dynamic_answers,
    l.ai_analysis_draft,
    l.final_report_pdf,
    l.score,
    l.score_reason,
    l.status,
    l.created_at,
    l.updated_at,
    -- Infos du formulaire
    f.title as form_title,
    f.consultant_email,
    f.consultant_name,
    f.consultant_role,
    f.domain as form_domain,
    f.ai_config,
    f.description as form_description
FROM leads l
LEFT JOIN forms f ON l.form_id = f.id;

-- 10. Commenter les colonnes pour documentation
COMMENT ON COLUMN forms.consultant_email IS 'Email du consultant (pour notifications n8n workflow #2)';
COMMENT ON COLUMN forms.consultant_name IS 'Nom du consultant (pour personnalisation emails)';
COMMENT ON COLUMN forms.consultant_role IS 'Rôle/expertise du consultant (utilisé dans prompts IA)';
COMMENT ON COLUMN leads.dynamic_answers IS 'Réponses dynamiques (alias de dynamic_dialogue pour compatibilité n8n)';
COMMENT ON VIEW v_leads_for_analysis IS 'Vue optimisée pour le workflow n8n Analyste - extrait les champs JSONB';

-- 11. Vérification finale
DO $$
DECLARE
    leads_count INTEGER;
    forms_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO leads_count FROM leads;
    SELECT COUNT(*) INTO forms_count FROM forms WHERE consultant_email IS NOT NULL;
    RAISE NOTICE '✅ Migration terminée: % leads, % forms avec consultant_email', leads_count, forms_count;
END $$;
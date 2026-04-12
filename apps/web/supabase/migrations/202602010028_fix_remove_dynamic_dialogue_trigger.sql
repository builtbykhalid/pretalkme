-- =============================================================================
-- MIGRATION: Supprimer le trigger problématique dynamic_dialogue
-- Date: 2026-02-02
-- Purpose: Corriger l'erreur "record new has no field dynamic_dialogue"
-- =============================================================================

-- 1. Supprimer le trigger problématique
DROP TRIGGER IF EXISTS trg_sync_dynamic_data ON leads;

-- 2. Supprimer la fonction associée
DROP FUNCTION IF EXISTS sync_dynamic_data();

-- 3. Vérification: la colonne dynamic_answers existe déjà
-- Si dynamic_dialogue existait, on migre les données (sécurité)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'dynamic_dialogue'
    ) THEN
        -- Migrer les données de dynamic_dialogue vers dynamic_answers
        UPDATE public.leads 
        SET dynamic_answers = dynamic_dialogue 
        WHERE dynamic_answers IS NULL AND dynamic_dialogue IS NOT NULL;
        
        -- Supprimer l'ancienne colonne
        ALTER TABLE public.leads DROP COLUMN IF EXISTS dynamic_dialogue;
        
        RAISE NOTICE 'Colonne dynamic_dialogue migrée et supprimée';
    ELSE
        RAISE NOTICE 'Colonne dynamic_dialogue inexistante - OK';
    END IF;
END $$;

-- 4. Confirmer que seule dynamic_answers existe
COMMENT ON COLUMN leads.dynamic_answers IS 'Réponses dynamiques générées par l IA (JSON array)';

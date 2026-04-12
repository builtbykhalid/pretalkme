-- ==============================================================================
-- 🛡️ AUDIT CORRECTIF DE SÉCURITÉ - SUPABASE ADVISOR (V2)
-- ==============================================================================

-- 1. FIX: Mutable Search Path (Sécurisation de TOUTES les fonctions du schéma public)
-- Cette approche automatisée évite les erreurs de signature de fonction.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER FUNCTION ' || quote_ident(r.nspname) || '.' || quote_ident(r.proname) || '(' || r.args || ') SET search_path = public;';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Impossible de modifier la fonction % : %', r.proname, SQLERRM;
        END;
    END LOOP;
END $$;


-- 2. FIX: RLS Policies Always True (leads & analytics)
-- Correction des politiques trop permissives signalées par l'Advisor.

-- Suppression des politiques "Always True" sur les leads
DROP POLICY IF EXISTS "Public can update own lead" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;

-- Recréation d'une politique INSERT saine pour les leads (uniquement via formulaire public)
-- Remarque : On autorise l'INSERT car c'est le flux normal du site, 
-- mais on s'assure que le form_id appartient à un formulaire publié.
CREATE POLICY "Public can insert leads into active forms" ON public.leads
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.forms 
        WHERE forms.id = leads.form_id 
        AND forms.status IN ('published', 'Active', 'published_v1')
    )
);

-- Sécurisation de Analytics (INSERT uniquement, avec validation de type)
DROP POLICY IF EXISTS "Allow public tracking" ON public_analytics_events;
CREATE POLICY "Allow public tracking" ON public_analytics_events
FOR INSERT WITH CHECK (
    event_type IN ('page_view', 'form_start', 'form_complete', 'link_click')
);


-- 3. FIX: Extensions in Public
-- On prépare le terrain pour déplacer les extensions (nécessite d'être superuser)
CREATE SCHEMA IF NOT EXISTS extensions;


-- 4. FIX: Sécurisation des Vues (Security Invoker)
-- Pour éviter le "tunneling" RLS via les vues publiques.

ALTER VIEW IF EXISTS public.public_profiles SET (security_invoker = true);
ALTER VIEW IF EXISTS public.public_forms_view SET (security_invoker = true);
ALTER VIEW IF EXISTS public.public_bookings SET (security_invoker = true);


-- ==========================
-- FIN DE L'AUDIT CORRECTIF
-- ==========================

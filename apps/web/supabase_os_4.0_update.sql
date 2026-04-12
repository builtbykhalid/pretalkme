-- ==============================================================================
-- STRATÉGIE PRETALK OS 4.0 : MIGRATION SQL
-- ==============================================================================
-- Ce fichier contient les tables et ajustements nécessaires pour le Dashboard ROI,
-- les Pipelines (Kanban) et les workflows n8n (Propositions & Contrats).
-- ==============================================================================

-- 1. CREATION DE LA TABLE DEALS (Pour le Dashboard ROI et Phase C/D)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour accélérer les requêtes du Dashboard (MRR / Chiffre d'Affaires)
CREATE INDEX IF NOT EXISTS idx_deals_consultant_status ON public.deals(consultant_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON public.deals(lead_id);

-- 2. POLITIQUES RLS (Row Level Security) POUR DEALS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les consultants voient leurs propres deals"
    ON public.deals FOR SELECT
    USING (auth.uid() = consultant_id);

CREATE POLICY "Les consultants créent leurs propres deals"
    ON public.deals FOR INSERT
    WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Les consultants mettent à jour leurs propres deals"
    ON public.deals FOR UPDATE
    USING (auth.uid() = consultant_id);

CREATE POLICY "Les consultants suppriment leurs propres deals"
    ON public.deals FOR DELETE
    USING (auth.uid() = consultant_id);

-- 3. AJOUT DU CHAMP STATUS DANS LEADS SI MANQUANT (Texte simple ou modification enum)
-- Vu que nous utilisons de nouveaux status ('new', 'scheduled', 'audited', 'won', 'lost'),
-- il n'y a pas d'enum strict par défaut. Si c'est le cas, voici la commande :
-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- 4. AJOUT DE LA COLONNE AI_ANALYSIS_JSON DANS LEADS SI MANQUANTE
-- ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ai_analysis_json JSONB DEFAULT '{}'::jsonb;

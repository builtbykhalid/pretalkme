-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_handle TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_on_login BOOLEAN DEFAULT true,
    display_on_onboarding BOOLEAN DEFAULT true,
    display_on_home BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to active testimonials" 
ON testimonials FOR SELECT 
USING (is_active = true);

-- Allow admin full access
CREATE POLICY "Allow authenticated full access" 
ON testimonials FOR ALL 
USING (auth.role() = 'authenticated');

-- Seed initial testimonials
INSERT INTO testimonials (content, author_name, author_handle, display_on_login, display_on_onboarding, display_on_home) VALUES
('J''ai remplacé mon formulaire Google par Pretalk et mes leads qualifiés ont triplé en 2 semaines. L''IA pose exactement les bonnes questions que je n''aurais jamais pensé à poser.', 'Sophie Martinet', '@sophie_consulting', true, true, true),
('En 15 minutes j''avais mon premier formulaire intelligent en ligne. Un prospect m''a dit ''je n''ai jamais rempli un formulaire aussi pertinent''. Ça résume tout.', 'Karim Bouzid', '@karim_bz', true, true, true),
('Pretalk a transformé ma prospection. Avant je perdais 2h par lead à qualifier manuellement. Maintenant l''IA le fait pour moi et je me concentre sur les vrais clients.', 'Marine Lefort', '@marine_growth', true, true, true),
('Le scoring automatique est bluffant. Il a détecté un prospect à 95/100 que j''aurais ignoré. Résultat : contrat signé à 8k€. Pretalk se paie tout seul.', 'Thomas Renaud', '@thomasrnd', true, true, true),
('J''étais sceptique sur l''IA conversationnelle dans un formulaire. Puis j''ai vu les réponses de mes prospects : 3x plus détaillées qu''avant. Plus besoin d''appels de découverte.', 'Léa Chen', '@lea_digital', true, true, true),
('L''intégration Slack + scoring automatique c''est un game changer. On reçoit une notif dès qu''un lead chaud tombe. Mon équipe adore.', 'Julien Moreau', '@julienmo_tech', true, true, true),
('En tant que freelance, Pretalk me donne la crédibilité d''une agence. Mes prospects reçoivent un audit personnalisé automatique. Ils pensent que j''ai une équipe de 10 personnes 😄', 'Amira Sayah', '@amira_freelance', true, true, true),
('J''ai testé Typeform, Tally, JotForm... rien ne se compare à Pretalk. L''IA qui adapte les questions en temps réel selon les réponses, c''est un autre niveau.', 'Nicolas Fabre', '@nico_saas', true, true, true),
('Mon taux de conversion formulaire est passé de 3% à 11% depuis que j''utilise les questions dynamiques. Les gens VEULENT répondre parce que les questions sont pertinentes.', 'Clara Dubois', '@clara_marketing', true, true, true),
('Onboarding en 5 minutes, premier lead qualifié en 24h. Si vous êtes consultant et que vous ne l''utilisez pas encore, vous laissez de l''argent sur la table.', 'Romain Petit', '@romain_consult', true, true, true);

-- Fix encoding issues - using ASCII-safe text without accents
UPDATE agents_library SET 
    description = 'Agent IA specialise en marketing digital. Analyse les strategies marketing, identifie les opportunites de croissance, evalue la presence en ligne, et genere des recommandations personnalisees pour ameliorer le ROI des campagnes.',
    base_prompt = 'Tu es un expert en marketing digital avec 15 ans d experience. Tu analyses les besoins des entreprises en matiere de strategie digitale globale (SEO, SEA, Social Media, Email Marketing), acquisition et fidelisation client, optimisation des tunnels de conversion, content marketing et personal branding, analytics et mesure de performance.'
WHERE name = 'Agent Marketing Digital Expert';

-- Update other agents with proper text
UPDATE agents_library SET 
    description = 'Analyse technique et semantique de site web. Detecte les opportunites de mots-cles.'
WHERE name = 'Agent Audit SEO';

UPDATE agents_library SET 
    description = 'Estime la complexite technique, recommande une stack (React/Node) et chiffre le projet.'
WHERE name = 'Agent Tech Lead';

UPDATE agents_library SET 
    description = 'Qualifie le BANT (Budget, Authority, Need, Timing) et detecte les signaux d achat.'
WHERE name = 'Agent Sales Coach';

UPDATE agents_library SET 
    description = 'Pre-analyse de contrats et verification de conformite RGPD de premier niveau.'
WHERE name = 'Agent Juridique';

-- Update form ai_config
UPDATE forms SET 
    ai_config = jsonb_set(
        ai_config, 
        '{prompt}', 
        '"Tu es Thomas Dubois, expert en marketing digital. Analyse les reponses du prospect et genere 3-5 questions complementaires pour mieux comprendre leurs besoins specifiques."'
    )
WHERE slug = 'audit-marketing-digital-2024';

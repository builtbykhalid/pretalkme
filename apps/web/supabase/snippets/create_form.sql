-- Créer le formulaire Audit Marketing Digital
INSERT INTO forms (
    user_id,
    title,
    slug,
    status,
    views_count,
    leads_count,
    form_structure,
    ai_config,
    design_config
)
SELECT 
    p.id,
    'Audit Marketing Digital Gratuit',
    'audit-marketing-digital-2024',
    'published',
    247,
    34,
    '[
        {"id": "q1", "type": "text", "label": "Quel est le nom de votre entreprise ?", "placeholder": "Ex: Ma Super Startup", "required": true},
        {"id": "q2", "type": "text", "label": "Quelle est l''URL de votre site web ?", "placeholder": "https://www.votresite.com", "required": true},
        {"id": "q3", "type": "select", "label": "Quel est votre secteur d''activité ?", "required": true, "options": ["E-commerce / Retail", "SaaS / Logiciel", "Services B2B", "Services B2C", "Industrie / Manufacturing", "Santé / Bien-être", "Immobilier", "Finance / Assurance", "Éducation / Formation", "Autre"]},
        {"id": "q4", "type": "select", "label": "Quelle est la taille de votre entreprise ?", "required": true, "options": ["Auto-entrepreneur / Freelance", "TPE (1-10 employés)", "PME (11-50 employés)", "ETI (51-250 employés)", "Grande entreprise (250+ employés)"]},
        {"id": "q5", "type": "select", "label": "Quel est votre budget marketing mensuel actuel ?", "required": true, "options": ["Moins de 500€", "500€ - 2 000€", "2 000€ - 5 000€", "5 000€ - 10 000€", "10 000€ - 20 000€", "Plus de 20 000€"]},
        {"id": "q6", "type": "checkbox", "label": "Quels canaux marketing utilisez-vous actuellement ?", "required": true, "options": ["SEO (Référencement naturel)", "SEA (Google Ads, Bing Ads)", "Réseaux sociaux organiques", "Social Ads (Meta, LinkedIn, TikTok)", "Email marketing", "Content marketing / Blog", "Affiliation", "Marketing d''influence", "Aucun pour le moment"]},
        {"id": "q7", "type": "textarea", "label": "Quels sont vos 3 principaux objectifs marketing pour les 12 prochains mois ?", "placeholder": "Ex: Augmenter le trafic de 50%, générer 100 leads qualifiés par mois...", "required": true},
        {"id": "q8", "type": "select", "label": "Quel est votre principal défi marketing actuel ?", "required": true, "options": ["Générer plus de trafic qualifié", "Convertir les visiteurs en clients", "Fidéliser les clients existants", "Mesurer le ROI des actions", "Manque de temps / ressources", "Ne sais pas par où commencer", "Budget limité"]},
        {"id": "q9", "type": "select", "label": "Avez-vous une équipe marketing en interne ?", "required": true, "options": ["Non, je gère seul(e)", "1 personne dédiée", "Petite équipe (2-5 personnes)", "Équipe structurée (5+ personnes)", "On travaille avec une agence"]},
        {"id": "q10", "type": "textarea", "label": "Décrivez brièvement votre cible client idéale", "placeholder": "Ex: Dirigeants de PME entre 35-55 ans, secteur tech, CA > 1M€...", "required": true},
        {"id": "q11", "type": "text", "label": "Votre prénom", "placeholder": "Jean", "required": true},
        {"id": "q12", "type": "text", "label": "Votre nom", "placeholder": "Dupont", "required": true},
        {"id": "q13", "type": "email", "label": "Votre email professionnel", "placeholder": "jean.dupont@entreprise.com", "required": true},
        {"id": "q14", "type": "text", "label": "Votre numéro de téléphone", "placeholder": "+33 6 XX XX XX XX", "required": false}
    ]'::jsonb,
    '{
        "enabled": true,
        "agentId": null,
        "prompt": "Tu es Thomas Dubois, expert en marketing digital. Analyse les réponses du prospect et génère 3-5 questions complémentaires pour mieux comprendre leurs besoins spécifiques.",
        "numberOfQuestions": 4,
        "questionComplexity": "intermediate",
        "questionContext": "Le prospect remplit un formulaire d''audit marketing digital gratuit."
    }'::jsonb,
    '{
        "primaryColor": "indigo",
        "backgroundColor": "white",
        "font": "inter",
        "logoUrl": "",
        "showBranding": true
    }'::jsonb
FROM profiles p
WHERE p.email = 'thomas.dubois@example.com';

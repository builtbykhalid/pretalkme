-- ===============================================
-- SEED DATA: Consultant Marketing Digital Complet
-- Thomas Dubois - Expert Marketing Digital
-- ===============================================

-- 1. Mise à jour complète du profil consultant Thomas Dubois
UPDATE profiles SET
    full_name = 'Thomas Dubois',
    role = 'consultant',
    avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    company_name = 'DigiGrowth Consulting',
    job_title = 'Expert en Marketing Digital & Growth',
    account_status = 'active',
    branding_config = '{
        "logo_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop",
        "primary_color": "#4F46E5",
        "secondary_color": "#10B981",
        "font_family": "Inter",
        "tagline": "Accélérez votre croissance digitale",
        "website": "https://digigrowth-consulting.com",
        "linkedin": "https://linkedin.com/in/thomas-dubois-marketing",
        "phone": "+33 6 12 34 56 78",
        "address": "42 Avenue des Champs-Élysées, 75008 Paris"
    }'::jsonb
WHERE email = 'thomas.dubois@example.com';

-- 2. Insertion de l'Agent IA Expert Marketing Digital
INSERT INTO agents_library (
    name,
    category,
    description,
    base_prompt,
    n8n_template_id,
    icon_key,
    color_class,
    bg_class,
    is_public
) VALUES (
    'Agent Marketing Digital Expert',
    'Marketing',
    'Agent IA spécialisé en marketing digital. Analyse les stratégies marketing, identifie les opportunités de croissance, évalue la présence en ligne, et génère des recommandations personnalisées pour améliorer le ROI des campagnes.',
    'Tu es un expert en marketing digital avec 15 ans d''expérience. Tu analyses les besoins des entreprises en matière de:
- Stratégie digitale globale (SEO, SEA, Social Media, Email Marketing)
- Acquisition et fidélisation client
- Optimisation des tunnels de conversion
- Content marketing et personal branding
- Analytics et mesure de performance

Pour chaque prospect, tu dois:
1. Comprendre leur situation actuelle (présence digitale, budget, objectifs)
2. Identifier les quick wins et opportunités immédiates
3. Proposer une stratégie sur-mesure avec KPIs clairs
4. Estimer le ROI potentiel des actions recommandées

Ton ton est professionnel mais accessible. Tu utilises des exemples concrets et des données chiffrées quand possible.',
    'marketing-digital-audit-v1',
    'TrendingUp',
    'text-indigo-600',
    'bg-indigo-100',
    true
) ON CONFLICT DO NOTHING;

-- 3. Récupérer l'ID du consultant Thomas
DO $$
DECLARE
    consultant_id UUID;
    new_form_id UUID;
    agent_id INTEGER;
BEGIN
    -- Récupérer l'ID du consultant
    SELECT id INTO consultant_id FROM profiles WHERE email = 'thomas.dubois@example.com';
    
    IF consultant_id IS NULL THEN
        RAISE EXCEPTION 'Consultant thomas.dubois@example.com not found';
    END IF;

    -- Récupérer l'ID de l'agent marketing
    SELECT id INTO agent_id FROM agents_library WHERE name = 'Agent Marketing Digital Expert' LIMIT 1;

    -- 4. Installer l'agent pour ce consultant
    INSERT INTO user_installed_agents (user_id, agent_id, settings)
    VALUES (
        consultant_id,
        agent_id,
        '{
            "auto_analyze": true,
            "notification_email": true,
            "custom_prompt_suffix": "Focus sur les PME françaises avec un budget marketing de 2000-10000€/mois"
        }'::jsonb
    ) ON CONFLICT (user_id, agent_id) DO UPDATE SET settings = EXCLUDED.settings;

    -- 5. Créer le formulaire détaillé pour Audit Marketing Digital
    new_form_id := gen_random_uuid();
    
    INSERT INTO forms (
        id,
        user_id,
        title,
        slug,
        status,
        views_count,
        leads_count,
        form_structure,
        ai_config,
        design_config
    ) VALUES (
        new_form_id,
        consultant_id,
        'Audit Marketing Digital Gratuit',
        'audit-marketing-digital-2024',
        'published',
        247,
        34,
        '[
            {
                "id": "q1",
                "type": "text",
                "label": "Quel est le nom de votre entreprise ?",
                "placeholder": "Ex: Ma Super Startup",
                "required": true
            },
            {
                "id": "q2",
                "type": "text",
                "label": "Quelle est l''URL de votre site web ?",
                "placeholder": "https://www.votresite.com",
                "required": true
            },
            {
                "id": "q3",
                "type": "select",
                "label": "Quel est votre secteur d''activité ?",
                "required": true,
                "options": [
                    "E-commerce / Retail",
                    "SaaS / Logiciel",
                    "Services B2B",
                    "Services B2C",
                    "Industrie / Manufacturing",
                    "Santé / Bien-être",
                    "Immobilier",
                    "Finance / Assurance",
                    "Éducation / Formation",
                    "Autre"
                ]
            },
            {
                "id": "q4",
                "type": "select",
                "label": "Quelle est la taille de votre entreprise ?",
                "required": true,
                "options": [
                    "Auto-entrepreneur / Freelance",
                    "TPE (1-10 employés)",
                    "PME (11-50 employés)",
                    "ETI (51-250 employés)",
                    "Grande entreprise (250+ employés)"
                ]
            },
            {
                "id": "q5",
                "type": "select",
                "label": "Quel est votre budget marketing mensuel actuel ?",
                "required": true,
                "options": [
                    "Moins de 500€",
                    "500€ - 2 000€",
                    "2 000€ - 5 000€",
                    "5 000€ - 10 000€",
                    "10 000€ - 20 000€",
                    "Plus de 20 000€"
                ]
            },
            {
                "id": "q6",
                "type": "checkbox",
                "label": "Quels canaux marketing utilisez-vous actuellement ?",
                "required": true,
                "options": [
                    "SEO (Référencement naturel)",
                    "SEA (Google Ads, Bing Ads)",
                    "Réseaux sociaux organiques",
                    "Social Ads (Meta, LinkedIn, TikTok)",
                    "Email marketing",
                    "Content marketing / Blog",
                    "Affiliation",
                    "Marketing d''influence",
                    "Aucun pour le moment"
                ]
            },
            {
                "id": "q7",
                "type": "textarea",
                "label": "Quels sont vos 3 principaux objectifs marketing pour les 12 prochains mois ?",
                "placeholder": "Ex: Augmenter le trafic de 50%, générer 100 leads qualifiés par mois, améliorer le taux de conversion...",
                "required": true
            },
            {
                "id": "q8",
                "type": "select",
                "label": "Quel est votre principal défi marketing actuel ?",
                "required": true,
                "options": [
                    "Générer plus de trafic qualifié",
                    "Convertir les visiteurs en clients",
                    "Fidéliser les clients existants",
                    "Mesurer le ROI des actions",
                    "Manque de temps / ressources",
                    "Ne sais pas par où commencer",
                    "Budget limité"
                ]
            },
            {
                "id": "q9",
                "type": "select",
                "label": "Avez-vous une équipe marketing en interne ?",
                "required": true,
                "options": [
                    "Non, je gère seul(e)",
                    "1 personne dédiée",
                    "Petite équipe (2-5 personnes)",
                    "Équipe structurée (5+ personnes)",
                    "On travaille avec une agence"
                ]
            },
            {
                "id": "q10",
                "type": "textarea",
                "label": "Décrivez brièvement votre cible client idéale",
                "placeholder": "Ex: Dirigeants de PME entre 35-55 ans, secteur tech, CA > 1M€...",
                "required": true
            },
            {
                "id": "q11",
                "type": "text",
                "label": "Votre prénom",
                "placeholder": "Jean",
                "required": true
            },
            {
                "id": "q12",
                "type": "text",
                "label": "Votre nom",
                "placeholder": "Dupont",
                "required": true
            },
            {
                "id": "q13",
                "type": "email",
                "label": "Votre email professionnel",
                "placeholder": "jean.dupont@entreprise.com",
                "required": true
            },
            {
                "id": "q14",
                "type": "text",
                "label": "Votre numéro de téléphone",
                "placeholder": "+33 6 XX XX XX XX",
                "required": false
            }
        ]'::jsonb,
        '{
            "enabled": true,
            "agentId": null,
            "prompt": "Tu es Thomas Dubois, expert en marketing digital. Analyse les réponses du prospect et génère 3-5 questions complémentaires pour mieux comprendre leurs besoins spécifiques. Concentre-toi sur : leur maturité digitale, leurs ressources internes, leurs concurrents, et leurs attentes en termes de résultats.",
            "numberOfQuestions": 4,
            "questionComplexity": "intermediate",
            "questionContext": "Le prospect remplit un formulaire d''audit marketing digital gratuit. Il cherche à améliorer sa stratégie digitale. Les questions doivent permettre de qualifier son besoin et de préparer un audit personnalisé."
        }'::jsonb,
        '{
            "primaryColor": "indigo",
            "backgroundColor": "white",
            "font": "inter",
            "logoUrl": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop",
            "showBranding": true,
            "customCss": ""
        }'::jsonb
    );

    -- 6. Mettre à jour la subscription du consultant
    INSERT INTO subscriptions (user_id, plan_id, status, current_period_end, usage_limit, usage_current, manual_override)
    VALUES (
        consultant_id,
        'pro',
        'active',
        NOW() + INTERVAL '1 year',
        1000,
        34,
        true
    )
    ON CONFLICT (id) DO NOTHING;

    -- Update if exists
    UPDATE subscriptions 
    SET plan_id = 'pro',
        status = 'active',
        current_period_end = NOW() + INTERVAL '1 year',
        usage_limit = 1000,
        usage_current = 34
    WHERE user_id = consultant_id;

    -- 7. Créer quelques leads de test pour ce formulaire
    -- Lead 1: Lead chaud - Grande entreprise
    INSERT INTO leads (form_id, respondent_info, static_answers, dynamic_dialogue, score, score_reason, status, ai_analysis_draft)
    VALUES (
        new_form_id,
        '{
            "firstName": "Marie",
            "lastName": "Laurent",
            "email": "marie.laurent@techcorp.fr",
            "phone": "+33 6 98 76 54 32",
            "company": "TechCorp Solutions"
        }'::jsonb,
        '{
            "q1": "TechCorp Solutions",
            "q2": "https://www.techcorp-solutions.fr",
            "q3": "SaaS / Logiciel",
            "q4": "PME (11-50 employés)",
            "q5": "5 000€ - 10 000€",
            "q6": ["SEO (Référencement naturel)", "SEA (Google Ads, Bing Ads)", "Email marketing"],
            "q7": "1. Doubler notre trafic organique en 6 mois\n2. Améliorer notre taux de conversion de 2% à 4%\n3. Réduire notre coût d''acquisition client de 30%",
            "q8": "Convertir les visiteurs en clients",
            "q9": "Petite équipe (2-5 personnes)",
            "q10": "DSI et CTO de PME/ETI dans le secteur tech, 40-55 ans, entreprises de 50-500 employés cherchant à moderniser leur stack IT",
            "q11": "Marie",
            "q12": "Laurent",
            "q13": "marie.laurent@techcorp.fr",
            "q14": "+33 6 98 76 54 32"
        }'::jsonb,
        '[
            {"question": "Quels sont vos principaux concurrents et comment vous différenciez-vous actuellement sur le marché ?", "answer": "Nos principaux concurrents sont Salesforce et HubSpot. On se différencie par notre approche sur-mesure pour les PME françaises et notre support client local."},
            {"question": "Avez-vous déjà mis en place du marketing automation ? Si oui, quels outils utilisez-vous ?", "answer": "Oui, on utilise Mailchimp pour nos newsletters mais c''est assez basique. On aimerait quelque chose de plus sophistiqué."},
            {"question": "Quel est votre cycle de vente moyen et votre panier moyen ?", "answer": "Le cycle de vente est de 3-6 mois, panier moyen de 15 000€/an par client."},
            {"question": "Comment mesurez-vous actuellement le succès de vos campagnes marketing ?", "answer": "On regarde le nombre de demos demandées et le trafic du site, mais on n''a pas vraiment de dashboard centralisé."}
        ]'::jsonb,
        92,
        'Budget élevé (5-10k€), équipe en place, objectifs clairs et mesurables, fort potentiel de conversion',
        'qualified',
        '# Audit Marketing Digital - TechCorp Solutions

## Résumé Exécutif
TechCorp Solutions présente un profil de prospect hautement qualifié avec un potentiel de ROI significatif. L''entreprise dispose déjà d''une base marketing solide mais nécessite une optimisation stratégique.

## Points Forts Identifiés
- ✅ Budget marketing conséquent (5-10k€/mois)
- ✅ Équipe marketing existante (2-5 personnes)
- ✅ Objectifs SMART bien définis
- ✅ Canaux diversifiés déjà en place
- ✅ Marché B2B avec cycle de vente long (idéal pour le content marketing)

## Axes d''Amélioration Prioritaires

### 1. Optimisation du Tunnel de Conversion (Priorité Haute)
Le taux de conversion actuel de 2% est en-dessous de la moyenne B2B SaaS (3-5%). Recommandations :
- Mise en place de landing pages dédiées par persona
- A/B testing systématique des CTAs
- Chatbot qualifié pour les visiteurs chauds

### 2. Marketing Automation Avancé
Passage de Mailchimp à une solution plus robuste (HubSpot, Marketo) :
- Scoring automatique des leads
- Nurturing séquencé par segment
- Attribution multi-touch

### 3. Content Strategy B2B
- Création de contenus thought leadership
- Webinaires mensuels
- Études de cas clients

## ROI Estimé
Avec les optimisations proposées :
- Augmentation du trafic : +80% en 6 mois
- Amélioration conversion : 2% → 4%
- Réduction CAC : -25%
- **ROI estimé : 340% sur 12 mois**

## Prochaines Étapes Recommandées
1. Appel découverte de 45 min
2. Audit technique complet du site
3. Proposition de stratégie sur-mesure'
    );

    -- Lead 2: Lead tiède - Startup
    INSERT INTO leads (form_id, respondent_info, static_answers, dynamic_dialogue, score, score_reason, status, ai_analysis_draft)
    VALUES (
        new_form_id,
        '{
            "firstName": "Alexandre",
            "lastName": "Martin",
            "email": "alex@startupinnovante.io",
            "phone": "+33 7 12 34 56 78",
            "company": "Startup Innovante"
        }'::jsonb,
        '{
            "q1": "Startup Innovante",
            "q2": "https://startupinnovante.io",
            "q3": "SaaS / Logiciel",
            "q4": "TPE (1-10 employés)",
            "q5": "500€ - 2 000€",
            "q6": ["Réseaux sociaux organiques", "Content marketing / Blog"],
            "q7": "1. Acquérir nos 100 premiers clients payants\n2. Valider notre product-market fit\n3. Lever des fonds série A",
            "q8": "Générer plus de trafic qualifié",
            "q9": "Non, je gère seul(e)",
            "q10": "Fondateurs de startups early-stage, 25-40 ans, secteur tech, cherchant à automatiser leur growth",
            "q11": "Alexandre",
            "q12": "Martin",
            "q13": "alex@startupinnovante.io",
            "q14": "+33 7 12 34 56 78"
        }'::jsonb,
        '[
            {"question": "À quel stade de développement est votre startup ?", "answer": "On a lancé notre MVP il y a 3 mois, on a 15 beta-testeurs actifs."},
            {"question": "Avez-vous validé votre pricing et votre positionnement ?", "answer": "Pas encore totalement, on teste différents prix entre 29€ et 99€/mois."}
        ]'::jsonb,
        65,
        'Budget limité mais potentiel de croissance, startup early-stage, besoin d''accompagnement stratégique',
        'pending',
        '# Audit Marketing Digital - Startup Innovante

## Contexte
Startup en phase d''amorçage avec un MVP récent. L''enjeu principal est la validation du product-market fit avant de scaler.

## Recommandations Adaptées au Budget
Avec un budget de 500-2000€, focus sur :

### 1. Growth Hacking Low-Cost
- LinkedIn outreach automatisé
- Product Hunt launch
- Programme de parrainage

### 2. Content Marketing Organique
- SEO long-tail sur des requêtes de niche
- Guest posting sur des blogs startup
- Newsletter hebdomadaire

## Accompagnement Proposé
Package Starter à 1 500€/mois incluant :
- 4h de consulting mensuel
- Setup des outils essentiels
- Tableau de bord KPIs'
    );

    -- Lead 3: Lead froid - Curieux
    INSERT INTO leads (form_id, respondent_info, static_answers, dynamic_dialogue, score, score_reason, status)
    VALUES (
        new_form_id,
        '{
            "firstName": "Pierre",
            "lastName": "Durand",
            "email": "p.durand@email.com",
            "company": "Freelance"
        }'::jsonb,
        '{
            "q1": "Pierre Durand Consulting",
            "q2": "https://pierredurand.fr",
            "q3": "Services B2B",
            "q4": "Auto-entrepreneur / Freelance",
            "q5": "Moins de 500€",
            "q6": ["Réseaux sociaux organiques"],
            "q7": "Avoir plus de visibilité sur LinkedIn",
            "q8": "Ne sais pas par où commencer",
            "q9": "Non, je gère seul(e)",
            "q10": "PME qui ont besoin de conseil en stratégie",
            "q11": "Pierre",
            "q12": "Durand",
            "q13": "p.durand@email.com",
            "q14": ""
        }'::jsonb,
        '[]'::jsonb,
        25,
        'Budget très limité, freelance individuel, besoins basiques',
        'new'
    );

    -- 8. Créer une intégration exemple
    INSERT INTO integrations (user_id, provider, access_token, settings, is_active)
    VALUES (
        consultant_id,
        'google_analytics',
        'ga_mock_token_xxxx',
        '{"property_id": "GA4-123456789", "connected_at": "2024-01-15"}'::jsonb,
        true
    ) ON CONFLICT DO NOTHING;

    -- 9. Créer un workflow d''automatisation
    INSERT INTO workflows (user_id, form_id, trigger_event, trigger_condition, action_type, webhook_url, payload_config, is_active)
    VALUES (
        consultant_id,
        new_form_id,
        'lead.created',
        '{"min_score": 70}'::jsonb,
        'webhook',
        'https://backand.pretalk.me/webhook/7a84dac7-7a65-40ae-8149-53959ea917fb',
        '{"include_analysis": true, "notify_slack": true}'::jsonb,
        true
    );

    RAISE NOTICE 'Successfully created marketing consultant data for Thomas Dubois';
    RAISE NOTICE 'Form ID: %', new_form_id;
    RAISE NOTICE 'Form slug: audit-marketing-digital-2024';

END $$;

-- Vérification finale
SELECT 
    p.full_name,
    p.company_name,
    p.job_title,
    COUNT(DISTINCT f.id) as forms_count,
    COUNT(DISTINCT l.id) as leads_count
FROM profiles p
LEFT JOIN forms f ON f.user_id = p.id
LEFT JOIN leads l ON l.form_id = f.id
WHERE p.email = 'thomas.dubois@example.com'
GROUP BY p.id, p.full_name, p.company_name, p.job_title;

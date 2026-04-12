-- Créer les leads de test pour le formulaire marketing
-- Lead 1: Lead chaud - Grande entreprise
INSERT INTO leads (form_id, respondent_info, static_answers, dynamic_dialogue, score, score_reason, status, ai_analysis_draft)
SELECT 
    f.id,
    '{"firstName": "Marie", "lastName": "Laurent", "email": "marie.laurent@techcorp.fr", "phone": "+33 6 98 76 54 32", "company": "TechCorp Solutions"}'::jsonb,
    '{"q1": "TechCorp Solutions", "q2": "https://www.techcorp-solutions.fr", "q3": "SaaS / Logiciel", "q4": "PME (11-50 employés)", "q5": "5 000€ - 10 000€", "q6": ["SEO", "SEA", "Email marketing"], "q7": "Doubler notre trafic organique", "q8": "Convertir les visiteurs en clients", "q9": "Petite équipe (2-5 personnes)", "q10": "DSI et CTO de PME", "q11": "Marie", "q12": "Laurent", "q13": "marie.laurent@techcorp.fr", "q14": "+33 6 98 76 54 32"}'::jsonb,
    '[{"question": "Quels sont vos principaux concurrents ?", "answer": "Salesforce et HubSpot"}, {"question": "Avez-vous du marketing automation ?", "answer": "Mailchimp basique"}]'::jsonb,
    92,
    'Budget élevé (5-10k€), équipe en place, objectifs clairs',
    'qualified',
    '# Audit Marketing Digital - TechCorp Solutions

## Résumé Exécutif
TechCorp Solutions présente un profil de prospect hautement qualifié avec un potentiel de ROI significatif.

## Points Forts Identifiés
- Budget marketing conséquent (5-10k€/mois)
- Équipe marketing existante (2-5 personnes)
- Objectifs SMART bien définis

## Axes d''Amélioration
1. Optimisation du Tunnel de Conversion
2. Marketing Automation Avancé
3. Content Strategy B2B

## ROI Estimé: 340% sur 12 mois'
FROM forms f
WHERE f.slug = 'audit-marketing-digital-2024';

-- Lead 2: Lead tiède - Startup
INSERT INTO leads (form_id, respondent_info, static_answers, dynamic_dialogue, score, score_reason, status, ai_analysis_draft)
SELECT 
    f.id,
    '{"firstName": "Alexandre", "lastName": "Martin", "email": "alex@startupinnovante.io", "phone": "+33 7 12 34 56 78", "company": "Startup Innovante"}'::jsonb,
    '{"q1": "Startup Innovante", "q2": "https://startupinnovante.io", "q3": "SaaS / Logiciel", "q4": "TPE (1-10 employés)", "q5": "500€ - 2 000€", "q6": ["Réseaux sociaux organiques", "Content marketing"], "q7": "Acquérir 100 premiers clients", "q8": "Générer plus de trafic qualifié", "q9": "Non, je gère seul(e)", "q10": "Fondateurs de startups early-stage", "q11": "Alexandre", "q12": "Martin", "q13": "alex@startupinnovante.io", "q14": "+33 7 12 34 56 78"}'::jsonb,
    '[{"question": "À quel stade est votre startup ?", "answer": "MVP lancé il y a 3 mois, 15 beta-testeurs"}]'::jsonb,
    65,
    'Budget limité mais potentiel de croissance',
    'pending',
    '# Audit - Startup Innovante

## Contexte
Startup en phase d''amorçage avec un MVP récent.

## Recommandations
- Growth Hacking Low-Cost
- Content Marketing Organique
- Package Starter à 1 500€/mois'
FROM forms f
WHERE f.slug = 'audit-marketing-digital-2024';

-- Lead 3: Lead froid
INSERT INTO leads (form_id, respondent_info, static_answers, score, score_reason, status)
SELECT 
    f.id,
    '{"firstName": "Pierre", "lastName": "Durand", "email": "p.durand@email.com", "company": "Freelance"}'::jsonb,
    '{"q1": "Pierre Durand Consulting", "q2": "https://pierredurand.fr", "q3": "Services B2B", "q4": "Auto-entrepreneur", "q5": "Moins de 500€", "q6": ["Réseaux sociaux organiques"], "q7": "Plus de visibilité LinkedIn", "q8": "Ne sais pas par où commencer", "q9": "Non, je gère seul(e)", "q10": "PME", "q11": "Pierre", "q12": "Durand", "q13": "p.durand@email.com"}'::jsonb,
    25,
    'Budget très limité, freelance individuel',
    'new'
FROM forms f
WHERE f.slug = 'audit-marketing-digital-2024';

-- Lead 4: Lead très chaud - E-commerce
INSERT INTO leads (form_id, respondent_info, static_answers, dynamic_dialogue, score, score_reason, status, ai_analysis_draft)
SELECT 
    f.id,
    '{"firstName": "Sophie", "lastName": "Bernard", "email": "sophie@modefrance.com", "phone": "+33 6 55 44 33 22", "company": "Mode France"}'::jsonb,
    '{"q1": "Mode France", "q2": "https://www.modefrance.com", "q3": "E-commerce / Retail", "q4": "PME (11-50 employés)", "q5": "10 000€ - 20 000€", "q6": ["SEO", "SEA", "Social Ads", "Email marketing", "Marketing d''influence"], "q7": "Augmenter CA e-commerce de 40%, réduire taux abandon panier", "q8": "Convertir les visiteurs en clients", "q9": "Petite équipe (2-5 personnes)", "q10": "Femmes 25-45 ans CSP+ passionnées de mode", "q11": "Sophie", "q12": "Bernard", "q13": "sophie@modefrance.com", "q14": "+33 6 55 44 33 22"}'::jsonb,
    '[{"question": "Quel est votre taux de conversion actuel ?", "answer": "1.8%, on aimerait atteindre 3%"}, {"question": "Utilisez-vous du retargeting ?", "answer": "Oui sur Meta et Google, mais pas optimisé"}, {"question": "Quel est votre taux d''ouverture email ?", "answer": "22% environ"}]'::jsonb,
    98,
    'Budget très élevé (10-20k€), e-commerce mature, besoins clairs et urgents',
    'qualified',
    '# Audit Marketing Digital - Mode France

## Résumé Exécutif
Mode France est un prospect premium avec un budget conséquent et des besoins immédiats en optimisation de conversion.

## Diagnostic
- Taux de conversion actuel: 1.8% (vs 2.5-3% benchmark mode)
- Bon taux d''ouverture email (22%)
- Retargeting non optimisé

## Plan d''Action Prioritaire
1. **Optimisation UX/Conversion** - Quick wins sur le checkout
2. **Retargeting Dynamique** - Catalogue produits synchronisé
3. **Email Automation** - Abandon panier, cross-sell

## Budget Recommandé: 15 000€/mois
## ROI Projeté: 450% sur 6 mois'
FROM forms f
WHERE f.slug = 'audit-marketing-digital-2024';

🗺️ Intégration des 12 "Frameworks Consulting" dans Pretalk

L'idée de génie ici est que le consultant n'aura jamais à taper ces prompts. Pretalk exécutera ces prompts en arrière-plan via ses Webhooks n8n, en utilisant les données du consultant, pour lui livrer le résultat final.

🛠️ PHASE 0 : LE SETUP (L'Onboarding & Profil)

Ce qui se passe quand le consultant s'inscrit sur Pretalk.

1. The McKinsey Service Productization Architect

Section Pretalk : Création des Offres (Configuration)

Sous-section : Générateur de Packages ("Productize your service")

Fonctionnement : Lors de l'onboarding, Pretalk demande au consultant : "Que vendez-vous ?". L'IA (via ce prompt) transforme sa réponse floue en 3 offres packagées claires (Starter, Pro, Premium) avec un prix fixe, et configure automatiquement ces offres dans son dashboard Pretalk.

6. The Deloitte Personal Brand Consultant

Section Pretalk : Le Profil Public (pretalk.me/nom-consultant)

Sous-section : "Bio & Positioning Generator"

Fonctionnement : Au lieu de laisser le consultant écrire une bio ennuyeuse, Pretalk utilise ce prompt pour générer sa page publique. L'IA rédige son accroche ("Headline"), sa proposition de valeur unique et optimise sa page Pretalk pour qu'elle agisse comme une vraie Landing Page haute conversion.

🛑 PHASE 1 : AVANT L'APPEL (Acquisition & Qualification)

Ce qui se passe sur le site web du consultant ou ses réseaux sociaux.

2. The Bain Client Acquisition System

Section Pretalk : Le Formulaire / Widget Interactif

Sous-section : Générateur de Questions Qualifiantes (Lead Filter)

Fonctionnement : C'est le cœur actuel de Pretalk. L'IA crée les "5 questions qui filtrent les mauvais clients" et les intègre dans le widget. Elle génère aussi le fameux score de maturité (Lead Scoring) visible dans le CRM Pretalk.

4. The HubSpot Inbound Lead Machine

Section Pretalk : Outils Marketing de l'OS (Engineering as Marketing)

Sous-section : "Lead Magnet Ideas" (Le rapport PDF généré par Pretalk)

Fonctionnement : Pretalk devient le moteur Inbound du consultant. Plutôt que de dire "Abonnez-vous à ma newsletter", le consultant partage son lien Pretalk ("Passez le test de maturité"). L'IA génère le contenu du PDF final envoyé au prospect, agissant comme le Lead Magnet parfait.

🟢 PHASE 2 : PENDANT L'APPEL (La Vente pure)

Ce qui se passe juste avant et pendant le rendez-vous Google Meet.

8. The Harvard Business School Proposal & Closing System

Section Pretalk : Préparation au Rendez-vous (Le Cheat Sheet)

Sous-section : Brief d'Appel IA ("Discovery Call Prep")

Fonctionnement : 15 minutes avant le RDV Calendly, Pretalk envoie un email au consultant. Cet email utilise le prompt Harvard pour analyser les réponses du prospect au formulaire et dicte au consultant : "Voici le budget du client, voici son problème urgent, et voici les mots exacts à utiliser pour contrer son objection sur le prix."

🏁 PHASE 3 : APRÈS L'APPEL (Closing, Ops & Fidélisation)

Ce qui se passe une fois que le client a dit "Oui" (ou "Je réfléchis").

3. The Goldman Sachs Pricing Strategist

Section Pretalk : Éditeur de Propositions Commerciales (Devis)

Sous-section : Générateur de Devis "Value-Based"

Fonctionnement : Juste après l'appel, le consultant clique sur "Créer Proposition" dans Pretalk. L'IA génère un devis en 3 options (Anchor Pricing) qui justifie le prix par le ROI (Retour sur Investissement) estimé pour le client. Le devis part par email via Brevo.

12. The Ernst & Young Tax and Legal Shield

Section Pretalk : L'Espace Contractualisation

Sous-section : Générateur de Contrats & Clauses

Fonctionnement : Pretalk attache automatiquement un contrat généré par l'IA au devis. L'IA insère les bonnes clauses juridiques (Acomptes de 50%, pénalités de retard, protection de la propriété intellectuelle) en fonction du type de mission détecté.

5. The Accenture Workflow Automation Engineer

Section Pretalk : Le Portail Client (Onboarding Post-Vente)

Sous-section : Formulaire d'Intake Client ("Kickoff form")

Fonctionnement : Le devis est signé. Automatiquement, Pretalk envoie un nouveau formulaire (différent de celui d'acquisition) pour demander au client ses accès, ses logos, ses fichiers de marque. Pretalk centralise ces données pour le consultant.

9. The PwC Client Retention & Expansion Strategist

Section Pretalk : Fidélisation (Follow-up Automatisé)

Sous-section : Demande de Témoignages & Upsell

Fonctionnement : 30 jours après la fin de la mission (marquée "Terminée" dans Pretalk), l'outil envoie un email automatique au client pour demander un avis 5 étoiles. Si le client est très satisfait, l'IA lui suggère poliment une mission "Retainer" (Abonnement mensuel).

📊 PHASE 4 : LE TABLEAU DE BORD (L'OS Central)

La vue globale pour le consultant quand il se connecte à Pretalk.

10. The Notion Operations System Builder

Section Pretalk : Le CRM Minimaliste (Pipeline)

Sous-section : Vue Kanban des Leads

Fonctionnement : C'est le tableau de bord de Pretalk. Une vue simple : "Nouveaux Leads" ➔ "Appel Prévu" ➔ "Proposition Envoyée" ➔ "Gagné/Perdu". Tout est centralisé au même endroit.

7. The Stripe Revenue Operations Architect

Section Pretalk : Analytics & Finances

Sous-section : MRR Dashboard & Cashflow Planner

Fonctionnement : La page "Statistiques" que nous avons pensée plus tôt ! Pretalk affiche le chiffre d'affaires prévisionnel (basé sur les devis envoyés) et calcule l'argent gagné ce mois-ci, lissant l'effet "montagnes russes" des freelances.

11. The Y Combinator Scaling Strategist

Section Pretalk : Analytics Avancés (Le Temps c'est de l'Argent)

Sous-section : Traqueur de "Temps Sauvé" ("ROI Metrics")

Fonctionnement : Un widget sur le dashboard qui affiche : "Pretalk a répondu à 42 prospects ce mois-ci, recalé 15 touristes, et généré 5 devis. Vous avez économisé 38 heures. Il est temps de déléguer l'exécution et de vous concentrer sur la stratégie."

12. During meet
un moyen qui permet au consultant de prendre des notes et de les sauvegarder dans le crm pretalk, apartir de cette dernier un workflow le propose un devis, un contrat, des relances, des emails de suivi, etc. sur demande de consultant (une option a activer le workflow selon le nouveau scoring post reunion)
PreTalk Hub — Audit & Correction Plan
Context
First deep-dive session on the PreTalk Hub project. Goal: understand the complete state of the codebase, identify what works, what is broken, what should be removed, and what needs to be built — so every future correction produces a production-ready result.

PreTalk is an all-in-one AI workspace for consultants: smart lead-capture forms, Kanban pipeline, AI-generated audits/proposals/devis, calendar booking, public profiles, and an admin control panel. Stack: Astro 5 + React 19 SPA + Express backend + Supabase (Postgres + Auth + Realtime) + N8N webhooks + Brevo email + Gotenberg PDF.

Part 1 — Ce qui fonctionne ✅
These features are implemented, architecturally sound, and do not need structural changes:

Feature	Key Files
Auth (email, magic link, Google OAuth, ban detection)	src/components/ReactApp/context/AuthContext.tsx
App state & data fetching (leads, forms, services, etc.)	src/components/ReactApp/context/AppContext.tsx
Lead Kanban + detail view (with N8N fix applied)	src/components/ReactApp/pages/LeadReview.tsx, pages/Leads.tsx
Form builder (drag-drop, real-time preview, templates)	src/components/ReactApp/pages/FormBuilder.tsx
Public profiles & public forms	src/pages/[username].astro, ReactApp/pages/PublicProfile.tsx
N8N webhook registry (with devis guard fix)	src/components/ReactApp/lib/n8n.ts
Express backend + email/PDF/lead routes	src/server/
Brevo email service (templates, logging, batch)	src/server/services/brevoEmailService.ts
Gotenberg PDF generation + Supabase Storage	src/server/services/gotenbergService.ts
Calendar/booking system (Google Calendar OAuth)	ReactApp/types/booking.ts, components/CalendarBooking.tsx
Admin panel (users, templates, factory, marketing)	ReactApp/pages/admin/
Multi-language i18n (fr/en/es/ar)	ReactApp/i18n/
Supabase real-time subscriptions	AppContext.tsx, lib/supabase.ts
File upload to Supabase Storage	hooks/useFileUpload.ts
Protected routes with role-based access	components/ProtectedRoute.tsx
ProtectedRoute admin role check with hydration delay	ProtectedRoute.tsx:45-58
Part 2 — Ce qui nécessite une correction 🔧
CRITIQUE — À corriger en priorité
C1. Conflit de routes "/" dans FullApp.tsx
Fichier: src/components/ReactApp/FullApp.tsx
Problème: Deux <Route path="/"> coexistent. Le premier (ligne 66) rend <Home /> (la landing page marketing). Le second (ligne 82) est le layout ProtectedRoute avec Dashboard. React Router v6 sélectionne le premier — donc /app/ affiche la landing page au lieu du tableau de bord pour les utilisateurs connectés.
Correction: Supprimer la <Route path="/" element={<Home />} /> standalone (ligne 66-67) et créer un composant AppRoot dédié qui redirige: si authentifié → /dashboard, si non → /login.

C2. LegacyFormRedirect définie mais jamais utilisée
Fichier: src/components/ReactApp/FullApp.tsx:52-55
Problème: La fonction LegacyFormRedirect est définie mais aucune <Route> ne l'utilise.
Correction: Soit ajouter la route qui la manque (/app/form-builder/:id → redirect), soit supprimer la fonction.

C3. index.astro en anglais pour un produit French-first
Fichier: src/pages/index.astro
Problème: lang="en", titre et meta description en anglais, JSON-LD en anglais. Le produit est French-first. Le nouveau home-seo.astro est en français.
Correction: Soit basculer index.astro vers le français (et utiliser HomeSEO.tsx), soit faire de home-seo.astro la vraie page / et déprécier l'ancienne.

C4. URLs JSON-LD invalides dans les deux landing pages
Fichiers: src/pages/index.astro, src/pages/home-seo.astro
Problèmes:

/pricing référencé → page réelle est /tarifs
/features/ai-forms et /features/audits → pages inexistantes
/search?q=... dans la SearchAction → page inexistante
Correction: Corriger les URLs JSON-LD pour pointer vers les pages qui existent (/tarifs, /fonctionnalites, etc.) ou supprimer les entrées invalides.

C5. Mismatch des statuts de lead frontend vs backend
Problème: Frontend (AppContext.tsx, Leads.tsx) utilise des statuts: hot, cold, won, lost, archived, reviewing. Backend (leadStatusService.ts) définit: new, contacted, qualified, proposal_sent, negotiating, won, lost, archived.
Impact: Les transitions de statut via l'API backend peuvent rejeter des valeurs du frontend.
Correction: Unifier le référentiel de statuts. Recommandé: aligner le frontend sur les statuts backend (plus détaillés et professionnels).

C6. App.tsx mode production cassé
Fichier: src/components/ReactApp/App.tsx
Problème: Quand VITE_APP_MODE=production, l'app rend <Home /> pour toutes les routes — aucun accès à /login, /app, etc. Mode non fonctionnel.
Correction: Clarifier l'intent: supprimer la branche production (qui date du mode "coming soon") ou la corriger pour gérer correctement toutes les routes.

C7. GOOGLE_CLIENT_ID placeholder dans .env.local
Fichier: .env.local
Problème: GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com → Google OAuth cassé.
Correction: Renseigner les vraies credentials OAuth ou désactiver le bouton Google si non encore configuré.

C8. GOTENBERG_API_KEY vide
Fichier: .env.local
Problème: GOTENBERG_API_KEY= → Si Gotenberg requiert une clé, la génération PDF échoue silencieusement.
Correction: Vérifier si Gotenberg self-hosted (pas de clé requise) ou service managé (clé obligatoire).

C9. brevoEmailService_v2.ts en parallèle avec v1
Fichier: src/server/services/brevoEmailService_v2.ts
Problème: Deux versions du service email coexistent. Aucun import de v2 visible → version morte ou en développement.
Correction: Supprimer v2 si inutilisée, ou migrer vers v2 et supprimer v1.

MODÉRÉ — À corriger pour la cohérence
M1. WaitlistModal toujours actif si app est live
Fichier: src/components/ReactApp/pages/Home.tsx, src/components/ReactApp/components/WaitlistModal.tsx
Problème: La landing page propose encore la "waitlist". Si l'app est ouverte au public, ce bouton devrait rediriger vers /app/login (inscription directe).

M2. FeedbackProvider dupliqué
Fichier: src/components/ReactApp/App.tsx:4,11 + FullApp.tsx:61
Problème: FeedbackProvider est importé dans App.tsx (pour le mode production only) ET dans FullApp.tsx. En mode staging/dev, le provider n'est wrappé que dans FullApp — duplication potentielle si App.tsx est revu.

M3. Statistics.tsx — bouton Filter non fonctionnel
Fichier: src/components/ReactApp/pages/Statistics.tsx:41
Problème: Le bouton <Filter> dans ChartCard ne déclenche aucune action.
Correction: Implémenter la logique de filtrage ou retirer le bouton.

Part 3 — Ce qui doit être supprimé 🗑️
Élément	Fichier	Raison
src/pages/test.astro	src/pages/test.astro	Page de test accessible en production
Route /debug-auth	FullApp.tsx:130	Route de debug exposée en production
Route /onboarding-legacy	FullApp.tsx:72	Legacy flow, confusion utilisateur
N8N_SEND_OFFER_WEBHOOK_DEPRECATED	lib/n8n.ts:62-65	Marqué DEPRECATED, ne plus exporter
N8N_LEAD_ACTIONS_WEBHOOK_DEPRECATED	lib/n8n.ts:74-76	Idem
Import Onboarding (legacy)	FullApp.tsx:22	Importé mais route legacy à supprimer
brevoEmailService_v2.ts	src/server/services/	Version morte ou non connectée
Part 4 — Ce qui nécessite une création 🆕
Priorité haute
N1. Composant AppRoot / Auth Gate à /app/
Pourquoi: Corriger C1. L'utilisateur arrivant sur /app/ doit être redirigé intelligemment.
Spec: Si loading → spinner. Si user → /app/dashboard. Si non authentifié → /app/login.

N2. Unification du référentiel de statuts
Pourquoi: Corriger C5. Créer un fichier src/components/ReactApp/lib/leadStatuses.ts qui définit la source de vérité unique pour tous les statuts, partagée par frontend et backend.

Priorité moyenne
N3. Pages SEO manquantes (Features détaillées)
Pourquoi: JSON-LD reference /features/ai-forms, /features/audits qui n'existent pas → 404 pour Google.
Options: Créer ces pages Astro ou retirer les URLs du JSON-LD.

N4. Intégration paiement (Stripe)
Pourquoi: La table subscriptions existe avec plan_id, usage_limit, usage_current mais aucune logique de paiement n'est implémentée. Les utilisateurs ne peuvent pas s'abonner.
Spec: Webhook Stripe, page de checkout, mise à jour de subscriptions.

N5. Monitoring des erreurs (Sentry)
Pourquoi: SENTRY_DSN= vide → aucun monitoring des erreurs en production.
Correction: Configurer Sentry DSN dans .env.local et dans les variables de déploiement.

N6. Système de contenu blog
Pourquoi: blog.astro et blog/[slug].astro existent mais sans source de contenu. Actuellement des placeholders.
Options: Intégrer un CMS headless (Sanity, Contentful) ou des fichiers Markdown locaux avec Astro Content Collections.

Priorité basse
N7. Page de recherche
Pourquoi: JSON-LD SearchAction pointe vers /search?q=.... Page inexistante.
Options: Implémenter une vraie page de recherche ou supprimer la SearchAction du JSON-LD.

Part 5 — Points d'incohérence globaux
Incohérence	Description
Deux landing pages	src/pages/index.astro + ReactApp/pages/Home.tsx — maintenance dupliquée
Trois versions de landing	Landing/pages/Home.jsx (Astro), ReactApp/pages/Home.tsx (React inside app), ReactApp/pages/HomeSEO.tsx (nouveau FR)
Langue principale	index.astro en EN, home-seo.astro en FR, app en FR — incohérence SEO
/app/ = landing page	L'URL principale de l'app affiche la page marketing, pas le tableau de bord
Statuts leads	hot/cold/reviewing (frontend) vs new/contacted/qualified/... (backend)
Mode production App.tsx	Broken — ne permet pas l'accès à l'app en mode production
Plan d'exécution recommandé
Phase 1 — Nettoyage critique (priorité immédiate)
Corriger C1: Supprimer la route "/" standalone (Home) de FullApp.tsx, créer AppRoot redirect
Corriger C3+C4: Décider de la landing page principale (FR ou EN), corriger JSON-LD URLs
Supprimer test.astro, /debug-auth route, /onboarding-legacy route
Supprimer exports DEPRECATED de n8n.ts
Corriger C2: Supprimer LegacyFormRedirect inutilisé ou l'utiliser
Phase 2 — Cohérence données
Corriger C5: Unifier statuts leads (N2)
Corriger C6: Clarifier App.tsx production mode
Nettoyer brevoEmailService_v2.ts
Phase 3 — Améliorations et créations
WaitlistModal → Login redirect (M1)
Statistiques → Filter button (M3)
Sentry configuration (N5)
Payment/Stripe (N4)
Blog CMS (N6)
Fichiers critiques à connaître
Fichier	Rôle
src/components/ReactApp/FullApp.tsx	Router principal de la SPA — toutes les routes
src/components/ReactApp/context/AuthContext.tsx	Auth state, sessions, account monitoring
src/components/ReactApp/context/AppContext.tsx	État global app (1 880 lignes)
src/components/ReactApp/lib/n8n.ts	Registry webhooks N8N
src/components/ReactApp/lib/supabase.ts	Client Supabase + directApi helper
src/server/index.ts	Express server entry point
src/server/routes/emailRoutes.ts	API email
src/server/routes/pdfRoutes.ts	API PDF
src/server/routes/leadManagementRoutes.ts	API leads
src/server/services/brevoEmailService.ts	Service email Brevo
src/pages/index.astro	Landing page principale (route /)
src/pages/home-seo.astro	Nouvelle landing FR SEO (route /home-seo)
astro.config.mjs	Config Astro, redirects, adapter Node
.env.local	Variables d'environnement (Supabase, N8N, Brevo, etc.)
Vérification / Test post-corrections
 /app/ redirige vers /app/dashboard (authentifié) ou /app/login (non authentifié)
 Aucune route de debug accessible en production
 JSON-LD ne pointe plus vers des URLs inexistantes
 Statuts leads cohérents frontend/backend (test: changer statut via API et vérifier UI)
 Google OAuth fonctionnel (si credentials configurées)
 PDF generation fonctionnel (test: génère un devis)
 Emails Brevo envoyés (test: déclencher un new_lead)
 Admin panel accessible uniquement avec role=admin
 Onboarding flow: nouvel utilisateur redirigé vers onboarding, puis dashboard
# PreTalk Hub — Audit & Correction Plan

## Context

First deep-dive session on the PreTalk Hub project. Goal: understand the complete state of the codebase, identify what works, what is broken, what should be removed, and what needs to be built — so every future correction produces a production-ready result.

PreTalk is an **all-in-one AI workspace for consultants**: smart lead-capture forms, Kanban pipeline, AI-generated audits/proposals/devis, calendar booking, public profiles, and an admin control panel. Stack: Astro 5 + React 19 SPA + Express backend + Supabase (Postgres + Auth + Realtime) + N8N webhooks + Brevo email + Gotenberg PDF.

---

## Part 1 — Ce qui fonctionne ✅

These features are implemented, architecturally sound, and do not need structural changes:

| Feature | Key Files |
|---|---|
| Auth (email, magic link, Google OAuth, ban detection) | `src/components/ReactApp/context/AuthContext.tsx` |
| App state & data fetching (leads, forms, services, etc.) | `src/components/ReactApp/context/AppContext.tsx` |
| Lead Kanban + detail view (with N8N fix applied) | `src/components/ReactApp/pages/LeadReview.tsx`, `pages/Leads.tsx` |
| Form builder (drag-drop, real-time preview, templates) | `src/components/ReactApp/pages/FormBuilder.tsx` |
| Public profiles & public forms | `src/pages/[username].astro`, `ReactApp/pages/PublicProfile.tsx` |
| N8N webhook registry (with devis guard fix) | `src/components/ReactApp/lib/n8n.ts` |
| Express backend + email/PDF/lead routes | `src/server/` |
| Brevo email service (templates, logging, batch) | `src/server/services/brevoEmailService.ts` |
| Gotenberg PDF generation + Supabase Storage | `src/server/services/gotenbergService.ts` |
| Calendar/booking system (Google Calendar OAuth) | `ReactApp/types/booking.ts`, `components/CalendarBooking.tsx` |
| Admin panel (users, templates, factory, marketing) | `ReactApp/pages/admin/` |
| Multi-language i18n (fr/en/es/ar) | `ReactApp/i18n/` |
| Supabase real-time subscriptions | `AppContext.tsx`, `lib/supabase.ts` |
| File upload to Supabase Storage | `hooks/useFileUpload.ts` |
| Protected routes with role-based access | `components/ProtectedRoute.tsx` |
| ProtectedRoute admin role check with hydration delay | `ProtectedRoute.tsx:45-58` |

---

## Part 2 — Ce qui nécessite une correction 🔧

### CRITIQUE — À corriger en priorité

#### C1. Conflit de routes "/" dans FullApp.tsx
**Fichier:** `src/components/ReactApp/FullApp.tsx`  
**Problème:** Deux `<Route path="/">` coexistent. Le premier (ligne 66) rend `<Home />` (la landing page marketing). Le second (ligne 82) est le layout ProtectedRoute avec Dashboard. React Router v6 sélectionne le premier — donc `/app/` affiche la landing page au lieu du tableau de bord pour les utilisateurs connectés.  
**Correction:** Supprimer la `<Route path="/" element={<Home />} />` standalone (ligne 66-67) et créer un composant `AppRoot` dédié qui redirige: si authentifié → `/dashboard`, si non → `/login`.

#### C2. LegacyFormRedirect définie mais jamais utilisée
**Fichier:** `src/components/ReactApp/FullApp.tsx:52-55`  
**Problème:** La fonction `LegacyFormRedirect` est définie mais aucune `<Route>` ne l'utilise.  
**Correction:** Soit ajouter la route qui la manque (`/app/form-builder/:id` → redirect), soit supprimer la fonction.

#### C3. index.astro en anglais pour un produit French-first
**Fichier:** `src/pages/index.astro`  
**Problème:** `lang="en"`, titre et meta description en anglais, JSON-LD en anglais. Le produit est French-first. Le nouveau `home-seo.astro` est en français.  
**Correction:** Soit basculer `index.astro` vers le français (et utiliser `HomeSEO.tsx`), soit faire de `home-seo.astro` la vraie page `/` et déprécier l'ancienne.

#### C4. URLs JSON-LD invalides dans les deux landing pages
**Fichiers:** `src/pages/index.astro`, `src/pages/home-seo.astro`  
**Problèmes:**
- `/pricing` référencé → page réelle est `/tarifs`
- `/features/ai-forms` et `/features/audits` → pages inexistantes
- `/search?q=...` dans la SearchAction → page inexistante

**Correction:** Corriger les URLs JSON-LD pour pointer vers les pages qui existent (`/tarifs`, `/fonctionnalites`, etc.) ou supprimer les entrées invalides.

#### C5. Mismatch des statuts de lead frontend vs backend
**Problème:** Frontend (`AppContext.tsx`, `Leads.tsx`) utilise des statuts: `hot`, `cold`, `won`, `lost`, `archived`, `reviewing`. Backend (`leadStatusService.ts`) définit: `new`, `contacted`, `qualified`, `proposal_sent`, `negotiating`, `won`, `lost`, `archived`.  
**Impact:** Les transitions de statut via l'API backend peuvent rejeter des valeurs du frontend.  
**Correction:** Unifier le référentiel de statuts. Recommandé: aligner le frontend sur les statuts backend (plus détaillés et professionnels).

#### C6. App.tsx mode production cassé
**Fichier:** `src/components/ReactApp/App.tsx`  
**Problème:** Quand `VITE_APP_MODE=production`, l'app rend `<Home />` pour toutes les routes — aucun accès à `/login`, `/app`, etc. Mode non fonctionnel.  
**Correction:** Clarifier l'intent: supprimer la branche production (qui date du mode "coming soon") ou la corriger pour gérer correctement toutes les routes.

#### C7. GOOGLE_CLIENT_ID placeholder dans .env.local
**Fichier:** `.env.local`  
**Problème:** `GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com` → Google OAuth cassé.  
**Correction:** Renseigner les vraies credentials OAuth ou désactiver le bouton Google si non encore configuré.

#### C8. GOTENBERG_API_KEY vide
**Fichier:** `.env.local`  
**Problème:** `GOTENBERG_API_KEY=` → Si Gotenberg requiert une clé, la génération PDF échoue silencieusement.  
**Correction:** Vérifier si Gotenberg self-hosted (pas de clé requise) ou service managé (clé obligatoire).

#### C9. brevoEmailService_v2.ts en parallèle avec v1
**Fichier:** `src/server/services/brevoEmailService_v2.ts`  
**Problème:** Deux versions du service email coexistent. Aucun import de v2 visible → version morte ou en développement.  
**Correction:** Supprimer v2 si inutilisée, ou migrer vers v2 et supprimer v1.

---

### MODÉRÉ — À corriger pour la cohérence

#### M1. WaitlistModal toujours actif si app est live
**Fichier:** `src/components/ReactApp/pages/Home.tsx`, `src/components/ReactApp/components/WaitlistModal.tsx`  
**Problème:** La landing page propose encore la "waitlist". Si l'app est ouverte au public, ce bouton devrait rediriger vers `/app/login` (inscription directe).

#### M2. FeedbackProvider dupliqué
**Fichier:** `src/components/ReactApp/App.tsx:4,11` + `FullApp.tsx:61`  
**Problème:** `FeedbackProvider` est importé dans `App.tsx` (pour le mode production only) ET dans `FullApp.tsx`. En mode staging/dev, le provider n'est wrappé que dans FullApp — duplication potentielle si App.tsx est revu.

#### M3. Statistics.tsx — bouton Filter non fonctionnel
**Fichier:** `src/components/ReactApp/pages/Statistics.tsx:41`  
**Problème:** Le bouton `<Filter>` dans ChartCard ne déclenche aucune action.  
**Correction:** Implémenter la logique de filtrage ou retirer le bouton.

---

## Part 3 — Ce qui doit être supprimé 🗑️

| Élément | Fichier | Raison |
|---|---|---|
| `src/pages/test.astro` | `src/pages/test.astro` | Page de test accessible en production |
| Route `/debug-auth` | `FullApp.tsx:130` | Route de debug exposée en production |
| Route `/onboarding-legacy` | `FullApp.tsx:72` | Legacy flow, confusion utilisateur |
| `N8N_SEND_OFFER_WEBHOOK_DEPRECATED` | `lib/n8n.ts:62-65` | Marqué DEPRECATED, ne plus exporter |
| `N8N_LEAD_ACTIONS_WEBHOOK_DEPRECATED` | `lib/n8n.ts:74-76` | Idem |
| Import `Onboarding` (legacy) | `FullApp.tsx:22` | Importé mais route legacy à supprimer |
| `brevoEmailService_v2.ts` | `src/server/services/` | Version morte ou non connectée |

---

## Part 4 — Ce qui nécessite une création 🆕

### Priorité haute

#### N1. Composant AppRoot / Auth Gate à /app/
**Pourquoi:** Corriger C1. L'utilisateur arrivant sur `/app/` doit être redirigé intelligemment.  
**Spec:** Si `loading` → spinner. Si `user` → `/app/dashboard`. Si non authentifié → `/app/login`.

#### N2. Unification du référentiel de statuts
**Pourquoi:** Corriger C5. Créer un fichier `src/components/ReactApp/lib/leadStatuses.ts` qui définit la source de vérité unique pour tous les statuts, partagée par frontend et backend.

### Priorité moyenne

#### N3. Pages SEO manquantes (Features détaillées)
**Pourquoi:** JSON-LD reference `/features/ai-forms`, `/features/audits` qui n'existent pas → 404 pour Google.  
**Options:** Créer ces pages Astro ou retirer les URLs du JSON-LD.

#### N4. Intégration paiement (Stripe)
**Pourquoi:** La table `subscriptions` existe avec `plan_id`, `usage_limit`, `usage_current` mais aucune logique de paiement n'est implémentée. Les utilisateurs ne peuvent pas s'abonner.  
**Spec:** Webhook Stripe, page de checkout, mise à jour de `subscriptions`.

#### N5. Monitoring des erreurs (Sentry)
**Pourquoi:** `SENTRY_DSN=` vide → aucun monitoring des erreurs en production.  
**Correction:** Configurer Sentry DSN dans `.env.local` et dans les variables de déploiement.

#### N6. Système de contenu blog
**Pourquoi:** `blog.astro` et `blog/[slug].astro` existent mais sans source de contenu. Actuellement des placeholders.  
**Options:** Intégrer un CMS headless (Sanity, Contentful) ou des fichiers Markdown locaux avec Astro Content Collections.

### Priorité basse

#### N7. Page de recherche
**Pourquoi:** JSON-LD `SearchAction` pointe vers `/search?q=...`. Page inexistante.  
**Options:** Implémenter une vraie page de recherche ou supprimer la SearchAction du JSON-LD.

---

## Part 5 — Points d'incohérence globaux

| Incohérence | Description |
|---|---|
| Deux landing pages | `src/pages/index.astro` + `ReactApp/pages/Home.tsx` — maintenance dupliquée |
| Trois versions de landing | `Landing/pages/Home.jsx` (Astro), `ReactApp/pages/Home.tsx` (React inside app), `ReactApp/pages/HomeSEO.tsx` (nouveau FR) |
| Langue principale | `index.astro` en EN, `home-seo.astro` en FR, app en FR — incohérence SEO |
| `/app/` = landing page | L'URL principale de l'app affiche la page marketing, pas le tableau de bord |
| Statuts leads | `hot/cold/reviewing` (frontend) vs `new/contacted/qualified/...` (backend) |
| Mode production `App.tsx` | Broken — ne permet pas l'accès à l'app en mode production |

---

## Plan d'exécution recommandé

### Phase 1 — Nettoyage critique (priorité immédiate)
1. Corriger C1: Supprimer la route "/" standalone (Home) de FullApp.tsx, créer AppRoot redirect
2. Corriger C3+C4: Décider de la landing page principale (FR ou EN), corriger JSON-LD URLs
3. Supprimer `test.astro`, `/debug-auth` route, `/onboarding-legacy` route
4. Supprimer exports DEPRECATED de n8n.ts
5. Corriger C2: Supprimer LegacyFormRedirect inutilisé ou l'utiliser

### Phase 2 — Cohérence données
6. Corriger C5: Unifier statuts leads (N2)
7. Corriger C6: Clarifier App.tsx production mode
8. Nettoyer brevoEmailService_v2.ts

### Phase 3 — Améliorations et créations
9. WaitlistModal → Login redirect (M1)
10. Statistiques → Filter button (M3)
11. Sentry configuration (N5)
12. Payment/Stripe (N4)
13. Blog CMS (N6)

---

## Fichiers critiques à connaître

| Fichier | Rôle |
|---|---|
| `src/components/ReactApp/FullApp.tsx` | Router principal de la SPA — toutes les routes |
| `src/components/ReactApp/context/AuthContext.tsx` | Auth state, sessions, account monitoring |
| `src/components/ReactApp/context/AppContext.tsx` | État global app (1 880 lignes) |
| `src/components/ReactApp/lib/n8n.ts` | Registry webhooks N8N |
| `src/components/ReactApp/lib/supabase.ts` | Client Supabase + directApi helper |
| `src/server/index.ts` | Express server entry point |
| `src/server/routes/emailRoutes.ts` | API email |
| `src/server/routes/pdfRoutes.ts` | API PDF |
| `src/server/routes/leadManagementRoutes.ts` | API leads |
| `src/server/services/brevoEmailService.ts` | Service email Brevo |
| `src/pages/index.astro` | Landing page principale (route `/`) |
| `src/pages/home-seo.astro` | Nouvelle landing FR SEO (route `/home-seo`) |
| `astro.config.mjs` | Config Astro, redirects, adapter Node |
| `.env.local` | Variables d'environnement (Supabase, N8N, Brevo, etc.) |

---

## Vérification / Test post-corrections

- [ ] `/app/` redirige vers `/app/dashboard` (authentifié) ou `/app/login` (non authentifié)
- [ ] Aucune route de debug accessible en production
- [ ] JSON-LD ne pointe plus vers des URLs inexistantes
- [ ] Statuts leads cohérents frontend/backend (test: changer statut via API et vérifier UI)
- [ ] Google OAuth fonctionnel (si credentials configurées)
- [ ] PDF generation fonctionnel (test: génère un devis)
- [ ] Emails Brevo envoyés (test: déclencher un `new_lead`)
- [ ] Admin panel accessible uniquement avec role=admin
- [ ] Onboarding flow: nouvel utilisateur redirigé vers onboarding, puis dashboard

---

---

# PLAN 2 — Lead Management : 100% Fonctionnel + Templates PDF

## Contexte

Analyse complète du pipeline lead (6 phases), du `LeadReview.tsx` (3 730 lignes), du système de génération PDF (Gotenberg + templateCompiler), et des 9 templates HTML existants. L'objectif : rendre cette section production-ready — UI/UX mobile, flux sans bugs, et bibliothèque de 5 familles de templates (audit + devis + contrat).

---

## État actuel des templates (inventaire)

**9 fichiers dans `n8n/new/templates/families/`** — 3 familles × 3 types :

| Famille | Audit | Devis | Contrat |
|---------|-------|-------|---------|
| `executive_impact` | ✅ | ✅ | ✅ |
| `data_driven` | ✅ (`data_driven_evidence`) | ✅ (`data_scope`) | ✅ (`data_performance`) |
| `storytelling` | ✅ (`storytelling_transformation`) | ✅ (`storytelling_offer`) | ✅ (`storytelling_agreement`) |
| `minimal_clarity` | ❌ manquant | ❌ manquant | ❌ manquant |
| `bold_impact` | ❌ manquant | ❌ manquant | ❌ manquant |

**Besoin : 6 nouveaux fichiers HTML** pour atteindre 5 familles complètes.

---

## Variables de template (standard universel)

Toutes les templates utilisent ce schéma via `{{variable}}` (templateCompiler.ts) :

**Branding dual :**
- `{{primaryColor}}` — couleur primaire consultant (profil)
- `{{accentColor}}` — couleur accent consultant (profil)
- `{{logoTag}}` — `<img>` du logo consultant
- `{{pretalkLogo}}` — logo PreTalk (pied de page)

**Consultant :**
- `{{consultantName}}`, `{{consultantTitle}}`, `{{consultantEmail}}`
- `{{consultantAvatar}}` — `<img>` avatar
- `{{consultantProfileLink}}` — lien profil public
- `{{companyName}}`

**Client :**
- `{{clientName}}`, `{{clientCompany}}`, `{{clientEmail}}`

**Document :**
- `{{date}}`, `{{validUntil}}`, `{{quoteNumber}}` / `{{contractNumber}}`

**Contenu audit :**
- `{{coverTitle}}`, `{{coverSubtitle}}`
- `{{auditBlocksHtml}}` — blocs audit compilés en HTML
- `{{chartImageUrl}}` — radar chart (image URL)
- `{{closingCta}}`, `{{coverImageUrl}}`, `{{closingImageUrl}}`

**Contenu devis :**
- `{{quoteSubject}}`, `{{lineItemsHtml}}`
- `{{subtotal}}`, `{{taxAmount}}`, `{{totalAmount}}`
- `{{impactSummary}}`, `{{paymentTerms}}`

**Contenu contrat :**
- `{{serviceScope}}`, `{{deliverablesHtml}}`
- `{{pricingTerms}}`, `{{contractStartDate}}`, `{{contractEndDate}}`
- `{{terminationClause}}`, `{{paymentSchedule}}`

---

## Section A — Corrections code LeadReview & pipeline

### A1. Timeout manquant sur fetch() directs dans LeadReview.tsx

**Fichier :** `src/components/ReactApp/pages/LeadReview.tsx`

**Problème :** Les appels `fetch(N8N_*_WEBHOOK)` directs (lignes ~902, ~963, ~1009, ~1093, ~1630, ~1675) n'ont pas de timeout. L'UI peut rester bloquée indéfiniment si N8N ne répond pas.

**Pattern à appliquer** (déjà utilisé dans `usePhaseButton.ts`) :
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30_000);
try {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  // ... handle response
} catch (err) {
  if (err.name === 'AbortError') throw new Error('Timeout: N8N did not respond in 30s');
  throw err;
}
```

**Appliquer sur :** toutes les fonctions `handleGenerate*` et `handleSend*` qui font `fetch()` direct (pas via `useN8nWebhook`).

---

### A2. Null check email avant envoi

**Fichier :** `src/components/ReactApp/pages/LeadReview.tsx` (~lignes 1321, 1375, 1741)

**Problème :** `recipient_email: (lead as any).respondent_info?.email` peut être `undefined`. L'email part silencieusement sans destinataire.

**Correction :** Avant chaque appel `sendAppTemplateEmail`, vérifier :
```typescript
const recipientEmail = lead?.respondent_info?.email;
if (!recipientEmail) {
  showNotification('Email client manquant — vérifiez les infos du lead', 'error');
  return;
}
```

---

### A3. URL devis PDF — normaliser le champ de retour

**Fichier :** `src/components/ReactApp/pages/LeadReview.tsx` (~lignes 1107-1116)

**Problème :** Cascade de fallbacks `data?.devis_url || data?.pdf_url || ...` — le champ réel retourné par N8N est incertain.

**Correction :** Décider d'un champ unique (`pdf_url`) et uniformiser. Côté N8N, s'assurer que la réponse retourne toujours `{ pdf_url: "https://..." }`. Dans le code React, utiliser uniquement :
```typescript
const devisUrl = data?.pdf_url;
if (!devisUrl) throw new Error('N8N did not return pdf_url');
```

---

### A4. Tags AI dynamiques dans LeadDetailsDrawer

**Fichier :** `src/components/ReactApp/components/LeadDetailsDrawer.tsx` (~ligne 244-246)

**Problème :** Tags "Budget Validé", "Décisionnaire", "Urgent" sont hardcodés. Ils doivent venir du champ `lead.ai_analysis_json`.

**Structure attendue dans `ai_analysis_json` :**
```json
{ "tags": ["Budget Validé", "Décisionnaire"], "score_reason": "...", "resume_executif": "..." }
```

**Correction :** Remplacer les tags hardcodés par :
```tsx
const tags = lead?.ai_analysis_json?.tags || [];
{tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
```

---

### A5. Conversation dynamique (dynamic_dialogue)

**Fichier :** `src/components/ReactApp/components/LeadDetailsDrawer.tsx` (~lignes 308-314)

**Problème :** La section "Conversation" est mockée avec des exemples statiques.

**Correction :** Connecter au champ `lead.dynamic_dialogue` (array de `{role: 'user'|'assistant', content: string}`). Si vide → afficher "Aucun échange enregistré".

---

### A6. Insight text dynamique (ai_analysis_json)

**Fichier :** `src/components/ReactApp/components/LeadDetailsDrawer.tsx`

**Correction :** Utiliser `lead.ai_analysis_json?.resume_executif || lead.score_reason || ''` pour le texte de l'analyse IA affiché dans la section "Analyse IA".

---

## Section B — Corrections UX / Mobile

### B1. Pipeline stepper mobile

**Fichier :** `src/components/ReactApp/components/LeadPipelineStepper.tsx`

**Problème :** Sur mobile, les 6 phases en ligne horizontale nécessitent un scroll. Les labels sont déjà adaptés (shortLabel), mais la zone de scroll n'est pas toujours visible.

**Correction :** Ajouter `scrollbar-hide` + indicateur de scroll droit, ou passer à un stepper vertical sur mobile (`flex-col sm:flex-row`).

---

### B2. Touch targets — boutons d'action de phase

**Fichier :** `src/components/ReactApp/components/PhaseActionButton.tsx`

**Problème :** Les boutons ont `min-width: 140px` mais pas de `min-height` explicite → cibles de touch petites sur mobile.

**Correction :** Ajouter `min-h-[44px]` (standard Apple HIG pour touch targets).

---

### B3. Audit blocks editor mobile

**Fichier :** `src/components/ReactApp/components/JsonAuditEditor.tsx`

**Correction :** Vérifier que les blocs audit ont `overflow-x: hidden` et que le texte wraps correctement. Les inputs de longue durée doivent être `w-full`.

---

## Section C — 6 nouveaux templates PDF à créer

### Famille 4 : `minimal_clarity`

**Philosophie :** Ultra-épuré. Fond blanc, typographie noire. Une seule colonne. Zéro décoration superflue. PreTalk branding en filigrane discret. Idéal pour les clients corporate qui valorisent la clarté.

**Variables de couleur :** `--pc: #1782C5` (bleu PreTalk), `--ac: #0D3B66` (marine PreTalk)  
**Police :** Georgia/serif pour les titres, Arial/sans pour le corps  
**Design :** Header ligne fine bleu + logo. Titres de section en bleu marine. Pas de background coloré. Signature en bas sobre.

**Fichiers à créer :**
1. `n8n/new/templates/families/audit_minimal_clarity.html`
2. `n8n/new/templates/families/devis_minimal_clarity.html`
3. `n8n/new/templates/families/contrat_minimal_clarity.html`

---

### Famille 5 : `bold_impact`

**Philosophie :** Fort contraste noir/blanc. Header 100% noir avec texte blanc. Typographie grande et assertive. Couleur d'accentuation = couleur primaire du consultant. Pour les consultants qui veulent un rendu premium et mémorable.

**Variables de couleur :** `--pc: {{primaryColor}}` (couleur consultant), `--ac: #0A0A0A` (noir)  
**Police :** Arial Black/sans-serif bold pour les titres  
**Design :** Bandeau header noir pleine largeur. Numéros de section en grand format. Tableau lignes alternes #f8f8f8. Footer noir avec mention PreTalk.

**Fichiers à créer :**
4. `n8n/new/templates/families/audit_bold_impact.html`
5. `n8n/new/templates/families/devis_bold_impact.html`
6. `n8n/new/templates/families/contrat_bold_impact.html`

---

### Branding dual sur tous les templates

Chaque template doit inclure :
- **Header :** logo consultant (`{{logoTag}}`) + nom entreprise
- **Footer :** mention "Propulsé par PreTalk" + `{{pretalkLogo}}` (petit, discret)
- **Couleurs :** dérivées du profil consultant (`primaryColor`, `accentColor`)
- **Fallback couleurs :** Si pas de couleurs consultant → utiliser les couleurs PreTalk (`#0D3B66`, `#1782C5`)

---

## Section D — Import des templates en base

**Script existant :** `scripts/import_pdf_family_templates.mjs`  
**Commande :** `npm run import:pdf-families`

Ce script lit les fichiers `.html` du dossier `n8n/new/templates/families/` et les insère dans la table `pdf_templates` de Supabase.

**Après la création des 6 nouveaux fichiers HTML :**
1. Relancer `npm run import:pdf-families`
2. Vérifier dans Supabase : `SELECT name, template_type, family_key FROM pdf_templates;`
3. Tester via `GET /api/pdf/templates` → 15 templates attendus (5 familles × 3 types)

---

## Section E — Vérification de la sélection de template dans le UI

**Fichier :** `src/components/ReactApp/components/LeadSettingsDrawer.tsx`

Ce drawer contient la sélection du template PDF pour chaque lead. Vérifier que :
- Le dropdown liste les 5 familles
- Le `family_key` sélectionné est bien transmis dans le payload N8N (`generate_audit`, `generate_devis`)
- Le payload inclut `template_family: selectedFamily`

---

## Ordre d'exécution recommandé

### Étape 1 — Corrections code (LeadReview.tsx + Drawers)
1. **A1** — Ajouter AbortController + timeout sur tous les fetch() directs
2. **A2** — Null check email avant sendAppTemplateEmail()
3. **A3** — Normaliser retour URL devis à `pdf_url` uniquement
4. **A4** — Tags AI dynamiques depuis `ai_analysis_json.tags`
5. **A5** — Conversation depuis `dynamic_dialogue`
6. **A6** — Insight text depuis `ai_analysis_json.resume_executif`

### Étape 2 — UX Mobile
7. **B1** — Pipeline stepper mobile (indicateur scroll ou layout vertical)
8. **B2** — min-height 44px sur PhaseActionButton
9. **B3** — Audit editor mobile overflow

### Étape 3 — Créer les 6 nouveaux templates HTML
10. Créer `audit_minimal_clarity.html`
11. Créer `devis_minimal_clarity.html`
12. Créer `contrat_minimal_clarity.html`
13. Créer `audit_bold_impact.html`
14. Créer `devis_bold_impact.html`
15. Créer `contrat_bold_impact.html`

### Étape 4 — Importer en base
16. `npm run import:pdf-families`
17. Vérifier 15 templates dans Supabase
18. Tester génération PDF avec chaque nouvelle famille

---

## Checklist de validation finale

- [ ] Toutes les actions de phase ont un timeout de 30s avec message d'erreur clair
- [ ] Email non envoyé si `respondent_info.email` est null (avec alerte UI)
- [ ] Retour URL devis = `pdf_url` uniquement, sans cascade de fallbacks
- [ ] Tags IA viennent de `ai_analysis_json.tags` (non hardcodés)
- [ ] Conversation affiche `dynamic_dialogue` ou message "aucun échange"
- [ ] Pipeline stepper scrollable sur mobile 375px
- [ ] Boutons d'action : cible touch ≥ 44px de hauteur
- [ ] 15 templates en base (SELECT count(*) FROM pdf_templates WHERE is_active = true)
- [ ] Génération audit → PDF → envoi email : flux complet sans erreur console
- [ ] Génération devis → PDF → envoi offre : flux complet
- [ ] Génération contrat → signature → deal won : flux complet
- [ ] Template minimal_clarity rendu correct en PDF (police serif, pas de couleur fond)
- [ ] Template bold_impact rendu correct en PDF (header noir, couleur consultant en accent)

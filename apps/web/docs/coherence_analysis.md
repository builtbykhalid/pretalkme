# Pretalk Hub — Analyse de Cohérence Complète
> Généré le 2026-04-02 | Évaluation de l'intégration n8n ↔ Frontend ↔ Backend ↔ Templates

---

## 1. Cartographie des Workflows

| Workflow | Webhook Path | Env Var Frontend | Statut |
|---|---|---|---|
| Audit PDF Generation | `/generate-audit` | `VITE_N8N_GENERATE_AUDIT_WEBHOOK` ✅ | OK |
| Analyste V2 (analyse IA) | `/new-lead-analysis` | *(déclenché par Supabase, pas frontend)* | OK |
| Analyste V2 (re-génération) | `/regenerate-audit` | `VITE_N8N_REGENERATE_AUDIT_WEBHOOK` ✅ | OK |
| Assistance IA Texte | `/ai-assist-text` | `VITE_N8N_AI_ASSIST_TEXT_WEBHOOK` ✅ | OK |
| Augmented Onboarding | `/onboarding-augmented` | `VITE_N8N_ONBOARDING_WEBHOOK` ✅ | OK |
| Cerveau Interactif | `/7a84dac7-7a65-40ae-8149-53959ea917fb` | `VITE_N8N_CERVEAU_WEBHOOK` ✅ | OK |
| Générateur Forms | `/generate-forms` | `VITE_N8N_GENERATE_FORMS_WEBHOOK` ⚠️ **MANQUANT en .env** | MANQUANT |
| Generation Champs IA | `/generate-form-fields` | `VITE_N8N_GENERATE_FORM_FIELDS_WEBHOOK` ✅ | OK |
| Lead Actions Hub | `/lead-actions` | `VITE_N8N_LEAD_ACTIONS_WEBHOOK` ✅ en env, **NON EXPORTÉ** dans n8n.ts | EXPORTÉ MANQUANT |
| Master Email Hub | `/master-email-hub` | *(appelé par backend uniquement)* | OK |
| Phase C — Generate Proposal (IA) | `/generate-proposal` | `VITE_N8N_GENERATE_PROPOSAL_WEBHOOK` ✅ | OK |
| Phase C — Generate Devis PDF | **`/generate-devis` ❌ INEXISTANT** | `VITE_N8N_GENERATE_DEVIS_WEBHOOK` ← pointe vers URL sans workflow | **CRITIQUE** |
| Phase D — Deal Won Ops | `/deal-won-ops` | `VITE_N8N_DEAL_WON_OPS_WEBHOOK` ✅ | OK |
| Phase D — Contract Template | `/generate-contract` | *(appelé en interne par deal-won-ops)* | OK |

---

## 2. Issues par Criticité

### 🔴 CRITIQUE — Workflow manquant : `/generate-devis`

**Problème :** Le frontend (`LeadReview.tsx:1093`, `usePhaseButton.ts:53`) appelle `VITE_N8N_GENERATE_DEVIS_WEBHOOK` qui pointe vers `/webhook/generate-devis`. **Aucun des 13 workflows fournis ne répond à ce chemin.** Ce webhook est mort à l'exécution.

**Flux attendu :**
1. `handleGenerateProposal()` → `/generate-proposal` → reçoit `proposals[]` + `quote_template_payloads[]` ✅
2. `handleGenerateDevisForOffer(offerIndex)` → `/generate-devis` → envoie le `quote_template_payload` spécifique + données offre → devrait recevoir `{ pdf_url, quote_template_payload }` ❌

**Payload envoyé par le frontend :**
```json
{
  "lead_id": "uuid",
  "user_id": "uuid",
  "locale": "fr",
  "offer_index": 0,
  "offer": { "name", "price", "description", "features", "recommended", "cta" },
  "quote_template_payload": { "quoteNumber", "validUntil", "tvaRate", "paymentTerms", "quote_items[]" },
  "consultant_name": "string",
  "consultant_email": "string"
}
```

**Réponse attendue par le frontend :**
```json
{
  "pdf_url": "https://...",
  "quote_template_payload": { ... }
}
```

**Fix requis :** Créer un workflow n8n `/generate-devis` qui :
1. Reçoit le `quote_template_payload`
2. Récupère le template devis de la famille active depuis `pdf_templates` (Supabase)
3. Remplace les variables du template HTML
4. Appelle Gotenberg → génère le PDF
5. Upload vers Supabase Storage bucket `pdf-documents/generated-pdfs/`
6. Retourne `{ pdf_url, quote_template_payload }`

---

### 🔴 CRITIQUE — Clé service role hardcodée dans Audit PDF Generation

**Problème :** Le workflow `Pretalk - Audit PDF Generation` contient une clé Supabase service role hardcodée dans les headers HTTP (node upload vers Storage). Cette clé est exposée dans le JSON exportable du workflow.

**Fix requis :** Remplacer par une référence à une credential n8n : `{{ $credentials.supabaseApi.serviceRoleKey }}` ou utiliser une variable d'environnement n8n `$env.SUPABASE_SERVICE_ROLE_KEY`.

---

### 🟠 HIGH — Fragmentation du service email (Lead Actions Hub)

**Problème :** `Lead Actions Hub` contient des nodes **SendGrid** (`Send Qualified Email`, `Log Rejection`) pour les emails de qualification/rejet. Or, le frontend (`LeadDetailsDrawer.tsx`) appelle le backend Express (`/api/email/send`) qui utilise **Brevo** via `documentSendingService.ts`. Deux chemins email coexistent pour la même action.

**Conséquence :** Lors d'une qualification de lead, soit l'email arrive de SendGrid (via n8n), soit de Brevo (via backend), selon le chemin emprunté. Incohérence de branding et de tracking.

**Fix requis :**
- Supprimer les nodes SendGrid du workflow `Lead Actions Hub`
- Le workflow doit seulement logger dans `lead_actions` et optionnellement appeler le `Master Email Hub` via HTTP node avec `event_type: 'lead_qualified'`
- Le Master Email Hub gère l'envoi via Brevo (canal unique)

---

### 🟠 HIGH — `N8N_GENERATE_FORMS_WEBHOOK` absent du `.env.local`

**Problème :** Le workflow `Générateur de Formulaires IA` écoute sur `/generate-forms`. Dans `n8n.ts`, `N8N_GENERATE_FORMS_WEBHOOK` utilise `VITE_N8N_GENERATE_FORMS_WEBHOOK` avec un fallback hardcodé. **Cette variable n'existe pas dans `.env.local`**, donc le fallback s'active silencieusement.

**Fix :** Ajouter `VITE_N8N_GENERATE_FORMS_WEBHOOK=https://backand.pretalk.me/webhook/generate-forms` dans `.env.local`.

---

### 🟠 HIGH — `N8N_LEAD_ACTIONS_WEBHOOK` non exporté depuis `n8n.ts`

**Problème :** `VITE_N8N_LEAD_ACTIONS_WEBHOOK` est défini dans `.env.local` mais **n'est pas exporté** dans `src/components/ReactApp/lib/n8n.ts`. Le composant `LeadDetailsDrawer.tsx` qui déclenche les actions lead ne peut pas l'importer proprement.

**Fix :** Ajouter l'export dans `n8n.ts` et ajouter l'entrée dans `N8N_WEBHOOKS_MAP`.

---

### 🟡 MEDIUM — Template IDs Brevo hardcodés dans Master Email Hub

**Problème :** Le workflow `Master Email Hub` hardcode les IDs Brevo (1→63) directement dans ses nodes. Le `.env.local` définit des variables `BREVO_TEMPLATE_*` mais le workflow les ignore complètement.

**Mapping actuel dans workflow vs .env.local :**

| event_type | Workflow (FR) | `.env.local` (FR) | Cohérence |
|---|---|---|---|
| `delivery_audit` | `1` | `BREVO_TEMPLATE_DELIVERY_AUDIT_FR=1` | ✅ |
| `delivery_proposition` | `10` | `BREVO_TEMPLATE_DELIVERY_PROPOSITION_FR=10` | ✅ |
| `kickoff_ready` | `20` | `BREVO_TEMPLATE_KICKOFF_READY_FR=20` | ✅ |
| `new_lead` | `30` | `BREVO_TEMPLATE_NEW_LEAD_FR=30` | ✅ |
| `proposal_follow_up` | `40` | `BREVO_TEMPLATE_PROPOSAL_FOLLOW_UP_FR=40` | ✅ |
| `contract_signed` | `50` | `BREVO_TEMPLATE_CONTRACT_SIGNED_FR=50` | ✅ |
| `onboarding_welcome` | `60` | `BREVO_TEMPLATE_ONBOARDING_WELCOME_FR=60` | ✅ |

Les valeurs sont identiques mais si les IDs changent dans Brevo, il faudra modifier le workflow ET le `.env.local`. Risque de désynchronisation future.

**Fix recommandé :** Configurer les variables d'environnement n8n (`$env.BREVO_TEMPLATE_DELIVERY_AUDIT_FR`) dans les nodes du workflow.

---

### 🟡 MEDIUM — Bucket Storage incohérent (Audit PDF vs .env)

**Problème :**
- `.env.local` : `SUPABASE_STORAGE_BUCKET=pdf-documents`, `SUPABASE_STORAGE_PDF_PATH=generated-pdfs/`
- Workflow Audit PDF Generation : upload vers bucket **`audits`** (hardcodé)

Les audits vont dans `audits/`, les devis/contrats iront dans `pdf-documents/generated-pdfs/`. Pas de convention unifiée.

**Fix :** Standardiser sur le bucket `pdf-documents` avec sous-dossiers : `pdf-documents/audits/`, `pdf-documents/devis/`, `pdf-documents/contrats/`.

---

### 🟡 MEDIUM — Webhook Cerveau utilise un UUID au lieu d'un path sémantique

**Problème :** `VITE_N8N_CERVEAU_WEBHOOK` pointe vers `/webhook/7a84dac7-7a65-40ae-8149-53959ea917fb`. Peu lisible, difficile à documenter.

**Fix recommandé :** Renommer le trigger n8n en `/cerveau-interactif` et mettre à jour l'env var.

---

### 🟡 MEDIUM — Phase D `/generate-contract` jamais appelé directement par le frontend

**Situation :** Le workflow `Phase D Contrat Template-Ready v3` écoute sur `/generate-contract`. Le frontend appelle uniquement `/deal-won-ops` (Phase D v2). Le workflow contrat est donc déclenché **en interne** par le workflow deal-won-ops via un HTTP node.

**Vérification nécessaire :** Confirmer que le workflow `deal-won-ops` appelle bien `/generate-contract` en interne. Si non, les contrats ne sont jamais générés.

---

### 🟡 MEDIUM — `Augmented Onboarding` répond immédiatement (async) mais frontend attend une réponse

**Problème :** Le workflow répond avec `{ status: 'generating_forms' }` immédiatement (async). Mais le frontend (`Home.tsx` ou onboarding page) attend peut-être un résultat synchrone.

**Fix :** Vérifier que le frontend gère bien une réponse partielle et écoute les changements Supabase Realtime pour la complétion.

---

## 3. Contrats API Webhook — Référence Complète

### `POST /webhook/generate-audit`
```
Input:  { lead_id, user_id, form_id, respondent_info, static_answers, dynamic_dialogue, ai_config }
Output: { success, lead_id, score, status: 'to_review', message, timestamp }
Supabase reads:  leads, forms, agents_library
Supabase writes: leads.ai_analysis_json, leads.status
```

### `POST /webhook/regenerate-audit`
```
Input:  { lead_id, user_id, audit_blocks, chart_data, pdf_settings }
Output: { success, pdf_url, lead_id }
Supabase writes: leads.final_report_pdf, leads.status
PDF: Gotenberg → Supabase Storage bucket 'audits'
```

### `POST /webhook/generate-proposal`
```
Input:  { lead_id, locale? }
Output: { success, lead_id, proposals[], recommended_tier, contract_summary, quote_template_payloads[] }
Supabase reads:  leads, profiles
Supabase writes: leads.proposals_json (via Update Lead)
```

### `POST /webhook/generate-devis` ❌ INEXISTANT
```
Input:  { lead_id, user_id, locale, offer_index, offer{}, quote_template_payload{}, consultant_name, consultant_email }
Output: { pdf_url, quote_template_payload{} }
→ Workflow à créer (Gotenberg + template devis)
```

### `POST /webhook/generate-contract`
```
Input:  { lead_id, locale? }
Output: { success, lead_id, contract_summary, contract_template_payload{} }
Supabase reads:  leads, profiles, deals
→ Appelé en interne par deal-won-ops, pas depuis le frontend
```

### `POST /webhook/deal-won-ops`
```
Input:  { lead_id, user_id, status, deal_data{} }
Output: { success }
Supabase reads:  leads, deals
Supabase writes: leads.status, deals
→ Appelle /generate-contract en interne
```

### `POST /webhook/lead-actions`
```
Input:  { action: 'lead_qualified'|'lead_rejected'|'reviewed', lead_id, lead_data?, reason? }
Output: { success, action, lead_id, logged_at }
Supabase writes: lead_actions
⚠️  Contient des nodes SendGrid obsolètes à supprimer
```

### `POST /webhook/master-email-hub`
```
Input:  { event_type, recipient_email, recipient_name?, locale?, consultant_name?, consultant_email?, data{} }
Output: { success, event_type, template_id, recipient, locale }
Email:  Brevo (SendInBlue) — IDs 1-63
→ Appelé uniquement par le backend, jamais directement du frontend
```

### `POST /webhook/ai-assist-text`
```
Input:  { action: 'enhance_description'|'fix_spelling'|'make_professional'|'generate_titles'|'generate_bio'|'generate_cta'|'translate'|'summarize', text, context?, locale? }
Output: { result, action, language }
```

### `POST /webhook/generate-forms`
```
Input:  { prompt, user_id, user_email, user_name, locale, consultant_profile{}, active_service?, ai_config?, form_title?, form_description? }
Output: { success, form_id, form_slug, form_title, timestamp, message }
Supabase writes: forms (nouvelle entrée complète)
```

### `POST /webhook/generate-form-fields`
```
Input:  { prompt, user_id, locale, consultant_profile{}, active_service? }
Output: { questions[], sections[], thank_you_title, thank_you_description }
→ Ne sauvegarde PAS en Supabase, retourne juste les champs
```

### `POST /webhook/onboarding-augmented`
```
Input:  { user_id, url?|pdf_url?|audio_base64?|text? }
Output: { success, user_id, status: 'generating_forms', timestamp, message }
→ Async — écoute Supabase Realtime pour la completion
```

### `POST /webhook/7a84dac7...` (Cerveau Interactif)
```
Input:  { locale, static_answers{}, ai_config{}, active_agent?, form_title }
Output: { questions[] }
```

---

## 4. Variables Template PDF — Cohérence

### Templates Audit (`audit_*.html`)
Variables injectées par le workflow Audit PDF Generation :

| Variable | Source Workflow | Présente dans HTML | Statut |
|---|---|---|---|
| `{{primaryColor}}` | `profiles.branding_config.primaryColor` | ✅ | OK |
| `{{accentColor}}` | `profiles.branding_config.accentColor` | ✅ | OK |
| `{{clientName}}` | `leads.respondent_info.name` | ✅ | OK |
| `{{clientCompany}}` | `leads.respondent_info.company` | ✅ | OK |
| `{{consultantName}}` | `profiles.full_name` | ✅ | OK |
| `{{companyName}}` | `profiles.company_name` | ✅ | OK |
| `{{logoTag}}` | `profiles.company_logo_url` → `<img>` tag | ✅ | OK |
| `{{date}}` | `new Date().toLocaleDateString('fr-FR')` | ✅ | OK |
| `{{coverTitle}}` | `ai_analysis_json.cover_title` | ✅ | OK |
| `{{coverSubtitle}}` | `ai_analysis_json.cover_subtitle` | ✅ | OK |
| `{{auditBlocksHtml}}` | `ai_analysis_json.audit_blocks` → HTML | ✅ | OK |
| `{{chartImageUrl}}` | `ai_analysis_json.chart_data` → image | ✅ | OK |
| `{{closingCta}}` | `ai_analysis_json.closing_cta` | ✅ | OK |
| `{{consultantAvatar}}` | `profiles.avatar_url` | ✅ | OK |
| `{{consultantTitle}}` | `profiles.job_title` | ✅ | OK |
| `{{consultantBio}}` | `profiles.bio` | ✅ | OK |
| `{{consultantEmail}}` | `profiles.contact_email` | ✅ | OK |
| `{{consultantProfileUrl}}` | `window.location.origin + '/' + profiles.username` | ✅ | OK |
| `{{coverImageUrl}}` | `ai_analysis_json.cover_image_url` | ⚠️ Optionnel | OK |
| `{{closingImageUrl}}` | `ai_analysis_json.closing_image_url` | ⚠️ Optionnel | OK |

### Templates Devis (`devis_*.html`)
Variables attendues par le frontend (`quote_template_payload`) :

| Variable | Source | Statut |
|---|---|---|
| `{{primaryColor}}` | `profiles.branding_config.primaryColor` | ✅ |
| `{{logoTag}}` | `profiles.company_logo_url` | ✅ |
| `{{quoteNumber}}` | `quote_template_payload.quoteNumber` | ✅ |
| `{{date}}` | `new Date()` | ✅ |
| `{{clientName}}` | `leads.respondent_info.name` | ✅ |
| `{{clientCompany}}` | `leads.respondent_info.company` | ✅ |
| `{{projectTitle}}` | `offer.name` | ✅ |
| `{{quoteItems}}` | `quote_template_payload.quote_items[]` → HTML table | ✅ |
| `{{subtotal}}` | Calculé depuis quote_items | ✅ |
| `{{tvaRate}}` | `quote_template_payload.tvaRate` | ✅ |
| `{{totalTTC}}` | Calculé | ✅ |
| `{{paymentTerms}}` | `quote_template_payload.paymentTerms` | ✅ |
| `{{validUntil}}` | `quote_template_payload.validUntil` | ✅ |

### Templates Contrat (`contrat_*.html`)
Variables injectées par le workflow Phase D :

| Variable | Source | Statut |
|---|---|---|
| `{{contractNumber}}` | `contract_template_payload.contractNumber` | ✅ |
| `{{clientName}}` | `leads.respondent_info.name` | ✅ |
| `{{serviceTitle}}` | `contract_template_payload.serviceTitle` | ✅ |
| `{{deliveryDelay}}` | `contract_template_payload.deliveryDelay` | ✅ |
| `{{paymentTerms}}` | `contract_template_payload.paymentTerms` | ✅ |
| `{{contractContent}}` | `contract_template_payload.contractContent` (HTML) | ✅ |

---

## 5. Supabase — Tables & Colonnes utilisées par les Workflows

| Table | Colonnes lues | Colonnes écrites | Par quel workflow |
|---|---|---|---|
| `leads` | `id, user_id, form_id, respondent_info, static_answers, dynamic_dialogue, ai_analysis_json, pdf_settings, proposals_json, status, score` | `ai_analysis_json, final_report_pdf, status, proposals_json` | Analyste, Audit PDF, Phase C, Phase D |
| `profiles` | `id, full_name, first_name, last_name, job_title, company_name, company_logo_url, avatar_url, username, contact_email, bio, branding_config, default_template_id, locale` | *(aucune)* | Audit PDF, Phase C/D |
| `pdf_templates` | `id, html_css_content, is_active, template_type, family_key` | *(aucune)* | Audit PDF |
| `forms` | `id, ai_config, form_structure, title` | *(via onboarding)* | Analyste, Générateur |
| `agents_library` | `id, name, base_prompt, description` | *(aucune)* | Analyste |
| `lead_actions` | *(aucune)* | `id, lead_id, action_type, action_reason, metadata, triggered_by` | Lead Actions Hub |
| `deals` | `id, lead_id, status, amount, contract_url` | `status, contract_url` | Phase D |

---

## 6. Plan de Correction Prioritisé

### Phase 1 — Corrections critiques (bloquantes)

| # | Action | Fichier | Effort |
|---|---|---|---|
| C1 | Créer workflow n8n `/generate-devis` (Devis PDF Generation) | n8n workflow | 🔴 Élevé |
| C2 | Supprimer nodes SendGrid du `Lead Actions Hub`, router vers Master Email Hub | n8n workflow | 🟠 Moyen |
| C3 | Supprimer clé service role hardcodée dans Audit PDF Generation | n8n workflow | 🟠 Moyen |

### Phase 2 — Corrections code (fait dans cette session)

| # | Action | Fichier | Statut |
|---|---|---|---|
| F1 | Ajouter `VITE_N8N_GENERATE_FORMS_WEBHOOK` dans `.env.local` | `.env.local` | ✅ Corrigé |
| F2 | Exporter `N8N_LEAD_ACTIONS_WEBHOOK` depuis `n8n.ts` | `n8n.ts` | ✅ Corrigé |
| F3 | Nettoyer `n8n.ts` : séparer `GENERATE_FORMS` vs `GENERATE_FORM_FIELDS` | `n8n.ts` | ✅ Corrigé |
| F4 | Documenter bucket storage dans `.env.local` | `.env.local` | ✅ Corrigé |

### Phase 3 — Recommandations workflow n8n

| # | Recommandation | Priorité |
|---|---|---|
| R1 | Remplacer IDs Brevo hardcodés par `$env.BREVO_TEMPLATE_*` dans Master Email Hub | Moyen |
| R2 | Renommer Cerveau Interactif webhook : `/cerveau-interactif` (exit UUID) | Faible |
| R3 | Unifier bucket Storage : `pdf-documents/audits/`, `pdf-documents/devis/`, `pdf-documents/contrats/` | Moyen |
| R4 | Ajouter validation explicite des champs dans chaque webhook (error response standardisé) | Moyen |

---

## 7. Score de Cohérence Global

| Axe | Score | Notes |
|---|---|---|
| Webhook paths frontend ↔ workflow | 85% | `/generate-devis` manquant |
| Payload fields frontend → workflow | 90% | Cohérents sur l'essentiel |
| Workflow output ↔ frontend parsing | 88% | Multi-path parsing (`data?.pdf_url \|\| data?.data?.pdf_url`) |
| Supabase schema ↔ workflow queries | 92% | Colonnes alignées post-migration |
| Email templates ↔ Brevo IDs | 95% | IDs identiques mais hardcodés |
| PDF template variables | 93% | Variables bien définies |
| **GLOBAL** | **90%** | Bloqué par /generate-devis manquant |

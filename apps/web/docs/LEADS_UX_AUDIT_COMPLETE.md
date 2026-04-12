# Audit UX complet - Gestion des leads (Pretalk Hub)

Date: 2026-03-25
Auteur: GitHub Copilot (GPT-5.3-Codex)
Perimetre: parcours complet de gestion des leads (board, detail, review multi-phases, automatisations n8n, realtime, statuts)

---

## Schéma complet de gestion de lead - Acteurs & flux

### Diagramme des intervenants et flux de données

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ARCHITECTURE LEAD MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            FRONTEND (React App)                                      │  │
│  ├──────────────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                      │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐               │  │
│  │  │  Leads List     │    │  Kanban Board   │    │  Lead Review     │               │  │
│  │  │  (Leads.tsx)    │───→│  (KanbanBoard)  │───→│  (LeadReview)    │               │  │
│  │  │                 │    │                 │    │  A→B→C→D→E→F    │               │  │
│  │  │ - Search        │    │ - Drag/Drop     │    │ - Multi-phase    │               │  │
│  │  │ - Filter        │    │ - Status col    │    │ - Editor audit   │               │  │
│  │  │ - Sort          │    │ - Auto update   │    │ - Gen offres     │               │  │
│  │  │ - Export CSV    │    │ - Realtime upd  │    │ - Contract edit  │               │  │
│  │  └────────┬────────┘    └────────┬────────┘    │ - Kickoff gen    │               │  │
│  │           │                      │             │ - Finance view   │               │  │
│  │           └──────────────────────┼─────────────→└────────┬─────────┘               │  │
│  │                                  │                       │                         │  │
│  │  ┌──────────────────────────────────────────────────────┴──────────────┐           │  │
│  │  │  LeadDetailsDrawer (Quick actions)                                   │           │  │
│  │  │  - Qualifier / Rejeter / À revoir                                   │           │  │
│  │  │  ⚠️  INCOHERENCE: Status mapping confus (sent/reviewed/rejected      │           │  │
│  │  │      vs new/scheduled/audited/active/won)                           │           │  │
│  │  └────────────────────────┬─────────────────────────────────────────────┘           │  │
│  │                           │                                                         │  │
│  │  Context: AppContext (lead state)                                                  │  │
│  │  ├─ leads[] (current leads in memory)                                              │  │
│  │  ├─ updateLeadStatus(id, newStatus)  ⚠️  Simple update only, no validation         │  │
│  │  └─ Logic: Direct Supabase update                                                  │  │
│  │                                                                                      │  │
│  │  Hooks & Services:                                                                  │  │
│  │  ├─ usePhaseButton      ⚠️  Direct webhook calls (no standardization)              │  │
│  │  ├─ leadTemperature     ✓ Scoring bien implémenté                                  │  │
│  │  ├─ leadActions         ✓ Logging et workflows externes                            │  │
│  │  └─ n8n.ts constants   ⚠️  Fallback devis → audit endpoint!                       │  │
│  │                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓ ↗ ↙                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                         SUPABASE (Database + Realtime)                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  Realtime Channels:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐              │
│  │ • leads table (UPDATE events)        ✓ Enabled in migration             │              │
│  │ • lead_generation_states            ✓ Subscription active              │              │
│  │ • workflow_executions               ✓ Subscription active              │              │
│  │                                                                          │              │
│  │ ⚠️  INCOHERENCE: Parallel polling (3s) + realtime = double latency      │              │
│  │     User perceives uncertain data source                                │              │
│  └─────────────────────────────────────────────────────────────────────────┘              │
│                                                                                             │
│  Core Tables:                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐              │
│  │ TABLE: leads                                                             │              │
│  │ ├─ id (uuid)                                                             │              │
│  │ ├─ status: 'new'|'scheduled'|'audited'|'active'|'won'|'rejected'        │              │
│  │ │  ⚠️  ISSUE: Also writes 'to_review', 'delivered', 'proposition_sent'  │              │
│  │ │       in LeadReview.tsx → STATUS POLLUTION                            │              │
│  │ ├─ pipeline_state (JSONB)  ← Source de vérité theo                      │              │
│  │ │  └─ current_phase, phases {A-F with status}                           │              │
│  │ │     ⚠️  Not always synced with leads.status                           │              │
│  │ ├─ ai_analysis_json        ← Phase B audit data                         │              │
│  │ ├─ proposals_json           ← Phase C offers                            │              │
│  │ ├─ contract_summary         ← Phase D contract                          │              │
│  │ ├─ kickoff_form_slug        ← Phase E form URL                          │              │
│  │ │  ⚠️  Added in 3 different migrations (duplicate risk)                 │              │
│  │ ├─ billing_status           ← Phase F (incomplete impl)                 │              │
│  │ └─ pdf_settings             ← Customization                             │              │
│  └─────────────────────────────────────────────────────────────────────────┘              │
│                                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐              │
│  │ TABLE: lead_generation_states (per phase)                               │              │
│  │ ├─ lead_id, phase                                                       │              │
│  │ ├─ is_generating: bool                                                  │              │
│  │ ├─ generation_status: 'idle'|'generating'|'success'|'failed'            │              │
│  │ │  ⚠️  Similar to workflow_executions.status but separate               │              │
│  │ ├─ generation_started_at, generation_completed_at                       │              │
│  │ └─ execution_id → FK workflow_executions                                │              │
│  └─────────────────────────────────────────────────────────────────────────┘              │
│                                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐              │
│  │ TABLE: workflow_executions                                              │              │
│  │ ├─ id (uuid)                                                             │              │
│  │ ├─ lead_id, phase                                                       │              │
│  │ ├─ workflow_name, webhook_identifier                                    │              │
│  │ ├─ status: 'started'|'in_progress'|'completed'|'failed'                 │              │
│  │ ├─ progress_steps (JSONB array)                                         │              │
│  │ ├─ error_message, retry_count (max 3)                                   │              │
│  │ │  ⚠️  No automatic escalation after max retries                        │              │
│  │ ├─ metadata (JSONB)                                                     │              │
│  │ └─ created_at, completed_at                                             │              │
│  └─────────────────────────────────────────────────────────────────────────┘              │
│                                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐              │
│  │ TABLE: deals                                                             │              │
│  │ ├─ id, lead_id (UNIQUE index missing risk)                             │              │
│  │ ├─ status: 'pending'|'paid'                                             │              │
│  │ ├─ billing_status, invoice_url, receipt_url                            │              │
│  │ ├─ amount, consultant_cost                                              │              │
│  │ │  ⚠️  Dual status (status vs billing_status) = ambiguity               │              │
│  │ └─ created_at, updated_at                                               │              │
│  └─────────────────────────────────────────────────────────────────────────┘              │
│                                                                                             │
│  RLS Policies:                                                                            │
│  ├─ ✓ leads: users see own leads only                                                   │
│  ├─ ✓ workflow_executions: users see own lead executions                               │
│  └─ ✓ lead_generation_states: users manage own generation states                       │
│                                                                                             │
│  Missing Policy Risk:                                                                      │
│  └─ ⚠️  Lead action history / deal history might lack RLS if not explicit                │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                  ↓ ↗ ↙
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    N8N WORKFLOWS (Orchestration Engine)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  Direct Webhook Calls (from frontend):                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Phase A - Generate Audit (Cerveau)                                      │             │
│  │ └─→ N8N_CERVEAU_WEBHOOK                                                 │             │
│  │     Input: lead_id, form responses, ai_config                           │             │
│  │     Output: ai_analysis_json (blocks, charts)                           │             │
│  │     ⚠️  Error handling: Generic "IA error" in UI                        │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Phase B - Generate PDF Audit                                            │             │
│  │ └─→ N8N_GENERATE_AUDIT_WEBHOOK                                          │             │
│  │     Input: lead_id, audit blocks, pdf settings                          │             │
│  │     Output: final_report_pdf (URL)                                      │             │
│  │     ⚠️  Used also as fallback for Devis → WRONG ENDPOINT!               │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Phase C - Generate Proposals                                            │             │
│  │ └─→ N8N_GENERATE_PROPOSAL_WEBHOOK                                       │             │
│  │     Input: lead_id, user_id, locale, consultant info                    │             │
│  │     Output: proposals_json (options array with price + template)        │             │
│  │     ✓ Functional, but no validation of proposal count/quality           │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Phase C - Generate Devis PDF (Quote)                                    │             │
│  │ └─→ N8N_GENERATE_DEVIS_WEBHOOK (FALLBACK TO AUDIT!)                    │             │
│  │     ⚠️  CRITICAL ISSUE:                                                 │             │
│  │     └─ if env var missing → falls back to audit endpoint                │             │
│  │         Structure mismatch (audit vs quote template) → garbled output  │             │
│  │     ⚠️  NO VALIDATION before fallback                                  │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Phase D - Deal Won & Contract                                           │             │
│  │ └─→ N8N_DEAL_WON_OPS_WEBHOOK                                            │             │
│  │     Input: lead_id, deal data                                           │             │
│  │     Output: contract generation, billing setup                          │             │
│  │     ⚠️  Sequence unclear: when exactly is signature sent?               │             │
│  │     ⚠️  Duplicate endpoint calls possible (regenerate button)           │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Phase E - Generate Kickoff Form                                         │             │
│  │ └─→ N8N_GENERATE_FORMS_WEBHOOK                                          │             │
│  │     Input: lead_id, deal_id, service_name, consultant profile           │             │
│  │     Output: form_slug (public form URL)                                 │             │
│  │     ✓ Direct store to leads.kickoff_form_slug                           │             │
│  │     ⚠️  No timeout, no user-facing generation status                    │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐             │
│  │ Email Hub - Send Audit / Offres / Contrat / Kickoff                     │             │
│  │ └─→ N8N_LEAD_ACTIONS_WEBHOOK or N8N_SEND_OFFER_WEBHOOK                 │             │
│  │     Input: event_type, locale, recipient, custom body, data             │             │
│  │     Output: email sent, status logged                                   │             │
│  │     ⚠️  Multiple endpoints for similar actions → consolidation needed   │             │
│  │     ⚠️  No bounce/soft-fail handling visible                            │             │
│  └──────────────────────────────────────────────────────────────────────────┘             │
│                                                                                             │
│  Retry & Timeout Strategy:                                                                │
│  └─ ⚠️  Frontend: No timeout (hang risk)                                                  │
│  └─ ⚠️  Edge Function (if used): 30s timeout, 3 retries                                  │
│  └─ ⚠️  Inconsistent: UI mostly direct calls, not via edge function                      │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                          ↓ ↗ ↙
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SYSTEMS                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  ┌────────────────────────────────┐    ┌────────────────────────────────┐                 │
│  │  Email Service                 │    │  Storage (S3 / Bucket)         │                 │
│  │  (Transactional emails)        │    │  (PDFs, receipts)              │                 │
│  │  └─ Audit delivery template    │    │  └─ final_report_pdf           │                 │
│  │  └─ Offres template            │    │  └─ proposal_pdfs[]            │                 │
│  │  └─ Contrat template           │    │  └─ invoice_url                │                 │
│  │  └─ Kickoff template           │    │  └─ receipt_url                │                 │
│  │  ⚠️ No bounce handling visible │    │  ⚠️ No URL validation          │                 │
│  └────────────────────────────────┘    └────────────────────────────────┘                 │
│                                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐                │
│  │  Signature Service (e-signature partner)                              │                │
│  │  └─ Contract sent for signature                                       │                │
│  │  └─ Signature received → deal.status = 'paid'                        │                │
│  │  ⚠️  Webhook callback from partner not fully integrated              │                │
│  └────────────────────────────────────────────────────────────────────────┘                │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Legenda des IncoherencesFlags

| Symbol | Meaning | Count | Severity |
|--------|---------|-------|----------|
| ✓ | Works as intended | 8 | - |
| ⚠️ | Incoherence / Risk / Friction | 24 | P0-P2 |
| ❌ | Not implemented | 5 | P0-P1 |

---

## Analyse détaillée des incoherences par zone

### FRONTEND ISSUES

#### 1. ⚠️ **STATUS POLLUTION** (LeadReview.tsx)
**Problème:**
- LeadReview écrit statuts: `to_review`, `delivered`, `proposition_sent`, `sent`
- Kanban/Drawer attendentCenters: `new`, `scheduled`, `audited`, `active`, `won`, `rejected`
- Badge handler ne reconnait pas correctement `to_review` vs `to-review`

**Impact UX:**
- Lead disparait de board après edit, ou reste dans mauvaise colonne
- Feeling de bug, confiance réduite

**Fichiers affectés:**
- `src/components/ReactApp/pages/LeadReview.tsx` L771, L1337, L1379
- `src/components/ReactApp/components/ui/Badges.tsx` L46-52
- `src/components/ReactApp/components/KanbanBoard.tsx` L16

**Fix:**
- Créer un dictionnaire mapping cannonique (status internal → status UI → statut métier)
- Utiliser une fonction `getCanonicalStatus(status)` dans tous les composants
- Effort: 1-2 jours

---

#### 2. ⚠️ **DRAWER vs ROUTE INCONSISTENCY** (LeadDetailsDrawer.tsx)
**Problème:**
- Drawer peut ouvrir route `/lead-review/:id` qui pourrait ne pas exister
- Route officielle: `/leads/:id` (LeadReview.tsx)
- Confusion possible

**Impact UX:**
- User clique "Modifier l'audit", va vers route potentiellement mismatchée
- Page blanche ou 404 possible

**Fichiers affectés:**
- `src/components/ReactApp/components/LeadDetailsDrawer.tsx` L83
- `src/components/ReactApp/FullApp.tsx` L100

**Fix:**
- Confirmer que `/leads/:id` est l'unique route pour LeadReview
- Tous les CTA du drawer → `/leads/:id`
- Effort: 1 jour

---

#### 3. ⚠️ **DRAG/DROP NO ERROR UI** (KanbanBoard.tsx)
**Problème:**
- En cas d'erreur backend pendant drag, log seulement console
- Lead snaps back ou reste frozen visuellement

**Impact UX:**
- User pense action est faite, mais elle a échoué silencieusement
- Desynchronisation lead state UI vs DB

**Fichiers affectés:**
- `src/components/ReactApp/components/KanbanBoard.tsx` L86-92

**Fix:**
- `setIsError(true)` dans onDragEnd catch block
- Afficher toast error "Erreur deplacement: [...] Relancrez ou contactez support"
- Rollback visuel immediat si erreur persiste après 1s
- Effort: 0.5 jours

---

#### 4. ⚠️ **REALTIME + POLLING DUPLICATION** (LeadReview.tsx)
**Problème:**
- Realtime channel setup sur leads UPDATE
- Polling setInterval() 3s parallele pour PDF et proposals
- User ne sait pas quelle source est "vraie"

**Impact UX:**
- Double checking, uncertain data source
- Higher network usage
- Apparence d'app "double-checking" = manque de confiance

**Fichiers affectés:**
- `src/components/ReactApp/pages/LeadReview.tsx` L553-630
- `src/components/ReactApp/components/GenerationBanner.tsx` L28+

**Fix:**
- Realtime = primary path, polling = fallback only
- Afficher badge "Mode degrade: mise-à-jour ralentie" si polling used
- Effort: 1 jour

---

#### 5. ❌ **NO TIMEOUT ON DIRECT WEBHOOK CALLS** (usePhaseButton.ts)
**Problème:**
- `fetch(webhookURL, {...})` sans AbortSignal.timeout()
- Si N8N hang, UI freeze indetermine

**Impact UX:**
- Spinner blocked infini
- User pense app crashed, reload page
- Action potentiellement executee double

**Fichiers affectés:**
- `src/components/ReactApp/hooks/usePhaseButton.ts` L119-130

**Fix:**
- Ajouter `signal: AbortSignal.timeout(30000)` en fetch options
- Catch timeout → afficher "Action timeout (30s). Relancez ou contactez support"
- Effort: 1 jour

---

#### 6. ⚠️ **PHASE UNLOCK NO EXPLANATION** (LeadPipelineStepper.tsx)
**Problème:**
- Phase verrouillée (locked icon), mais pas de tooltip/explication
- User ne sait pas pourquoi elle est disabled

**Impact UX:**
- Frustration: "Pourquoi je peux pas cliquer ici?"
- Sensation d'incompleteness/bug

**Fichiers affectés:**
- `src/components/ReactApp/components/LeadPipelineStepper.tsx` L59
- `src/components/ReactApp/pages/LeadReview.tsx` L1752

**Fix:**
- Ajouter tooltip: "Déverouillé une fois [prerequisite] complété"
- Ex: "Phase offres deverouillée une fois audit PDF genere"
- Effort: 0.5 jours

---

#### 7. ⚠️ **DENSE PAGE LEGREVIEW** (LeadReview.tsx)
**Problème:**
- 1 seule page pour 6 phases + 40+ useState
- Logique métier mélangée à UI

**Impact UX:**
- Charge cognitive elevee
- Performance possible hit (re-renders)
- Maintenance difficile

**Fichiers affectés:**
- `src/components/ReactApp/pages/LeadReview.tsx` L1-3300 (entire file)

**Fix:**
- Extraire phaseA/B/C/D/E/F dans sous-composants
- Creer services/hook pour chaque phase (audit generation, proposal logic, etc.)
- Effort: 3-5 jours

---

### SUPABASE SCHEMA ISSUES

#### 8. ⚠️ **DUAL STATUS SYSTEM (UNSYNC)** (leads table)
**Problème:**
- `leads.status` = simple status for board (new/scheduled/audited/active/won/rejected)
- `leads.pipeline_state` = detailed JSONB for phases (A-F with nested status)
- Pas de fonction de sync bidi entre eux

**Impact DB:**
- Lead peut avoir status='new' mais pipeline_state.phases.audit.status='completed'
- Inconsistency in audit trail

**Fichiers affectés:**
- `supabase/migrations/202603190001_pipeline_state...sql` L8-11
- `supabase/migrations/202602010022_add_missing_leads...sql`
- `src/components/ReactApp/pages/LeadReview.tsx` (status writes)

**Fix:**
- Creer fonction RPC `sync_lead_status_to_pipeline()` qui derive leads.status from current_phase
- OU: deprecated leads.status en faveur de pipeline_state uniquement
- Mais board Kanban dépend de leads.status → migration progressive
- Effort: 2 jours

---

#### 9. ⚠️ **KICKOFF FORM SLUG ADDED 3 TIMES** (migrations)
**Problème:**
- Colonne kickoff_form_slug ajoutée dans:
  1. `202603170001_post_review_enhancements.sql` L6
  2. `202603170002_complete_lead_review_workflow.sql` L23
  3. `202603190002_leadreview_realtime_alignment.sql` L7
- IF NOT EXISTS protection, mais confusion dans historique

**Impact:**
- Maintenance horror: quelle migration est vraie?
- Risque de drift schema en dev

**Fix:**
- Nettoyer: garder une seule migration, marquer autres comme deprecated
- Ajouter note: "Column added in 202603170001, referenced/verified in 202603170002 and 202603190002"
- Effort: 1 jour

---

#### 10. ⚠️ **DEAL vs LEAD STATUS AMBIGUITY**
**Problème:**
- `leads.status = 'won'` vs `deals.status = 'paid'` vs `leads.billing_status = 'pending'|'paid'`
- Semantique unclear: quand exactement un lead est-il "gagné"?

**Impact DB:**
- Logic tries both: `currentDeal?.status === 'paid' || lead?.status === 'won'`
- Post-hoc inference au lieu d'invariant fort

**Fichiers affectés:**
- `src/components/ReactApp/pages/LeadReview.tsx` L1798
- supabase deals/leads schema

**Fix:**
- Definir règle: lead.status='won' IFF (deals.count > 0 AND deals[0].billing_status='paid')
- Ajouter trigger Supabase pour sync automatique
- Effort: 2 jours

---

#### 11. ⚠️ **GENERATION STATUS TRIPLE** (lead_generation_states + workflow_executions + proposal_generation_status)
**Problème:**
- 3 champs pour tracking génération:
  1. `lead_generation_states.generation_status`: idle|generating|success|failed
  2. `workflow_executions.status`: started|in_progress|completed|failed
  3. `leads.proposal_generation_status`: idle|running|completed|failed
- Semantique voisine, enum différentes

**Impact:**
- Confusion quelle source croire
- Risque update un champ et pas l'autre

**Fix:**
- Définir: lead_generation_states = source of truth pour phase current
- workflow_executions = audit trail pour chaque action
- Remove proposal_generation_status (derive depuis lead_generation_states)
- Effort: 1.5 jours

---

### N8N / WEBHOOKS ISSUES

#### 12. 🔴 **CRITICAL: DEVIS FALLBACK TO AUDIT** (n8n.ts)
**Problème:**
```javascript
export const N8N_GENERATE_DEVIS_WEBHOOK =
  import.meta.env.VITE_N8N_GENERATE_DEVIS_WEBHOOK ||
  import.meta.env.VITE_N8N_GENERATE_AUDIT_WEBHOOK ||  // FALLBACK!
  'https://backand.pretalk.me/webhook/generate-audit';
```
- Si endpoint devis manquant → silent fallback à audit
- Audit structure (blocks, charts) ≠ Quote structure (items, totals)
- Result: garbled PDF ou JSON parse error

**Impact UX:**
- "Générer devis" → reçoit audit PDF au lieu de devis
- Colossal fail at closing criticak step
- Client confusion

**Fichiers affectés:**
- `src/components/ReactApp/lib/n8n.ts` L40-45
- LeadReview.tsx phaseC

**Fix:**
- Require VITE_N8N_GENERATE_DEVIS_WEBHOOK
- If missing: throw error in phaseConfig "Devis endpoint not configured"
- Add UI message "Endpoint not configured, contact admin"
- Effort: 0.5 jours (FIX) + CONFIG AUDIT (1 jour)

---

#### 13. ⚠️ **NO VALIDATION BEFORE WEBHOOK CALLS**
**Problème:**
- Send proposals action: no check if user selected ≥ 1 offer
- Send audit: no check if audit_blocks non-vides
- Send contrat: no check if contract_summary exists

**Impact UX:**
- Empty/incomplete data sent to N8N
- N8N errors, user sees generic "error" toast

**Fix:**
- Pre-send validation with specific error msg:
  - "Sélectionnez au moins 1 offre avant d'envoyer"
  - "Complétez l'audit avant de générer PDF"
  - "Rédigez un contrat avant d'envoyer"
- Effort: 1 jour

---

#### 14. ⚠️ **EMAIL ENDPOINT FRAGMENTATION**
**Problème:**
- Send audit → N8N_LEAD_ACTIONS_WEBHOOK
- Send offres → N8N_SEND_OFFER_WEBHOOK (or N8N_MASTER_EMAIL_HUB)
- Send kickoff → N8N_MASTER_EMAIL_HUB + N8N_LEAD_ACTIONS_WEBHOOK (inconsistent)

**Impact:**
- Multiple endpoint maps
- Diff retry/timeout strategies per endpoint
- Maintenance: changes to one endpoint don't affect others

**Fix:**
- Consolidate all email sends via N8N_MASTER_EMAIL_HUB
- Use event_type discrimination (audit|proposal|contract|kickoff)
- Effort: 1.5 jours (API consolidation)

---

#### 15. ⚠️ **RETRY LOGIC SILENT FAILURE**
**Problème:**
- Max 3 retries in usePhaseButton
- After 3 retries: state='failed', message: "3 tentatives échouées. Contactez le support."
- No CTA button "Contact support" or Zendesk link

**Impact UX:**
- User reads "contact support"
- Doesn't know where/how
- Many don't bother → lost deals

**Fix:**
- Add button "📞 Contactez support" → mailto: or Zendesk widget
- Include error details in email so support can debug
- Effort: 0.5 jours

---

### REALTIME & TELEMETRY ISSUES

#### 16. ⚠️ **REALTIME PUBLICATION NOT VERIFIED**
**Problème:**
- Migration adds workflows, lead_generation_states, leads to supabase_realtime publication
- But no test that subscriptions actually work (channel.subscribe() success?)

**Impact:**
- Silent subscription failure → fallback to polling
- No way for user to know

**Fix:**
- Add try/catch around supabase.channel().subscribe()
- Log to Sentry on failure
- Afficher indication if realtime unavailable (network status)
- Effort: 1 jour

---

#### 17. ⚠️ **NO HANDLING OF STALE REALTIME CONNECTIONS**
**Probleme:**
- Connection drops, but UI continues to await updates
- Polling may have stale data too

**Impact:**
- User edits, thinks saved, but offline
- Lost changes

**Fix:**
- Add offline indicator
- Queue pending changes locally
- Sync on reconnect
- Effort: 2 jours (offline-first pattern)

---

### BUSINESS LOGIC ISSUES

#### 18. ⚠️ **CONVERSION WORKFLOW UNCLEAR** (LeadReview.tsx query param)
**Problème:**
- URL: `/leads/:id?convert=true` triggers deal creation modal
- But logic is opaque: when should user click "convert"?
- No guidance in UI

**Impact UX:**
- User confused quando to trigger conversion
- May miss step or trigger too early

**Fix:**
- Add explicit state machine: briefing → audit → proposals → (AUTO trigger: "Créer deal?") → contrat
- OU: replace query param with stepper click event
- Effort: 1 jour

---

#### 19. ❌ **PHASE F (FINANCE) NOT ACTIONABLE**
**Problème:**
- Phase présente dans stepper
- Zero buttons in phaseConfig.finance
- No UI pour track invoice/payment

**Impact UX:**
- Promise unfulfilled
- User sees incomplete product

**Fix:**
- Either:
  1. Hide phase till ready
  2. Or implement MVP: timeline invoice sent/paid, link to invoice
- Effort: 1-2 jours (depends on payment partner integration status)

---

#### 20. ⚠️ **NO UNSAVED CHANGES PROTECTION** (LeadReview.tsx)
**Problème:**
- 40+ useState, no dirty flag
- User edits, navigates away without save → data lost silently

**Impact UX:**
- User frustration: "Where did my work go?"
- Lost information

**Fix:**
- Implement hasChanges flag (already exists but not used for nav warning)
- Add `window.onbeforeunload` if hasChanges=true
- Effort: 0.5 jours

---

---

## Priorisation & Plan d'implementation

### Timeline de remediation recommandee

**PHASE 1: IMMEDIATE (48-72 heures) - QUICK WINS**
| Issue | Fix | Effort | Owner | Rationale |
|-------|------|--------|-------|-----------|
| #12 (CRITICAL: Devis Fallback) | Remove fallback, require VITE_N8N_GENERATE_DEVIS_WEBHOOK | 0.5j | Backend | Revenue blocker |
| #5 (No Timeout) | Add AbortSignal.timeout(30s) to fetch | 1j | Frontend | UX freeze risk |
| #3 (Drag Error UI) | Toast + visual rollback on failed drag | 0.5j | Frontend | Silent failures |
| #20 (Unsaved Changes) | Implement dirty flag + beforeunload warning | 0.5j | Frontend | Data loss prevention |
| #15 (Retry Failure UX) | Add "Contact support" button in error state | 0.5j | Frontend | Conversion impact |
| **Total** | | **3j** | | |

**PHASE 2: SHORT TERM (1-2 weeks) - HIGH IMPACT FIXES**
| Issue | Fix | Effort | Owner | Rationale |
|-------|------|--------|-------|-----------|
| #1 (Status Pollution) | Unify status taxonomy, create mapping function | 2j | Frontend+DB | Data integrity |
| #8 (Dual Status System) | Sync leads.status ↔ pipeline_state via RPC + trigger | 2j | Backend | Source of truth |
| #4 (Realtime + Polling) | Make realtime primary, polling fallback only | 1j | Frontend | Clarity + performance |
| #10 (Deal vs Lead Status) | Define deal creation rule, add trigger | 2j | Backend | Business logic |
| #11 (Triple Generation Status) | Consolidate to lead_generation_states only | 1.5j | Backend | Consistency |
| #13 (No Validation) | Pre-send validation with specific errors | 1j | Frontend | UX clarity |
| **Total** | | **9.5j** | | |

**PHASE 3: MEDIUM TERM (2-4 weeks) - STABILITY & COMPLETENESS**
| Issue | Fix | Effort | Owner | Rationale |
|-------|------|--------|-------|-----------|
| #7 (Dense LeadReview) | Extract phases into sub-components + services | 4j | Frontend | Maintainability |
| #2 (Drawer vs Route) | Confirm single route entry point | 1j | Frontend | Consistency |
| #6 (Phase Unlock UX) | Add tooltip explaining unlock prerequisites | 0.5j | Frontend | UX clarity |
| #9 (Migration Cleanup) | Consolidate duplicate kickoff_form_slug migrations | 1j | Backend | Technical debt |
| #14 (Email Fragmentation) | Consolidate via N8N_MASTER_EMAIL_HUB | 1.5j | Backend | Consistency |
| #16 (Realtime Verification) | Add try/catch + Sentry logging for subscriptions | 1j | Backend | Observability |
| #18 (Conversion Workflow) | Make deal creation implicit or explicit per spec | 1j | Frontend | UX clarity |
| **Total** | | **10j** | | |

**PHASE 4: NICE-TO-HAVE (Pending spec/design decision)**
| Issue | Fix | Effort | Owner | Rationale |
|-------|------|--------|-------|-----------|
| #19 (Phase F Finance) | Implement payment tracking OR hide phase | 1-2j | Product | Completeness |
| #17 (Stale Connections) | Add offline queue + sync on reconnect | 2j | Frontend | Robustness |
| **Total** | | **3-4j** | | |

### Budget sommaire
- **Critical issues fixed:** 3j (Phase 1)
- **High-impact wins:** 9.5j (Phase 2)
- **Stability improvements:** 10j (Phase 3)
- **Optional enhancements:** 3-4j (Phase 4)
- **TOTAL ESTIMATE:** 25.5-26.5j (4-5 weeks, 1 FTE)

### Dependencies & Sequencing
1. **Phase 1 must precede all else** (Devis fallback is revenue blocker)
2. **Status unification (#1) blocks:** drag/drop error handling, deal sync, conversion logic
3. **Pipeline state sync (#8) blocks:** dual status system fixes
4. **Realtime verification (#16) prerequisite for:** Realtime+Polling consolidation (#4)
5. **Phase F decision needed asap** (impacts roadmap planning)

---

## 1. Resume executif

Le parcours lead est deja riche et ambitieux (qualification, audit, propositions, contrat, kickoff), mais l'experience utilisateur perd en clarte a cause de 3 causes racines:

1. Multiples sources de verite pour les statuts (status lead, pipeline_state, etats generation).
2. Orchestration hybride difficile a comprendre (webhooks directs, realtime + polling, edge function non utilisee cote UI).
3. Feedback utilisateur incomplet lors des echecs reseau, transitions d'etat et verrouillages de phase.

Impact business principal:
- baisse de confiance au moment des etapes critiques (envoi audit, envoi offres, conversion contrat),
- risque de statuts incoherents dans le board,
- risque de frictions sur le closing (offres/devis/contrat).

---

## 2. Methode d'analyse

Analyse basee sur:
- UI/UX reelle dans les pages et composants React,
- logique des actions (hooks/services),
- schema et migrations Supabase,
- flux de generation et realtime,
- tests existants et zones non couvertes.

### Fichiers et zones principales

- src/components/ReactApp/pages/Leads.tsx
- src/components/ReactApp/components/KanbanBoard.tsx
- src/components/ReactApp/components/LeadDetailsDrawer.tsx
- src/components/ReactApp/pages/LeadReview.tsx
- src/components/ReactApp/lib/phaseConfig.ts
- src/components/ReactApp/hooks/usePhaseButton.ts
- src/components/ReactApp/lib/n8n.ts
- src/components/ReactApp/components/GenerationBanner.tsx
- src/components/ReactApp/context/AppContext.tsx
- supabase/migrations/202603190001_pipeline_state_and_workflow_executions.sql
- supabase/migrations/202603190002_leadreview_realtime_alignment.sql
- docs/lead-review-steps.md

---

## 3. Cartographie du funnel lead (etat reel)

## Etape 0 - Vue globale leads (board/list)

Objectif UX:
- prioriser rapidement les leads,
- deplacer un lead de statut en statut,
- ouvrir les details et actions rapides.

Etat actuel:
- board Kanban avec colonnes: new, scheduled, audited, active, won, rejected.
- drag and drop avec update optimiste.

Points forts:
- lecture rapide du pipeline,
- interaction directe (drag and drop).

Friction:
- en cas d'erreur backend pendant drag/drop, retour utilisateur insuffisant,
- certains statuts ecrits ailleurs ne correspondent pas a ces colonnes.

---

## Etape 1 - Qualification dans le drawer

Objectif UX:
- qualifier, rejeter, ou programmer une revue rapidement depuis la fiche.

Etat actuel:
- actions via status changes (sent/rejected/reviewed) + trigger workflows.
- feedback toast present.

Points forts:
- vitesse d'action,
- peu de clics pour demarrer des automatisations.

Friction:
- vocabulaire de statut trop technique/heterogene,
- action d'ouverture du dossier peut pointer vers route differente de la route officielle.

---

## Etape 2 - Lead Review multi-phases (A -> F)

Objectif UX:
- guider l'expert du diagnostic au closing puis onboarding.

Etat actuel:
- phases A-F avec stepper,
- actions de generation/envoi par phase,
- autosave + feedback.

Points forts:
- workflow complet dans un ecran unique,
- progression visible.

Friction:
- logique stepper en partie derivee localement,
- desynchronisation possible avec pipeline_state en base,
- page tres dense (beaucoup d'etats locaux), charge cognitive elevee.

---

## Etape 3 - Audit (generation, edition, PDF, envoi)

Objectif UX:
- produire un audit fiable, modifiable, puis livrable au client.

Etat actuel:
- generation audit IA,
- edition par blocs,
- generation PDF,
- envoi email.

Points forts:
- pipeline fonctionnel de bout en bout,
- feedback visuel de generation.

Friction:
- realtime + polling en parallele augmente la complexite percue,
- messages d'erreur parfois generiques.

---

## Etape 4 - Propositions / Devis

Objectif UX:
- generer des options commerciales credibles, envoyer proprement.

Etat actuel:
- IA booster pour offres,
- generation devis PDF,
- envoi des offres.

Points forts:
- logique d'offres multiples,
- workflow d'envoi present.

Friction critique:
- fallback technique du webhook devis vers webhook audit possible si variable manquante,
- risque de resultat non conforme au contexte devis.

---

## Etape 5 - Contrat / Signature / Conversion

Objectif UX:
- passer du "ok client" au contrat signe avec etat clair.

Etat actuel:
- generation contrat,
- envoi signature,
- logique de validation/paid/won.

Points forts:
- sequence complete theorique.

Friction:
- semantique des etats deal/lead pas toujours explicite,
- ambiguite possible entre paid, won, billing_status.

---

## Etape 6 - Kickoff

Objectif UX:
- lancer la mission et transmettre un formulaire operationnel.

Etat actuel:
- generation form slug,
- preview,
- envoi email kickoff.

Points forts:
- presence d'une vraie etape d'activation post-signature.

Friction:
- plusieurs migrations ajoutent la meme colonne kickoff_form_slug,
- potentielle confusion maintenance/evolution.

---

## Etape 7 - Finance

Objectif UX:
- suivi facture, paiement, preuve de transaction.

Etat actuel:
- structure de donnees partiellement presente,
- phase encore peu actionnable en UX.

Friction:
- phase visible mais percue comme incompletement operationnelle.

---

## 4. Evaluation UX critique (heuristiques)

## 4.1 Visibilite de l'etat systeme

Bon:
- loaders et toasts presents,
- banner de generation en realtime.

A corriger:
- absence de timeout utilisateur explicite pour certains appels fetch,
- echec drag/drop peu visible,
- etats simultanes (loading local vs workflow status) pas toujours alignes.

## 4.2 Coherence et standards

Bon:
- architecture par phases et boutons configures.

A corriger:
- taxonomie de statuts non unifiee (new/scheduled/audited/active/won/rejected vs to_review/delivered/proposition_sent/sent/reviewed).

## 4.3 Prevention des erreurs

Bon:
- try/catch present dans de nombreuses actions.

A corriger:
- endpoint fallback potentiellement dangereux pour les devis,
- manque de guardrails explicites avant certaines transitions critiques.

## 4.4 Controle utilisateur

Bon:
- actions manuelles nombreuses (save, regenerate, send).

A corriger:
- rollback UX incomplet lors d'erreur sur interactions board,
- confirmations non uniformes selon les actions risquee.

## 4.5 Charge cognitive

Bon:
- workflow centralise dans LeadReview.

A corriger:
- forte densite d'informations et d'actions dans une seule page,
- logique metier et logique UI tres imbriquees.

---

## 5. Incoherences produit-technique (racines)

1. Systeme de statuts paralleles
- Leads board base sur leads.status,
- pipeline detail base sur pipeline_state.
- absence d'une fonction canonique de traduction bidirectionnelle.

2. Generation multi-couches
- button state local,
- lead_generation_states,
- workflow_executions.
- semantique voisine mais non strictement harmonisee.

3. Edge function prete mais UI en appels directs
- fonction trigger-workflow existe,
- UI continue majoritairement en webhooks directs.
- resultat: comportement moins standardise (retries/timeouts/telemetrie variable).

4. Duplication migrations
- kickoff_form_slug ajoutee dans plusieurs migrations.
- dette schema qui complexifie maintenance et audit.

---

## 6. Backlog d'amelioration UX priorise

## P0 (bloquant business/confiance)

1. Unifier la taxonomie des statuts
- Definir un dictionnaire unique (source of truth) + mapping officiel.
- Aligner board, drawer, review, badges, automations.
- Impact: forte reduction des incoherences de pipeline.

2. Supprimer fallback devis -> audit
- Exiger endpoint devis explicite.
- Message d'erreur clair si non configure.
- Impact: securise l'etape commerciale la plus sensible.

3. Clarifier transitions critiques
- Ajouter confirmations/validation robustes avant envoi offres/contrat.
- Afficher resultat de transition avec etat final lisible.

## P1 (fort impact UX)

4. Standardiser la couche d'execution workflow
- Migrer progressivement les appels vers trigger-workflow.
- Benefice: retries, timeout, telemetrie, statuts homogenes.

5. Nettoyer realtime vs polling
- Realtime en primaire,
- polling seulement fallback explicite (etat "mode degrade").

6. Renforcer feedback erreurs
- Erreur actionable (cause + next step),
- rollback visuel coherent sur board.

7. Harmoniser routes et CTA
- Eviter routes alternatives inconsistantes,
- relier tous les CTA au meme parcours officiel.

## P2 (qualite/performance/perception)

8. Alleger la page LeadReview
- extraire logique metier en services/hooks,
- reduire la charge cognitive par sections progressives.

9. Rendre la phase Finance actionnable MVP
- timeline facture/paiement,
- CTA minimaux (marquer facture envoyee, payee).

10. Nettoyage migrations et documentation schema
- consolider colonnes redondantes,
- document de reference schema pipeline.

---

## 7. Plan de mise en oeuvre (30 jours)

## Semaine 1 - Stabilisation statut/commerce
- implementer dictionnaire unique de statuts,
- corriger fallback devis,
- ajuster badges et colonnes board.

Livrable:
- parcours board -> review -> offres coherent,
- zero statut orphelin dans les colonnes.

## Semaine 2 - Fiabilite execution
- bascule progressive vers trigger-workflow,
- retries/timeouts standardises,
- journalisation unifiee.

Livrable:
- erreurs mieux gerees,
- meilleure observabilite des echecs.

## Semaine 3 - UX feedback et verrouillages
- tooltips/explications de phases verrouillees,
- rollback visuel board,
- messages d'erreur actionnables.

Livrable:
- moins d'ambiguite,
- confiance utilisateur augmentee.

## Semaine 4 - Refactor experience
- simplification LeadReview,
- phase Finance MVP,
- nettoyage doc/migrations.

Livrable:
- parcours de closing plus lisible,
- dette technique reduite.

---

## 8. KPI UX a suivre

KPI de fluidite:
- Temps median pour passer new -> won.
- Taux de leads avec statut incoherent detecte.
- Taux d'echec des actions critiques (send audit/offres/contrat).

KPI de confiance:
- Nombre de retries manuels par action.
- Taux d'abandon dans chaque phase.
- Taux de reouverture de lead apres envoi (symptome d'erreur percue).

KPI conversion:
- Taux d'envoi offre apres generation audit.
- Taux de conversion offre -> contrat signe.
- Taux de conversion contrat -> kickoff complete.

---

## 9. Couverture test - etat et gaps

Existant:
- tests integration autour des lead actions et score temperature.

Manquants critiques:
1. test de coherence statuts board/review/drawer.
2. test d'echec drag/drop avec rollback visible.
3. test de mapping webhook par action (notamment devis).
4. test unlock/lock des phases base sur pipeline_state.
5. test parcours complet new -> won -> kickoff.

---

## 10. Decision architecture recommandee

Direction cible:
1. pipeline_state = progression metier canonique,
2. leads.status = vue simplifiee derivee pour board,
3. workflow_executions + lead_generation_states = execution/telemetrie,
4. trigger-workflow = point d'entree unique pour actions asynchrones.

Regle d'or UX:
- une action utilisateur critique doit produire:
  1) un feedback immediat,
  2) un etat intermediaire explicite,
  3) un etat final coherent dans toutes les vues.

---

## 11. Quick wins (48h)

1. Corriger fallback devis dans la config n8n.
2. Uniformiser badges pour to_review/to-review.
3. Afficher un toast erreur + revert visuel sur drag/drop failed.
4. Verifier et harmoniser la route unique vers LeadReview.
5. Ajouter message explicite si phase verrouillee (pre-requis manquant).

---

## 12. Conclusion

La base est solide et deja orientee "workflow expert". Le gain UX majeur n'est pas d'ajouter plus de features, mais de rendre le parcours fiable, coherent et previsible a chaque transition critique.

Priorite absolue: coherence des statuts + execution workflow standardisee.

Une fois ces deux points stabilises, la conversion et la confiance utilisateur devraient progresser rapidement, avec moins de frictions operationnelles pour l'equipe.

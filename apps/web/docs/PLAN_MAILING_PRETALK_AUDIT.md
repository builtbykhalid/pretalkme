# PLAN MAILING PRETALK - AUDIT GLOBAL

Date: 2026-03-26
Scope: email transactionnel, notifications in-app, rappels booking, automatisations recurrentes, architecture backend/n8n/supabase.

## 1) Executive summary

Etat global: partiellement implemente avec une base solide, mais architecture split en 2 chemins (n8n direct depuis le frontend + backend email API), et couverture incomplete sur le recurrent (weekly report, marketing drip, rappels 24h/1h verifies cote Pretalk).

Niveau de maturite estime:
- Transactionnel coeur de funnel: 75%
- Notification in-app: 80%
- Observabilite/logging email: 70%
- Recurrence (weekly/marketing/reminders): 30%
- Cohesion architecture (single source of truth): 40%

## 2) Architecture actuelle (constat)

### 2.1 Chemin A - Frontend -> n8n webhook (actif)
- Le frontend declenche majoritairement des webhooks n8n pour les actions de lead et d'envoi.
- Fichiers principaux:
  - src/components/ReactApp/pages/LeadReview.tsx
  - src/components/ReactApp/lib/leadActions.ts
  - src/components/ReactApp/hooks/usePhaseButton.ts
  - src/components/ReactApp/lib/n8n.ts

### 2.2 Chemin B - Frontend/Backend -> /api/email (existe)
- Backend Express email implemente (routes, auth admin, logs, stats) avec Brevo.
- Fichiers principaux:
  - src/server/index.ts
  - src/server/routes/emailRoutes.ts
  - src/server/services/brevoEmailService.ts
  - src/server/services/documentSendingService.ts

### 2.3 Couche n8n email
- Master Email Hub v2 present, mapping event_type -> template Brevo.
- Lead Actions Hub present, mais envoi email encore via SendGrid.
- Fichiers principaux:
  - n8n/new/Pretalk_-_Master_Email_Hub_v2.json
  - n8n/new/Pretalk_-_Lead_Actions_Hub.json

### 2.4 Couche Supabase notifications et booking
- Notification in-app + preferences profile presentes.
- Schema booking_reminders present (table/index/policies), mais execution recurrente non evidente dans le code actif inspecte.
- Fonctions calendar Google actives avec sendUpdates=all (emails Google Calendar).
- Fichiers principaux:
  - src/components/ReactApp/context/NotificationContext.tsx
  - src/components/ReactApp/pages/Settings.tsx
  - supabase/functions/google-calendar-sync/index.ts
  - supabase/migrations/202602010030_booking_system.sql

## 3) Inventaire complet par etape (fait vs non fait)

### 3.1 Capture lead / qualification

| Flux | Statut | Source probable | Notes |
|---|---|---|---|
| New lead notification consultant | Fait (actif) | n8n Master Email Hub | event_type new_lead mappe Brevo |
| Lead qualified / rejected notification | Fait (actif) | n8n Lead Actions Hub | encore SendGrid dans ce workflow |
| Reminder lead "a revoir" | Partiel | leadActions + webhook | commentaire "Future: integrate with reminder service" |

### 3.2 Livraison audit / proposition / kickoff

| Flux | Statut | Source probable | Notes |
|---|---|---|---|
| Delivery audit email | Fait (actif) | LeadReview -> n8n Master Hub | event_type delivery_audit |
| Delivery proposition email | Fait (actif) | LeadReview -> n8n Master Hub | event_type delivery_proposition |
| Kickoff ready email | Fait (actif) | LeadReview -> n8n Master Hub | event_type kickoff_ready |
| Proposal follow-up auto | Implemente mais non prouve en trigger | mapping backend+n8n | present dans mappings, invocation non claire |
| Contract signed email | Implemente mais non prouve en trigger | mapping backend+n8n | present dans mappings, invocation non claire |

### 3.3 Booking / rendez-vous

| Flux | Statut | Source probable | Notes |
|---|---|---|---|
| Confirmation booking client | Fait (actif) | booking workflow + Google Calendar | creation event + attendees |
| Reschedule/cancel notifications | Fait (actif) | google-calendar-sync | sendUpdates=all |
| Rappels 24h/1h Pretalk (pilotage interne) | Non confirme / probablement manquant | schema DB seulement | promesse visible dans templates, moteur de dispatch non localise |

### 3.4 Onboarding / auth

| Flux | Statut | Source probable | Notes |
|---|---|---|---|
| Emails auth (signup reset magic link invite) | Fait (base prete) | Supabase auth templates | templates documentes |
| Onboarding welcome consultant | Implemente mais activation non prouvee | mappings backend+n8n | event_type onboarding_welcome present |

### 3.5 Notifications in-app

| Flux | Statut | Source probable | Notes |
|---|---|---|---|
| Notification center realtime | Fait (actif) | NotificationContext + table notifications | CRUD + subscription |
| Preferences notification (newLead/weeklyReport/marketing) | Fait (UI+DB) | Settings + profiles.notification_preferences | stockage OK |
| Application effective des preferences weekly/marketing dans un job d'envoi | Non prouve / manquant | n/a | pas de scheduler/envoi detecte |

### 3.6 Marketing / recurrent

| Flux | Statut | Source probable | Notes |
|---|---|---|---|
| Weekly report email (lundi) | Non implemente de bout en bout | UI prefs seulement | texte/UI present, pipeline absent |
| Emails marketing opt-in | Non implemente de bout en bout | UI prefs + Admin Marketing in-app | Admin Marketing gere des annonces in-app, pas campagne email |
| Drip post-mission (J+30 avis/retainer) | Promesse produit/doc, non prouvee techniquement | docs/pages marketing | aucun moteur de job trouve dans scope inspecte |

## 4) Backend emailing: verification explicite

Conclusion: oui, un backend emailing existe deja et il est reellement implemente.

Preuves:
- Route montee sur serveur: src/server/index.ts
- API email avec envoi template/batch + health/stats/logs: src/server/routes/emailRoutes.ts
- Service Brevo complet avec map event_type -> template: src/server/services/brevoEmailService.ts
- Orchestration document + envoi + logs: src/server/services/documentSendingService.ts

Limite actuelle:
- Les flux UI critiques en production semblent encore principalement passer par n8n webhooks, pas uniformement par /api/email.

## 5) Risques principaux

1. Double architecture d'envoi
- Risque de divergence de templates, de tracking et de comportement selon le chemin utilise.

2. Mix provider (Brevo + SendGrid)
- Risque cout, maintenance, deliverability heterogene, incidents plus difficiles a diagnostiquer.

3. Recurrence non finalisee
- Weekly/marketing/reminders affiches en UI mais non garantis en execution automatique.

4. Observabilite fragmentee
- Logs presents, mais entre backend, n8n et Google Calendar la vision unifiee peut manquer.

## 6) Plan de remediation recommande (priorise)

## Phase 0 - Decision d'architecture (1 jour)

Objectif: choisir la source de verite des envois.

Option recommandee:
- Standardiser sur Backend API (/api/email) + n8n pour orchestration metier non-email.
- Maintenir temporairement n8n Master Hub comme fallback, puis decommissionner progressivement.

Livrable:
- ADR courte: "Single Email Dispatch Path".

## Phase 1 - Unification provider et events (2 a 3 jours)

Actions:
- Migrer Lead Actions Hub de SendGrid vers Brevo.
- Verifier toutes les clefs event_type et templates IDs.
- Definir un catalogue unique d'events (source de verite).

Done criteria:
- 100% des envois transactionnels via Brevo.
- Aucun node SendGrid dans workflows actifs.

## Phase 2 - Wiring frontend vers chemin unique (2 a 4 jours)

Actions:
- Remplacer appels directs webhooks critiques par endpoint backend securise (ou edge function unique qui route backend).
- Garder idempotence et retries.
- Ajouter correlation_id sur chaque envoi.

Done criteria:
- LeadReview et actions lead passent par le chemin unifie.
- Logs centralises exploitables par lead_id/correlation_id.

## Phase 3 - Recurrence reelle (3 a 5 jours)

Actions:
- Implementer scheduler fiable (cron/worker) pour:
  - weekly report selon preferences
  - emails marketing opt-in
  - reminders booking 24h/1h si non delegates uniquement a Google
- Consommer booking_reminders + notification_preferences.

Done criteria:
- Jobs planifies visibles et monitorables.
- Taux d'envoi trace par job run.

## Phase 4 - Qualite, governance, deliverability (2 a 3 jours)

Actions:
- KPIs: sent, delivered, opened, bounced, failed, latency.
- Alerting sur failure rate.
- Process template versioning (FR/EN/ES/AR).
- Tests de non-regression sur parcours emails critiques.

Done criteria:
- Dashboard operationnel de sante emailing.
- SLA d'envoi defini par type d'event.

## 7) Backlog manquant prioritaire (actionnable)

P0:
- Choix officiel du chemin unique d'envoi.
- Suppression progressive de SendGrid.
- Verification complete des triggers event_type reellement utilises.

P1:
- Moteur reminders 24h/1h Pretalk (si requis au-dela des emails Google Calendar).
- Weekly report automatique base sur preferences.
- Marketing campaign opt-in automatique (batch + desinscription).

P2:
- Segmentation avancee + A/B test templates.
- Scoring deliverability et warmup process.

## 8) Checklist de validation finale

- [ ] Un seul provider transactionnel actif (Brevo).
- [ ] Un seul point d'entree d'envoi pour le produit.
- [ ] Tous les events critiques testes end-to-end.
- [ ] Weekly/marketing/reminders executes automatiquement et monitorables.
- [ ] Preferences utilisateur effectivement respectees en execution.
- [ ] Dashboard et alerting operationnels.

## 9) Reponse directe a la question "ce qui est fait / pas fait"

Deja fait:
- Backend email complet (API + Brevo + logs/stats).
- Workflows n8n transactionnels coeur de funnel.
- Notification in-app et preferences stockees.
- Integration Google Calendar avec envoi updates.

Pas complet / manquant:
- Unification architecture (backend vs n8n direct).
- Uniformisation provider (presence SendGrid residuelle).
- Recurrence email weekly/marketing operationnelle de bout en bout.
- Moteur explicite des rappels 24h/1h Pretalk verifie en production.

---

Si tu veux, je peux enchainer directement avec la phase suivante:
1) proposer une ADR technique courte (decision d'architecture),
2) sortir une todo technique fichier par fichier,
3) preparer les patchs de migration vers le chemin d'envoi unique.

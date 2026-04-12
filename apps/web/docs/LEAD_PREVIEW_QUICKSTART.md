# ⚡ Lead Preview - Quick Summary & Action Items

**Date** : 17 Mars 2026  
**Status** : 🔴 CRITIQUE - Workflows non fonctionnels

---

## 🎯 En 30 Secondes

### État Actuel
- ✅ **UI/UX** : 7.5/10 - Bonne interface de visualisation
- ❌ **Workflows** : 2/10 - AUCUN workflow déclenché depuis le drawer
- ❌ **Scenarios** : Phases 2 & 3 absentes complètement

### Le Problème Principal
**Les boutons "Rejeter", "À revoir", "Qualifier" changent le statut MAIS ne déclenchent AUCUNE ACTION.**

```
Devrait arriver → Attend →  Vérification
Consultant clique "Qualifier"
    ↓
Lead passe à "qualified"
    + Audit généré ✅ N8N_GENERATE_AUDIT
    + Email sent ✅ SendGrid
    + Deep link LeadReview créé ✅ Open new tab
    + Log action ✅ lead_actions table

Réalité actuelle ❌
    ↓
Lead passe à "qualified"
    FIN. Rien d'autre.
```

---

## 📋 Checklist Rapide

### Avant Production
- [ ] Webhooks n8n connectés
- [ ] Table lead_actions créée
- [ ] Toast feedback + spinner UI
- [ ] Hot/cold lead badges
- [ ] Rejection reason modal
- [ ] Mobile responsive
- [ ] ARIA labels

### Tests Minimum
- [ ] Clic "Qualifier" → Webhook appelé
- [ ] lead_actions table peuplée
- [ ] Email envoyé au prospect
- [ ] Status reflété en live
- [ ] Score badges visibles (🔥 / ❄️)
- [ ] Rejection raison loggée

---

## 🚀 Actions Immédites (24h)

### 1️⃣ Créer leadActions.ts API
**File** : `src/lib/leadActions.ts`  
**Effort** : 2h  
**Impact** : CRITIQUE

```typescript
export const triggerLeadQualificationWorkflow = async (leadId, leadData) => {
  // POST to N8N_DEAL_WON_OPS_WEBHOOK
  // Log action to lead_actions table
};

export const logLeadAction = async (action) => {
  // Insert into Supabase lead_actions
};
```

### 2️⃣ Modifier LeadDetailsDrawer.tsx
**File** : `src/components/ReactApp/components/LeadDetailsDrawer.tsx`  
**Effort** : 2h  
**Impact** : CRITIQUE

```typescript
const handleStatusChange = async (id: string, newStatus: string) => {
  // 1. Update status
  // 2. IF "sent" → triggerLeadQualificationWorkflow()
  // 3. IF "rejected" → triggerLeadRejectionWorkflow()
  // 4. Show toast feedback + spinner
  // 5. Log action
};
```

### 3️⃣ Créer table lead_actions
**File** : `supabase/migrations/20260317_create_lead_actions.sql`  
**Effort** : 30m  
**Impact** : DATA

```sql
CREATE TABLE lead_actions (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  action_type ('qualified'|'rejected'|'reviewed'),
  action_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Problèmes Détectés

### 🔴 CRITIQUE

| # | Problème | Impact | Fix Time |
|---|----------|--------|----------|
| P1 | No workflow triggers from drawer buttons | Consultant actions don't cascade | 3h |
| P4 | No action logging | Pas de traçabilité | 2h |
| P2 | Drawer vs LeadReview redundancy | UX confusion | 1h planning |

### 🟠 HAUTE

| # | Problème | Impact | Fix Time |
|---|----------|--------|----------|
| P3 | No hot/cold lead visual cues | Consultant misses urgents | 2h |
| P5 | Old leads show raw keys (q1, q2) | Bad UX for old data | 1h |

### 🟡 MOYEN

| # | Problème | Impact | Fix Time |
|---|----------|--------|----------|
| P6 | No rejection reason capture | Lost context | 1h |
| P7 | Mobile layout cramped | Mobile users hurt | 1h |

---

## 📍 Fichiers Clés à Modifier

```
src/
├── lib/
│   ├── leadActions.ts              ← CREATE (NEW)
│   ├── n8n.ts                      ← Verify webhooks
│   └── supabase.ts                 ← Check connection
├── components/ReactApp/
│   └── components/
│       ├── LeadDetailsDrawer.tsx    ← MODIFY (ADD workflows)
│       └── Badges.tsx              ← EXTEND (hot/cold)
└── pages/
    └── Leads.tsx                   ← No changes needed

supabase/
└── migrations/
    └── 20260317_create_lead_actions.sql  ← CREATE (NEW)

n8n/
└── workflow_phase_c_proposition.json     ← UPDATE (handlers)
```

---

## 🎮 Workflows à Connecter

```
┌─────────────────────────┬──────────────────────────────────────┐
│ BUTTON ACTION           │ SHOULD TRIGGER                       │
├─────────────────────────┼──────────────────────────────────────┤
│ Qualifier (✅)          │ N8N_DEAL_WON_OPS_WEBHOOK             │
│                         │ + email "audit ready"                │
│                         │ + log to lead_actions                │
│                         │ + open LeadReview (optional)         │
├─────────────────────────┼──────────────────────────────────────┤
│ Rejeter (❌)            │ Log rejection reason                  │
│                         │ + notification to vendor (optional)  │
│                         │ + email to prospect (optional)       │
├─────────────────────────┼──────────────────────────────────────┤
│ À revoir (⏱️)           │ Create reminder task                  │
│                         │ + add to calendar                    │
│                         │ + send reminder email (24h before)   │
└─────────────────────────┴──────────────────────────────────────┘
```

---

## 🔗 Related Documents

1. **[LEAD_PREVIEW_ANALYSIS_2026.md](LEAD_PREVIEW_ANALYSIS_2026.md)** — Full analysis (9-section deep dive)
2. **[LEAD_PREVIEW_TECHNICAL_ROADMAP.md](LEAD_PREVIEW_TECHNICAL_ROADMAP.md)** — Code implementation guide

---

## 💡 Quick Wins (Low Hanging Fruit)

**Can do today** ⚡
1. Add spinner to buttons while processing (10m)
2. Show rejection reason prompt (20m)
3. Add hot/cold lead badge (1h)
4. Fix old lead q1/q2 display (30m)

**Can do this week** 📅
1. Create led_actions logging (2h)
2. Connect webhooks (3h)
3. Add ARIA labels (2h)
4. Mobile responsiveness (2h)

---

## 📈 Success Metrics

- [ ] Workflows trigger on button click
- [ ] 95% of lead actions logged
- [ ] < 500ms response time
- [ ] Mobile accessibility score > 80
- [ ] Zero console errors
- [ ] Consultant feedback: "Much faster!"

---

**Priority** : 🔴 URGENT — Blocking production  
**Owner** : Backend + Frontend team  
**Deadline** : End of this week


# 🚀 Lead Preview - Implémentation Complète

## 📋 Sommaire des Changements

Cette implémentation apporte une **UX/UI complète et fonctionnelle** dès le premier test, avec workflows n8n intégrés.

### ✅ Fichiers Créés

1. **`src/lib/leadActions.ts`** (287 lignes)
   - API wrapper pour tous les workflows N8N
   - Logging d'actions lead
   - Gestion des erreurs gracieuse

2. **`src/utils/leadTemperature.ts`** (130 lignes)
   - Détection hot/cold/warm leads
   - Badges avec emojis
   - Recommandations d'action

3. **`supabase/migrations/20260317_create_lead_actions_table.sql`**
   - Table audit trail `lead_actions`
   - RLS policies
   - Indexes pour performance

4. **`n8n/new/Pretalk_-_Lead_Actions_Hub.json`**
   - Nouveau workflow n8n pour routage d'actions
   - Logging automatique
   - Notifications email


### ✏️ Fichiers Modifiés

1. **`src/components/ReactApp/components/LeadDetailsDrawer.tsx`** (Rewrite complet)
   - Imports d'actions et workflows
   - État pour loading/processing
   - Hot/cold lead alert banner
   - Boutons avec spinners
   - ARIA labels pour accessibilité
   - Mobile responsivité améliorée
   - Toast feedback intégré

2. **`.env.local`**
   - Ajout webhooks N8N manquants
   - Nouvelle var `VITE_N8N_LEAD_ACTIONS_WEBHOOK`

3. **`src/components/ReactApp/lib/n8n.ts`**
   - Ajout webhooks manquants
   - Nouvelle map `N8N_WEBHOOKS_MAP` pour debug

---

## 🎮 Flux d'Utilisation - Étape par Étape

### Étape 1 : Migration Supabase
```bash
# Exécuter la migration
npx supabase db push
```

Cela crée :
- Table `lead_actions` avec RLS
- Indexes pour performance
- Triggers pour `updated_at`

### Étape 2 : Configuration .env
Les webhooks sont déjà dans `.env.local`. Vérifier qu'ils pointent vers vos instances N8N.

### Étape 3 : Déployer N8N Workflows

Import les workflows dans n8n (en ordre) :
1. `Pretalk_OS_4_0_Phase_D_v2.json` (Deal Won Ops) ← Déjà existe
2. `Pretalk_-_Lead_Actions_Hub.json` ← NOUVEAU

### Étape 4 : Test Complet

#### Cas 1 : Lead Qualifié (Hot Lead)
```
1. Ouvrir Leads page
2. Trouver lead avec score > 80 (ex: 85)
3. Cliquer sur le lead → Drawer ouvre
4. Banner 🔥 "Hot Lead" appear
5. Cliquer "Qualifier"
   ✅ Spinner appear
   ✅ Toast "Qualification en cours..."
   ✅ N8N webhook appelé
   ✅ Email envoyé au consultant
   ✅ lead_actions table loggée
   ✅ Option d'ouvrir LeadReview
```

#### Cas 2 : Lead Rejeté (Cold Lead)
```
1. Ouvrir Leads page
2. Trouver lead avec score < 30
3. Cliquer sur le lead → Drawer ouvre
4. Banner ❄️ "À Qualifier" appear
5. Cliquer "Rejeter"
   ✅ Prompt demande raison
   ✅ Status change "rejected"
   ✅ Action loggée avec raison
   ✅ Toast feedback
```

#### Cas 3 : Lead À Revoir
```
1. Cliquer "À revoir"
   ✅ Status change "reviewed"
   ✅ Reminder logged
   ✅ Toast "À revoir — Rappel programmé"
```

---

## 🧪 Validation Techniques

### Console Logs à Vérifier
```javascript
// Quand lead qualifié :
[Lead Qualification] Starting for lead abc123
[Lead Qualification] Payload: {...}
[Lead Qualification] Triggered successfully (1240ms)
[LeadActions] Action logged: qualified abc123

// Quand lead rejeté :
[Lead Rejection] Logging rejection for lead abc123. Reason: Pas un bon fit
[LeadActions] Action logged: rejected abc123
```

### Supabase Checks
```sql
-- Vérifier que les actions sont loggées
SELECT * FROM lead_actions 
WHERE lead_id = 'abc123'
ORDER BY created_at DESC;

-- Doit retourner :
id    | lead_id | action_type | action_reason | created_at
------|---------|-------------|---------------|-------------------
xxx   | abc123  | qualified   | NULL          | 2026-03-17 10:45:23+00
yyy   | abc123  | rejected    | Pas un b...   | 2026-03-17 10:44:15+00
```

### N8N Workflow Checks
```
1. Open n8n UI
2. Go to Workflows → Pretalk_OS_4_0_Phase_D
3. Check execution logs
4. Should see:
   - Lead data received
   - Supabase update successful
   - Email sent
   - Response returned
```

---

## 🎨 Comportement UX/UI

### Lead Preview Drawer - États

#### 1. État Normal
```
┌─────────────────────────────────┐
│ [Lead Name]     Company   [X]   │
├─────────────────────────────────┤
│ Score | Date | Status           │
├─────────────────────────────────┤
│ 🧠 Analyse IA                   │
│ 📄 Réponses                     │
│ 💬 Conversation                 │
├─────────────────────────────────┤
│ Rejeter | À revoir | Qualifier  │
└─────────────────────────────────┘
```

#### 2. État Hot Lead (Score > 80)
```
┌─────────────────────────────────┐
│ ┌───────────────────────────┐   │
│ │ 🔥 Hot Lead               │   │
│ │ Call immediately — High   │   │
│ │ closing probability       │   │
│ └───────────────────────────┘   │
│                                 │
│ [Rest of drawer...]             │
└─────────────────────────────────┘
```

#### 3. État avec Spinner
```
┌────────────────────────────────┐
│ [Rejeter | À revoir | ⟳ 〰️]   │
│           En cours...          │
└────────────────────────────────┘
```

### Toast Feedback

| Action | Feedback |
|--------|----------|
| Qualify | "Lead qualifié ✓ Prochain : Consultez le dossier complet" |
| Reject | "Lead rejeté — Pas un bon fit" |
| Review | "À revoir — Rappel programmé" |

---

## 🔧 Troubleshooting

### Problème : Boutons ne répondent pas
**Solution** :
```
1. Vérifier console pour erreurs
2. Vérifier que FeedbackContext est fourni
3. Vérifier que leadActions.ts est importé correctement
4. Vérifier webhooks n8n dans .env
```

### Problème : N8N webhook timeout
**Solution** :
```
1. Vérifier que n8n est running
2. Vérifier URL webhook dans n8n UI
3. Vérifier que le workflow est "Active"
4. Vérifier Supabase credentials dans n8n
```

### Problème : lead_actions table vide
**Solution** :
```
1. Vérifier que migration a été appliquée
   → SELECT * FROM information_schema.tables WHERE table_name = 'lead_actions';
2. Vérifier RLS policies
   → SELECT * FROM pg_policies WHERE tablename = 'lead_actions';
```

### Problème : Mobile drawer écrasé
**Solution** :
```
Code gère automatiquement :
- max-w-2xl sur desktop
- max-w-full sur mobile
- Padding réduit sur petit écran
- Boutons en grid 3 colonnes →  empilés si besoin
```

---

## 📊 Métriques de Succès

After implementation, you should see:

✅ **Qualité UX**
- [ ] Boutons répondent immédiatement (< 100ms)
- [ ] Spinners visibles pendant workflow
- [ ] Toast feedback clair et approprié
- [ ] Drawer responsive sur mobile
- [ ] Hot/cold badges visibles

✅ **Workflows Exécution**
- [ ] N8N webhooks appelés avec payload correct
- [ ] Supabase lead_actions loggée
- [ ] Emails envoyés aux bons destinataires
- [ ] Statut lead mis à jour en temps réel
- [ ] Pas d'erreurs console

✅ **Données Intégrité**
- [ ] lead_actions table peuplée
- [ ] Raisons rejection loggées
- [ ] Métadata JSON valide
- [ ] Timestamps corrects

✅ **Performance**
- [ ] Webhook response < 2 secondes
- [ ] Supabase update < 500ms
- [ ] UX ne freeze jamais
- [ ] Pas de memory leaks

---

## 🎓 Prochaines Étapes (Phase 2)

1. **Intégration Calendar**
   - Bouton "Prévoir appel" depuis drawer
   - Sync avec Google Calendar
   - Reminder 15 min avant

2. **Notes d'Appel**
   - Textarea pour notes en temps réel
   - Save → lead.notes
   - Sync avec audit

3. **Audit Generation Auto**
   - Clic "Qualifier" → Auto-generate audit
   - Notification quand prêt

4. **Proposal Preview**
   - Bouton depuis drawer
   - Modal preview des 3 options
   - Direct send

---

## 📞 Support

Si erreur :
1. Vérifier syntax JavaScript (ESLint)
2. Vérifier imports et paths
3. Vérifier n8n logs
4. Vérifier Supabase logs
5. Vérifier console browser

---

**Implémentation complétée** : 17 Mars 2026  
**Status** : ✅ **PRÊT POUR TEST**  
**Durée estimation** : 2-3h déploiement + test


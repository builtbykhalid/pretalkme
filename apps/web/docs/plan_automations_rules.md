# Plan — Règles Automatiques : Fonctionnement Complet

**Date :** 2026-04-03  
**Scope :** Page Automations, onglet "Règles Automatiques" + connexion réelle aux actions du pipeline

---

## Diagnostic : Ce qui existe vs ce qui fonctionne

### Ce qui existe (UI uniquement)
- Onglet "Règles Automatiques" avec 2 sections :
  1. **Kickoff mode** : `custom` (IA) vs `global` (formulaire universel)
  2. **Passages automatiques** : 4 toggles `auto_step_audit/rdv/proposal/won`
- Les toggles **sauvegardent** dans `userProfile.automations_config` via `updateProfile()`

### Ce qui ne fonctionne PAS
| Problème | Fichier | Détail |
|---|---|---|
| `automations_config` absent du type `UserProfile` | `AppContext.tsx:144-207` | Colonne n'est pas typée → usage via `any` |
| Aucune migration Supabase | `supabase/migrations/` | Colonne `automations_config` JSONB absente |
| Auto-steps jamais exécutés | `usePhaseButton.ts`, `PhaseActionButton.tsx` | `onSuccess` n'appelle pas `updateLeadStatus()` |
| `kickoff_mode` jamais lu | `LeadReview.tsx` | Le mode est sauvegardé mais ignoré |
| Bug encodage onglet | `Automations.tsx:252` | `'R\uFFFDgles'` au lieu de `'Règles Automatiques'` |
| Disconnect taxonomie status | `leadStatusService.ts:18-27` | Statuts DB (`new/contacted/qualified...`) ≠ labels UI pipeline |
| `email_automation_preferences` isolé | `AppContext.tsx:197-206` | Règles email séparées des règles auto → confusion UX |

---

## Architecture cible

```
Automations Config (profiles.automations_config JSONB)
{
  kickoff_mode: 'custom' | 'global',
  auto_step_audit: boolean,      // Nouveau → Audit Envoyé
  auto_step_rdv: boolean,        // Audit Envoyé → RDV Fixé
  auto_step_proposal: boolean,   // RDV Fixé → Proposition Envoyée
  auto_step_won: boolean,        // Proposition → Gagné / Kickoff
}
```

**Mapping auto-step → statuts DB (leadStatusService) :**
| Règle auto | Trigger | Statut actuel → nouveau statut |
|---|---|---|
| `auto_step_audit` | `triggerPdfGeneration` success | `new` → `contacted` |
| `auto_step_rdv` | booking confirmé (webhook n8n) | `contacted` → `qualified` |
| `auto_step_proposal` | `sendProposals` success | `qualified` → `proposal_sent` |
| `auto_step_won` | `triggerContractGeneration` success | `proposal_sent` → `negotiating` → `won` |

> **Note :** Les labels UI ("Audit Envoyé", "Rendez-vous Fixé") sont des étapes produit.  
> Les statuts DB sont la taxonomie technique. Garder les deux, les mapper explicitement.

---

## Plan d'implémentation

### Étape 1 — Fondation de données (30 min)

**1a. Type `UserProfile` — `AppContext.tsx:144-207`**

Ajouter le champ typé :
```typescript
automations_config?: {
  kickoff_mode?: 'custom' | 'global';
  auto_step_audit?: boolean;
  auto_step_rdv?: boolean;
  auto_step_proposal?: boolean;
  auto_step_won?: boolean;
};
```

**1b. Migration Supabase**

Créer `supabase/migrations/YYYYMMDDXXXXXX_add_automations_config.sql` :
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS automations_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.automations_config IS
  'Règles automatiques : kickoff_mode, auto_step_audit, auto_step_rdv, auto_step_proposal, auto_step_won';
```

---

### Étape 2 — Fix encodage + UX (15 min)

**2a. Bug encodage — `Automations.tsx:252`**

Remplacer `'R\uFFFDgles Automatiques'` par `'Règles Automatiques'`  
(ou utiliser la clé i18n `t('automations.tabs.rules')` avec la traduction correcte)

**2b. Tab par défaut**

Changer `useState<...>('integrations')` → `useState<...>('rules')` si on veut que les règles soient en avant (ou garder `integrations` si les intégrations restent le point d'entrée).

---

### Étape 3 — Connexion auto-steps au pipeline (cœur du plan)

C'est la partie la plus importante : **les règles doivent déclencher de vraies transitions de statut**.

**3a. Créer un hook `useAutomationRules` — nouveau fichier**  
`src/components/ReactApp/hooks/useAutomationRules.ts`

```typescript
import { useApp } from '../context/AppContext';
import { useCallback } from 'react';

export function useAutomationRules() {
  const { userProfile, updateLeadStatus } = useApp();
  const config = userProfile?.automations_config ?? {};

  const tryAutoStep = useCallback(async (
    ruleKey: keyof typeof config,
    leadId: string,
    targetStatus: string
  ) => {
    if (!config[ruleKey]) return; // règle désactivée
    await updateLeadStatus(leadId, targetStatus);
  }, [config, updateLeadStatus]);

  return { tryAutoStep, config };
}
```

**3b. Câbler dans `usePhaseButton.ts` via `onSuccess`**

Dans `PhaseActionButton.tsx`, passer un `onSuccess` qui appelle `tryAutoStep`. Le mapping :

| `webhookAction` | `ruleKey` | `targetStatus` |
|---|---|---|
| `triggerPdfGeneration` | `auto_step_audit` | `'contacted'` |
| `triggerProposalGen` | `auto_step_proposal` | `'proposal_sent'` |
| `triggerContractGeneration` | `auto_step_won` | `'won'` |

**3c. Pour `auto_step_rdv` (booking confirmé)**

La règle RDV est différente : le trigger vient de n8n (webhook entrant) ou du calendrier,  
pas d'un bouton UI. Deux options :

- **Option A (simple)** : Déclencher via Supabase Realtime — quand `lead_generation_states` reçoit `phase='booking' AND status='success'` → vérifier la règle et avancer le statut.
- **Option B (recommandée pour maintenant)** : Dans `LeadReview.tsx`, au moment où l'utilisateur confirme manuellement qu'un RDV est fixé (bouton existant), appeler `tryAutoStep('auto_step_rdv', leadId, 'qualified')`.

Partir sur l'Option B pour rester synchrone avec le reste de la logique.

---

### Étape 4 — Kickoff mode (20 min)

Dans `LeadReview.tsx`, au moment de déclencher `generateKickoff` :

```typescript
const { config } = useAutomationRules();

// Dans le PhaseActionButton du kickoff :
const kickoffPayload = {
  lead_id: leadId,
  mode: config.kickoff_mode ?? 'custom',
  // Si 'global', passer l'ID du formulaire universel
  global_form_id: config.kickoff_mode === 'global' ? globalKickoffFormId : undefined,
};
```

Le webhook n8n (`N8N_GENERATE_FORMS_WEBHOOK`) doit recevoir `mode` et adapter sa logique en conséquence. Côté UI, il faut ajouter un sélecteur de formulaire universel dans les Settings (ou dans l'onglet Règles) pour choisir quel formulaire est le "global".

---

### Étape 5 — Refonte UX de l'onglet Règles (optionnel mais recommandé)

**Problème actuel :** l'onglet mélange deux concepts dans une même page sans hiérarchie claire.

**Proposition de refonte — 3 sections distinctes :**

```
┌─────────────────────────────────────────────────┐
│  RÈGLES AUTOMATIQUES                            │
├─────────────────────────────────────────────────┤
│  📧 Emails automatiques                         │
│  (déplacé depuis Settings > Email)              │
│  · Envoyer l'audit auto après génération        │
│  · Envoyer le contrat auto après signature      │
├─────────────────────────────────────────────────┤
│  🔄 Passages de pipeline automatiques           │
│  (les 4 toggles actuels)                        │
├─────────────────────────────────────────────────┤
│  🚀 Comportement Kickoff                        │
│  · Mode IA / Mode universel                     │
│  · Si universel : sélecteur de formulaire       │
└─────────────────────────────────────────────────┘
```

Avantage : tout ce qui est "automatique" est au même endroit, plus de dispersion entre Settings et Automations.

---

### Étape 6 — Visibilité d'exécution (nice-to-have)

Afficher sous chaque règle la dernière fois qu'elle a été déclenchée :

```typescript
// Dans automations_config ou dans une nouvelle table
last_triggered?: {
  auto_step_audit?: string; // ISO date
  auto_step_rdv?: string;
  auto_step_proposal?: string;
  auto_step_won?: string;
}
```

---

## Ordre d'exécution recommandé

```
1. [BUG]    Fix encodage onglet (2 min)
2. [DATA]   Type UserProfile + migration SQL (20 min)
3. [HOOK]   Créer useAutomationRules.ts (20 min)
4. [WIRE]   Câbler PhaseActionButton onSuccess → auto-steps (30 min)
5. [KICKOFF] Lire kickoff_mode dans LeadReview (20 min)
6. [UX]     Refonte layout onglet Règles (45 min)
```

**Total estimé : ~2h30 de développement**

---

## Risques et précautions

| Risque | Mitigation |
|---|---|
| Double-avancement statut (bouton + auto) | Vérifier le statut courant avant d'appeler `updateLeadStatus` |
| `updateLeadStatus` viole les transitions valides | `leadStatusService.VALID_TRANSITIONS` le catch déjà |
| `automations_config` null au premier login | Défault `{}` dans le type + vérif `?? {}` à chaque lecture |
| n8n `generateKickoff` ne supporte pas encore `mode` | Préparer le payload côté UI d'abord, mettre à jour le workflow n8n ensuite |

---

## Fichiers à modifier

| Fichier | Action |
|---|---|
| `src/components/ReactApp/context/AppContext.tsx` | Ajouter `automations_config` dans `UserProfile` |
| `supabase/migrations/XXXXXX_add_automations_config.sql` | Nouveau fichier |
| `src/components/ReactApp/pages/Automations.tsx` | Fix encodage, layout refonte |
| `src/components/ReactApp/hooks/useAutomationRules.ts` | Nouveau fichier |
| `src/components/ReactApp/components/PhaseActionButton.tsx` | Passer `onSuccess` avec `tryAutoStep` |
| `src/components/ReactApp/pages/LeadReview.tsx` | Lire `kickoff_mode`, câbler `auto_step_rdv` |

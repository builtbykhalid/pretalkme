# Plan UI — Lead Review Redesign

> Référence : screenshots Linear/Notion-style (task detail panel) + Data Catalog SaaS (table + left nav)  
> Objectif : cohérence, modernité, responsive, pipeline intuitif sans locks

---

## 1. Problèmes actuels identifiés

| Problème | Impact |
|---|---|
| `absolute inset-0 z-[30]` sur LeadReview — overlay hacky | Sidebar visible derrière, layout instable |
| DashboardLayout ignore `/leads/:id` dans `isImmersivePage` | Sidebar app reste ouverte, double sidebar |
| Stepper horizontal en haut — masqué sur mobile, peu lisible | Pipeline illisible, pas moderne |
| Phases "locked" = `cursor-not-allowed`, non cliquables | UX frustrante — on ne peut pas naviguer librement |
| Boutons différents par phase dans le header | Incohérence totale entre les onglets |
| Overview = juste des cards texte basiques | Pas d'analytics, pas de valeur visuelle |
| Aucune unité de style entre les tabs | Chaque phase ressemble à une app différente |
| Pas de responsive mobile propre | Layout cassé sur petits écrans |

---

## 2. Architecture — Changements Layout

### 2.1 DashboardLayout — déclarer `/leads/:id` comme immersive

```tsx
// DashboardLayout.tsx
const isImmersivePage = 
  pathname.includes('/my-profile') || 
  pathname.includes('/forms/') ||
  /\/leads\/[^/]+/.test(pathname);  // ← AJOUT
```

→ La sidebar app se ferme automatiquement au niveau layout quand on entre dans un lead.  
→ Plus besoin du hack `absolute inset-0 z-[30]` dans LeadReview.

### 2.2 LeadReview — nouveau layout global

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR  [← Back]  [Lead Name · Company]         [Actions] │  h-14
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  PIPELINE    │           CONTENT AREA                       │
│  LEFT        │           (scrollable)                       │
│  SIDEBAR     │                                              │
│  w-56        │                                              │
│  (fixed)     │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**LeadReview wrapper :**
```tsx
<div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
  <PipelineLeftSidebar ... />
  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
    <LeadTopBar ... />
    <div className="flex-1 overflow-y-auto">
      {renderActivePhase()}
    </div>
    <LeadActionBar ... />   {/* barre d'actions unifiée en bas */}
  </div>
</div>
```

---

## 3. Composant : PipelineLeftSidebar (nouveau)

Inspiré du screenshot #1 (menu gauche Linear/ClickUp) — vertical, épuré, fixe.

### Structure visuelle

```
┌─────────────────────┐
│ 🔵 Lead Name        │  ← titre raccourci
│    Company          │  ← sous-titre
├─────────────────────┤
│  Pipeline           │  ← label section
│                     │
│  ✓ Overview         │  ← completed = vert plein
│  │                  │
│  ✓ Audit            │  ← completed
│  │                  │
│  ● Offres           │  ← active = point animé vert
│  │                  │
│  ○ Contrat          │  ← disponible mais pas fait
│  │                  │
│  ○ Kickoff          │
│  │                  │
│  ○ Finance          │
├─────────────────────┤
│ Score: 78/100  🟢   │  ← badge score
│ Statut: En cours    │
├─────────────────────┤
│ [⚙ Paramètres]      │  ← settings drawer trigger
│ [📋 Consultation]   │  ← consultation drawer trigger
└─────────────────────┘
```

### Specs design

- **Width** : `w-56` (224px) sur desktop, collapse/drawer sur mobile
- **Background** : `bg-white border-r border-[#EBEBEB]`
- **Phase item** :
  - Hauteur : `h-11`
  - Active : `bg-[#F0FDF4] text-[#16A34A] font-bold border-r-2 border-[#22C55E]`
  - Completed : icône `✓` verte, texte `text-[#374151]`, clickable
  - Disponible (was "locked") : texte `text-[#9CA3AF]`, clickable **sans restriction** — juste état visuel
  - **SUPPRESSION du lock** : toutes les phases sont cliquables, le state "locked" devient juste un style grisé sans `cursor-not-allowed`
- **Connector** : ligne verticale `w-[2px] bg-[#E5E7EB]`, verte si completed
- **Score badge** en bas : pill `bg-[#F0FDF4] text-[#16A34A]` avec `{score}/100`
- **Mobile** : drawer slide-in depuis la gauche, trigger = hamburger dans topbar

---

## 4. Composant : LeadTopBar (refactorisé)

Remplacement de l'actuel header chaotique avec boutons différents par phase.

### Specs

```
[← Leads]  [Lead Name]  [Company · Phase courante]        [Score 78]  [···]
```

- Hauteur : `h-14`
- Background : `bg-white border-b border-[#EBEBEB]`
- **Gauche** : bouton retour `←` + breadcrumb `Leads / [Nom]`
- **Centre** (mobile only) : nom phase active
- **Droite** : badge score + menu `···` (Settings, Consultation)
- **Pas de boutons d'action dans le topbar** — ils migrent dans la `LeadActionBar`

---

## 5. Composant : LeadActionBar (nouveau — sticky bottom)

Barre d'actions **unifiée et cohérente** pour toutes les phases, en bas de la content area.

```
┌─────────────────────────────────────────────────────────────┐
│  [💾 Enregistrer]          [Action principale phase] →      │
└─────────────────────────────────────────────────────────────┘
```

### Par phase

| Phase | Action gauche | Action principale (droite) |
|---|---|---|
| A — Overview | — | `[✨ Générer l'audit →]` |
| B — Audit | `[💾 Sauvegarder]` `[🔄 Ré-générer]` | `[📄 Générer PDF]` `[📤 Envoyer]` |
| C — Offres | `[💾 Sauvegarder]` | `[📊 Générer Devis]` `[📤 Envoyer offres]` |
| D — Contrat | `[💾 Sauvegarder]` | `[✍ Générer contrat]` `[✅ Marquer signé]` |
| E — Kickoff | — | `[🚀 Générer formulaire]` `[📤 Envoyer]` |
| F — Finance | — | `[+ Enregistrer deal]` |

### Specs design

- **Height** : `h-16` sticky bottom
- **Background** : `bg-white border-t border-[#EBEBEB] px-6`
- **Bouton sauvegarde** : `bg-white border border-[#E5E7EB] text-[#374151] rounded-xl`  
- **Bouton action principale** : `bg-[#0D0D0D] text-white rounded-xl` ou `bg-[#22C55E]` si action positive (envoi)
- **Loading state** : spinner inline, texte dynamique `"En cours..."`
- **State conditionnel** : bouton "Envoyer" désactivé si PDF pas encore généré (tooltip explicatif)

---

## 6. Phase A — Overview (refonte analytics)

Inspiré screenshot #1 (panneau detail avec sections structurées) + cards analytics modernes.

### Layout

```
┌──────────────────────────────────────────────────────┐
│  KPI STRIP  [Score 78]  [Réponses 12]  [Statut: ●]  │  h-20 bg-white border-b
├─────────────────┬────────────────────────────────────┤
│                 │                                    │
│  Radar Chart    │  Contact                           │
│  (Chart.js /   │  Nom / Email / Entreprise / Tel     │
│   SVG inline)   │                                    │
│  w-1/3          │  Réponses client                   │
│                 │  (liste scrollable)                │
│                 │                                    │
└─────────────────┴────────────────────────────────────┘
│  Consultation card   │   Pipeline progress card      │
└──────────────────────┴───────────────────────────────┘
```

### KPI Strip

Bande horizontale de 3-4 métriques clés :

```tsx
<div className="grid grid-cols-4 divide-x border-b bg-white">
  <KpiCell label="Score IA" value="78/100" color="green" />
  <KpiCell label="Réponses" value="12" />
  <KpiCell label="Statut" value="En cours" badge />
  <KpiCell label="Créé le" value="12 jan 2025" />
</div>
```

### Radar Chart

- Librairie : `recharts` (déjà probable dans le projet) ou SVG inline simple
- Données : `chartData.labels` + `chartData.scores` (déjà disponibles)
- Style : couleurs `#22C55E` (fill) + `#221A40` (stroke)
- Taille : `w-full max-w-[240px] aspect-square`

### Cards redesign

- Coins : `rounded-2xl` (garder le style existant)
- Shadow : `shadow-sm` uniquement
- Padding : `p-5`
- Label section : `text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3`
- Valeur info : row avec icon + text, pas de box séparée par info
- **Avant** : chaque info = une carte individuelle `bg-[#FBFBFB]`
- **Après** : liste compacte `divide-y divide-[#F3F4F6]` avec icon + label + valeur inline

---

## 7. Phase B — Audit (style cohérent)

### Ajouts / fixes

- Supprimer le split `mobileTab`/`editorTab` visible — utiliser des tabs inline discrets
- **Tab switcher** pour l'audit : `[Contenu]  [Design]  [Aperçu]` — pills style, aligné en haut du content area
- Zone d'édition : bordure `border border-[#E5E7EB] rounded-2xl` avec toolbar sticky interne
- Generating banner : passer en overlay fullscreen (pas inline)

---

## 8. Phase C — Offres (style cohérent)

### Ajouts / fixes

- Cards d'offres : style unifié avec Phase B (même border-radius, même shadow)
- Éditeur devis inline : accordion par offre, pas de toggle séparé
- Status badge par offre (draft / pdf ready / sent) — pill colorée visible
- Sélecteur d'offres à envoyer : checkboxes plus claires

---

## 9. Phase D — Contrat

- Éditeur de contrat : style cohérent avec AuditEditor (même wrapper)
- Signature status : banner vert `bg-[#F0FDF4]` avec check si signé

---

## 10. Phases E/F — Kickoff & Finance

- Kickoff : card centrée avec lien formulaire + bouton envoi email — style simple, pas surchargé
- Finance : table simple ou cards pour les deals enregistrés

---

## 11. Fixes Lock System

**Actuel** : phases `locked` → `cursor-not-allowed`, `onPhaseClick` bloqué dans le composant  
**Nouveau** :
- Toutes les phases sont **cliquables** sans restriction
- Le state `locked` ne bloque plus la navigation
- Si on clique sur une phase non encore atteinte : afficher un banner contextuel dans le content area du type :
  ```
  ⚠️ Cette phase nécessite de compléter l'Audit d'abord.  [Aller à l'Audit →]
  ```
- Supprimer l'icône `<Lock>` — remplacer par un cercle vide `○` avec couleur `text-[#D1D5DB]`
- **`isClickable`** dans `LeadPipelineStepper` = `true` pour **toutes** les phases

---

## 12. Responsive Mobile

| Élément | Desktop | Mobile |
|---|---|---|
| Pipeline sidebar | `w-56` fixe à gauche | Hidden — drawer triggered par bouton pipeline dans topbar |
| Topbar | full | compact (juste ← + nom + ···) |
| Content area | scroll vertical | scroll vertical |
| ActionBar | sticky bottom full | sticky bottom full |
| KPI strip | 4 colonnes | 2×2 grid |
| Charts | visibles | cachés (accordion toggle) |

---

## 13. Tokens de design unifiés

À appliquer de façon **cohérente** dans toutes les phases :

```css
/* Surfaces */
--bg-page: #F8F9FA
--bg-card: #FFFFFF
--bg-subtle: #F9FAFB
--border: #E5E7EB
--border-strong: #D1D5DB

/* Texte */
--text-primary: #111827
--text-secondary: #6B7280
--text-muted: #9CA3AF
--text-label: #9CA3AF + uppercase + tracking-widest + text-[10px]

/* Accents */
--green-primary: #22C55E
--green-bg: #F0FDF4
--green-border: #BBF7D0

/* Shapes */
--radius-card: 16px (rounded-2xl)
--radius-btn: 10px (rounded-xl)
--radius-pill: 999px (rounded-full)

/* Shadow */
--shadow-card: 0 1px 3px rgba(0,0,0,0.06)
```

---

## 14. Ordre d'exécution

1. **[LAYOUT]** `DashboardLayout.tsx` — ajouter `/leads/:id` dans `isImmersivePage`
2. **[LAYOUT]** `LeadReview.tsx` — supprimer `absolute inset-0 z-[30]`, nouveau wrapper flex
3. **[COMPOSANT]** Créer `PipelineSidebar.tsx` — remplace `LeadPipelineStepper.tsx`
4. **[COMPOSANT]** Créer `LeadActionBar.tsx` — barre d'actions unifiée sticky bottom
5. **[COMPOSANT]** Refactorer `LeadTopBar` inline dans LeadReview
6. **[PHASE A]** Refonte Overview — KPI strip + radar chart + cards redesign
7. **[PHASE B]** Audit — tab switcher + style unifié
8. **[PHASES C/D/E/F]** Appliquer tokens cohérents
9. **[FIX]** Lock system — rendre toutes phases cliquables
10. **[RESPONSIVE]** Mobile sidebar drawer + breakpoints

# Plan 05 — Audit Landing Page (Conversion-First)

> **Objectif** : Remplacer la generation PDF d'audit par une **landing page de conversion** publique, integree au systeme de profil du consultant, heritant de ses couleurs/polices, et alimentee par les outputs N8N.

---

## Partie 1 — Analyse du workflow N8N actuel

### 1.1 Pipeline actuel (Pretalk_-_Analyste_V2_3_FINAL)

```
Webhook (new-lead / regenerate)
  → Get Lead Details (Supabase)
  → Get Form Context
  → Get Agent Focus (optionnel)
  → Get Consultant Profile
  → Extract & Prepare Variables
  → 3 branches paralleles :
      ├─ Jina AI (scrape site) → Gemini Flash (Site Summary)
      ├─ Gemini Flash (Lead Scoring) → JSON {score, breakdown, justification, first_call_angle}
      └─ Gemini Pro (Market Research) → prose 10-14 lignes
  → Prepare Master Prompt (assemble persona + context + scoring + market)
  → Gemini Pro (Master Copywriter) → JSON final
  → Parse Final JSON (validation)
  → Update Lead DB (leads.ai_analysis_json + score + status=to_review)
  → Respond — Audit Ready
```

### 1.2 Output JSON actuel (sauvegarde dans `leads.ai_analysis_json`)

```json
{
  "client_graph": {
    "label_unite": "€",
    "valeur_inaction": 15000,
    "valeur_potentiel": 50000
  },
  "visualizations": [
    {
      "id": "viz-1",
      "type": "bar|line|table",
      "title": "...",
      "label_unite": "€",
      "page_index": 3,
      "enabled": true,
      "points": [{"label": "...", "value": 123}]
    }
  ],
  "audit_blocks": [
    {"id": "intro", "zone": "main", "title": "...", "content": "<p>...</p>"},
    {"id": "forts", "zone": "main", "title": "...", "content": "<ul>...</ul>"},
    {"id": "faibles", "zone": "main", "title": "...", "content": "<ul>...</ul>"},
    {"id": "recos", "zone": "main", "title": "...", "content": "<ul>...</ul>"},
    {"id": "cta", "zone": "main", "title": "...", "content": "<p>...</p>"}
  ],
  "chart_data": {
    "labels": ["Strategie","Execution","Ressources","Opportunites"],
    "scores": [75, 60, 45, 80]
  }
}
```

### 1.3 Problemes identifies dans les outputs N8N

| Probleme | Impact | Solution proposee |
|----------|--------|-------------------|
| `audit_blocks` trop generiques (5 blocs: intro/forts/faibles/recos/cta) | Ne permet pas la structure landing page riche | Imposer 8-9 blocs semantiques dans le prompt (voir 2.2) |
| Pas de champ `hero_headline` / `hero_subline` | Pas de section hero accrocheuse | Ajouter au schema JSON demande |
| Pas de `checklist` dans le schema | Pas de bloc "checklist de mise en place" | Ajouter un bloc `checklist` dans les output_rules |
| `chart_data` duplique `visualizations` | Confusion frontend | Fusionner en un seul systeme `visualizations` |
| Pas de metadata pour images/layout | Consultant ne peut pas associer images aux blocs | Ajouter `image_url` et `image_position` optionnels par bloc |
| Pas de `cta_config` structure | CTA basique | Ajouter un objet CTA avec `booking_url`, `cta_label`, `cta_sublabel` |
| `page_index` inutile (etait pour PDF) | Dead field | Supprimer du schema |

---

## Partie 2 — Nouveau schema JSON d'audit (landing page-first)

### 2.1 Schema JSON cible (output N8N → `leads.ai_analysis_json`)

```json
{
  "version": 2,
  "hero": {
    "headline": "Audit Digital personnalise pour {{lead_company}}",
    "subline": "Prepare par {{consultant_name}}, {{consultant_job}}",
    "score": 78,
    "score_label": "Score de maturite digitale"
  },
  "context_block": {
    "title": "Votre situation analysee",
    "content": "<p>Texte montrant que le consultant comprend le prospect...</p>",
    "highlights": ["Signal 1 du formulaire", "Signal 2 du site", "Signal 3 du marche"]
  },
  "checklist": {
    "title": "Les fondamentaux a mettre en place",
    "items": [
      {"label": "Strategie de contenu", "status": "missing|partial|ok"},
      {"label": "Tunnel de conversion", "status": "missing"},
      {"label": "Tracking analytics", "status": "partial"}
    ]
  },
  "visualizations": [
    {
      "id": "viz-1",
      "type": "bar",
      "title": "Cout de l'inaction sur 6 mois",
      "label_unite": "€",
      "enabled": true,
      "points": [
        {"label": "Sans action", "value": 15000},
        {"label": "Avec optimisation", "value": 50000}
      ]
    },
    {
      "id": "viz-2",
      "type": "radar",
      "title": "Maturite par axe",
      "label_unite": "/100",
      "enabled": true,
      "points": [
        {"label": "Strategie", "value": 75},
        {"label": "Execution", "value": 60},
        {"label": "Ressources", "value": 45},
        {"label": "Opportunites", "value": 80}
      ]
    }
  ],
  "analysis_block": {
    "title": "Resultats de l'analyse",
    "content": "<p>Prose d'analyse de marche et du prospect...</p>"
  },
  "problems_block": {
    "title": "Problemes centraux identifies",
    "items": [
      {"title": "Probleme 1", "description": "Description...", "severity": "critical|high|medium"},
      {"title": "Probleme 2", "description": "Description...", "severity": "high"}
    ]
  },
  "solutions_block": {
    "title": "Axes de resolution recommandes",
    "items": [
      {"title": "Solution 1", "description": "Description sans donner le comment...", "impact": "Fort"},
      {"title": "Solution 2", "description": "Description...", "impact": "Moyen"}
    ]
  },
  "cta": {
    "headline": "Passez a l'action avec {{consultant_name}}",
    "sublabel": "Reservez votre appel decouverte gratuit",
    "cta_label": "Reserver mon appel",
    "booking_url": ""
  },
  "consultant_edits": {
    "block_images": {},
    "block_visibility": {},
    "block_order": []
  }
}
```

### 2.2 Blocs semantiques (8 sections de la landing page)

| # | Bloc ID | Role conversion | Type de contenu |
|---|---------|-----------------|-----------------|
| 1 | `hero` | **Accrocher** — Score + headline personnalise | Titre + sous-titre + jauge score |
| 2 | `context_block` | **Montrer qu'on connait le prospect** | Paragraphe + 3 highlights du formulaire/site |
| 3 | `checklist` | **Creer l'urgence** — checklist what's missing | Liste avec statuts visuels (missing/partial/ok) |
| 4 | `visualizations` (x2) | **Prouver la competence** | 2 graphiques cote a cote (bar + radar) |
| 5 | `analysis_block` | **Exposer les resultats** | Prose d'analyse marche+prospect |
| 6 | `problems_block` | **Identifier la douleur** | Cards de problemes avec severite |
| 7 | `solutions_block` | **Ouvrir la porte** (sans donner le comment) | Cards de solutions avec impact |
| 8 | `cta` | **Convertir** — Call to action booking | Bouton CTA + texte persuasif |

### 2.3 Modifications N8N necessaires

#### Noeud "Prepare Master Prompt" — Output rules a remplacer :

Le prompt actuel demande un JSON avec `audit_blocks[]` generiques. Le nouveau prompt doit :

1. **Supprimer** la structure `audit_blocks[]` generique
2. **Imposer** le schema 2.1 avec les 8 blocs nommes
3. **Supprimer** `page_index` (plus de PDF)
4. **Ajouter** le type `radar` aux visualizations
5. **Ajouter** les champs `hero`, `context_block`, `checklist`, `problems_block`, `solutions_block`, `cta`
6. **Garder** le scoring `client_graph` fusionne dans `visualizations[0]`

#### Noeud "Parse Final JSON" — Validation a adapter :

1. Valider les 8 blocs au lieu de `audit_blocks[]`
2. Generer des defaults pour les blocs manquants
3. Supprimer la validation `chart_data` (remplacee par `visualizations`)

---

## Partie 3 — Architecture Frontend

### 3.1 Nouvelle route publique

```
URL : /{username}/audit/{lead_id}
Route React : <Route path="/:username/audit/:leadId" element={<PublicAudit />} />
```

Cette page est **publique** (pas de login requis) — c'est la page que le prospect recoit par email.

### 3.2 Composants a creer

```
src/components/ReactApp/
  pages/
    PublicAudit.tsx              ← Page principale (fetche lead + profile, compose les blocs)
  components/
    audit-landing/
      AuditHero.tsx              ← Hero avec score jauge + headline
      AuditContextBlock.tsx      ← "On vous connait" + highlights
      AuditChecklist.tsx         ← Checklist avec statuts visuels
      AuditChartPair.tsx         ← 2 graphiques cote a cote (bar + radar)
      AuditAnalysis.tsx          ← Resultats d'analyse (prose)
      AuditProblems.tsx          ← Cards de problemes
      AuditSolutions.tsx         ← Cards de solutions
      AuditCTA.tsx               ← Call to action final
      AuditBlockWrapper.tsx      ← Wrapper generique (gere image_position, visibility)
```

### 3.3 Integration avec le systeme de profil

La page d'audit **herite** du design du profil consultant :

| Element | Source | Comment |
|---------|--------|---------|
| Couleur primaire | `profiles.page_config.color` | Tous les accents, boutons, graphiques |
| Police | `profiles.page_config.font` | Via `FONT_MAP` existant |
| Avatar | `profiles.avatar_url` | Affiche dans le hero + CTA |
| Nom/titre | `profiles.full_name`, `job_title` | Hero + CTA |
| Booking URL | `profiles.booking_config.url` ou `profiles.website` | Bouton CTA |
| Reseaux sociaux | `profiles.social_networks` | Footer de la landing page |

### 3.4 Systeme d'images par bloc (consultant-side)

Le consultant peut, depuis **LeadReview.tsx** (phase audit), associer des images aux blocs :

```typescript
// Dans leads.ai_analysis_json.consultant_edits
{
  "block_images": {
    "context_block": {
      "url": "https://storage.supabase.co/...",
      "position": "after"  // "before" | "after" | "grid" | "background"
    },
    "analysis_block": {
      "url": "https://storage.supabase.co/...",
      "position": "grid"
    }
  },
  "block_visibility": {
    "checklist": true,
    "problems_block": true,
    "solutions_block": true
  },
  "block_order": ["hero", "context_block", "checklist", "visualizations", "analysis_block", "problems_block", "solutions_block", "cta"]
}
```

**Layouts d'image par bloc** :
- `grid` : Image + texte cote a cote (50/50)
- `after` : Texte au-dessus, image en dessous (full-width)
- `before` : Image au-dessus, texte en dessous
- `background` : Image en fond du bloc avec overlay texte

### 3.5 Editeur de contenu (cote consultant dans LeadReview)

**Analyse de l'editeur existant** : Le `JsonAuditEditor.tsx` actuel est un editeur basique de champs (points_forts, points_faibles, etc.) qui ne correspond plus au nouveau schema.

**Decision** : **Recreer** un nouvel editeur adapte au schema v2 :

```
src/components/ReactApp/components/
  AuditLandingEditor.tsx        ← Editeur principal (remplace JsonAuditEditor)
    ├── Inline editing de chaque bloc (contentEditable ou textarea)
    ├── Toggle visibilite par bloc
    ├── Drag & drop reordonnancement des blocs
    ├── Upload image par bloc + choix de position
    └── Preview live (iframe ou side panel)
```

---

## Partie 4 — Data flow complet

### 4.1 Cycle de vie d'un audit

```
1. Lead soumis via formulaire public
   └→ Webhook N8N "new-lead-analysis"
   └→ Pipeline IA (scoring + site + market + master copywriter)
   └→ leads.ai_analysis_json = {version:2, hero, context_block, ...}
   └→ leads.status = "to_review"

2. Consultant ouvre LeadReview (phase audit)
   └→ Voit l'audit genere en preview (landing page)
   └→ Peut editer : texte des blocs, images, visibilite, ordre
   └→ Peut regenerer via N8N (avec feedback)
   └→ Sauvegarde les edits dans leads.ai_analysis_json.consultant_edits

3. Consultant "envoie" l'audit au prospect
   └→ Email Brevo avec lien : /{username}/audit/{lead_id}
   └→ Email template existant (delivery_audit.{lang}.html) — modifier le lien

4. Prospect ouvre le lien
   └→ PublicAudit.tsx fetch lead + profile
   └→ Render landing page de conversion
   └→ CTA → booking du consultant
```

### 4.2 Securite d'acces

Le lead_id est un UUID (non devinable). Mais pour plus de securite :

- Ajouter un champ `audit_share_token` (UUID court ou hash) dans la table `leads`
- L'URL devient : `/{username}/audit/{share_token}`
- Le token est genere lors de l'envoi de l'audit
- On fetch le lead via `share_token` au lieu de `lead_id`

Alternative simple (phase 1) : utiliser le `lead_id` directement, c'est un UUID v4 — suffisamment imprevisible.

---

## Partie 5 — UX/UI de la landing page d'audit

### 5.1 Layout global

```
┌──────────────────────────────────────────────────┐
│  [Logo consultant]    [Nom]    [Socials icons]   │ ← Navbar minimaliste
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─── HERO ─────────────────────────────────┐    │
│  │  Score: ████████░░ 78/100                │    │ ← Jauge circulaire ou barre
│  │  "Audit Digital pour {{company}}"        │    │
│  │  "Prepare par {{consultant}}"            │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── CONTEXTE ─────────────────────────────┐    │
│  │  "Votre situation analysee"              │    │
│  │  [Paragraphe personnalise]               │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐       │    │ ← 3 highlights cards
│  │  │Signal 1│ │Signal 2│ │Signal 3│       │    │
│  │  └────────┘ └────────┘ └────────┘       │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── CHECKLIST ────────────────────────────┐    │
│  │  "Les fondamentaux"                      │    │
│  │  ✅ Item ok          ⚠️ Item partiel      │    │ ← Grid 2 colonnes
│  │  ❌ Item manquant    ❌ Item manquant     │    │
│  │  ⚠️ Item partiel     ✅ Item ok           │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── GRAPHIQUES (2 cartes cote a cote) ────┐    │
│  │  ┌──────────────┐  ┌──────────────┐      │    │
│  │  │  BAR CHART   │  │ RADAR CHART  │      │    │ ← Responsive: stack mobile
│  │  │  Inaction vs │  │  Maturite    │      │    │
│  │  │  Potentiel   │  │  par axe     │      │    │
│  │  └──────────────┘  └──────────────┘      │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── ANALYSE ──────────────────────────────┐    │
│  │  "Resultats de l'analyse"                │    │
│  │  [Image optionnelle]  [Texte d'analyse]  │    │ ← Layout grid si image
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── PROBLEMES ────────────────────────────┐    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │🔴 Critique│ │🟡 Haut   │ │🟡 Moyen  │ │    │ ← Cards avec severity
│  │  │Probleme 1│ │Probleme 2│ │Probleme 3│ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── SOLUTIONS ────────────────────────────┐    │
│  │  ┌──────────────────────────────────┐    │    │
│  │  │ Solution 1 — Impact Fort  →      │    │    │ ← Cards horizontales
│  │  │ Description sans le comment...   │    │    │
│  │  └──────────────────────────────────┘    │    │
│  │  ┌──────────────────────────────────┐    │    │
│  │  │ Solution 2 — Impact Moyen →      │    │    │
│  │  └──────────────────────────────────┘    │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─── CTA ──────────────────────────────────┐    │
│  │  "Passez a l'action avec {{consultant}}" │    │ ← Background accent color
│  │  "Reservez votre appel decouverte"       │    │
│  │     ┌────────────────────────┐           │    │
│  │     │  RESERVER MON APPEL →  │           │    │ ← Gros bouton
│  │     └────────────────────────┘           │    │
│  │  [Avatar]  [Nom]  [Titre]               │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Footer : "Powered by PreTalk" + socials         │
└──────────────────────────────────────────────────┘
```

### 5.2 Principes de design

- **Dark mode par defaut** (coherent avec le profil public actuel `bg-[#221A40]`)
- **Couleur accent** = `page_config.color` du consultant (boutons, jauges, bordures, graphiques)
- **Police** = `page_config.font` du consultant
- **Responsive** : Mobile-first, les 2 graphiques stackent en colonne sur mobile
- **Animations subtiles** : Fade-in au scroll (IntersectionObserver), jauge animee au load
- **Graphiques** : Utiliser **Recharts** (deja installe ou facilement ajouteable) pour bar/radar
- **Pas de sidebar** : Full-width sections, max-width 800px pour le contenu texte

### 5.3 Theming dynamique (couleur consultant)

```css
/* Variables CSS generees dynamiquement */
--accent: {{page_config.color}};
--accent-light: {{color + 20% luminosite}};
--accent-dark: {{color - 20% luminosite}};
--accent-10: {{color a 10% opacite}};  /* backgrounds de blocs */
--accent-20: {{color a 20% opacite}};  /* hover states */
```

---

## Partie 6 — Modifications dans LeadReview.tsx (cote consultant)

### 6.1 Phase "Audit" — nouveau rendu

Remplacer le rendu actuel des `audit_blocks` (editeur de blocs generiques) par :

1. **Preview live** de la landing page (en miniature ou iframe)
2. **Panneau d'edition** lateral ou en dessous avec :
   - Edition inline de chaque bloc (titre + contenu)
   - Upload d'image par bloc + selection de position (grid/before/after/background)
   - Toggle visibilite par bloc
   - Drag & drop pour reordonner les blocs
   - Bouton "Voir en plein ecran" → ouvre la PublicAudit en preview

### 6.2 Envoi de l'audit

L'email envoye au prospect contient desormais un **lien vers la landing page** au lieu d'un PDF :

```
Lien : https://pretalk.me/{username}/audit/{lead_id}
```

**Templates email a modifier** :
- `delivery_audit.fr.html`
- `delivery_audit.en.html`
- `delivery_audit.es.html`
- `delivery_audit.ar.html`

Remplacer le lien PDF par le lien landing page. Le CTA de l'email devient "Consulter votre audit" au lieu de "Telecharger votre audit".

---

## Partie 7 — Modifications backend

### 7.1 Nouvelle route API

```
GET /api/public/audit/:leadId
```

- Retourne le `leads.ai_analysis_json` + le profil consultant associe (`profiles.*` via `leads.user_id`)
- **Pas d'authentification** requise (page publique)
- Peut ajouter un rate-limit leger pour eviter le scraping

### 7.2 Route dans `src/server/routes/`

Creer `publicRoutes.ts` (ou ajouter a un fichier existant) :

```typescript
router.get('/public/audit/:leadId', async (req, res) => {
  const { leadId } = req.params;
  // Fetch lead (ai_analysis_json, score, status, user_id)
  // Fetch profile (page_config, avatar_url, full_name, job_title, booking_config, social_networks, website)
  // Return combined JSON
});
```

### 7.3 Supabase RLS

Verifier que la table `leads` a une policy permettant le `SELECT` public sur les colonnes necessaires, OU passer par le backend Express comme proxy (recommande pour la securite).

---

## Partie 8 — Modifications N8N (workflow)

### 8.1 Noeud "Prepare Master Prompt" — Nouveau `<output_rules>`

Remplacer la section `<output_rules>` du master prompt pour imposer le schema v2 (section 2.1).

Points cles du nouveau prompt :
- Demander les 8 blocs nommes au lieu de `audit_blocks[]`
- Ajouter le bloc `hero` avec `headline`, `subline`, `score`, `score_label`
- Ajouter le bloc `context_block` avec `highlights[]`
- Ajouter le bloc `checklist` avec items `{label, status}`
- Ajouter `problems_block` et `solutions_block` comme blocs separes
- Ajouter le bloc `cta` avec `booking_url` pre-rempli depuis le profil consultant
- Injecter `"version": 2` pour differencier du format v1
- Supprimer `page_index` de la structure des visualizations

### 8.2 Noeud "Parse Final JSON" — Nouvelle validation

- Valider la presence des 8 blocs
- Generer des defaults pour les blocs absents
- Valider les types de `visualizations[].type` (ajouter `"radar"` comme type valide)
- Injecter `"version": 2` si absent
- Supprimer la validation de `chart_data` (champ deprecie)

### 8.3 Retrocompatibilite

Le frontend `PublicAudit.tsx` doit gerer les deux formats :
- **v1** (`audit_blocks[]` + `chart_data`) : transformer en structure v2 au runtime
- **v2** (schema 2.1) : utiliser directement

Fonction de migration :

```typescript
function migrateAuditV1toV2(v1: any): AuditLandingData {
  if (v1.version === 2) return v1;
  return {
    version: 2,
    hero: {
      headline: v1.audit_blocks?.[0]?.title || "Votre audit personnalise",
      subline: "",
      score: v1.chart_data?.scores?.[0] || 50,
      score_label: "Score global"
    },
    context_block: {
      title: "Contexte",
      content: v1.audit_blocks?.find(b => b.id === 'intro')?.content || "",
      highlights: []
    },
    // ... mapper les autres blocs
  };
}
```

---

## Partie 9 — Plan d'execution

### Phase 1 — Schema & N8N (sans code frontend)

| # | Tache | Fichiers | Dependance |
|---|-------|----------|------------|
| 1.1 | Definir le type TypeScript `AuditLandingData` (schema v2) | Nouveau type dans `LeadReview.tsx` ou fichier dedie | — |
| 1.2 | Modifier le noeud "Prepare Master Prompt" dans N8N | Workflow JSON N8N | — |
| 1.3 | Modifier le noeud "Parse Final JSON" dans N8N | Workflow JSON N8N | 1.2 |
| 1.4 | Tester le workflow N8N avec un lead de test | N8N UI | 1.3 |
| 1.5 | Ecrire la fonction `migrateAuditV1toV2()` | `src/components/ReactApp/lib/auditMigration.ts` | 1.1 |

### Phase 2 — Backend API

| # | Tache | Fichiers | Dependance |
|---|-------|----------|------------|
| 2.1 | Creer la route `GET /api/public/audit/:leadId` | `src/server/routes/publicRoutes.ts` | — |
| 2.2 | Enregistrer la route dans `src/server/index.ts` | `src/server/index.ts` | 2.1 |
| 2.3 | Tester l'API avec un lead existant | Postman / curl | 2.2 |

### Phase 3 — Composants landing page

| # | Tache | Fichiers | Dependance |
|---|-------|----------|------------|
| 3.1 | Creer `AuditBlockWrapper.tsx` (gestion images + layout) | `components/audit-landing/` | 1.1 |
| 3.2 | Creer `AuditHero.tsx` (jauge score + headline) | `components/audit-landing/` | 3.1 |
| 3.3 | Creer `AuditContextBlock.tsx` (highlights cards) | `components/audit-landing/` | 3.1 |
| 3.4 | Creer `AuditChecklist.tsx` (statuts visuels) | `components/audit-landing/` | 3.1 |
| 3.5 | Creer `AuditChartPair.tsx` (bar + radar Recharts) | `components/audit-landing/` | 3.1 |
| 3.6 | Creer `AuditAnalysis.tsx` (prose) | `components/audit-landing/` | 3.1 |
| 3.7 | Creer `AuditProblems.tsx` (cards severity) | `components/audit-landing/` | 3.1 |
| 3.8 | Creer `AuditSolutions.tsx` (cards impact) | `components/audit-landing/` | 3.1 |
| 3.9 | Creer `AuditCTA.tsx` (bouton booking) | `components/audit-landing/` | 3.1 |
| 3.10 | Creer `PublicAudit.tsx` (page assembleur) | `pages/PublicAudit.tsx` | 3.2-3.9, 2.1, 1.5 |
| 3.11 | Ajouter la route dans `FullApp.tsx` | `FullApp.tsx` | 3.10 |

### Phase 4 — Editeur consultant (LeadReview)

| # | Tache | Fichiers | Dependance |
|---|-------|----------|------------|
| 4.1 | Creer `AuditLandingEditor.tsx` (remplace JsonAuditEditor) | `components/AuditLandingEditor.tsx` | 1.1, 3.1-3.9 |
| 4.2 | Integrer l'editeur dans LeadReview phase audit | `pages/LeadReview.tsx` | 4.1 |
| 4.3 | Ajouter upload image par bloc | `AuditLandingEditor.tsx` | 4.1 |
| 4.4 | Ajouter drag & drop reordonnancement | `AuditLandingEditor.tsx` | 4.1 |
| 4.5 | Ajouter toggle visibilite par bloc | `AuditLandingEditor.tsx` | 4.1 |
| 4.6 | Preview live (reutiliser les composants PublicAudit) | `AuditLandingEditor.tsx` | 3.10, 4.1 |

### Phase 5 — Email & Integration

| # | Tache | Fichiers | Dependance |
|---|-------|----------|------------|
| 5.1 | Modifier les 4 templates email delivery_audit | `src/templates/emails/delivery_audit.*.html` | 3.11 |
| 5.2 | Modifier la logique d'envoi dans LeadReview (lien au lieu de PDF) | `pages/LeadReview.tsx` | 5.1 |
| 5.3 | Generer le `audit_share_token` a l'envoi | `LeadReview.tsx` + migration Supabase | 5.2 |
| 5.4 | Tester le flow complet : formulaire → N8N → review → envoi → landing | — | Tout |

### Phase 6 — Nettoyage

| # | Tache | Fichiers | Dependance |
|---|-------|----------|------------|
| 6.1 | Supprimer / deprecier le code PDF d'audit dans `pdfRoutes.ts` | `src/server/routes/pdfRoutes.ts` | 5.4 |
| 6.2 | Supprimer l'ancien `JsonAuditEditor.tsx` | `components/JsonAuditEditor.tsx` | 4.2 |
| 6.3 | Supprimer les references Gotenberg pour l'audit | `pdfRoutes.ts`, `gotenbergService.ts` | 6.1 |

---

## Partie 10 — Dependances techniques

| Package | Usage | Deja installe ? |
|---------|-------|-----------------|
| `recharts` | Graphiques bar/radar/line | A verifier (`npm ls recharts`) |
| `@hello-pangea/dnd` | Drag & drop blocs dans l'editeur | Oui (utilise dans ProfileStructureBuilder) |
| `lucide-react` | Icones | Oui |
| `tailwindcss` | Styling | Oui |
| IntersectionObserver | Animations scroll | Natif browser |

---

## Partie 11 — Metriques de succes

| Metrique | Comment mesurer |
|----------|-----------------|
| Taux d'ouverture de l'audit | Analytics event `page_view` sur PublicAudit (useAnalytics existant) |
| Temps passe sur la page | Event `time_on_page` |
| Clic sur CTA | Event `cta_click` |
| Conversion booking | Event `booking_started` |
| Scroll depth | IntersectionObserver sur chaque bloc |

---

## Resume executif

Ce plan transforme l'audit de **document PDF statique** en **landing page de conversion dynamique** qui :

1. **Herite du branding** du consultant (couleurs, police, avatar)
2. **Structure le contenu** en 8 blocs optimises pour la conversion
3. **Offre des visualisations interactives** (bar chart + radar chart)
4. **Permet au consultant** d'editer, reordonner, ajouter des images
5. **Envoie un lien** au lieu d'un PDF (plus leger, trackable, modifiable apres envoi)
6. **Est responsive** et optimise mobile
7. **Fonctionne pour tous les domaines** grace a l'adaptation de domaine dans le prompt N8N

Le format est **universel** : le meme schema sert a tous les types d'audit (marketing, coaching, finance, tech, etc.) car c'est le prompt N8N qui adapte le contenu au domaine du consultant.

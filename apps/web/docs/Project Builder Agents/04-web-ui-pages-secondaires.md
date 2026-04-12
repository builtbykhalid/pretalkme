# AGENT 04 — UI Pages Secondaires (CRM, E-Commerce, AI Agent, Flows, Settings)
> Mission : Construire toutes les pages React du dashboard hors Inbox.
> **Travail dans `apps/web/src/components/ReactApp/pages/`**

---

## Contexte

L'inbox (Agent 03) est la page principale. Ce prompt couvre toutes les autres pages du dashboard :
- CRM (contacts + Kanban)
- E-Commerce (produits + commandes)
- Agent IA (config + simulateur + logs)
- Flow Builder (canvas automation)
- Analytics
- Settings + Billing
- Onboarding wizard

Utiliser le design system existant (ShadCN/ui + Tailwind) pour toute l'UI.

---

## PAGE 1 — CRM (`/app/crm`)

### Vue Contacts (onglet par défaut)

**Table contacts :**
```typescript
// Colonnes : Avatar | Nom | Téléphone | Tags | Pipeline Stage | Dernière activité | Actions
// Actions : Voir conversation, Éditer, Supprimer

// Filtres :
// - Recherche full-text (nom, téléphone)
// - Filtre par tag (multi-select)
// - Filtre par pipeline stage
// - Filtre par source (whatsapp, avito, instagram)

// Pagination : 25 contacts par page
```

### Vue Kanban Pipeline (onglet "Pipeline")

```typescript
// Colonnes Kanban (drag-and-drop avec @dnd-kit) :
const STAGES = ['Nouveau', 'Qualifié', 'Proposé', 'Négociation', 'Gagné', 'Perdu']

// Chaque card contact affiche :
// - Nom + téléphone
// - Dernière commande (si existe)
// - Tags
// - Bouton → ouvrir conversation inbox

// Drag d'une card entre colonnes → PATCH /api/v1/contacts/:id { pipeline_stage: newStage }
```

### Vue Fiche Contact (`/app/crm/:contactId`)

```typescript
// Layout 2 colonnes :
// Gauche : infos contact + tags + pipeline + notes + timeline HITL
// Droite : historique conversations + commandes liées

// Timeline HITL (bas de page) :
// "IA a transféré le 12/04 à 14h32 — raison : Réclamation détectée — Agent: @Sarah"
// "Agent @Sarah a repassé à l'IA le 12/04 à 15h10"
```

---

## PAGE 2 — E-Commerce

### Onglet Produits (`/app/ecommerce/products`)

```typescript
// Table produits :
// Colonnes : Image | Nom | SKU | Prix | Stock | Plateforme | Statut | Actions

// Badge stock :
// Stock > 10 : badge vert
// Stock 1-10 : badge orange "Stock faible"
// Stock = 0 : badge rouge "Rupture"

// Bouton "Synchroniser" (top right) :
// → POST /api/v1/ecommerce/sync
// → Toast "Synchronisation en cours..." puis "X produits mis à jour"

// Quick-edit inline : clic sur stock ou prix → input en place → PATCH

// Intégration connectée visible en haut :
// "YouCan ✅ Connecté — Dernière sync: il y a 2h" [Resync]
```

### Onglet Commandes (`/app/ecommerce/orders`)

```typescript
// Table commandes :
// Colonnes : ID | Client | Date | Statut | Montant | Plateforme | Actions

// Statuts avec couleur :
const ORDER_STATUS = {
  new:       { label: 'Nouveau',   color: 'blue' },
  confirmed: { label: 'Confirmé', color: 'indigo' },
  shipped:   { label: 'Expédié',  color: 'orange' },
  delivered: { label: 'Livré',    color: 'green' },
  returned:  { label: 'Retourné', color: 'yellow' },
  cancelled: { label: 'Annulé',   color: 'red' },
}

// Clic sur commande → modal ou page détail :
// - Produits commandés (image, nom, qté, prix)
// - Adresse livraison
// - Historique statuts
// - Lien → conversation WhatsApp du client
// - Bouton "Envoyer update WhatsApp" → modal sélection template (confirmation/expédition)
```

---

## PAGE 3 — Agent IA (`/app/ai-agent`)

### 3 Panneaux (layout tabs ou 3 colonnes)

**Panneau A : Simulateur**

```typescript
// Input : texte libre OU upload audio (.ogg, .mp3, .wav)
// Bouton "Simuler" → POST /api/v1/ai/simulate { text?, audioFile? }
// Afficher :
//   - Transcription STT (si audio) avec langue détectée
//   - Réponse LLM générée
//   - Player audio TTS (.ogg) si mode vocal activé
//   - Sources RAG utilisées (si activé)
//   - Score confiance (barre de progression)
//   - Temps de traitement (ms)

// Badges indicateurs résultat :
// ✅ IA confident (>70%) → envoi automatique activé
// ⚠️ Score faible (<70%) → validation humaine requise
// 🔴 Transfert forcé → réclamation ou ton agressif détecté
```

**Panneau B : Configuration**

```typescript
// Formulaire de config agent (PATCH /api/v1/ai/config) :

// Nom de l'agent (ex: "Khalid IA", "Assistant Boutique")
// Voix TTS (Select) : liste de voix ElevenLabs + preview audio
// Langue principale (Radio) : Français | Arabe | Darija
// Seuil HITL (Slider 0-100%) : en dessous → validation humaine
// Mode sécurité (Switch) : ON = valider avant tout envoi
// Instructions système (Textarea) : system prompt custom
// Catalogue produits RAG (Toggle) : activer/désactiver la base de connaissances

// Section "Mots-clés HITL" :
// Liste éditable de mots qui déclenchent transfert humain automatique
// Par défaut : ["remboursement", "arnaque", "problème grave", "avocat"]
```

**Panneau C : Logs**

```typescript
// Table logs ai_runs :
// Colonnes : Date | Contact | STT (tronqué) | LLM (tronqué) | Confiance | Statut | Actions

// Filtres : Succès | Validation requise | Transfert humain | Erreur

// Clic sur ligne → modal détail :
// - STT complet
// - Réponse LLM complète
// - Player TTS si audio disponible
// - Function calls exécutés
// - Modèle LLM utilisé
// - Latence totale (ms)
// - Raison HITL si applicable
```

---

## PAGE 4 — Flow Builder (`/app/flows`)

### Canvas Principal

```typescript
// Utiliser ReactFlow (yarn add reactflow)
// Canvas infini, zoom in/out, minimap

import ReactFlow, { Controls, MiniMap, Background } from 'reactflow'
import 'reactflow/dist/style.css'

// Types de nodes custom à créer :
const NODE_TYPES = {
  trigger:           TriggerNode,      // 📩 Nouveau message reçu
  sendText:          SendTextNode,     // 💬 Envoyer texte
  sendMedia:         SendMediaNode,    // 🖼️ Image/vidéo/doc
  buttons:           ButtonsNode,      // 🔘 Template interactif
  condition:         ConditionNode,    // 🔀 Si/alors
  wait:              WaitNode,         // ⏱️ Délai
  checkStock:        CheckStockNode,   // 📦 Vérifier stock
  suggestAlternative: SuggestAltNode, // 🔄 Proposer alternatif
  getOrderStatus:    OrderStatusNode,  // 🚚 Statut commande
  transferHuman:     TransferHumanNode,// 👤 HITL — critique
  end:               EndNode,          // ✅ Fin flow
}
```

**Node "Transfert Humain" (HITL) — design spécial :**
```typescript
// Bord rouge + icône 👤
// Paramètres dans le panneau latéral :
// - Agent cible (Select parmi l'équipe ou "Pool général")
// - Priorité (Normal | Haute | Urgente)
// - Message interne auto-généré (textarea)
// Action automatique créée : tag contact + note + notification agent
```

**Panneau latéral (propriétés node sélectionné) :**
```typescript
// Apparaît à droite quand on clique un node
// Contenu dynamique selon le type de node
// Champ de test : "Simuler ce node avec un message test"
```

**Sauvegarde :**
```typescript
// Bouton "Sauvegarder" → POST /api/v1/flows { name, trigger_type, nodes_json, edges_json }
// Bouton toggle "Activer / Désactiver" → PATCH /api/v1/flows/:id/toggle
```

---

## PAGE 5 — Analytics (`/app/analytics`)

```typescript
// KPI Cards (4 en haut) :
// Messages envoyés | Livrés | Lus | Taux de lecture
// Conversations IA | Transferts humain | Temps réponse moyen | Conversions estimées

// Graphiques (Recharts — déjà dans le projet) :
// - Activité jour/semaine (LineChart)
// - Répartition IA vs Humain (PieChart)
// - Top agents (BarChart — temps réponse + résolutions)
// - Campagnes actives (liste avec stats)

// Filtres : Aujourd'hui | 7 jours | 30 jours | Période custom
```

---

## PAGE 6 — Onboarding (`/app/onboarding`)

```typescript
// Wizard 4 étapes avec progress bar

// Étape 1 : Connexion WhatsApp
// → Bouton "Connecter WhatsApp Business" → ouvre Meta Embedded Signup popup
// → Callback : WABA connecté → afficher numéro confirmé + vert ✅

// Étape 2 : Connexion E-Commerce
// → 3 options : YouCan | Shopify | WooCommerce
// → Chaque option : formulaire simple (store URL + clé API)
// → Bouton "Ignorer" (optionnel)

// Étape 3 : Config Agent IA
// → Nom agent, langue, voix (preview audio), seuil HITL
// → Instructions système (textarea avec placeholder "Vous êtes l'assistant de la boutique X...")

// Étape 4 : Sync & Lancement
// → Progress bar sync produits + commandes
// → Message "Votre agent est prêt !" + bouton → /app/inbox
```

---

## PAGE 7 — Settings (`/app/settings`)

```typescript
// Onglets :

// [Général] : Nom boutique, logo, fuseau horaire, langue interface

// [Équipe] :
// Table membres : Avatar | Nom | Email | Rôle | Statut | Actions
// Rôles : owner (non modifiable) | admin | agent | viewer
// Bouton "Inviter" → modal email + sélection rôle → POST /api/v1/settings/team/invite

// [Intégrations] :
// Statut de chaque intégration (WABA, YouCan, Shopify, WooCommerce)
// Bouton Reconnecter / Déconnecter

// [Billing] (sous-page /app/settings/billing) :
// Plan actuel + date renouvellement
// Usage du mois (barres de progression) :
//   Conversations : 234/300 (78%)
//   Crédits IA : 145/200 (72%)
//   Broadcasts : 1/2
// Bouton "Gérer mon abonnement" → POST /api/v1/billing/portal → redirect Stripe
// Section "Changer de plan" → cartes des plans avec bouton upgrade
```

---

## Résultat attendu

Toutes les pages listées existent, sont routées, et communiquent avec `apps/api` via `useApi`.
Aucune page ne crash. Les données sont chargées depuis l'API (ou affichent un skeleton loading).
Design cohérent avec le design system ShadCN/Tailwind existant dans pretalk.

## Vérification

```bash
cd apps/web && npm run dev
# Naviguer sur chaque route :
# /app/crm → table contacts + onglet Kanban
# /app/ecommerce/products → table produits
# /app/ai-agent → simulateur + config + logs
# /app/flows → canvas ReactFlow
# /app/analytics → KPIs + graphiques
# /app/settings → onglets équipe + billing
# /app/onboarding → wizard 4 étapes
```

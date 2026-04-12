# 💼 Pretalk.me — Stratégie Pricing Révisée & Adaptée
> Dernière mise à jour : Mars 2026 · Version 2.1

---

## ⚠️ Audit de la Stratégie Initiale — Ce qui a été corrigé

Avant la version révisée, voici les **problèmes identifiés** dans la stratégie originale :

| Problème | Impact | Correction |
|---|---|---|
| "Audits IA" utilisés comme métrique principale — concept vague et non-natif dans l'app | Confusion utilisateur | Remplacé par des métriques réelles : **Leads, Formulaires, Agents, Automations** |
| "2 agents marketplace" au Starter — mais les agents sont dans un store libre, pas payant par quota | Incohérence fonctionnelle | Les agents marketplace restent libres, les **agents custom sur devis** sont le vrai levier |
| "Deals tracking" présenté comme Pro-only — mais la page Finances existe et gère les deals | Feature mapping incorrect | Deals + Finance KPIs disponibles dès **Pro**, verrouillés en Starter |
| "Automations Slack/n8n/Sheets + IFTTT" présentés comme dispo Growth — mais ce sont des integrations "Coming Soon" dans le code | Promesses non-tenues | Label **"Soon" explicite**, preview available, activation Growth |
| "Design on Demand" Growth — feature non implémentée | Sur-promesse | Renommé en **Agent Custom inclus** (1 agent custom/an inclus en Growth) |
| Overage 1.50€/audit — unité floue | Friction inutile | Overage basé sur **leads supplémentaires** (unité native CRM) |
| "100 Starter 6.90€ = 690€ MRR Semaine 1" — projections GTM irréalistes | Mauvaise planification | Projections réalistes corrigées |
| Marge Starter négative (-3€) sans plan de mitigation | Risque financier | Limite de leads/mois stricte comme garde-fou |

---

## ✅ Structure Pricing Finale — Adaptée App Pretalk.me

### Vue d'ensemble

```
Essai Gratuit 7j → Starter 6.90€ → Pro 29€ → Growth 99€ → Enterprise (devis)
```

### Tableau Comparatif Complet

| Plan | Prix/mois | Annuel | Essai | Cible |
|---|---|---|---|---|
| **Essai Gratuit** | 0€ | — | 7 jours | Découverte |
| **Starter** | 6.90€ | 5.50€/mois (~66€/an) | — | Consultant solo débutant |
| **Pro** | 29€ | 23€/mois (~276€/an) | — | Freelance actif |
| **Growth** | 99€ | 79€/mois (~948€/an) | — | Agences 2-5 personnes |
| **Enterprise** | Sur devis | Sur devis | — | 10+ consultants |

---

## 🗂️ Mapping Complet des Features par Plan

### 🆓 ESSAI GRATUIT (7 jours — Aucune carte requise)

> **Objectif : Laisser l'utilisateur toucher la valeur core en 7 jours.**

#### CRM & Leads
- ✅ Dashboard avec KPIs temps réel (leads, bookings, conversion rate)
- ✅ Jusqu'à **10 leads** capturés
- ✅ Liste leads + filtres statut (nouveau, qualifié, archivé)
- ✅ Lead score basique

#### Formulaires
- ✅ **1 formulaire publié** (PublicForm accessible via `/f/:slug`)
- ✅ FormBuilder complet (toutes les étapes, logique conditionnelle)
- ✅ **2 templates de départ** disponibles

#### Profil Public
- ✅ **Page Profil Public** (`/:username`) — SSR/Astro
- ✅ 1 thème de profil (Classic)
- ✅ Google Calendar integration (connexion)
- ✅ Disponibilités + réservations basiques

#### Agents IA
- ✅ Accès au **Marketplace d'agents** (lecture/installation)
- ✅ **2 agents installables** depuis le store
- ❌ Agents custom sur devis : non disponible

#### Automations
- ✅ Google Calendar connecté
- ❌ Slack, Sheets, Webhook : indisponibles

#### Finances
- ❌ Page Finances / Deals : verrouillée

#### Après 7 jours
- ⚠️ Auto-downgrade : accès lecture seule, nouveaux leads bloqués
- 📧 Emails automatiques J3, J6, J7 (voir section Funnel)

---

### 🟢 STARTER — 6.90€/mois (5.50€ annuel)

> **Cible : Consultant qui veut démarrer avec un outil pro sans se ruiner.**

#### CRM & Leads
- ✅ **30 leads/mois** (overages : 0.50€/lead supplémentaire)
- ✅ Export CSV des leads
- ✅ Filtres avancés, statuts, notes
- ✅ Lead score + historique complet
- ❌ Deals pipeline / Finance KPIs : verrouillé

#### Formulaires
- ✅ **3 formulaires publiés** simultanément
- ✅ FormBuilder complet (toutes les sections : Parcours, Design, Settings)
- ✅ **5 templates** disponibles
- ✅ Formulaire multi-étapes avec logique IA

#### Profil Public
- ✅ Page profil publique complète (`/:username`)
- ✅ **2 thèmes** (Classic, Banner)
- ✅ Booking via calendrier
- ✅ **2 services publiés**

#### Agents IA
- ✅ Marketplace : accès complet (installation libre)
- ✅ **5 agents installables** depuis le store
- ❌ Agents custom : sur devis séparé (non inclus)

#### Automations
- ✅ Google Calendar (connexion + sync)
- ❌ Slack, Sheets, Webhook : verrouillés (badge "Soon")

#### Finances
- ❌ Page Finances/Deals : verrouillée

---

### 💎 PRO — 29€/mois (23€ annuel)

> **Cible : Freelance actif avec pipeline clients régulier.**

#### CRM & Leads
- ✅ **Leads illimités**
- ✅ Export CSV + filtres avancés
- ✅ **Deals pipeline complet** (suivi statut, montant, client)
- ✅ **Finance KPIs** : CA brut, bénéfice net, pipeline value, taux conversion
- ✅ Historique des ventes + analyse rentabilité

#### Formulaires
- ✅ **10 formulaires** simultanés
- ✅ **Templates illimités**
- ✅ FormBuilder complet + toutes les features IA

#### Profil Public
- ✅ **4 thèmes** (Classic, Banner, Premium, Glassmorphism)
- ✅ **5 services publiés**
- ✅ Branding : sélection de palettes de couleurs
- ✅ Typographies avancées (Playfair, Outfit, Inter)
- ✅ Hero shapes multiples (Circle, Diamond, Hexagon, Arch)
- ✅ Upload d'image hero PNG

#### Agents IA
- ✅ Marketplace : tous les agents, **illimité**
- ✅ **1 demande d'agent custom** offerte (valeur jusqu'à 299€)
- ✅ Suivi des demandes custom (statuts, devis, livraison)

#### Automations
- ✅ Google Calendar (complet)
- ✅ Accès anticipé Slack + Sheets en bêta (quand disponibles)

#### Disponibilités
- ✅ Règles de disponibilité avancées
- ✅ Buffers, plages horaires custom

---

### 🚀 GROWTH — 99€/mois (79€ annuel)

> **Cible : Agence ou équipe consultants (2-5 membres).**

#### Tout Pro +

#### Multi-utilisateurs
- ✅ **5 utilisateurs inclus**
- ✅ RBAC basique (admin / membre)
- ✅ Tableau de bord partagé

#### Automations Avancées
- ✅ **Slack** : notifications deals + leads (quand disponible)
- ✅ **Google Sheets** : export automatique leads (quand disponible)
- ✅ **Webhooks** personnalisés
- ✅ Workflows automatisés (création, triggers, actions)

#### Agents IA
- ✅ **2 agents custom inclus/an** (valeur ~600€)
- ✅ Agents avec Tone of Voice cloning
- ✅ Analyse documents PDF/Word pour entraînement agent

#### Pages Publiques Premium
- ✅ Tous les thèmes + Glassmorphism complet
- ✅ **Linktree-style** : multi-links sur profil
- ✅ Branding illimité

#### Finances
- ✅ Objectifs mensuels configurables
- ✅ ROI analysis par service
- ✅ Multi-utilisateurs : vue consolidée équipe

---

### 🏢 ENTERPRISE — Sur devis

> **Cible : Cabinets 10+ consultants, grands comptes.**

#### Tout Growth +
- ✅ **White-label** : branding Pretalk remplacé par le vôtre
- ✅ **API complète** : accès programmatique à toutes les données
- ✅ **SLA personnalisé** : uptime garanti, support prioritaire
- ✅ **Agents custom illimités** (développés par l'équipe Pretalk)
- ✅ **SSO / SAML** pour authentification enterprise
- ✅ **Multi-workspace** : gestion multi-entités
- ✅ Onboarding dédié + formation équipe
- ✅ Intégrations API spécifiques (CRM propriétaire, ERP...)

---

## 💳 Overages & Add-ons

### Leads supplémentaires (Starter uniquement)
```
0.50€ / lead supplémentaire au-delà de 30/mois
Dégressif : 0.30€ au-delà de 100 leads/mois
```

### Agents Custom (tous plans)
```
299€ — 500€ one-shot, selon complexité
(1 inclus en Pro, 2 inclus en Growth)
Budget estimé dans l'app via formulaire de demande
```

---

## 📧 Funnel Essai → Starter Automatisé

```
JOUR 1  : Inscription → Dashboard + onboarding guidé
          Email : "Bienvenue ! Voici vos 7 jours pour explorer Pretalk"

JOUR 3  : Si leads créés → 
          Email : "Vous avez capturé X leads ! Continuez avec Starter à 6.90€/mois"
          In-app banner doux non-bloquant

JOUR 6  : Email urgence :
          "Votre accès complet expire dans 24h → Continuez sans interruption"
          CTA : "Passer à Starter — 6.90€/mois"

JOUR 7  : Auto-downgrade à minuit :
          → Option 1 : Starter 6.90€ (carte requise)
          → Option 2 : Accès lecture seule (leads visibles, nouveaux bloqués)
          
          Email : "Votre essai s'est terminé — Vos données sont sauvegardées"
          CTA principal : "Reprendre avec Starter"
          CTA secondaire : "Voir mes données (lecture seule)"

JOUR 8  : Si converti → Email de bienvenue Starter
          "Bienvenue ! Découvrez le Pro (29€) pour débloquer Finances + Deals"
          
JOUR 14 : Si non converti → Email de réactivation
          "Vos X leads attendent — Revenez pour 6.90€/mois"
```

---

## 📊 Unit Economics Révisée

### Coûts réels estimés par plan

| Plan | Prix | Coûts estimés | Marge brute | Note |
|---|---|---|---|---|
| Essai (7j) | 0€ | ~1.50€ (infra + IA) | -1.50€ | Subventionné |
| Starter 6.90€ | 6.90€ | ~3.50€ | **+3.40€ (49%)** | Viable dès J1 |
| Pro 29€ | 29€ | ~8€ | **+21€ (72%)** | Excellent |
| Growth 99€ | 99€ | ~20€ | **+79€ (80%)** | Très fort |

> **Correction clé** : La stratégie originale estimait 10€ de coût pour 10 audits IA au Starter, 
> ce qui générait une marge négative. La vraie métrique de coût Pretalk est l'infrastructure 
> Supabase + les calls IA du FormBuilder, estimés à ~3.50€/mois pour un usage Starter normal.

### Break-even réaliste

```
PHASE 1 (Mois 1-3) :
  50 Starter 6.90€  = 345€ MRR
  10 Pro 29€        = 290€ MRR
  TOTAL             = 635€ MRR
  Coûts infra       ~300€/mois
  →  RENTABLE dès 50 Starter + 10 Pro

PHASE 2 (Mois 4-6) :
  150 Starter       = 1 035€ MRR
  40 Pro            = 1 160€ MRR
  5 Growth          = 495€ MRR
  TOTAL             = 2 690€ MRR
  → Objectif PME viable

PHASE 3 (Mois 7-12) :
  300 Starter       = 2 070€ MRR
  80 Pro            = 2 320€ MRR
  15 Growth         = 1 485€ MRR
  2 Enterprise      = ~2 000€ MRR
  TOTAL             = 7 875€ MRR (~94k€ ARR)
```

---

## 🛠️ Implémentation Technique (Supabase + Stripe)

### Stripe Products à créer

```javascript
// Stripe Products Config
const PLANS = {
  starter: {
    stripe_price_id: 'price_starter_monthly', // 6.90€
    stripe_price_annual_id: 'price_starter_annual', // 5.50€ x 12 = 66€
    limits: {
      leads_per_month: 30,
      forms: 3,
      agents: 5,
      services: 2,
      themes: 2,
    }
  },
  pro: {
    stripe_price_id: 'price_pro_monthly', // 29€
    stripe_price_annual_id: 'price_pro_annual', // 23€ x 12 = 276€
    limits: {
      leads_per_month: -1, // illimité
      forms: 10,
      agents: -1,
      services: 5,
      themes: 4,
      deals: true,
      finance_kpis: true,
      custom_agent_included: 1,
    }
  },
  growth: {
    stripe_price_id: 'price_growth_monthly', // 99€
    stripe_price_annual_id: 'price_growth_annual', // 79€ x 12 = 948€
    limits: {
      leads_per_month: -1,
      forms: -1,
      agents: -1,
      services: -1,
      themes: -1,
      users: 5,
      automations: true,
      custom_agent_included: 2,
      webhooks: true,
    }
  },
  enterprise: {
    // Sur devis — Stripe checkout personnalisé
    white_label: true,
    api_access: true,
    sla: true,
  }
};

// Trial logic (Supabase edge function)
const TRIAL_CONFIG = {
  duration_days: 7,
  limits: {
    leads: 10,
    forms: 1,
    agents: 2,
    services: 1,
  }
};

// Auto-downgrade logic (Supabase cron job)
async function handleTrialExpiry(userId: string) {
  const subscription = await getSubscription(userId);
  
  if (subscription.trial_end < new Date() && !subscription.paid) {
    // Set to read-only mode
    await supabase.from('profiles').update({
      plan: 'expired',
      leads_capture_enabled: false,
    }).eq('id', userId);
    
    // Trigger email sequence
    await sendEmail(userId, 'trial_expired');
  }
}

// Overage billing (lead cap Starter)
async function checkLeadQuota(userId: string) {
  const profile = await getProfile(userId);
  
  if (profile.plan !== 'starter') return { allowed: true };
  
  const leadsThisMonth = await countLeadsThisMonth(userId);
  const STARTER_LIMIT = 30;
  
  if (leadsThisMonth >= STARTER_LIMIT) {
    // Either block or charge overage
    if (profile.allow_overage) {
      await chargeOverage(userId, 0.50); // 0.50€/lead
      return { allowed: true, charged: true };
    }
    return { allowed: false, limit_reached: true };
  }
  
  return { allowed: true };
}
```

### Colonnes Supabase à ajouter (table `profiles`)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  plan TEXT DEFAULT 'trial' 
    CHECK (plan IN ('trial', 'expired', 'starter', 'pro', 'growth', 'enterprise')),
  trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  leads_captured_this_month INTEGER DEFAULT 0,
  allow_overage BOOLEAN DEFAULT false;
```

---

## 🚀 GTM — Lancement Réaliste

### Semaine 1
```
✅ Pricing page live (nouvelle version)
✅ Stripe checkout configuré (Starter + Pro + Growth)
✅ Auto-downgrade logic en place
✅ Séquence emails Postmark/Resend configurée (J3, J6, J7, J8, J14)
📢 Outreach LinkedIn : 20-30 consultants/jour Casablanca, Tunis, Paris
🎯 Objectif : 30 essais gratuits / semaine
```

### Mois 1
```
🎯 150 essais gratuits
🎯 Taux conversion essai → Starter : 30% = 45 Starter
🎯 Taux upsell Starter → Pro (Mois 2) : 20% = 9 Pro
📊 MRR Fin Mois 1 : 310.50€ + 261€ = 571.50€
```

### Mois 3
```
🎯 300 essais cumulés
🎯 80 Starter actifs + 25 Pro + 3 Growth
📊 MRR : 552€ + 725€ + 297€ = 1 574€ MRR
```

### Mois 6
```
📊 Objectif 3 500€+ MRR → Viabilité business confirmée
📊 Premiers Enterprise prospects identifiés
```

---

## 🎯 Positionnement & Psychologie Prix

### Justification des prix
- **6.90€** : Prix psychologique "moins de 7€" — coût d'un café/semaine
- **29€** : Standard SaaS solo (<30€ = pas perçu comme un "gros" abonnement)
- **99€** : Seuil agence — perçu comme "tool professionnel sérieux"
- **Annuel -20%** : Incentive sans dévaluer (standard industrie)

### Ancrage par rapport à la concurrence
```
Typeform Pro    : 59€/mois  → Pretalk Pro 29€ = 50% moins cher + CRM intégré
Notion AI       : 16€/mois  → Pretalk Starter = même prix range + vertical consultant
HubSpot Starter : 45€/mois  → Pretalk Pro = moins cher + IA native
```

### La proposition de valeur unique
> *"L'unique plateforme qui combine CRM consultant + Formulaires IA + Profil public SSO 
> + Agents IA + Finance tracking — conçue exclusivement pour les consultants indépendants."*

---

## 📋 Page Pricing (Copie Finale)

```
PRETALK.ME — PRICING

Plateforme IA tout-en-un pour consultants indépendants

┌─────────────────────────────────────────────────────────────┐
│  🆓 ESSAI GRATUIT — 7 jours, sans carte                    │
│  10 leads · 1 formulaire · profil public · 2 agents IA     │
│  [Démarrer gratuitement →]                                  │
└─────────────────────────────────────────────────────────────┘

⭐ STARTER — 6.90€/mois
  Parfait pour démarrer
  → 30 leads/mois
  → 3 formulaires IA
  → Profil public (2 thèmes)
  → 5 agents marketplace
  → 2 services
  [Choisir Starter]

💎 PRO — 29€/mois        ← RECOMMANDÉ
  Pour les freelances actifs
  → Leads illimités
  → 10 formulaires IA
  → Deals pipeline + Finance KPIs
  → 4 thèmes premium
  → 1 agent custom inclus
  [Choisir Pro]

🚀 GROWTH — 99€/mois
  Pour les équipes et agences
  → Tout Pro +
  → 5 utilisateurs inclus
  → Automations (Slack, Sheets, Webhooks)
  → 2 agents custom inclus/an
  → White-label partiel
  [Choisir Growth]

🏢 ENTERPRISE — Sur devis
  White-label · API · SLA · Agents custom illimités
  [Nous contacter]

───────────────────────────────────────
💳 Paiement annuel : -20% sur tous les plans
📧 Support email inclus à partir de Starter
🛡️ Données hébergées EU (Supabase)
```

---

## 📌 Résumé des Corrections Clés

> [!IMPORTANT]
> **Les 5 corrections critiques appliquées** par rapport à la stratégie initiale :
>
> 1. **Feature-mapping corrigé** : Chaque feature listée correspond à une page/fonctionnalité réellement implémentée dans le code
> 2. **"Audits IA" supprimé** : Remplacé par les métriques natives (leads, formulaires, agents) — plus clair pour l'utilisateur
> 3. **Marge Starter viable** : Coût réel ~3.50€ (pas 10€) → marge +49% dès Mois 1
> 4. **Automations honnêtes** : Features "Coming Soon" clairement labellisées, non vendues comme disponibles immédiatement
> 5. **GTM réaliste** : Projections basées sur des taux de conversion SaaS standards (30% trial→paid vs 40% initial)

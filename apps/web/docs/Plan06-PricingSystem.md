# Plan 06 — Systeme Pricing & Limitations Pretalk Hub

> **Auteur** : Product Owner | **Date** : 2026-04-08
> **Objectif** : Implementer un systeme de pricing complet avec enforcement backend, integration LemonSqueezy, et gestion des quotas par plan.

---

## 0. Diagnostic de l'existant

### Ce qui existe deja
- Table `subscriptions` (plan_id, status, usage_limit, usage_current, manual_override)
- Champ `billing_details` JSONB dans `profiles` (plan: free/pro/enterprise)
- Fonction RPC `grant_gift_subscription` pour les cadeaux admin
- Checks frontend basiques (voice recording = Pro only, PromotionalBar, useAnnouncements)
- Landing page avec 4 plans (Free/Starter/Plus/Pro) dans `src/data/landing/index.js`

### Ce qui manque (critique)
- **Aucun enforcement backend** des limites (leads, forms, agents, services, PDF)
- **Aucune integration de paiement** (ni Stripe, ni LemonSqueezy)
- **Incoherence entre les plans** : landing page (Free/Starter/Plus/Pro) vs code (free/pro/enterprise) vs docs (Trial/Starter/Pro/Growth/Enterprise)
- **Aucun tracking de consommation** (leads/mois, PDFs generes, appels IA)
- **Aucune gestion de trial** avec expiration automatique

---

## 1. Architecture Pricing Finale (Revisee Expert)

### 1.1 Structure des plans

> **Principe** : 3 plans payes + 1 trial + 1 enterprise custom. Pas de plan gratuit permanent (freine la conversion).

| Plan | Prix/mois | Prix annuel | Cible | Marge estimee |
|------|-----------|-------------|-------|---------------|
| **Trial** | 0 EUR | - | Decouverte 14j | -2 EUR (subventionne) |
| **Starter** | 19 EUR | 15 EUR/mois (180 EUR/an) | Consultant solo debutant | ~75% |
| **Pro** | 29 EUR | 23 EUR/mois (276 EUR/an) | Freelance actif | ~72% |
| **Growth** | 99 EUR | 79 EUR/mois (948 EUR/an) | Agence 2-5 personnes | ~80% |
| **Enterprise** | Sur devis | Sur devis | Cabinets 10+ | Custom |

> **Changements vs strategie precedente (Optimisations friction)** :
> - **Trial** : Limite passee de 10 a 30 leads pour garantir le moment "Aha!" avant de heurter le paywall.
> - **Starter** : Repositionne a 19 EUR (vs 9 EUR precedemment). Un prix trop bas devalorisait la perception qualitative de l'IA pour une cible B2B. Ce tarif est plus credible face aux standards du marche.
> - **Soft Limit Leads** : Suppression du Hard Paywall sur le captage des leads. Les leads sont toujours collectes (meme hors-quota), mais floutes/masques dans le dashboard avec obligation d'upgrade pour les lire.
> - Suppression du plan "Plus" a 45 EUR et "Free" permanent (simplifie le choix).

### 1.2 Justification prix vs cout LLM

Les appels IA sont le cout variable principal. Voici l'estimation par action :

| Action IA | Modele utilise | Cout estime/appel | Frequence moyenne |
|-----------|---------------|-------------------|-------------------|
| Audit Lead (analyse site + scoring) | Gemini (modele standard) | ~0.02-0.05 EUR | 1x par lead |
| Generation champs formulaire | Gemini | ~0.01-0.03 EUR | 1x par formulaire |
| Generation devis (3 options) | Gemini | ~0.03-0.08 EUR | 1x par lead qualifie |
| Generation contrat | Gemini | ~0.02-0.05 EUR | 1x par deal |
| Assistant IA texte | Gemini | ~0.01-0.02 EUR | 2-3x par jour |
| Audit SEO complet (scraping + analyse) | Gemini + Jina | ~0.10-0.15 EUR | 1x par lead |

> **Note** : Le moteur IA actuel utilise un modele standard. Le choix du modele d'execution sera disponible dans une version future, permettant d'optimiser le ratio qualite/cout selon vos besoins.

**Cout IA estime par plan/mois :**
- Trial (30 leads max) : ~1.50-3.00 EUR
- Starter (30 leads/mois) : ~1.50-3.00 EUR
- Pro (illimite, ~100 leads) : ~5-10 EUR
- Growth (~300 leads, 5 users) : ~15-30 EUR

**Cout infra fixe** : Supabase (~25 EUR), Gotenberg PDF (~10 EUR), Brevo emails (~20 EUR), Serveur (~15 EUR) = ~70 EUR/mois

### 1.3 Tableau des limites par plan

```
PLAN_LIMITS = {
  trial: {
    duration_days: 14,
    leads_per_month: 30, // Aligne sur Starter pour demo de valeur
    forms_published: 1,
    services: 1,
    agents_installed: 2,
    pdf_generations_per_month: 5,
    email_sends_per_month: 10,
    themes: 1,              // Classic uniquement
    ai_generations_per_month: 20,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: false,
  },
  starter: {
    duration_days: null,     // illimite
    leads_per_month: 30,
    forms_published: 3,
    services: 2,
    agents_installed: 5,
    pdf_generations_per_month: 20,
    email_sends_per_month: 100,
    themes: 2,              // Classic + Banner
    ai_generations_per_month: 50,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: true,
  },
  pro: {
    duration_days: null,
    leads_per_month: -1,     // illimite
    forms_published: 10,
    services: 5,
    agents_installed: -1,    // illimite
    pdf_generations_per_month: -1,
    email_sends_per_month: 500,
    themes: 4,              // Tous
    ai_generations_per_month: 200,
    deals_pipeline: true,
    finance_kpis: true,
    automations: false,      // beta access
    custom_agents: 1,        // 1 inclus
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: true,
  },
  growth: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: -1,     // illimite
    services: -1,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: 2000,
    themes: -1,
    ai_generations_per_month: -1,
    deals_pipeline: true,
    finance_kpis: true,
    automations: true,
    custom_agents: 2,        // 2 inclus/an
    team_members: 5,
    webhooks: true,
    api_access: false,
    white_label: true,       // partiel
    booking_calendar: true,
    export_csv: true,
  },
  enterprise: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: -1,
    services: -1,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: -1,
    themes: -1,
    ai_generations_per_month: -1,
    deals_pipeline: true,
    finance_kpis: true,
    automations: true,
    custom_agents: -1,
    team_members: -1,
    webhooks: true,
    api_access: true,
    white_label: true,
    booking_calendar: true,
    export_csv: true,
  }
}
```

---

## 2. LemonSqueezy : Recommandation API vs Webhooks

### 2.1 Verdict : **Webhooks uniquement** (pas d'API)

**Pourquoi Webhooks suffisent :**
1. LemonSqueezy gere tout le checkout, la facturation recurrente, et le portail client
2. Vous n'avez PAS besoin de creer des subscriptions via API — le client va sur la page LemonSqueezy
3. Les webhooks vous notifient de chaque evenement (creation, renouvellement, annulation, mise a jour)
4. Moins de code a maintenir, moins de failles de securite

**Quand l'API serait necessaire (pas maintenant) :**
- Si vous voulez creer des checkouts programmatiques depuis votre app (custom checkout button)
- Si vous voulez afficher les factures dans votre dashboard
- Si vous voulez modifier les subscriptions depuis votre admin

**Recommandation finale :**
> Phase 1 : **Webhooks only** — LemonSqueezy envoie les evenements, votre backend met a jour Supabase
> Phase 2 (future) : Ajouter l'API pour checkout programmatique et portail de facturation in-app

### 2.2 Evenements Webhook a ecouter

| Evenement LemonSqueezy | Action Backend |
|------------------------|----------------|
| `subscription_created` | Creer/updater `subscriptions` + `profiles.billing_details` |
| `subscription_updated` | Mettre a jour plan_id, status, period_end |
| `subscription_cancelled` | Mettre status = 'cancelled', programmer downgrade a fin de periode |
| `subscription_resumed` | Remettre status = 'active' |
| `subscription_expired` | Downgrade vers 'expired' (lecture seule) |
| `subscription_payment_success` | Logger le paiement, reset compteurs mensuels |
| `subscription_payment_failed` | Envoyer email relance, marquer 'past_due' |
| `order_created` | Pour les achats one-shot (agents custom) |

### 2.3 Configuration LemonSqueezy requise

Creer dans le dashboard LemonSqueezy :
1. **Store** : "Pretalk Hub"
2. **Products** (4) :
   - Starter Monthly (19 EUR) + Starter Annual (180 EUR)
   - Pro Monthly (29 EUR) + Pro Annual (276 EUR)
   - Growth Monthly (99 EUR) + Growth Annual (948 EUR)
   - Agent Custom (299-500 EUR one-shot)
3. **Webhook endpoint** : `https://votre-domaine.com/api/webhooks/lemonsqueezy`
4. **Signing secret** : A stocker dans `.env` comme `LEMONSQUEEZY_WEBHOOK_SECRET`

---

## 3. Implementation — Etapes Detaillees

### Phase A : Migration Database & Config (Priorite 1)

#### Etape A1 : Nouvelle migration — Table plan_limits + colonnes profiles

**Fichier** : `supabase/migrations/202604080001_pricing_system.sql`

```sql
-- ============================================
-- PRICING SYSTEM — Plan limits & usage tracking
-- ============================================

-- 1. Ajouter les colonnes de plan sur profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial' 
    CHECK (plan IN ('trial', 'expired', 'starter', 'pro', 'growth', 'enterprise')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' 
    CHECK (billing_cycle IN ('monthly', 'annual'));

-- 2. Table de tracking d'usage mensuel
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  leads_count INTEGER DEFAULT 0,
  forms_published_count INTEGER DEFAULT 0,
  pdf_generations_count INTEGER DEFAULT 0,
  email_sends_count INTEGER DEFAULT 0,
  ai_generations_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- 3. Table des evenements de paiement (audit trail)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- subscription_created, payment_success, etc.
  provider TEXT DEFAULT 'lemonsqueezy',
  provider_event_id TEXT,
  plan_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index pour les requetes de limites
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period 
  ON usage_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_payment_events_user 
  ON payment_events(user_id, created_at DESC);

-- 5. Fonction pour obtenir ou creer le tracking du mois
CREATE OR REPLACE FUNCTION get_or_create_monthly_usage(p_user_id UUID)
RETURNS usage_tracking AS $$
DECLARE
  result usage_tracking;
  current_period DATE := date_trunc('month', CURRENT_DATE)::date;
BEGIN
  SELECT * INTO result FROM usage_tracking 
  WHERE user_id = p_user_id AND period_start = current_period;
  
  IF NOT FOUND THEN
    INSERT INTO usage_tracking (user_id, period_start)
    VALUES (p_user_id, current_period)
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour incrementer un compteur d'usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID, 
  p_metric TEXT,  -- 'leads', 'pdf_generations', 'email_sends', 'ai_generations'
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  current_period DATE := date_trunc('month', CURRENT_DATE)::date;
  current_count INTEGER;
  column_name TEXT;
BEGIN
  -- Map metric to column
  column_name := p_metric || '_count';
  
  -- Upsert usage tracking
  INSERT INTO usage_tracking (user_id, period_start)
  VALUES (p_user_id, current_period)
  ON CONFLICT (user_id, period_start) DO NOTHING;
  
  -- Increment the metric
  EXECUTE format(
    'UPDATE usage_tracking SET %I = %I + $1, updated_at = NOW() 
     WHERE user_id = $2 AND period_start = $3 
     RETURNING %I', 
    column_name, column_name, column_name
  ) INTO current_count USING p_amount, p_user_id, current_period;
  
  RETURN jsonb_build_object(
    'metric', p_metric,
    'current_count', current_count,
    'incremented_by', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour verifier les limites avant action
CREATE OR REPLACE FUNCTION check_plan_limit(
  p_user_id UUID,
  p_metric TEXT  -- 'leads', 'forms_published', 'pdf_generations', 'email_sends', 'ai_generations'
)
RETURNS JSONB AS $$
DECLARE
  user_plan TEXT;
  current_count INTEGER;
  plan_limit INTEGER;
  current_period DATE := date_trunc('month', CURRENT_DATE)::date;
  trial_end TIMESTAMPTZ;
BEGIN
  -- Get user plan
  SELECT plan, trial_ends_at INTO user_plan, trial_end FROM profiles WHERE id = p_user_id;
  
  -- Check trial expiry
  IF user_plan = 'trial' AND trial_end < NOW() THEN
    UPDATE profiles SET plan = 'expired' WHERE id = p_user_id;
    RETURN jsonb_build_object('allowed', false, 'reason', 'trial_expired', 'plan', 'expired');
  END IF;
  
  -- Expired = read only
  IF user_plan = 'expired' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'plan_expired', 'plan', 'expired');
  END IF;
  
  -- Get plan limit (-1 = unlimited)
  plan_limit := CASE 
    WHEN user_plan = 'trial' THEN
      CASE p_metric
        WHEN 'leads' THEN 30
        WHEN 'forms_published' THEN 1
        WHEN 'pdf_generations' THEN 5
        WHEN 'email_sends' THEN 10
        WHEN 'ai_generations' THEN 20
        ELSE 0
      END
    WHEN user_plan = 'starter' THEN
      CASE p_metric
        WHEN 'leads' THEN 30
        WHEN 'forms_published' THEN 3
        WHEN 'pdf_generations' THEN 20
        WHEN 'email_sends' THEN 100
        WHEN 'ai_generations' THEN 50
        ELSE 0
      END
    WHEN user_plan = 'pro' THEN
      CASE p_metric
        WHEN 'leads' THEN -1
        WHEN 'forms_published' THEN 10
        WHEN 'pdf_generations' THEN -1
        WHEN 'email_sends' THEN 500
        WHEN 'ai_generations' THEN 200
        ELSE -1
      END
    WHEN user_plan IN ('growth', 'enterprise') THEN -1
    ELSE 0
  END;
  
  -- Unlimited
  IF plan_limit = -1 THEN
    RETURN jsonb_build_object('allowed', true, 'plan', user_plan, 'limit', -1);
  END IF;
  
  -- Get current usage
  SELECT COALESCE(
    CASE p_metric
      WHEN 'leads' THEN leads_count
      WHEN 'forms_published' THEN forms_published_count
      WHEN 'pdf_generations' THEN pdf_generations_count
      WHEN 'email_sends' THEN email_sends_count
      WHEN 'ai_generations' THEN ai_generations_count
    END, 0)
  INTO current_count
  FROM usage_tracking
  WHERE user_id = p_user_id AND period_start = current_period;
  
  IF current_count IS NULL THEN current_count := 0; END IF;
  
  -- Check limit
  IF current_count >= plan_limit THEN
    -- Special case for LEADS: SOFT LIMIT
    -- We allow the action (return allowed: true) but mark as restricted
    IF p_metric = 'leads' THEN
      RETURN jsonb_build_object(
        'allowed', true, 
        'soft_limit_exceeded', true,
        'reason', 'soft_limit_reached',
        'plan', user_plan,
        'current', current_count,
        'limit', plan_limit
      );
    END IF;

    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'limit_reached',
      'plan', user_plan,
      'current', current_count,
      'limit', plan_limit,
      'upgrade_needed', true
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true, 
    'plan', user_plan,
    'current', current_count,
    'limit', plan_limit,
    'remaining', plan_limit - current_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Migrer les utilisateurs existants
-- Tous les users actuels avec billing_details.plan = 'pro' => plan = 'pro'
-- Les autres => plan = 'trial' (generosite pour early adopters)
UPDATE profiles SET plan = 'pro' 
WHERE billing_details->>'plan' = 'pro';

UPDATE profiles SET plan = 'pro' 
WHERE billing_details->>'plan' = 'enterprise';

UPDATE profiles SET plan = 'trial', trial_started_at = NOW(), trial_ends_at = NOW() + INTERVAL '14 days'
WHERE plan IS NULL OR plan = 'trial';

-- Migrer les gift subscriptions
UPDATE profiles p SET plan = 'pro'
FROM subscriptions s 
WHERE s.user_id = p.id AND s.plan_id = 'pro_gift' AND s.status = 'active';
```

#### Etape A2 : Fichier config partagee plan_limits

**Fichier** : `src/shared/planLimits.ts`

```typescript
// Plan limits configuration — source of truth partagee frontend/backend
// Valeur -1 = illimite

export type PlanId = 'trial' | 'expired' | 'starter' | 'pro' | 'growth' | 'enterprise';

export interface PlanLimits {
  duration_days: number | null;
  leads_per_month: number;
  forms_published: number;
  services: number;
  agents_installed: number;
  pdf_generations_per_month: number;
  email_sends_per_month: number;
  themes: number;
  ai_generations_per_month: number;
  deals_pipeline: boolean;
  finance_kpis: boolean;
  automations: boolean;
  custom_agents: number;
  team_members: number;
  webhooks: boolean;
  api_access: boolean;
  white_label: boolean;
  booking_calendar: boolean;
  export_csv: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  trial: {
    duration_days: 14,
    leads_per_month: 30,
    forms_published: 1,
    services: 1,
    agents_installed: 2,
    pdf_generations_per_month: 5,
    email_sends_per_month: 10,
    themes: 1,
    ai_generations_per_month: 20,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: false,
  },
  expired: {
    duration_days: null,
    leads_per_month: 0,
    forms_published: 0,
    services: 0,
    agents_installed: 0,
    pdf_generations_per_month: 0,
    email_sends_per_month: 0,
    themes: 0,
    ai_generations_per_month: 0,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 0,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: false,
    export_csv: false,
  },
  starter: {
    duration_days: null,
    leads_per_month: 30,
    forms_published: 3,
    services: 2,
    agents_installed: 5,
    pdf_generations_per_month: 20,
    email_sends_per_month: 100,
    themes: 2,
    ai_generations_per_month: 50,
    deals_pipeline: false,
    finance_kpis: false,
    automations: false,
    custom_agents: 0,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: true,
  },
  pro: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: 10,
    services: 5,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: 500,
    themes: 4,
    ai_generations_per_month: 200,
    deals_pipeline: true,
    finance_kpis: true,
    automations: false,
    custom_agents: 1,
    team_members: 1,
    webhooks: false,
    api_access: false,
    white_label: false,
    booking_calendar: true,
    export_csv: true,
  },
  growth: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: -1,
    services: -1,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: 2000,
    themes: -1,
    ai_generations_per_month: -1,
    deals_pipeline: true,
    finance_kpis: true,
    automations: true,
    custom_agents: 2,
    team_members: 5,
    webhooks: true,
    api_access: false,
    white_label: true,
    booking_calendar: true,
    export_csv: true,
  },
  enterprise: {
    duration_days: null,
    leads_per_month: -1,
    forms_published: -1,
    services: -1,
    agents_installed: -1,
    pdf_generations_per_month: -1,
    email_sends_per_month: -1,
    themes: -1,
    ai_generations_per_month: -1,
    deals_pipeline: true,
    finance_kpis: true,
    automations: true,
    custom_agents: -1,
    team_members: -1,
    webhooks: true,
    api_access: true,
    white_label: true,
    booking_calendar: true,
    export_csv: true,
  },
};

// Plan display info
export const PLAN_INFO: Record<PlanId, { name: string; price_monthly: number; price_annual: number; color: string }> = {
  trial: { name: 'Essai Gratuit', price_monthly: 0, price_annual: 0, color: '#6B7280' },
  expired: { name: 'Expire', price_monthly: 0, price_annual: 0, color: '#EF4444' },
  starter: { name: 'Starter', price_monthly: 19, price_annual: 15, color: '#10B981' },
  pro: { name: 'Pro', price_monthly: 29, price_annual: 23, color: '#7C3AED' },
  growth: { name: 'Growth', price_monthly: 99, price_annual: 79, color: '#F59E0B' },
  enterprise: { name: 'Enterprise', price_monthly: 0, price_annual: 0, color: '#1F2937' },
};

// Helper: check if a numeric limit allows an action
export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) return true; // unlimited
  return current < limit;
}

// Helper: check if a boolean feature is available
export function hasFeature(plan: PlanId, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return false;
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}
```

---

### Phase B : Backend Enforcement (Priorite 1)

#### Etape B1 : Middleware plan guard

**Fichier** : `src/server/middleware/planGuard.ts`

Ce middleware sera utilise sur toutes les routes qui necessitent une verification de plan.

```typescript
// Middleware Express pour verifier les limites de plan
// Usage: router.post('/leads', planGuard('leads'), createLead)

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseAdmin';

type Metric = 'leads' | 'forms_published' | 'pdf_generations' | 'email_sends' | 'ai_generations';

export function planGuard(metric: Metric) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase.rpc('check_plan_limit', {
      p_user_id: userId,
      p_metric: metric
    });

    if (error || !data?.allowed) {
      return res.status(403).json({
        error: 'plan_limit_reached',
        message: data?.reason || 'Plan limit reached',
        plan: data?.plan,
        current: data?.current,
        limit: data?.limit,
        upgrade_needed: true
      });
    }

    // Attach plan info to request for downstream use
    (req as any).planInfo = data;
    next();
  };
}

// After successful action, increment usage
export async function incrementUsage(userId: string, metric: Metric, amount = 1) {
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_metric: metric,
    p_amount: amount
  });
}

// Feature gate (boolean features like deals_pipeline)
export function featureGuard(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Import plan limits dynamically to avoid circular deps
    const { PLAN_LIMITS } = await import('../../shared/planLimits');
    const limits = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];

    if (!limits || !(limits as any)[feature]) {
      return res.status(403).json({
        error: 'feature_not_available',
        feature,
        plan: profile.plan,
        upgrade_needed: true
      });
    }

    next();
  };
}
```

#### Etape B2 : Appliquer les guards sur les routes existantes

**Fichiers a modifier :**

| Route | Fichier | Guard a ajouter |
|-------|---------|-----------------|
| POST /api/leads (creation via webhook n8n) | `src/server/routes/leadManagementRoutes.ts` | `planGuard('leads')` + `incrementUsage` apres succes |
| POST /api/forms (publication) | Routes de formulaires | `planGuard('forms_published')` au moment du publish |
| POST /api/pdf/generate | `src/server/routes/pdfRoutes.ts` | `planGuard('pdf_generations')` + `incrementUsage` |
| POST /api/emails/send | `src/server/routes/emailRoutes.ts` | `planGuard('email_sends')` + `incrementUsage` |
| POST /api/ai/* (toutes les routes IA) | Routes IA/n8n | `planGuard('ai_generations')` + `incrementUsage` |
| GET /api/deals, /api/finances | `src/server/routes/` | `featureGuard('deals_pipeline')` |
| POST /api/automations | `src/server/routes/` | `featureGuard('automations')` |
| POST /api/webhooks | `src/server/routes/` | `featureGuard('webhooks')` |

#### Etape B3 : Webhook LemonSqueezy handler

**Fichier** : `src/server/routes/webhookRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabaseAdmin';

const router = Router();

// Verify LemonSqueezy webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Map LemonSqueezy variant/product to plan_id
function mapVariantToPlan(variantId: string, productName: string): string {
  // Ces IDs seront configures dans .env apres creation des produits LemonSqueezy
  const mapping: Record<string, string> = {
    [process.env.LS_VARIANT_STARTER_MONTHLY!]: 'starter',
    [process.env.LS_VARIANT_STARTER_ANNUAL!]: 'starter',
    [process.env.LS_VARIANT_PRO_MONTHLY!]: 'pro',
    [process.env.LS_VARIANT_PRO_ANNUAL!]: 'pro',
    [process.env.LS_VARIANT_GROWTH_MONTHLY!]: 'growth',
    [process.env.LS_VARIANT_GROWTH_ANNUAL!]: 'growth',
  };
  return mapping[variantId] || 'starter';
}

function getBillingCycle(variantId: string): string {
  const annualVariants = [
    process.env.LS_VARIANT_STARTER_ANNUAL,
    process.env.LS_VARIANT_PRO_ANNUAL,
    process.env.LS_VARIANT_GROWTH_ANNUAL,
  ];
  return annualVariants.includes(variantId) ? 'annual' : 'monthly';
}

router.post('/api/webhooks/lemonsqueezy', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const rawBody = JSON.stringify(req.body);
    
    if (!verifySignature(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventName = event.meta.event_name;
    const customData = event.meta.custom_data || {};
    const userId = customData.user_id; // Passer user_id dans le checkout URL
    const attrs = event.data.attributes;

    if (!userId) {
      console.error('[LemonSqueezy] No user_id in custom_data');
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // Log l'evenement
    await supabase.from('payment_events').insert({
      user_id: userId,
      event_type: eventName,
      provider: 'lemonsqueezy',
      provider_event_id: event.data.id,
      plan_id: mapVariantToPlan(attrs.variant_id?.toString(), attrs.product_name),
      amount: parseFloat(attrs.total || '0') / 100,
      currency: attrs.currency || 'EUR',
      metadata: { variant_id: attrs.variant_id, status: attrs.status }
    });

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const planId = mapVariantToPlan(attrs.variant_id?.toString(), attrs.product_name);
        const billingCycle = getBillingCycle(attrs.variant_id?.toString());
        
        await supabase.from('profiles').update({
          plan: planId,
          billing_cycle: billingCycle,
          lemonsqueezy_customer_id: attrs.customer_id?.toString(),
          lemonsqueezy_subscription_id: event.data.id,
          billing_details: {
            plan: planId,
            provider: 'lemonsqueezy',
            status: attrs.status,
            renews_at: attrs.renews_at,
          }
        }).eq('id', userId);

        // Upsert subscription table
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_id: planId,
          status: attrs.status === 'active' ? 'active' : attrs.status,
          current_period_end: attrs.renews_at,
          manual_override: false
        }, { onConflict: 'user_id' });
        break;
      }

      case 'subscription_cancelled': {
        await supabase.from('profiles').update({
          billing_details: {
            ...(await supabase.from('profiles').select('billing_details').eq('id', userId).single()).data?.billing_details,
            status: 'cancelled',
            ends_at: attrs.ends_at
          }
        }).eq('id', userId);

        await supabase.from('subscriptions').update({
          status: 'cancelled'
        }).eq('user_id', userId);
        break;
      }

      case 'subscription_expired': {
        await supabase.from('profiles').update({
          plan: 'expired',
          billing_details: { plan: 'expired', status: 'expired' }
        }).eq('id', userId);

        await supabase.from('subscriptions').update({
          status: 'expired'
        }).eq('user_id', userId);
        break;
      }

      case 'subscription_payment_success': {
        // Reset compteurs mensuels au renouvellement
        const currentPeriod = new Date();
        currentPeriod.setDate(1); // Premier du mois
        await supabase.from('usage_tracking').upsert({
          user_id: userId,
          period_start: currentPeriod.toISOString().split('T')[0],
          leads_count: 0,
          forms_published_count: 0,
          pdf_generations_count: 0,
          email_sends_count: 0,
          ai_generations_count: 0,
        }, { onConflict: 'user_id,period_start' });
        break;
      }

      case 'subscription_payment_failed': {
        await supabase.from('profiles').update({
          billing_details: {
            ...(await supabase.from('profiles').select('billing_details').eq('id', userId).single()).data?.billing_details,
            status: 'past_due'
          }
        }).eq('id', userId);
        // TODO: Envoyer email de relance via Brevo
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[LemonSqueezy Webhook Error]', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

#### Etape B4 : Enregistrer la route webhook dans le serveur

**Fichier a modifier** : `src/server/index.ts`

Ajouter :
```typescript
import webhookRoutes from './routes/webhookRoutes';
// ... dans le setup des routes
app.use(webhookRoutes);
```

---

### Phase C : Frontend Enforcement (Priorite 2)

#### Etape C1 : Hook usePlanLimits

**Fichier** : `src/components/ReactApp/hooks/usePlanLimits.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PLAN_LIMITS, PLAN_INFO, type PlanId, isWithinLimit, hasFeature } from '../../../shared/planLimits';

interface UsageData {
  leads_count: number;
  forms_published_count: number;
  pdf_generations_count: number;
  email_sends_count: number;
  ai_generations_count: number;
}

interface PlanLimitsHook {
  plan: PlanId;
  limits: typeof PLAN_LIMITS[PlanId];
  usage: UsageData | null;
  planInfo: typeof PLAN_INFO[PlanId];
  loading: boolean;
  canDo: (metric: string) => boolean;
  hasFeature: (feature: string) => boolean;
  getRemaining: (metric: string) => number;
  getUsagePercent: (metric: string) => number;
  refresh: () => Promise<void>;
}

export function usePlanLimits(userId: string | undefined): PlanLimitsHook {
  const [plan, setPlan] = useState<PlanId>('trial');
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    
    // Fetch plan from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
    
    if (profile?.plan) setPlan(profile.plan as PlanId);

    // Fetch current month usage
    const { data: usageData } = await supabase.rpc('get_or_create_monthly_usage', {
      p_user_id: userId
    });
    
    if (usageData) setUsage(usageData);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial;
  const info = PLAN_INFO[plan] || PLAN_INFO.trial;

  const canDo = useCallback((metric: string) => {
    if (!usage) return false;
    const limitValue = (limits as any)[`${metric}_per_month`] ?? (limits as any)[metric];
    const currentValue = (usage as any)[`${metric}_count`] ?? 0;
    if (typeof limitValue === 'boolean') return limitValue;
    return isWithinLimit(currentValue, limitValue);
  }, [limits, usage]);

  const checkFeature = useCallback((feature: string) => {
    return hasFeature(plan, feature as any);
  }, [plan]);

  const getRemaining = useCallback((metric: string) => {
    if (!usage) return 0;
    const limitValue = (limits as any)[`${metric}_per_month`] ?? (limits as any)[metric];
    if (limitValue === -1) return Infinity;
    const currentValue = (usage as any)[`${metric}_count`] ?? 0;
    return Math.max(0, limitValue - currentValue);
  }, [limits, usage]);

  const getUsagePercent = useCallback((metric: string) => {
    if (!usage) return 0;
    const limitValue = (limits as any)[`${metric}_per_month`] ?? (limits as any)[metric];
    if (limitValue === -1) return 0;
    if (limitValue === 0) return 100;
    const currentValue = (usage as any)[`${metric}_count`] ?? 0;
    return Math.min(100, Math.round((currentValue / limitValue) * 100));
  }, [limits, usage]);

  return {
    plan,
    limits,
    usage,
    planInfo: info,
    loading,
    canDo,
    hasFeature: checkFeature,
    getRemaining,
    getUsagePercent,
    refresh
  };
}
```

#### Etape C2 : Composant UpgradeGate

**Fichier** : `src/components/ReactApp/components/UpgradeGate.tsx`

```typescript
// Composant wrapper qui affiche un CTA upgrade si le plan ne permet pas l'acces
// Usage: <UpgradeGate feature="deals_pipeline" plan={plan}><Finances /></UpgradeGate>
// Usage: <UpgradeGate metric="leads" current={usage.leads_count} limit={limits.leads_per_month}><CreateLead /></UpgradeGate>

import React from 'react';
import { PLAN_INFO, type PlanId } from '../../../shared/planLimits';

interface UpgradeGateProps {
  children: React.ReactNode;
  plan: PlanId;
  feature?: string;       // boolean feature check
  metric?: string;        // numeric limit check
  current?: number;
  limit?: number;
  requiredPlan?: PlanId;  // minimum plan needed
  fallback?: React.ReactNode; // custom fallback UI
}

export function UpgradeGate({ children, plan, feature, metric, current, limit, requiredPlan, fallback }: UpgradeGateProps) {
  // Boolean feature gate
  if (feature) {
    // Determine minimum required plan for this feature
    const planOrder: PlanId[] = ['trial', 'starter', 'pro', 'growth', 'enterprise'];
    const currentIdx = planOrder.indexOf(plan);
    const reqIdx = requiredPlan ? planOrder.indexOf(requiredPlan) : -1;
    
    if (reqIdx > currentIdx) {
      return fallback || <UpgradeCTA currentPlan={plan} requiredPlan={requiredPlan || 'pro'} feature={feature} />;
    }
  }

  // Numeric limit gate
  if (metric && limit !== undefined && current !== undefined && limit !== -1 && current >= limit) {
    return fallback || <UpgradeCTA currentPlan={plan} feature={metric} limit={limit} />;
  }

  return <>{children}</>;
}

function UpgradeCTA({ currentPlan, requiredPlan, feature, limit }: { 
  currentPlan: PlanId; requiredPlan?: PlanId; feature?: string; limit?: number 
}) {
  const targetPlan = requiredPlan || 'pro';
  const info = PLAN_INFO[targetPlan];
  
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
      <div className="text-4xl mb-3">🔒</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Fonctionnalite {info.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
        {limit 
          ? `Vous avez atteint votre limite de ${limit}. Passez au plan ${info.name} pour continuer.`
          : `Cette fonctionnalite est disponible a partir du plan ${info.name}.`
        }
      </p>
      <a 
        href={`/pricing?upgrade=${targetPlan}&from=${currentPlan}`}
        className="px-6 py-2.5 rounded-lg text-white font-medium text-sm"
        style={{ backgroundColor: info.color }}
      >
        Passer a {info.name} — {info.price_monthly} EUR/mois
      </a>
    </div>
  );
}
```

#### Etape C3 : Pages a proteger avec UpgradeGate

| Page | Feature/Metric | Plan minimum |
|------|---------------|--------------|
| `Finances.tsx` | `deals_pipeline` | Pro |
| `Automations.tsx` | `automations` | Growth |
| `LeadReview.tsx` — section devis/contrat | `pdf_generations` | Verifier limite |
| `Forms.tsx` — bouton publish | `forms_published` | Verifier limite |
| `Services.tsx` — creation service | `services` | Verifier limite |
| `Agents.tsx` — installation agent | `agents_installed` | Verifier limite |
| Route email send | `email_sends` | Verifier limite |

#### Etape C4 : Composant UsageMeter dans Settings

**Ajouter dans** `src/components/ReactApp/pages/Settings.tsx`

Un widget affichant la consommation du mois en cours avec barres de progression pour chaque metrique :
- Leads : X / 30
- Formulaires publies : X / 3
- PDFs generes : X / 20
- Emails envoyes : X / 100
- Generations IA : X / 50

---

### Phase D : Landing Page & Checkout (Priorite 2)

#### Etape D1 : Mettre a jour les plans dans la landing page

**Fichier** : `src/data/landing/index.js`

Remplacer le tableau PLANS actuel par :

```javascript
export const PLANS = [
  { 
    name: "Essai Gratuit", 
    price: { m: "0", y: "0" }, 
    period: "14 jours", 
    featured: false, 
    cta: "Demarrer l'essai", 
    outline: true,
    features: [
      "30 leads",
      "1 formulaire IA",
      "Profil public (1 theme)",
      "2 agents marketplace",
      "Calendrier de reservations",
      "Aucune carte requise"
    ], 
    color: "#6B7280" 
  },
  { 
    name: "Starter", 
    price: { m: "19", y: "15" }, 
    period: "/ mois", 
    featured: false, 
    cta: "Choisir Starter", 
    outline: true,
    features: [
      "30 leads / mois",
      "3 formulaires IA",
      "2 services publies",
      "5 agents marketplace",
      "20 PDFs / mois",
      "100 emails / mois",
      "2 themes de profil",
      "Export CSV",
      "Support email"
    ], 
    color: "#10B981",
    lemonsqueezy_monthly_url: "PLACEHOLDER_STARTER_MONTHLY",
    lemonsqueezy_annual_url: "PLACEHOLDER_STARTER_ANNUAL",
  },
  { 
    name: "Pro", 
    price: { m: "29", y: "23" }, 
    period: "/ mois", 
    featured: true, 
    cta: "Choisir Pro", 
    outline: false,
    badge: "Recommande",
    features: [
      "Leads illimites",
      "10 formulaires IA",
      "5 services publies",
      "Agents illimites",
      "PDFs illimites",
      "500 emails / mois",
      "4 themes premium",
      "Deals pipeline + Finance",
      "1 agent custom inclus",
      "Support prioritaire"
    ], 
    color: "#7C3AED",
    lemonsqueezy_monthly_url: "PLACEHOLDER_PRO_MONTHLY",
    lemonsqueezy_annual_url: "PLACEHOLDER_PRO_ANNUAL",
  },
  { 
    name: "Growth", 
    price: { m: "99", y: "79" }, 
    period: "/ mois", 
    featured: false, 
    cta: "Choisir Growth", 
    outline: true,
    features: [
      "Tout le plan Pro +",
      "5 utilisateurs inclus",
      "Formulaires illimites",
      "2000 emails / mois",
      "Automations (Slack, Sheets)",
      "Webhooks personnalises",
      "2 agents custom / an",
      "White-label partiel",
      "Support dedie"
    ], 
    color: "#F59E0B",
    lemonsqueezy_monthly_url: "PLACEHOLDER_GROWTH_MONTHLY",
    lemonsqueezy_annual_url: "PLACEHOLDER_GROWTH_ANNUAL",
  },
];
```

#### Etape D2 : Checkout flow

Le bouton CTA de chaque plan doit rediriger vers le checkout LemonSqueezy avec `custom_data.user_id` :

```
https://pretalk.lemonsqueezy.com/checkout/buy/{variant_id}?checkout[custom][user_id]={userId}
```

Cela permet au webhook de savoir quel user a souscrit.

---

### Phase E : Trial Management (Priorite 3)

#### Etape E1 : Cron job expiration trial

**Option** : Supabase Edge Function ou pg_cron

```sql
-- Cron job quotidien pour expirer les trials
-- A executer via pg_cron ou Supabase scheduled function
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET plan = 'expired'
  WHERE plan = 'trial' 
    AND trial_ends_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Si pg_cron est disponible :
-- SELECT cron.schedule('expire-trials', '0 0 * * *', 'SELECT expire_trials()');
```

#### Etape E2 : Sequence email trial

Utiliser Brevo + table `scheduled_emails` existante :

| Jour | Email | Condition |
|------|-------|-----------|
| J1 | Bienvenue + guide onboarding | Tous |
| J7 | "Vous avez X leads ! Continuez avec Starter" | Si leads > 0 |
| J12 | "Plus que 2 jours — ne perdez pas vos donnees" | Si non converti |
| J14 | "Votre essai est termine" | Auto-downgrade |
| J21 | "Vos X leads vous attendent" | Si non converti |

---

### Phase F : Mettre a jour le TypeScript (Priorite 1)

#### Etape F1 : Mettre a jour AppContext.tsx

**Fichier** : `src/components/ReactApp/context/AppContext.tsx`

Modifier le type `billing_details` :

```typescript
// AVANT
billing_details?: {
    plan: 'free' | 'pro' | 'enterprise';
    // ...
};

// APRES
billing_details?: {
    plan: 'trial' | 'expired' | 'starter' | 'pro' | 'growth' | 'enterprise';
    provider?: 'lemonsqueezy' | 'manual';
    status?: 'active' | 'cancelled' | 'past_due' | 'expired';
    renews_at?: string;
    last4?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
};
```

#### Etape F2 : Mettre a jour tous les checks plan existants

Remplacer tous les `billing_details?.plan === 'free'` par un check sur la colonne `plan` directement :

| Fichier | Changement |
|---------|------------|
| `StepsConfigEditor.tsx` | Utiliser `usePlanLimits` au lieu de check manuel |
| `PromotionalBar.tsx` | Utiliser `plan` column au lieu de `billing_details.plan` |
| `useAnnouncements.ts` | Utiliser `plan` column + verifier subscription status |
| `admin/Users.tsx` | Afficher le plan depuis `profiles.plan` |
| `admin/Dashboard.tsx` | Compter par `profiles.plan` au lieu de subscriptions |

---

### Phase G : Variables d'environnement

#### Etape G1 : Ajouter dans `.env`

```env
# LemonSqueezy
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret
LEMONSQUEEZY_STORE_ID=your_store_id

# LemonSqueezy Variant IDs (a remplir apres creation dans le dashboard)
LS_VARIANT_STARTER_MONTHLY=
LS_VARIANT_STARTER_ANNUAL=
LS_VARIANT_PRO_MONTHLY=
LS_VARIANT_PRO_ANNUAL=
LS_VARIANT_GROWTH_MONTHLY=
LS_VARIANT_GROWTH_ANNUAL=
```

---

## 4. Ordre d'execution

```
SPRINT 1 (Semaine 1) — Fondations
  [1] Creer la migration SQL (Etape A1)
  [2] Creer planLimits.ts (Etape A2)
  [3] Mettre a jour les types TypeScript (Etape F1)
  [4] Creer le middleware planGuard (Etape B1)

SPRINT 2 (Semaine 1-2) — Enforcement Backend
  [5] Appliquer planGuard sur les routes leads (Etape B2)
  [6] Appliquer planGuard sur les routes PDF (Etape B2)
  [7] Appliquer planGuard sur les routes email (Etape B2)
  [8] Appliquer featureGuard sur les routes finances (Etape B2)
  [9] Tester les limites avec un user trial et starter

SPRINT 3 (Semaine 2) — Frontend
  [10] Creer usePlanLimits hook (Etape C1)
  [11] Creer UpgradeGate composant (Etape C2)
  [12] Proteger Finances.tsx avec UpgradeGate (Etape C3)
  [13] Proteger Automations.tsx avec UpgradeGate (Etape C3)
  [14] Ajouter UsageMeter dans Settings (Etape C4)
  [15] Mettre a jour les checks existants (Etape F2)

SPRINT 4 (Semaine 3) — Paiement & Landing
  [16] Creer les produits dans LemonSqueezy dashboard
  [17] Creer webhookRoutes.ts (Etape B3)
  [18] Enregistrer la route dans index.ts (Etape B4)
  [19] Mettre a jour landing page PLANS (Etape D1)
  [20] Implementer checkout flow (Etape D2)
  [21] Configurer les variables .env (Etape G1)

SPRINT 5 (Semaine 3-4) — Trial & Polish
  [22] Creer le cron job expire_trials (Etape E1)
  [23] Configurer la sequence email trial dans Brevo (Etape E2)
  [24] Test E2E du flow complet : signup → trial → checkout → upgrade → usage
  [25] Mettre a jour pricing-strategy.md avec la version finale
```

---

## 5. Checklist de verification finale

- [ ] Migration SQL deployee et testee
- [ ] Tous les users existants migres vers le bon plan
- [ ] planLimits.ts importe correctement en frontend ET backend
- [ ] planGuard actif sur TOUTES les routes de creation (leads, forms, pdf, email, ai)
- [ ] featureGuard actif sur les routes protegees (finances, automations, webhooks)
- [ ] UpgradeGate visible sur les pages concernees
- [ ] UsageMeter fonctionnel dans Settings
- [ ] Landing page affiche les bons plans et prix
- [ ] Checkout LemonSqueezy fonctionne (test en sandbox)
- [ ] Webhook LemonSqueezy recoit et traite les evenements
- [ ] Trial expiration automatique fonctionne
- [ ] Sequence email trial configuree dans Brevo
- [ ] Aucun plan 'free' permanent dans le code
- [ ] Type `billing_details` mis a jour partout
- [ ] Tests manuels : trial → expired, starter limits, pro features, upgrade flow

---

## 6. Points d'attention

1. **Ne jamais bloquer un utilisateur brusquement** : toujours afficher un message clair avec CTA upgrade
2. **Grace period** : apres expiration trial, laisser l'acces en lecture seule pendant 30 jours
3. **Les early adopters actuels** : leur donner un trial de 14 jours genereusement (pas les forcer en expired)
4. **Le webhook LemonSqueezy doit etre idempotent** : le meme evenement peut arriver plusieurs fois
5. **Les compteurs d'usage se resetent au debut de chaque mois** (via le cron ou via payment_success)
6. **Toujours verifier cote backend** : les checks frontend sont UX, pas securite
7. **Soft Limit pour les leads** : ne jamais bloquer techniquement la reception d'un lead (webhook/form). Si hors-plan, le lead est enregistre mais marque comme "locked" (UI floutee).
8. **Le modele IA actuel est fixe** (Gemini standard) — le choix de modele est prevu pour une version future

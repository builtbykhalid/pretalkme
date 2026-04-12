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

-- ============================================
-- FIXES & RLS
-- ============================================

-- 1. Contrainte UNIQUE sur subscriptions (nécessaire pour upsert)
-- On vérifie d'abord si elle existe pour ne pas erreur
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_unique') THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- 2. Activer RLS sur les nouvelles tables
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS pour usage_tracking
DROP POLICY IF EXISTS "Users can view their own usage" ON usage_tracking;
CREATE POLICY "Users can view their own usage" 
  ON usage_tracking FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- 4. Politiques RLS pour payment_events
DROP POLICY IF EXISTS "Users can view their own payment events" ON payment_events;
CREATE POLICY "Users can view their own payment events" 
  ON payment_events FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Note: Le backend utilise service_role pour INSERT/UPDATE, 
-- donc pas besoin de politiques spécifiques pour ces actions.

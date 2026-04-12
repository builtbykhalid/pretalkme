-- Migration: Create Gift Subscription Functions
-- Date: 2026-02-06
-- This script creates RPC functions for admins to gift subscriptions to users.

-- =================================================================
-- Function: grant_gift_subscription(user_id, duration_days)
-- Grants a free premium subscription for a specified duration.
-- =================================================================
CREATE OR REPLACE FUNCTION public.grant_gift_subscription(
  user_id_to_gift uuid,
  duration_days integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  caller_role text;
  subscription_record uuid;
  current_period_end timestamptz;
BEGIN
  -- 1. Check if the caller is an admin
  SELECT get_my_role() INTO caller_role;
  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: You must be an admin to perform this action.';
  END IF;

  -- 2. Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id_to_gift) THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- 3. Calculate the period end
  current_period_end := now() + (duration_days || ' days')::interval;

  -- 4. Upsert subscription: if exists, update; if not, create
  INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_end, manual_override)
  VALUES (user_id_to_gift, 'pro_gift', 'active', current_period_end, true)
  ON CONFLICT (id) DO NOTHING;

  -- If the user already has a subscription, update it instead
  UPDATE public.subscriptions
  SET 
    plan_id = 'pro_gift',
    status = 'active',
    current_period_end = current_period_end,
    manual_override = true
  WHERE user_id = user_id_to_gift
  AND plan_id != 'pro_gift'; -- Only update if not already a gift

  -- If no subscription was updated/inserted, get the existing one
  SELECT id INTO subscription_record FROM public.subscriptions WHERE user_id = user_id_to_gift LIMIT 1;

  -- 5. Log the audit event
  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_resource, details)
  VALUES (
    auth.uid(),
    'grant_gift_subscription',
    user_id_to_gift::text,
    jsonb_build_object(
      'duration_days', duration_days,
      'plan_id', 'pro_gift',
      'period_end', current_period_end
    )
  );

  -- 6. Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Gift subscription granted successfully',
    'period_end', current_period_end,
    'subscription_id', subscription_record
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

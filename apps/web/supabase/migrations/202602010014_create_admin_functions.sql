-- Migration: Create Admin RPC Functions
-- Date: 2026-02-06
-- This script creates stored procedures for secure admin actions.

-- =================================================================
-- Function 1: ban_user(user_id)
-- Changes a user's status to 'banned' and logs the action.
-- =================================================================
CREATE OR REPLACE FUNCTION public.ban_user(user_id_to_ban uuid)
RETURNS void AS $$
DECLARE
  caller_role text;
BEGIN
  -- 1. Check if the caller is an admin
  SELECT get_my_role() INTO caller_role;
  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: You must be an admin to perform this action.';
  END IF;

  -- 2. Perform the action
  UPDATE public.profiles
  SET account_status = 'banned'
  WHERE id = user_id_to_ban;

  -- 3. Log the audit event
  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_resource, details)
  VALUES (auth.uid(), 'ban_user', user_id_to_ban::text, jsonb_build_object('reason', 'Action performed via admin backoffice'));

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- Function 2: toggle_user_status(user_id)
-- More flexible: toggles between 'active' and 'banned'.
-- =================================================================
CREATE OR REPLACE FUNCTION public.toggle_user_status(user_id_to_toggle uuid)
RETURNS text AS $$
DECLARE
  caller_role text;
  current_status text;
  new_status text;
BEGIN
  -- 1. Check admin privileges
  SELECT get_my_role() INTO caller_role;
  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: You must be an admin to perform this action.';
  END IF;

  -- 2. Get current status
  SELECT account_status INTO current_status FROM public.profiles WHERE id = user_id_to_toggle;

  -- 3. Determine new status
  IF current_status = 'active' THEN
    new_status := 'banned';
  ELSE
    new_status := 'active';
  END IF;

  -- 4. Update the profile
  UPDATE public.profiles
  SET account_status = new_status
  WHERE id = user_id_to_toggle;

  -- 5. Log the action
  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_resource, details)
  VALUES (
    auth.uid(), 
    'toggle_user_status', 
    user_id_to_toggle::text, 
    jsonb_build_object('old_status', current_status, 'new_status', new_status)
  );

  -- 6. Return the new status
  RETURN new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

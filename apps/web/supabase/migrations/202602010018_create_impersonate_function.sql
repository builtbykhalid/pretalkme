-- Migration: Create Impersonation Function
-- Date: 2026-02-06
-- Allow admins to temporarily impersonate other users for debugging.

-- =================================================================
-- Function: impersonate_user(user_id_to_impersonate)
-- Generates a temporary session for an admin to access as another user.
-- Returns a JSON with success flag and session details.
-- =================================================================
CREATE OR REPLACE FUNCTION public.impersonate_user(
  user_id_to_impersonate uuid
)
RETURNS jsonb AS $$
DECLARE
  caller_role text;
  target_user_email text;
  impersonate_token text;
BEGIN
  -- 1. Check if the caller is an admin
  SELECT get_my_role() INTO caller_role;
  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can impersonate users.';
  END IF;

  -- 2. Check if target user exists
  SELECT email INTO target_user_email FROM profiles WHERE id = user_id_to_impersonate;
  IF target_user_email IS NULL THEN
    RAISE EXCEPTION 'Target user not found.';
  END IF;

  -- 3. Log the impersonation action
  INSERT INTO admin_audit_logs (admin_user_id, action, target_resource, details)
  VALUES (
    auth.uid(),
    'impersonate_user',
    user_id_to_impersonate::text,
    jsonb_build_object('target_email', target_user_email)
  );

  -- 4. Return success response with impersonation flag
  -- The actual JWT generation happens client-side using Supabase SDK
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Impersonation authorized',
    'user_id', user_id_to_impersonate,
    'user_email', target_user_email,
    'admin_id', auth.uid(),
    'can_impersonate', true
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

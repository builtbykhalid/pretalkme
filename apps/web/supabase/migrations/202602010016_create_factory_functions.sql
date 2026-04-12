-- Migration: Create Factory Management Functions
-- Date: 2026-02-06
-- Functions for managing custom agent requests in the Factory.

-- =================================================================
-- Function: update_agent_request_status(request_id, new_status)
-- Updates the status of an agent request and logs the action.
-- =================================================================
CREATE OR REPLACE FUNCTION public.update_agent_request_status(
  request_id uuid,
  new_status text
)
RETURNS jsonb AS $$
DECLARE
  caller_role text;
  request_record agent_requests%ROWTYPE;
BEGIN
  -- 1. Check if the caller is an admin
  SELECT get_my_role() INTO caller_role;
  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: You must be an admin to perform this action.';
  END IF;

  -- 2. Validate new_status
  IF new_status NOT IN ('pending', 'quote_sent', 'in_progress', 'delivered', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;

  -- 3. Get the request record
  SELECT * INTO request_record FROM agent_requests WHERE id = request_id;
  IF request_record.id IS NULL THEN
    RAISE EXCEPTION 'Agent request not found.';
  END IF;

  -- 4. Update the status
  UPDATE agent_requests
  SET admin_status = new_status
  WHERE id = request_id;

  -- 5. Log the action
  INSERT INTO admin_audit_logs (admin_user_id, action, target_resource, details)
  VALUES (
    auth.uid(),
    'update_agent_request_status',
    request_id::text,
    jsonb_build_object('old_status', request_record.admin_status, 'new_status', new_status)
  );

  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Agent request status updated successfully',
    'new_status', new_status
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

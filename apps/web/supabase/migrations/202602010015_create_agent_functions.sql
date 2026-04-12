-- Migration: Create Agent Management Functions
-- Date: 2026-02-06
-- Allow admins to create and update agents in the library.

-- =================================================================
-- Function: create_or_update_agent(...)
-- Create a new agent or update an existing one.
-- =================================================================
CREATE OR REPLACE FUNCTION public.create_or_update_agent(
  agent_id integer DEFAULT NULL,
  agent_name text DEFAULT NULL,
  category text DEFAULT NULL,
  description text DEFAULT NULL,
  base_prompt text DEFAULT NULL,
  icon_key text DEFAULT NULL,
  n8n_template_id text DEFAULT NULL,
  is_public boolean DEFAULT true
)
RETURNS jsonb AS $$
DECLARE
  caller_role text;
  final_id integer;
BEGIN
  -- 1. Check if the caller is an admin
  SELECT get_my_role() INTO caller_role;
  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can manage agents.';
  END IF;

  -- 2. Validate inputs
  IF agent_name IS NULL OR agent_name = '' THEN
    RAISE EXCEPTION 'Agent name is required.';
  END IF;
  IF category IS NULL OR category = '' THEN
    RAISE EXCEPTION 'Category is required.';
  END IF;

  -- 3. Insert or update
  IF agent_id IS NULL THEN
    -- Create new agent
    INSERT INTO agents_library (name, category, description, base_prompt, icon_key, n8n_template_id, is_public)
    VALUES (agent_name, category, description, base_prompt, icon_key, n8n_template_id, is_public)
    RETURNING id INTO final_id;

    -- Log the action
    INSERT INTO admin_audit_logs (admin_user_id, action, target_resource, details)
    VALUES (
      auth.uid(),
      'create_agent',
      final_id::text,
      jsonb_build_object('name', agent_name, 'category', category)
    );
  ELSE
    -- Update existing agent
    UPDATE agents_library
    SET 
      name = agent_name,
      category = category,
      description = description,
      base_prompt = base_prompt,
      icon_key = icon_key,
      n8n_template_id = n8n_template_id,
      is_public = is_public
    WHERE id = agent_id;

    final_id := agent_id;

    -- Log the action
    INSERT INTO admin_audit_logs (admin_user_id, action, target_resource, details)
    VALUES (
      auth.uid(),
      'update_agent',
      agent_id::text,
      jsonb_build_object('name', agent_name, 'category', category)
    );
  END IF;

  -- 4. Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN agent_id IS NULL THEN 'Agent created successfully' ELSE 'Agent updated successfully' END,
    'agent_id', final_id
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

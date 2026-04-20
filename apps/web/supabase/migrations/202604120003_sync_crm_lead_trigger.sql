-- Migration 202604120003
-- Sync CRM leads into shared.contacts when enough identity data exists.

CREATE OR REPLACE FUNCTION shared.sync_crm_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_payload jsonb := to_jsonb(NEW);
  respondent_info jsonb := COALESCE(lead_payload->'respondent_info', '{}'::jsonb);
  v_tenant_id uuid;
  v_contact_id uuid;
  v_phone text;
  v_email text;
  v_full_name text;
  v_crm_lead_id uuid;
BEGIN
  BEGIN
    v_tenant_id := NULLIF(lead_payload->>'tenant_id', '')::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_tenant_id := NULL;
  END;

  IF v_tenant_id IS NULL THEN
    BEGIN
      v_tenant_id := NULLIF(lead_payload->>'tenantId', '')::uuid;
    EXCEPTION
      WHEN invalid_text_representation THEN
        v_tenant_id := NULL;
    END;
  END IF;

  IF v_tenant_id IS NULL THEN
    BEGIN
      v_tenant_id := NULLIF((current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'), '')::uuid;
    EXCEPTION
      WHEN others THEN
        v_tenant_id := NULL;
    END;
  END IF;

  IF v_tenant_id IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_crm_lead_id := (lead_payload->>'id')::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_crm_lead_id := NULL;
  END;

  v_phone := NULLIF(
    COALESCE(
      lead_payload->>'phone',
      lead_payload->>'phone_number',
      respondent_info->>'phone',
      respondent_info->>'phoneNumber',
      respondent_info->>'mobile',
      respondent_info->>'whatsapp',
      respondent_info->>'whatsapp_number'
    ),
    ''
  );

  v_email := NULLIF(COALESCE(lead_payload->>'email', respondent_info->>'email'), '');
  v_full_name := NULLIF(
    COALESCE(
      lead_payload->>'full_name',
      lead_payload->>'name',
      respondent_info->>'name',
      CONCAT_WS(' ', respondent_info->>'firstName', respondent_info->>'lastName')
    ),
    ''
  );

  IF v_phone IS NULL AND v_email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id
    INTO v_contact_id
  FROM shared.contacts
  WHERE tenant_id = v_tenant_id
    AND (
      (v_phone IS NOT NULL AND phone = v_phone)
      OR (v_email IS NOT NULL AND email = v_email)
    )
  LIMIT 1;

  IF v_contact_id IS NULL THEN
    INSERT INTO shared.contacts (
      tenant_id,
      phone,
      email,
      full_name,
      crm_lead_id,
      source
    ) VALUES (
      v_tenant_id,
      v_phone,
      v_email,
      v_full_name,
      v_crm_lead_id,
      'consultant'
    )
    ON CONFLICT (tenant_id, phone) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, shared.contacts.email),
      full_name = COALESCE(EXCLUDED.full_name, shared.contacts.full_name),
      crm_lead_id = COALESCE(EXCLUDED.crm_lead_id, shared.contacts.crm_lead_id),
      source = 'consultant',
      updated_at = now();
  ELSE
    UPDATE shared.contacts
    SET
      phone = COALESCE(v_phone, shared.contacts.phone),
      email = COALESCE(v_email, shared.contacts.email),
      full_name = COALESCE(v_full_name, shared.contacts.full_name),
      crm_lead_id = COALESCE(v_crm_lead_id, shared.contacts.crm_lead_id),
      source = 'consultant',
      updated_at = now()
    WHERE id = v_contact_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_crm_lead ON public.leads;
CREATE TRIGGER trg_sync_crm_lead
  AFTER INSERT OR UPDATE OF respondent_info, static_answers, status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION shared.sync_crm_lead();

GRANT EXECUTE ON FUNCTION shared.sync_crm_lead() TO authenticated;
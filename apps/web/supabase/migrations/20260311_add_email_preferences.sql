-- Migration to add email automation preferences to profiles

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_automation_preferences JSONB DEFAULT '{
  "auto_send_audit": false,
  "auto_send_contract": false,
  "audit_template_type": "default", 
  "audit_custom_template": "",
  "contract_template_type": "default",
  "contract_custom_template": ""
}'::jsonb;

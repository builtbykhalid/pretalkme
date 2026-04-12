-- Apply this after the main migration to seed existing forms with consultant data
-- This ensures all forms have the required fields for n8n workflow

-- Update Thomas Dubois form with proper consultant info
UPDATE forms 
SET 
  consultant_email = 'thomas.dubois@marketingpro.fr',
  consultant_name = 'Thomas Dubois', 
  consultant_role = 'Expert en Marketing Digital',
  domain = 'thomasdubois-marketing.fr'
WHERE slug = 'audit-marketing-digital-2024';

-- Update dev forms with test consultant info
UPDATE forms 
SET 
  consultant_email = 'dev@localhost',
  consultant_name = 'Dev Consultant',
  consultant_role = 'Consultant de test',
  domain = 'localhost:5173'
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
AND consultant_email IS NULL;

-- Update any other existing forms with default consultant info
UPDATE forms 
SET 
  consultant_email = COALESCE(
    (SELECT email FROM profiles WHERE profiles.id = forms.user_id),
    'admin@pretalk.me'
  ),
  consultant_name = COALESCE(
    (SELECT full_name FROM profiles WHERE profiles.id = forms.user_id),
    'Consultant Pretalk'
  ),
  consultant_role = COALESCE(
    (SELECT job_title FROM profiles WHERE profiles.id = forms.user_id),
    'Expert consultant'
  ),
  domain = 'pretalk.me'
WHERE consultant_email IS NULL;
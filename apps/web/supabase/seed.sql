-- Seed Data for Development
-- This runs after migrations. Use it to populate richer test data.

-- 1. Enrich the Dev User Profile (created in migrations/xx_seed_dev_user.sql)
UPDATE public.profiles
SET 
  first_name = 'Thomas',
  last_name = 'Dubois',
  email = 'thomas.dubois@example.com', -- Override basic email
  role = 'Consultant Marketing Senior',
  notification_preferences = '{"newLead": true, "weeklyReport": true, "marketing": false}'::jsonb,
  billing_details = '{"plan": "pro", "last4": "4242", "brand": "Visa", "exp_month": 12, "exp_year": 2028}'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000000';

-- 2. Insert Sample Workflows
INSERT INTO public.workflows (user_id, title, status, trigger_config, action_config, run_count)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'Notification Nouveau Lead',
    'active',
    '{"type": "new_lead"}'::jsonb,
    '{"type": "email", "target": "thomas@example.com"}'::jsonb,
    142
),
(
    '00000000-0000-0000-0000-000000000000',
    'Sync CRM HubSpot',
    'active',
    '{"type": "new_lead"}'::jsonb,
    '{"type": "hubspot"}'::jsonb,
    89
),
(
    '00000000-0000-0000-0000-000000000000',
    'Alerte Slack VIP',
    'inactive',
    '{"type": "new_lead", "condition": "score > 80"}'::jsonb,
    '{"type": "slack", "channel": "#sales"}'::jsonb,
    0
);

-- 3. Insert Sample Invoices
INSERT INTO public.invoices (user_id, amount, status, created_at, pdf_url)
VALUES
('00000000-0000-0000-0000-000000000000', 49.00, 'paid', NOW() - INTERVAL '1 month', '#'),
('00000000-0000-0000-0000-000000000000', 49.00, 'paid', NOW() - INTERVAL '2 months', '#'),
('00000000-0000-0000-0000-000000000000', 49.00, 'paid', NOW() - INTERVAL '3 months', '#');

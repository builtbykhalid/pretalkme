-- Migration to add support for Settings page (Profile, Billing, Notifications) and Automations

-- 1. Enhance profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"newLead": true, "weeklyReport": true, "marketing": false}'::jsonb,
ADD COLUMN IF NOT EXISTS billing_details jsonb DEFAULT '{"plan": "free", "last4": null, "brand": null, "exp_month": null, "exp_year": null}'::jsonb;

-- 2. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    currency text DEFAULT 'EUR',
    status text DEFAULT 'paid', -- paid, pending, failed
    period_start timestamptz,
    period_end timestamptz,
    pdf_url text,
    created_at timestamptz DEFAULT now()
);

alter table invoices enable row level security;

-- Policy for invoices (view own)
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;

CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Recreate workflows table (for Automations page)
DROP TABLE IF EXISTS workflows CASCADE;
CREATE TABLE workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    status text DEFAULT 'active', -- active, inactive
    trigger_config jsonb NOT NULL, -- e.g. { "type": "form_submission", "form_id": "..." }
    action_config jsonb NOT NULL, -- e.g. { "type": "email", "to": "..." }
    run_count integer DEFAULT 0,
    last_run_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

alter table workflows enable row level security;

-- Policy for workflows (CRUD own)
DROP POLICY IF EXISTS "Users can manage own workflows" ON workflows;

CREATE POLICY "Users can manage own workflows" ON workflows
    FOR ALL USING (auth.uid() = user_id);

-- 4. Seed some initial data for the dev user
DO $$
DECLARE
    dev_user_id uuid;
BEGIN
    SELECT id INTO dev_user_id FROM profiles WHERE email = 'dev@pretalk.me';
    
    -- If dev user exists (it should from previous steps), update it
    IF dev_user_id IS NOT NULL THEN
        UPDATE profiles SET
            first_name = 'Thomas',
            last_name = 'Dubois',
            job_title = 'Consultant Marketing Senior',
            notification_preferences = '{"newLead": true, "weeklyReport": true, "marketing": false}'::jsonb,
            billing_details = '{"plan": "pro", "last4": "4242", "brand": "Visa", "exp_month": 12, "exp_year": 2028}'::jsonb
        WHERE id = dev_user_id;

        -- Insert sample invoices
        INSERT INTO invoices (user_id, amount, status, period_end, created_at)
        VALUES 
            (dev_user_id, 49.00, 'paid', now() - interval '1 month', now() - interval '1 month'),
            (dev_user_id, 49.00, 'paid', now() - interval '2 months', now() - interval '2 months');

        -- Insert sample workflows
        INSERT INTO workflows (user_id, title, status, trigger_config, action_config, run_count)
        VALUES
            (dev_user_id, 'Notification Slack Nouveaux Leads', 'active', '{"type": "new_lead"}'::jsonb, '{"type": "slack", "channel": "#leads"}'::jsonb, 142),
            (dev_user_id, 'Email de Bienvenue', 'active', '{"type": "new_lead"}'::jsonb, '{"type": "email", "template": "welcome"}'::jsonb, 89);
            
    END IF;
END $$;

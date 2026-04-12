-- Clean up empty profiles and create admin user
DELETE FROM profiles WHERE email IS NULL OR email = '';

-- Create admin user
INSERT INTO profiles (email, role, full_name, company_name, job_title, account_status)
VALUES ('admin@pretalk.me', 'admin', 'Admin Pretalk', 'Pretalk.me', 'Administrateur Plateforme', 'active')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Verify
SELECT email, role, full_name FROM profiles WHERE role = 'admin' OR email = 'thomas.dubois@example.com';

INSERT INTO user_installed_agents (user_id, agent_id, settings)
SELECT 
    p.id,
    a.id,
    '{"auto_analyze": true, "notification_email": true}'::jsonb
FROM profiles p, agents_library a
WHERE p.email = 'thomas.dubois@example.com' 
AND a.name = 'Agent Marketing Digital Expert'
ON CONFLICT (user_id, agent_id) DO UPDATE SET settings = EXCLUDED.settings;

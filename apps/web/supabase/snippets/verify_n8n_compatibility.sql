-- Quick script to verify n8n workflow compatibility
-- Run this after applying the migration to check readiness

-- 1. Check if all required columns exist in forms table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'forms' 
AND column_name IN ('consultant_email', 'consultant_name', 'consultant_role', 'domain')
ORDER BY column_name;

-- 2. Check if leads table has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('form_id', 'respondent_info', 'static_answers', 'dynamic_answers', 'ai_analysis_draft', 'score', 'status', 'created_at', 'updated_at')
ORDER BY column_name;

-- 3. Sample query to verify data structure compatibility
SELECT 
    f.id as form_id,
    f.title,
    f.consultant_email,
    f.consultant_name,
    f.consultant_role,
    f.ai_config,
    COUNT(l.id) as leads_count
FROM forms f
LEFT JOIN leads l ON l.form_id = f.id
WHERE f.status = 'published'
GROUP BY f.id, f.title, f.consultant_email, f.consultant_name, f.consultant_role, f.ai_config
LIMIT 5;

-- 4. Check sample lead data structure
SELECT 
    id,
    form_id,
    respondent_info->'email' as email,
    respondent_info->'company' as company,
    static_answers IS NOT NULL as has_static_answers,
    dynamic_answers IS NOT NULL as has_dynamic_answers,
    ai_analysis_draft IS NOT NULL as has_analysis,
    score,
    status,
    created_at
FROM leads 
WHERE form_id IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;
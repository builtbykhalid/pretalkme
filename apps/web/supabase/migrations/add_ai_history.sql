-- Add ai_analysis_json and ai_generation_history to leads table

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS ai_analysis_json JSONB,
ADD COLUMN IF NOT EXISTS ai_generation_history JSONB DEFAULT '[]'::jsonb;

-- Comment on columns
COMMENT ON COLUMN public.leads.ai_analysis_json IS 'Structured JSON output of the AI analysis';
COMMENT ON COLUMN public.leads.ai_generation_history IS 'Array of past analysis versions and consultant feedback';

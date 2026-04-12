-- 202602280000_create_deals_table.sql
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'service', -- 'service' or 'consultation'
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    consultant_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'lost'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Security RLS for deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can manage their own deals" 
ON public.deals FOR ALL 
USING (auth.uid() = consultant_id);

-- 202602280001_add_financial_fields_to_forms.sql
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consultant_cost DECIMAL(10, 2) DEFAULT 0.00;

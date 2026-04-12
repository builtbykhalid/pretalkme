-- Migration: Booking System for Pretalk.me
-- Ajoute la fonctionnalité de réservation de rendez-vous type Calendly

-- ==========================
-- Modifications sur la table forms
-- Ajout de la configuration des étapes et du booking
-- ==========================

-- Ajouter la configuration des étapes du formulaire
ALTER TABLE forms ADD COLUMN IF NOT EXISTS steps_config JSONB DEFAULT '{
    "steps_order": ["calendar", "form", "ai"],
    "calendar_enabled": false,
    "form_enabled": true,
    "ai_enabled": true
}'::jsonb;

-- Ajouter la configuration du booking/calendrier
ALTER TABLE forms ADD COLUMN IF NOT EXISTS booking_config JSONB DEFAULT '{
    "duration_minutes": 30,
    "buffer_before": 0,
    "buffer_after": 15,
    "min_notice_hours": 24,
    "max_days_advance": 30,
    "timezone": "Europe/Paris",
    "availability": {
        "monday": {"enabled": true, "slots": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
        "tuesday": {"enabled": true, "slots": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
        "wednesday": {"enabled": true, "slots": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
        "thursday": {"enabled": true, "slots": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
        "friday": {"enabled": true, "slots": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]},
        "saturday": {"enabled": false, "slots": []},
        "sunday": {"enabled": false, "slots": []}
    },
    "meeting_type": "google_meet",
    "custom_location": null
}'::jsonb;

-- ==========================
-- Table: bookings
-- Stocke les réservations faites par les prospects
-- ==========================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Informations du rendez-vous
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'Europe/Paris',
    
    -- Informations du prospect (dupliquées pour faciliter les requêtes)
    guest_email TEXT NOT NULL,
    guest_name TEXT,
    guest_phone TEXT,
    guest_company TEXT,
    
    -- Intégration Google Calendar/Meet
    google_event_id TEXT,
    google_meet_link TEXT,
    calendar_event_created BOOLEAN DEFAULT FALSE,
    
    -- Statut et workflow
    status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by TEXT, -- 'guest' ou 'host'
    
    -- Rappels et notifications
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    confirmation_sent BOOLEAN DEFAULT FALSE,
    confirmation_sent_at TIMESTAMPTZ,
    
    -- n8n tracking
    n8n_workflow_execution_id TEXT,
    n8n_webhook_triggered BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_bookings_form_id ON bookings(form_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);

-- ==========================
-- Table: blocked_dates
-- Dates bloquées par le consultant (vacances, indisponibilités ponctuelles)
-- ==========================
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE, -- NULL = bloque tous les formulaires
    
    blocked_date DATE NOT NULL,
    all_day BOOLEAN DEFAULT TRUE,
    start_time TIME, -- Si all_day = false
    end_time TIME,   -- Si all_day = false
    
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_user_id ON blocked_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);

-- ==========================
-- Table: booking_reminders
-- Gestion des rappels automatiques
-- ==========================
CREATE TABLE IF NOT EXISTS booking_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    
    reminder_type TEXT NOT NULL, -- 'email', 'sms', 'webhook'
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_scheduled ON booking_reminders(scheduled_for) WHERE sent = FALSE;

-- ==========================
-- Table: google_calendar_tokens
-- Stockage sécurisé des tokens OAuth Google Calendar par utilisateur
-- ==========================
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ,
    scope TEXT,
    
    calendar_id TEXT DEFAULT 'primary', -- ID du calendrier Google à utiliser
    is_connected BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user_id ON google_calendar_tokens(user_id);

-- ==========================
-- Modifier la table leads pour ajouter le lien vers la réservation
-- ==========================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS booking_scheduled_at TIMESTAMPTZ;

-- ==========================
-- Trigger: Mise à jour automatique de updated_at pour bookings
-- ==========================
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_updated_at();

-- ==========================
-- Fonction: Vérifier disponibilité d'un créneau
-- ==========================
CREATE OR REPLACE FUNCTION check_slot_availability(
    p_form_id UUID,
    p_user_id UUID,
    p_scheduled_at TIMESTAMPTZ,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    slot_end TIMESTAMPTZ;
    is_blocked BOOLEAN;
    has_conflict BOOLEAN;
BEGIN
    slot_end := p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Vérifier si la date est bloquée
    SELECT EXISTS (
        SELECT 1 FROM blocked_dates
        WHERE user_id = p_user_id
        AND (form_id IS NULL OR form_id = p_form_id)
        AND blocked_date = DATE(p_scheduled_at)
        AND (
            all_day = TRUE 
            OR (p_scheduled_at::TIME BETWEEN start_time AND end_time)
        )
    ) INTO is_blocked;
    
    IF is_blocked THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier les conflits avec d'autres réservations
    SELECT EXISTS (
        SELECT 1 FROM bookings
        WHERE user_id = p_user_id
        AND status NOT IN ('cancelled')
        AND (
            (scheduled_at <= p_scheduled_at AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL > p_scheduled_at)
            OR (scheduled_at < slot_end AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL >= slot_end)
            OR (scheduled_at >= p_scheduled_at AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL <= slot_end)
        )
    ) INTO has_conflict;
    
    RETURN NOT has_conflict;
END;
$$ LANGUAGE plpgsql;

-- ==========================
-- Fonction: Obtenir les créneaux disponibles pour une date
-- ==========================
CREATE OR REPLACE FUNCTION get_available_slots(
    p_form_id UUID,
    p_date DATE
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ
) AS $$
DECLARE
    v_form RECORD;
    v_booking_config JSONB;
    v_day_name TEXT;
    v_day_config JSONB;
    v_slot JSONB;
    v_slot_start TIME;
    v_slot_end TIME;
    v_duration INTEGER;
    v_buffer_after INTEGER;
    v_current_time TIME;
    v_slot_datetime TIMESTAMPTZ;
    v_timezone TEXT;
BEGIN
    -- Récupérer la configuration du formulaire
    SELECT f.*, f.booking_config INTO v_form
    FROM forms f
    WHERE f.id = p_form_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    v_booking_config := v_form.booking_config;
    v_duration := COALESCE((v_booking_config->>'duration_minutes')::INTEGER, 30);
    v_buffer_after := COALESCE((v_booking_config->>'buffer_after')::INTEGER, 15);
    v_timezone := COALESCE(v_booking_config->>'timezone', 'Europe/Paris');
    
    -- Obtenir le jour de la semaine
    v_day_name := LOWER(TO_CHAR(p_date, 'day'));
    v_day_name := TRIM(v_day_name);
    
    -- Obtenir la config du jour
    v_day_config := v_booking_config->'availability'->v_day_name;
    
    -- Vérifier si le jour est activé
    IF NOT COALESCE((v_day_config->>'enabled')::BOOLEAN, FALSE) THEN
        RETURN;
    END IF;
    
    -- Parcourir les créneaux de la journée
    FOR v_slot IN SELECT * FROM jsonb_array_elements(v_day_config->'slots')
    LOOP
        v_slot_start := (v_slot->>'start')::TIME;
        v_slot_end := (v_slot->>'end')::TIME;
        v_current_time := v_slot_start;
        
        -- Générer les créneaux
        WHILE v_current_time + (v_duration || ' minutes')::INTERVAL <= v_slot_end LOOP
            v_slot_datetime := (p_date || ' ' || v_current_time)::TIMESTAMP AT TIME ZONE v_timezone;
            
            -- Vérifier la disponibilité
            IF check_slot_availability(p_form_id, v_form.user_id, v_slot_datetime, v_duration) THEN
                slot_start := v_slot_datetime;
                slot_end := v_slot_datetime + (v_duration || ' minutes')::INTERVAL;
                RETURN NEXT;
            END IF;
            
            v_current_time := v_current_time + ((v_duration + v_buffer_after) || ' minutes')::INTERVAL;
        END LOOP;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==========================
-- RLS Policies
-- ==========================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Bookings: Consultant peut voir ses bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;

CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert bookings for their forms" ON bookings;


CREATE POLICY "Users can insert bookings for their forms" ON bookings
    FOR INSERT WITH CHECK (
        user_id IN (SELECT user_id FROM forms WHERE id = form_id)
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;


CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

-- Blocked dates: Consultant gère ses dates bloquées
DROP POLICY IF EXISTS "Users can manage own blocked dates" ON blocked_dates;

CREATE POLICY "Users can manage own blocked dates" ON blocked_dates
    FOR ALL USING (user_id = auth.uid());

-- Google tokens: Utilisateur gère ses propres tokens
DROP POLICY IF EXISTS "Users can manage own google tokens" ON google_calendar_tokens;

CREATE POLICY "Users can manage own google tokens" ON google_calendar_tokens
    FOR ALL USING (user_id = auth.uid());

-- Booking reminders: Via le système
DROP POLICY IF EXISTS "System can manage reminders" ON booking_reminders;

CREATE POLICY "System can manage reminders" ON booking_reminders
    FOR ALL USING (
        booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid())
    );

-- ==========================
-- Accès anonyme pour la réservation publique
-- ==========================
DROP POLICY IF EXISTS "Anyone can view form booking config" ON forms;

CREATE POLICY "Anyone can view form booking config" ON forms
    FOR SELECT USING (status = 'published' OR status = 'Active');

DROP POLICY IF EXISTS "Anyone can create bookings for published forms" ON bookings;


CREATE POLICY "Anyone can create bookings for published forms" ON bookings
    FOR INSERT WITH CHECK (
        form_id IN (SELECT id FROM forms WHERE status IN ('published', 'Active'))
    );

-- ==========================
-- Commentaires
-- ==========================
COMMENT ON TABLE bookings IS 'Réservations de rendez-vous faites par les prospects';
COMMENT ON TABLE blocked_dates IS 'Dates/créneaux bloqués par les consultants';
COMMENT ON TABLE booking_reminders IS 'Rappels automatiques pour les rendez-vous';
COMMENT ON TABLE google_calendar_tokens IS 'Tokens OAuth Google Calendar pour chaque utilisateur';
COMMENT ON COLUMN forms.steps_config IS 'Configuration de l''ordre et activation des étapes (calendar, form, ai)';
COMMENT ON COLUMN forms.booking_config IS 'Configuration complète du système de réservation Calendly-like';

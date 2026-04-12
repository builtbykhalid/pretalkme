-- ============================================================
-- Migration: Système de Disponibilités pour Profil Public
-- Description: Découplage complet du calendrier des formulaires pour permettre
-- une gestion des disponibilités globale sur le profil.
-- ============================================================

-- 1. Ajout de la configuration de disponibilité au profil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS booking_config JSONB DEFAULT '{
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
    "meeting_type": "google_meet"
  }'::jsonb;

-- 2. Ajout de la configuration des étapes au profil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS steps_config JSONB DEFAULT '{
    "calendar_enabled": true,
    "form_enabled": false,
    "ai_enabled": false,
    "intro_enabled": false,
    "calendar_first": true,
    "steps_order": ["calendar"]
  }'::jsonb;

-- 3. Mise à jour de la table bookings (form_id devient optionnel)
ALTER TABLE public.bookings ALTER COLUMN form_id DROP NOT NULL;

-- 4. [CRITIQUE] Nouvelle fonction pour obtenir les disponibilités du profil
-- Cette fonction permet de calculer les créneaux libres sans dépendre d'un formulaire.
CREATE OR REPLACE FUNCTION get_profile_available_slots(
    p_username TEXT,
    p_date DATE
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ
) AS $$
DECLARE
    v_profile RECORD;
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
    -- Récupérer la configuration du profil
    SELECT * INTO v_profile
    FROM profiles
    WHERE username = p_username;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    v_booking_config := v_profile.booking_config;
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
            
            -- Vérifier la disponibilité (On utilise check_slot_availability existante mais sans form_id)
            IF check_slot_availability(NULL, v_profile.id, v_slot_datetime, v_duration) THEN
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

-- 5. Mise à jour de la fonction check_slot_availability pour supporter form_id NULL
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
        AND (p_form_id IS NULL OR form_id IS NULL OR form_id = p_form_id)
        AND blocked_date = DATE(p_scheduled_at)
        AND (
            all_day = TRUE 
            OR (p_scheduled_at::TIME BETWEEN start_time AND end_time)
        )
    ) INTO is_blocked;
    
    IF is_blocked THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier les conflits avec d'autres réservations (indépendamment du formulaire)
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

-- 6. Mise à jour des vues
DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE VIEW public.public_profiles AS
SELECT 
  id, username, first_name, last_name, full_name, job_title, bio, avatar_url, 
  website, social_networks, public_visibility, page_config, custom_links,
  booking_config, steps_config
FROM public.profiles
WHERE account_status = 'active';

DROP VIEW IF EXISTS public_forms_view CASCADE;
CREATE VIEW public_forms_view AS
SELECT
  f.id AS form_id, f.user_id, p.id AS profile_id, p.username, p.first_name, p.last_name, 
  p.avatar_url, p.job_title, p.bio, p.website, p.social_networks, p.public_visibility, 
  p.page_config, p.custom_links, 
  p.booking_config AS profile_booking_config, 
  p.steps_config AS profile_steps_config,
  f.title, f.slug, f.clean_slug, f.description, f.form_structure, f.design_config, 
  f.steps_config, f.booking_config, f.created_at, f.updated_at
FROM forms f
JOIN profiles p ON p.id = f.user_id
WHERE f.is_public = TRUE;

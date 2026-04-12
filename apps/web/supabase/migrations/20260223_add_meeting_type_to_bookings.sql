-- Ajout de la colonne meeting_type à la table bookings
-- Permet de savoir si le rendez-vous est en visio ou en présentiel

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS meeting_type TEXT;

-- Mettre à jour la vue publique si nécessaire
DROP VIEW IF EXISTS public.public_bookings;
CREATE OR REPLACE VIEW public.public_bookings AS
SELECT * FROM public.bookings;

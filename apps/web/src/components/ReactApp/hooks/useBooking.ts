import { useState, useCallback } from 'react';
import { directApi } from '../lib/supabase';
import { N8N_BOOKING_WEBHOOK } from '../lib/n8n';
import type {
    BookingConfig,
    Booking,
    AvailableSlot,
    CreateBookingData,
    BlockedDate,
} from '../types/booking';
import { DEFAULT_BOOKING_CONFIG } from '../types/booking';
// n8n webhook calls are handled server-side via Supabase DB webhook

// Use centralized webhook constant from src/lib/n8n.ts

interface UseBookingReturn {
    // État
    isLoading: boolean;
    error: string | null;
    availableSlots: AvailableSlot[];
    bookings: Booking[];
    blockedDates: BlockedDate[];

    // Actions
    fetchAvailableSlots: (formId: string, date: Date) => Promise<void>;
    fetchAvailableDates: (formId: string, month: Date) => Promise<Date[]>;
    createBooking: (data: CreateBookingData) => Promise<Booking | null>;
    cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>;
    rescheduleBooking: (bookingId: string, newDate: string) => Promise<boolean>;
    fetchUserBookings: (userId: string) => Promise<void>;
    addBlockedDate: (blockedDate: Omit<BlockedDate, 'id' | 'created_at'>) => Promise<boolean>;
    removeBlockedDate: (blockedDateId: string) => Promise<boolean>;

    // Reset
    reset: () => void;
}

// Fonction utilitaire pour formater une date en français
const formatDateFr = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };
    return date.toLocaleDateString('fr-FR', options);
};

// Fonction utilitaire pour formater l'heure
const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// Générer les créneaux côté client
const generateSlotsForDate = (
    date: Date,
    bookingConfig: BookingConfig,
    existingBookings: Booking[],
    blockedDates: BlockedDate[]
): AvailableSlot[] => {
    const slots: AvailableSlot[] = [];

    // Obtenir le jour de la semaine
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()] as keyof typeof bookingConfig.availability;
    const dayConfig = bookingConfig.availability[dayName];

    if (!dayConfig.enabled) {
        return slots;
    }

    // Vérifier si la date est bloquée
    const dateString = date.toISOString().split('T')[0];
    const isBlocked = blockedDates.some(bd => {
        if (bd.blocked_date === dateString) {
            if (bd.all_day) return true;
            // TODO: vérifier les heures spécifiques
        }
        return false;
    });

    if (isBlocked) {
        return slots;
    }

    // Calculer les créneaux
    const { duration_minutes, buffer_after, min_notice_hours } = bookingConfig;
    const now = new Date();
    const minNoticeTime = new Date(now.getTime() + min_notice_hours * 60 * 60 * 1000);

    dayConfig.slots.forEach(timeSlot => {
        const [startHour, startMin] = timeSlot.start.split(':').map(Number);
        const [endHour, endMin] = timeSlot.end.split(':').map(Number);

        let currentTime = new Date(date);
        currentTime.setHours(startHour, startMin, 0, 0);

        const slotEndLimit = new Date(date);
        slotEndLimit.setHours(endHour, endMin, 0, 0);

        while (currentTime.getTime() + duration_minutes * 60 * 1000 <= slotEndLimit.getTime()) {
            // Vérifier le préavis minimum
            if (currentTime <= minNoticeTime) {
                currentTime = new Date(currentTime.getTime() + (duration_minutes + buffer_after) * 60 * 1000);
                continue;
            }

            // Vérifier les conflits avec les réservations existantes
            const slotEnd = new Date(currentTime.getTime() + duration_minutes * 60 * 1000);
            const hasConflict = existingBookings.some(booking => {
                if (booking.status === 'cancelled') return false;
                const bookingStart = new Date(booking.scheduled_at);
                const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60 * 1000);
                return (currentTime < bookingEnd && slotEnd > bookingStart);
            });

            if (!hasConflict) {
                slots.push({
                    slot_start: currentTime.toISOString(),
                    slot_end: slotEnd.toISOString(),
                    formatted_time: formatTime(currentTime.toISOString()),
                    formatted_date: formatDateFr(currentTime),
                });
            }

            currentTime = new Date(currentTime.getTime() + (duration_minutes + buffer_after) * 60 * 1000);
        }
    });

    return slots;
};

export function useBooking(): UseBookingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

    // Récupérer les créneaux disponibles pour une date
    const fetchAvailableSlots = useCallback(async (formId: string, date: Date) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Récupérer la configuration du formulaire
            const formData = await directApi.select('forms', 'booking_config, user_id', {
                'id': `eq.${formId}`
            });

            if (!formData || formData.length === 0) {
                throw new Error('Formulaire introuvable');
            }

            const form = formData[0];
            const bookingConfig: BookingConfig = form.booking_config || DEFAULT_BOOKING_CONFIG;

            // 2. Récupérer les réservations existantes pour ce jour
            const dateString = date.toISOString().split('T')[0];

            const existingBookings = await directApi.select('bookings', '*', {
                'user_id': `eq.${form.user_id}`,
                'scheduled_at': `gte.${dateString}`,
                'status': 'neq.cancelled'
            });

            // 3. Récupérer les dates bloquées
            const blocked = await directApi.select('blocked_dates', '*', {
                'user_id': `eq.${form.user_id}`,
                'blocked_date': `eq.${dateString}`
            });

            // 4. Générer les créneaux
            const slots = generateSlotsForDate(
                date,
                bookingConfig,
                existingBookings || [],
                blocked || []
            );

            setAvailableSlots(slots);
        } catch (err: any) {
            console.error('Error fetching slots:', err);
            setError(err.message || 'Erreur lors de la récupération des créneaux');
            setAvailableSlots([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Récupérer les dates avec des disponibilités pour un mois
    const fetchAvailableDates = useCallback(async (formId: string, month: Date): Promise<Date[]> => {
        try {
            // Récupérer la configuration du formulaire
            const formData = await directApi.select('forms', 'booking_config, user_id', {
                'id': `eq.${formId}`
            });

            if (!formData || formData.length === 0) {
                return [];
            }

            const form = formData[0];
            const bookingConfig: BookingConfig = form.booking_config || DEFAULT_BOOKING_CONFIG;

            // Calculer les dates du mois
            const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
            const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Max days advance
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + bookingConfig.max_days_advance);

            const availableDates: Date[] = [];

            // Parcourir chaque jour du mois
            for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
                // Ignorer les dates passées
                if (d < today) continue;

                // Ignorer les dates au-delà du max
                if (d > maxDate) continue;

                // Vérifier si le jour est activé
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayName = dayNames[d.getDay()] as keyof typeof bookingConfig.availability;

                if (bookingConfig.availability[dayName].enabled) {
                    availableDates.push(new Date(d));
                }
            }

            return availableDates;
        } catch (err) {
            console.error('Error fetching available dates:', err);
            return [];
        }
    }, []);

    // Créer une réservation
    const createBooking = useCallback(async (data: CreateBookingData): Promise<Booking | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Récupérer les infos du formulaire
            const formData = await directApi.select(
                'forms',
                'id, title, user_id, booking_config',
                { 'id': `eq.${data.form_id}` }
            );

            if (!formData || formData.length === 0) {
                throw new Error('Formulaire introuvable');
            }

            const form = formData[0];
            const bookingConfig: BookingConfig = form.booking_config || DEFAULT_BOOKING_CONFIG;

            // consultant info is handled server-side; no client-side use needed

            // 3. Créer la réservation dans la base
            const bookingData = {
                form_id: data.form_id,
                user_id: form.user_id,
                scheduled_at: data.scheduled_at,
                duration_minutes: bookingConfig.duration_minutes,
                timezone: data.timezone || bookingConfig.timezone,
                guest_email: data.guest_email,
                guest_name: data.guest_name || null,
                guest_phone: data.guest_phone || null,
                guest_company: data.guest_company || null,
                notes: data.notes || null,
                meeting_type: data.meeting_type || bookingConfig.meeting_type,
                lead_id: data.lead_id || null,
                service_id: data.service_id || null,
                status: 'pending',
                calendar_event_created: false,
                n8n_webhook_triggered: false,
            };

            const result = await directApi.insert('bookings', bookingData);

            if (!result || result.length === 0) {
                throw new Error('Erreur lors de la création de la réservation');
            }

            const booking = result[0] as Booking;

            // Trigger n8n booking webhook for Google Calendar event creation and email notifications
            // This is a fire-and-forget call — webhook failure must not break the booking flow.
            try {
                fetch(N8N_BOOKING_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        booking_id: booking.id,
                        form_id: booking.form_id,
                        user_id: booking.user_id,
                        action: 'create',
                        scheduled_at: booking.scheduled_at,
                        duration_minutes: booking.duration_minutes,
                        timezone: booking.timezone,
                        guest_email: booking.guest_email,
                        guest_name: booking.guest_name,
                        guest_phone: booking.guest_phone,
                        guest_company: booking.guest_company,
                        meeting_type: booking.meeting_type,
                        service_id: booking.service_id,
                    }),
                }).catch(e => console.warn('[n8n] Booking webhook call failed (non-blocking):', e));
            } catch (e) {
                console.warn('[n8n] Could not fire booking webhook:', e);
            }

            return booking;
        } catch (err: any) {
            console.error('Error creating booking:', err);
            setError(err.message || 'Erreur lors de la création de la réservation');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Annuler une réservation
    const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Récupérer la réservation
            const bookingData = await directApi.select('bookings', '*', { 'id': `eq.${bookingId}` });
            if (!bookingData || bookingData.length === 0) {
                throw new Error('Réservation introuvable');
            }
            // 2. Mettre à jour le statut
            await directApi.update('bookings', {
                status: 'cancelled',
                cancellation_reason: reason || '',
                cancelled_at: new Date().toISOString(),
                cancelled_by: 'guest',
            }, { 'id': `eq.${bookingId}` });

            // Cancellation webhook handled server-side via Supabase DB webhook.
            // Frontend should not call n8n directly.

            return true;
        } catch (err: any) {
            console.error('Error cancelling booking:', err);
            setError(err.message || 'Erreur lors de l\'annulation');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reprogrammer une réservation
    const rescheduleBooking = useCallback(async (bookingId: string, newDate: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // Optionnel : Vous pouvez vérifier la disponibilité ici ou faire confiance à l'UI
            await directApi.update('bookings', {
                scheduled_at: newDate,
                updated_at: new Date().toISOString()
            }, { 'id': `eq.${bookingId}` });

            // Le webhook Supabase (Update) se chargera d'appeler Google Calendar 
            return true;
        } catch (err: any) {
            console.error('Error rescheduling booking:', err);
            setError(err.message || 'Erreur lors de la reprogrammation');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Récupérer les réservations d'un utilisateur
    const fetchUserBookings = useCallback(async (userId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await directApi.select('bookings', '*', {
                'user_id': `eq.${userId}`,
                'order': 'scheduled_at.desc'
            });

            setBookings(data || []);
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Erreur lors de la récupération des réservations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Ajouter une date bloquée
    const addBlockedDate = useCallback(async (
        blockedDate: Omit<BlockedDate, 'id' | 'created_at'>
    ): Promise<boolean> => {
        try {
            await directApi.insert('blocked_dates', blockedDate);
            return true;
        } catch (err: any) {
            console.error('Error adding blocked date:', err);
            setError(err.message);
            return false;
        }
    }, []);

    // Supprimer une date bloquée
    const removeBlockedDate = useCallback(async (blockedDateId: string): Promise<boolean> => {
        try {
            await directApi.delete('blocked_dates', { id: blockedDateId });
            return true;
        } catch (err: any) {
            console.error('Error removing blocked date:', err);
            setError(err.message);
            return false;
        }
    }, []);

    // Reset
    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setAvailableSlots([]);
        setBookings([]);
        setBlockedDates([]);
    }, []);

    return {
        isLoading,
        error,
        availableSlots,
        bookings,
        blockedDates,
        fetchAvailableSlots,
        fetchAvailableDates,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        fetchUserBookings,
        addBlockedDate,
        removeBlockedDate,
        reset,
    };
}

export default useBooking;

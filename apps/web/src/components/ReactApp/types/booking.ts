// Types pour le système de booking Calendly-like
// Pretalk.me - Booking Types

// ==========================================
// Configuration des étapes du formulaire
// ==========================================
export type FormStepType = 'calendar' | 'form' | 'ai';

export interface StepsConfig {
    steps_order: FormStepType[];
    calendar_enabled: boolean;
    form_enabled: boolean;
    ai_enabled: boolean;
    booking_info_enabled?: boolean;
    sections_enabled?: boolean;
    voice_recorder_enabled?: boolean;
}

// ==========================================
// Configuration du booking/calendrier
// ==========================================
export interface TimeSlot {
    start: string; // Format "HH:MM"
    end: string;   // Format "HH:MM"
}

export interface DayAvailability {
    enabled: boolean;
    slots: TimeSlot[];
}

export interface WeeklyAvailability {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
}

export type MeetingType = 'google_meet' | 'zoom' | 'phone' | 'in_person' | 'custom';

export interface BookingConfig {
    duration_minutes: number;       // Durée du RDV (15, 30, 45, 60, 90, 120)
    buffer_before: number;          // Temps tampon avant le RDV (en minutes)
    buffer_after: number;           // Temps tampon après le RDV (en minutes)
    min_notice_hours: number;       // Préavis minimum pour réserver (en heures)
    max_days_advance: number;       // Réservation max jours à l'avance
    timezone: string;               // Fuseau horaire (ex: "Europe/Paris")
    availability: WeeklyAvailability;
    meeting_type: MeetingType;
    allowed_meeting_types?: MeetingType[]; // Types autorisés pour ce formulaire
    custom_location?: string;       // Lieu personnalisé si meeting_type = 'custom' ou 'in_person'
    // Bring Your Own Calendar: optional external booking link + display mode
    external_booking_url?: string;  // ex: https://cal.com/mon-nom or https://calendly.com/mon-nom
    booking_display_mode?: 'external' | 'iframe' | 'none';

    // Contact form fields for the booking
    ask_guest_phone?: boolean;
    ask_guest_company?: boolean;
    ask_notes?: boolean;
}

// ==========================================
// Réservation (Booking)
// ==========================================
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
    id: string;
    form_id: string;
    lead_id?: string;
    user_id: string;

    // Informations du rendez-vous
    scheduled_at: string;           // ISO datetime
    duration_minutes: number;
    timezone: string;

    // Informations du prospect
    guest_email: string;
    guest_name?: string;
    guest_phone?: string;
    guest_company?: string;

    // Intégration Google Calendar/Meet
    google_event_id?: string;
    google_meet_link?: string;
    meeting_type?: string;
    calendar_event_created: boolean;

    // Statut
    status: BookingStatus;
    cancellation_reason?: string;
    cancelled_at?: string;
    cancelled_by?: 'guest' | 'host';

    // Notifications
    reminder_sent: boolean;
    confirmation_sent: boolean;

    // n8n
    n8n_workflow_execution_id?: string;
    n8n_webhook_triggered: boolean;

    // Métadonnées
    service_id?: string;
    notes?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// ==========================================
// Date bloquée
// ==========================================
export interface BlockedDate {
    id: string;
    user_id: string;
    form_id?: string;               // null = bloque tous les formulaires
    blocked_date: string;           // Format YYYY-MM-DD
    all_day: boolean;
    start_time?: string;            // Format HH:MM
    end_time?: string;              // Format HH:MM
    reason?: string;
    created_at: string;
}

// ==========================================
// Créneau disponible (pour l'affichage)
// ==========================================
export interface AvailableSlot {
    slot_start: string;             // ISO datetime
    slot_end: string;               // ISO datetime
    formatted_time: string;         // Ex: "09:00"
    formatted_date: string;         // Ex: "Lundi 15 Janvier"
}

// ==========================================
// Formulaire étendu avec booking
// ==========================================
export interface FormWithBooking {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    status: string;
    form_structure: any[];
    ai_config: {
        systemPrompt: string;
        tone: 'professional' | 'friendly' | 'strict' | 'empathetic';
        numberOfQuestions: number;
        questionComplexity: 'simple' | 'intermediate' | 'expert';
        questionContext: string;
        model: string;
        agentId: string | null;
        welcomeMessage?: string;
    };
    design_config: any;
    steps_config: StepsConfig;
    booking_config: BookingConfig;
    views_count: number;
    leads_count: number;
    created_at: string;
    updated_at: string;
}

// ==========================================
// Données pour créer une réservation
// ==========================================
export interface CreateBookingData {
    form_id: string;
    scheduled_at: string;
    guest_email: string;
    guest_name?: string;
    guest_phone?: string;
    guest_company?: string;
    notes?: string;
    meeting_type?: string;
    timezone?: string;
    lead_id?: string;
    service_id?: string;
}

// ==========================================
// Résultat de la création de booking via n8n
// ==========================================
export interface BookingWebhookPayload {
    booking_id: string;
    form_id: string;
    form_title: string;
    consultant_email: string;
    consultant_name: string;

    // Guest info
    guest_email: string;
    guest_name: string;
    guest_phone?: string;
    guest_company?: string;

    // Meeting details
    scheduled_at: string;
    duration_minutes: number;
    timezone: string;
    meeting_type: MeetingType;
    custom_location?: string;

    // Action
    action: 'create' | 'cancel' | 'reschedule';

    // Additional data
    static_answers?: Record<string, string>;
    ai_answers?: Record<string, string>;
}

// ==========================================
// État du calendrier UI
// ==========================================
export interface CalendarState {
    selectedDate: Date | null;
    selectedSlot: AvailableSlot | null;
    currentMonth: Date;
    availableSlots: AvailableSlot[];
    isLoading: boolean;
    error: string | null;
}

// ==========================================
// Configuration de l'affichage calendrier
// ==========================================
export interface CalendarDisplayConfig {
    locale: string;                 // 'fr-FR', 'en-US'
    firstDayOfWeek: 0 | 1;          // 0 = Dimanche, 1 = Lundi
    showWeekNumbers: boolean;
    minDate?: Date;
    maxDate?: Date;
}

// ==========================================
// Props pour les composants
// ==========================================
export interface CalendarBookingProps {
    formId: string;
    bookingConfig: BookingConfig;
    designConfig: any;
    onSlotSelected: (slot: AvailableSlot) => void;
    onBack?: () => void;
}

export interface BookingConfirmationProps {
    booking: Booking;
    formTitle: string;
    consultantName: string;
    meetLink?: string;
}

export interface StepsConfigEditorProps {
    config: StepsConfig;
    onChange: (config: StepsConfig) => void;
    bookingConfig: BookingConfig;
    onBookingConfigChange: (config: BookingConfig) => void;
}

// ==========================================
// Default values
// ==========================================
export const DEFAULT_STEPS_CONFIG: StepsConfig = {
    steps_order: ['calendar', 'form', 'ai'],
    calendar_enabled: false,
    form_enabled: true,
    ai_enabled: true,
    booking_info_enabled: false,
    sections_enabled: false,
    voice_recorder_enabled: false,
};

export const DEFAULT_DAY_AVAILABILITY: DayAvailability = {
    enabled: true,
    slots: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
    ]
};

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
    duration_minutes: 30,
    buffer_before: 0,
    buffer_after: 15,
    min_notice_hours: 24,
    max_days_advance: 30,
    timezone: 'Europe/Paris',
    availability: {
        monday: DEFAULT_DAY_AVAILABILITY,
        tuesday: DEFAULT_DAY_AVAILABILITY,
        wednesday: DEFAULT_DAY_AVAILABILITY,
        thursday: DEFAULT_DAY_AVAILABILITY,
        friday: DEFAULT_DAY_AVAILABILITY,
        saturday: { enabled: false, slots: [] },
        sunday: { enabled: false, slots: [] },
    },
    meeting_type: 'google_meet',
    allowed_meeting_types: ['google_meet'],
    custom_location: undefined,
    external_booking_url: undefined,
    booking_display_mode: 'external',
    ask_guest_phone: false,
    ask_guest_company: false,
    ask_notes: false,
};

// ==========================================
// Durées disponibles pour les RDV
// ==========================================
export const DURATION_OPTIONS = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 heure' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2 heures' },
];

// ==========================================
// Types de réunion
// ==========================================
export const MEETING_TYPE_OPTIONS = [
    { value: 'google_meet', label: 'Google Meet', icon: 'video' },
    { value: 'zoom', label: 'Zoom', icon: 'video' },
    { value: 'phone', label: 'Appel téléphonique', icon: 'phone' },
    { value: 'in_person', label: 'En personne', icon: 'map-pin' },
    { value: 'custom', label: 'Lieu personnalisé', icon: 'edit' },
];

// ==========================================
// Fuseaux horaires communs
// ==========================================
export const TIMEZONE_OPTIONS = [
    { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
    { value: 'Europe/London', label: 'Londres (UTC+0/+1)' },
    { value: 'Europe/Brussels', label: 'Bruxelles (UTC+1/+2)' },
    { value: 'Europe/Zurich', label: 'Zurich (UTC+1/+2)' },
    { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
    { value: 'America/Montreal', label: 'Montréal (UTC-5/-4)' },
    { value: 'Africa/Casablanca', label: 'Casablanca (UTC+0/+1)' },
    { value: 'Africa/Tunis', label: 'Tunis (UTC+1)' },
];

// ==========================================
// Jours de la semaine (pour affichage)
// ==========================================
export const WEEKDAYS = [
    { key: 'monday', label: 'Lundi', short: 'Lun' },
    { key: 'tuesday', label: 'Mardi', short: 'Mar' },
    { key: 'wednesday', label: 'Mercredi', short: 'Mer' },
    { key: 'thursday', label: 'Jeudi', short: 'Jeu' },
    { key: 'friday', label: 'Vendredi', short: 'Ven' },
    { key: 'saturday', label: 'Samedi', short: 'Sam' },
    { key: 'sunday', label: 'Dimanche', short: 'Dim' },
] as const;

export type WeekdayKey = typeof WEEKDAYS[number]['key'];

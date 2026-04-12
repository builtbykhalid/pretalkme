import { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Calendar as CalendarIcon,
    MapPin,
    Video,
    Phone
} from 'lucide-react';
import { useBooking } from '../hooks/useBooking';
import type {
    BookingConfig,
    AvailableSlot
} from '../types/booking';
import { DEFAULT_BOOKING_CONFIG } from '../types/booking';

interface CalendarBookingProps {
    formId: string;
    bookingConfig?: BookingConfig;
    designConfig?: {
        primaryColor: string;
        buttonStyle: string;
        font: string;
    };
    isDark?: boolean;
    onSlotSelected: (slot: AvailableSlot, meetingType: string) => void;
    onBack?: () => void;
}

// Couleurs par défaut
const COLORS: Record<string, string> = {
    'indigo': '#6366f1',
    'emerald': '#10b981',
    'rose': '#f43f5e',
    'amber': '#f59e0b',
    'slate': '#64748b',
    'violet': '#8b5cf6',
};

// Noms des jours de la semaine en français
const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Noms des mois en français
const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function CalendarBooking({
    formId,
    bookingConfig = DEFAULT_BOOKING_CONFIG,
    designConfig,
    isDark = false,
    onSlotSelected,
    onBack,
}: CalendarBookingProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [selectedMeetingType, setSelectedMeetingType] = useState<string>(
        (bookingConfig.allowed_meeting_types && bookingConfig.allowed_meeting_types.length > 0)
            ? bookingConfig.allowed_meeting_types[0]
            : bookingConfig.meeting_type
    );

    const {
        isLoading,
        error,
        availableSlots,
        fetchAvailableSlots,
        fetchAvailableDates
    } = useBooking();

    // Couleur principale
    const primaryColor = designConfig?.primaryColor || 'indigo';
    const primaryColorHex = COLORS[primaryColor] || COLORS['indigo'];
    const buttonStyle = designConfig?.buttonStyle || 'rounded-xl';

    // Charger les dates disponibles quand le mois change
    useEffect(() => {
        const loadAvailableDates = async () => {
            const dates = await fetchAvailableDates(formId, currentMonth);
            setAvailableDates(dates);
        };
        loadAvailableDates();
    }, [formId, currentMonth, fetchAvailableDates]);

    // Charger les créneaux quand une date est sélectionnée
    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots(formId, selectedDate);
        }
    }, [formId, selectedDate, fetchAvailableSlots]);

    // Générer les jours du calendrier
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Premier jour du mois
        const firstDay = new Date(year, month, 1);
        // Dernier jour du mois
        const lastDay = new Date(year, month + 1, 0);

        // Jour de la semaine du premier jour (0 = dimanche, on veut lundi = 0)
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6; // Dimanche devient 6

        const days: (Date | null)[] = [];

        // Ajouter des jours vides avant le premier jour
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Ajouter les jours du mois
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    }, [currentMonth]);

    // Vérifier si une date est disponible
    const isDateAvailable = (date: Date): boolean => {
        return availableDates.some(d =>
            d.getFullYear() === date.getFullYear() &&
            d.getMonth() === date.getMonth() &&
            d.getDate() === date.getDate()
        );
    };

    // Vérifier si une date est passée
    const isDatePast = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Vérifier si une date est sélectionnée
    const isDateSelected = (date: Date): boolean => {
        if (!selectedDate) return false;
        return (
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
        );
    };

    // Navigation mois
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    // Formater la durée
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
    };

    // Icône du type de réunion
    const getMeetingIcon = (type = selectedMeetingType) => {
        switch (type) {
            case 'google_meet':
            case 'zoom':
                return <Video size={16} />;
            case 'phone':
                return <Phone size={16} />;
            case 'in_person':
            case 'custom':
                return <MapPin size={16} />;
            default:
                return <Video size={16} />;
        }
    };

    // Label du type de réunion
    const getMeetingLabel = (type = selectedMeetingType): string => {
        switch (type) {
            case 'google_meet':
                return 'Visioconférence';
            case 'zoom':
                return 'Zoom';
            case 'phone':
                return 'Appel téléphonique';
            case 'in_person':
                return 'En personne';
            case 'custom':
                return bookingConfig.custom_location || 'Lieu personnalisé';
            default:
                return 'Visioconférence';
        }
    };

    const allowedTypes = bookingConfig.allowed_meeting_types || [bookingConfig.meeting_type];
    const hasMultipleTypes = allowedTypes.length > 1;

    return (
        <div className="p-6 space-y-6">
            {/* En-tête avec infos RDV */}
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-neutral-100'}`}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColorHex}15` }}
                    >
                        <CalendarIcon size={20} style={{ color: primaryColorHex }} />
                    </div>
                    <div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-dark'}`}>Choisissez un créneau</h3>
                        <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatDuration(bookingConfig.duration_minutes)}
                            </span>
                            <span className="flex items-center gap-1">
                                {getMeetingIcon()}
                                {getMeetingLabel()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Type Selection (if multiple) */}
            {hasMultipleTypes && (
                <div className={`flex ${isDark ? 'bg-white/10' : 'bg-neutral-100'} p-1 rounded-2xl`}>
                    {allowedTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedMeetingType(type)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${selectedMeetingType === type
                                ? isDark ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-dark shadow-sm'
                                : isDark ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-dark'
                                }`}
                        >
                            {getMeetingIcon(type)}
                            {getMeetingLabel(type)}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Calendrier */}
                <div className="space-y-4">
                    {/* Navigation du mois */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goToPreviousMonth}
                            className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'} rounded-lg transition-colors`}
                        >
                            <ChevronLeft size={20} className={isDark ? 'text-white/70' : 'text-neutral-600'} />
                        </button>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-dark'}`}>
                            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h4>
                        <button
                            onClick={goToNextMonth}
                            className={`p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'} rounded-lg transition-colors`}
                        >
                            <ChevronRight size={20} className={isDark ? 'text-white/70' : 'text-neutral-600'} />
                        </button>
                    </div>

                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 gap-1">
                        {WEEKDAY_NAMES.map(day => (
                            <div
                                key={day}
                                className={`text-center text-xs font-medium ${isDark ? 'text-white/40' : 'text-neutral-400'} py-2`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grille du calendrier */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, idx) => {
                            if (!date) {
                                return <div key={`empty-${idx}`} className="h-10" />;
                            }

                            const isPast = isDatePast(date);
                            const isAvailable = isDateAvailable(date);
                            const isSelected = isDateSelected(date);
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <button
                                    key={date.toISOString()}
                                    disabled={isPast || !isAvailable}
                                    onClick={() => setSelectedDate(date)}
                                    className={`
                                        h-10 rounded-lg text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'text-white shadow-md'
                                            : isAvailable && !isPast
                                                ? isDark ? 'text-white hover:bg-white/10' : 'text-dark hover:bg-neutral-100'
                                                : isDark ? 'text-white/20 cursor-not-allowed' : 'text-neutral-300 cursor-not-allowed'
                                        }
                                        ${isToday && !isSelected ? isDark ? 'ring-2 ring-inset ring-white/20' : 'ring-2 ring-inset ring-neutral-200' : ''}
                                    `}
                                    style={isSelected ? { backgroundColor: primaryColorHex } : undefined}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Légende */}
                    <div className={`flex items-center justify-center gap-4 text-xs ${isDark ? 'text-white/50' : 'text-neutral-500'} pt-2`}>
                        <div className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: primaryColorHex }}
                            />
                            <span>Sélectionné</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${isDark ? 'bg-white/10 border border-white/20' : 'bg-neutral-100 border border-neutral-200'}`} />
                            <span>Disponible</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${isDark ? 'bg-white/5 border border-white/10' : 'bg-neutral-50 border border-neutral-100'}`} />
                            <span>Indisponible</span>
                        </div>
                    </div>
                </div>

                {/* Liste des créneaux */}
                <div className="space-y-4">
                    {selectedDate ? (
                        <>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-dark'}`}>
                                {selectedDate.toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </h4>

                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`h-12 ${isDark ? 'bg-white/10' : 'bg-neutral-100'} rounded-lg animate-pulse`}
                                        />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className={`p-4 ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-neutral-50 border-neutral-100 text-neutral-500'} border rounded-xl text-sm text-center`}>
                                    Aucun créneau disponible pour cette date
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {availableSlots.map((slot, idx) => (
                                        <button
                                            key={`${slot.slot_start}-${idx}`}
                                            onClick={() => onSlotSelected(slot, selectedMeetingType)}
                                            className={`
                                                w-full px-4 py-3 border-2 ${buttonStyle} 
                                                font-medium text-sm transition-all
                                                hover:shadow-md
                                            `}
                                            style={{
                                                borderColor: `${primaryColorHex}30`,
                                                color: primaryColorHex,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = `${primaryColorHex}10`;
                                                e.currentTarget.style.borderColor = primaryColorHex;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = `${primaryColorHex}30`;
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{slot.formatted_time}</span>
                                                <ChevronRight size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                style={{ backgroundColor: `${primaryColorHex}10` }}
                            >
                                <CalendarIcon size={28} style={{ color: primaryColorHex }} />
                            </div>
                            <p className={`${isDark ? 'text-white/50' : 'text-neutral-500'} text-sm`}>
                                Sélectionnez une date sur le calendrier pour voir les créneaux disponibles
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bouton retour si disponible */}
            {onBack && (
                <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-neutral-100'}`}>
                    <button
                        onClick={onBack}
                        className={`text-sm ${isDark ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-dark'} transition-colors`}
                    >
                        ← Retour
                    </button>
                </div>
            )}
        </div>
    );
}

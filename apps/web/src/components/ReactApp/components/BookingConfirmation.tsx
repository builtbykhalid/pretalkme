import {
    CheckCircle2,
    Calendar,
    Clock,
    Video,
    Phone,
    Mail,
    User,
    Building,
    ExternalLink,
    MapPin,
    Globe,
    MessageCircle,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Github
} from 'lucide-react';
import type { Booking } from '../types/booking';

interface ConsultantPublicInfo {
    bio?: string;
    phone?: string;
    website?: string;
    social_networks?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
        youtube?: string;
        github?: string;
        other?: string;
    };
}

interface BookingConfirmationProps {
    booking: Booking;
    formTitle: string;
    consultantName: string;
    consultantEmail?: string;
    consultantPublicInfo?: ConsultantPublicInfo;
    primaryColorHex?: string;
    isDark?: boolean;
}

export default function BookingConfirmation({
    booking,
    formTitle,
    consultantName,
    consultantEmail,
    consultantPublicInfo,
    primaryColorHex = '#6366f1',
    isDark = false,
}: BookingConfirmationProps) {
    // Formater la date
    const scheduledDate = new Date(booking.scheduled_at);
    const formattedDate = scheduledDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Calculer l'heure de fin
    const endTime = new Date(scheduledDate.getTime() + booking.duration_minutes * 60 * 1000);
    const formattedEndTime = endTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Générer le lien pour ajouter au calendrier Google
    const generateGoogleCalendarLink = () => {
        const startDate = scheduledDate.toISOString().replace(/-|:|\.\d{3}/g, '');
        const endDate = endTime.toISOString().replace(/-|:|\.\d{3}/g, '');

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: formTitle,
            dates: `${startDate}/${endDate}`,
            details: `Rendez-vous avec ${consultantName}\n\n${booking.google_meet_link ? `Lien Google Meet: ${booking.google_meet_link}` : ''}`,
            location: booking.google_meet_link || '',
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    return (
        <div className="p-8 text-center space-y-6">
            {/* Icône de succès */}
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300"
                style={{ backgroundColor: `${primaryColorHex}15` }}
            >
                <CheckCircle2 size={40} style={{ color: primaryColorHex }} />
            </div>

            {/* Message de confirmation */}
            <div className="space-y-2">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-dark'}`}>
                    Rendez-vous confirmé !
                </h2>
                <p className={isDark ? 'text-white/60' : 'text-neutral-500'}>
                    Une confirmation a été envoyée à{' '}
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-dark'}`}>{booking.guest_email}</span>
                </p>
            </div>

            {/* Carte de détails */}
            <div className={`${isDark ? 'bg-white/5' : 'bg-neutral-50'} rounded-2xl p-6 text-left space-y-4`}>
                <h3 className={`font-bold ${isDark ? 'text-white border-white/10' : 'text-dark border-neutral-200'} border-b pb-3`}>
                    {formTitle}
                </h3>

                <div className="space-y-3">
                    {/* Date et heure */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColorHex}15` }}
                        >
                            <Calendar size={18} style={{ color: primaryColorHex }} />
                        </div>
                        <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-dark'} capitalize`}>{formattedDate}</p>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                                {formattedTime} - {formattedEndTime}
                            </p>
                        </div>
                    </div>

                    {/* Durée */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColorHex}15` }}
                        >
                            <Clock size={18} style={{ color: primaryColorHex }} />
                        </div>
                        <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-dark'}`}>{booking.duration_minutes} minutes</p>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Durée du rendez-vous</p>
                        </div>
                    </div>

                    {/* Google Meet Link */}
                    {booking.google_meet_link && (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColorHex}15` }}
                            >
                                <Video size={18} style={{ color: primaryColorHex }} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-dark'}`}>Google Meet</p>
                                <a
                                    href={booking.google_meet_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline flex items-center gap-1"
                                    style={{ color: primaryColorHex }}
                                >
                                    Rejoindre la réunion
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Type de réunion */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColorHex}15` }}
                        >
                            {booking.meeting_type === 'in_person' ? <MapPin size={18} style={{ color: primaryColorHex }} /> : <Video size={18} style={{ color: primaryColorHex }} />}
                        </div>
                        <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-dark'}`}>
                                {booking.meeting_type === 'in_person' ? 'Rendez-vous Présentiel' : 'Visioconférence'}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>Mode de rencontre</p>
                        </div>
                    </div>

                    {/* Consultant */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColorHex}15` }}
                        >
                            <User size={18} style={{ color: primaryColorHex }} />
                        </div>
                        <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-dark'}`}>{consultantName}</p>
                            {consultantEmail && (
                                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>{consultantEmail}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Infos du participant */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-neutral-200'} border rounded-xl p-4 text-left`}>
                <h4 className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-neutral-500'} mb-3`}>Vos informations</h4>
                <div className="space-y-2">
                    {booking.guest_name && (
                        <div className="flex items-center gap-2 text-sm">
                            <User size={14} className={isDark ? 'text-white/40' : 'text-neutral-400'} />
                            <span className={isDark ? 'text-white' : 'text-dark'}>{booking.guest_name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className={isDark ? 'text-white/40' : 'text-neutral-400'} />
                        <span className={isDark ? 'text-white' : 'text-dark'}>{booking.guest_email}</span>
                    </div>
                    {booking.guest_phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className={isDark ? 'text-white/40' : 'text-neutral-400'} />
                            <span className={isDark ? 'text-white' : 'text-dark'}>{booking.guest_phone}</span>
                        </div>
                    )}
                    {booking.guest_company && (
                        <div className="flex items-center gap-2 text-sm">
                            <Building size={14} className={isDark ? 'text-white/40' : 'text-neutral-400'} />
                            <span className={isDark ? 'text-white' : 'text-dark'}>{booking.guest_company}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                    href={generateGoogleCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl font-medium text-sm transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-neutral-50'}`}
                    style={{ borderColor: `${primaryColorHex}30`, color: primaryColorHex }}
                >
                    <Calendar size={18} />
                    Ajouter au calendrier
                </a>

                {booking.google_meet_link && (
                    <a
                        href={booking.google_meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium text-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: primaryColorHex }}
                    >
                        <Video size={18} />
                        Rejoindre maintenant
                    </a>
                )}
            </div>

            {/* Informations publiques du consultant */}
            {consultantPublicInfo && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-neutral-200'} border rounded-2xl p-6 text-left space-y-4`}>
                    <h3 className={`font-bold ${isDark ? 'text-white border-white/10' : 'text-dark border-neutral-200'} border-b pb-3 flex items-center gap-2`}>
                        <User size={18} />
                        À propos de {consultantName}
                    </h3>

                    <div className="space-y-4">
                        {/* Bio */}
                        {consultantPublicInfo.bio && (
                            <div className="space-y-2">
                                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-neutral-600'} leading-relaxed`}>
                                    {consultantPublicInfo.bio}
                                </p>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {consultantPublicInfo.phone && (
                                <div className={`flex items-center gap-3 p-3 ${isDark ? 'bg-white/5' : 'bg-neutral-50'} rounded-lg`}>
                                    <Phone size={16} className={isDark ? 'text-white/50' : 'text-neutral-500'} />
                                    <span className={`text-sm ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>{consultantPublicInfo.phone}</span>
                                </div>
                            )}

                            {consultantPublicInfo.website && (
                                <a
                                    href={consultantPublicInfo.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-neutral-50 hover:bg-neutral-100'} rounded-lg transition-colors`}
                                >
                                    <Globe size={16} className={isDark ? 'text-white/50' : 'text-neutral-500'} />
                                    <span className="text-sm text-primary-600">Site web</span>
                                    <ExternalLink size={14} className={isDark ? 'text-white/40' : 'text-neutral-400'} />
                                </a>
                            )}
                        </div>

                        {/* Réseaux sociaux */}
                        {consultantPublicInfo.social_networks && (
                            <div className="space-y-3">
                                <h4 className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>Réseaux sociaux</h4>
                                <div className="flex flex-wrap gap-2">
                                    {consultantPublicInfo.social_networks.linkedin && (
                                        <a
                                            href={consultantPublicInfo.social_networks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-accent-50 text-accent-700 hover:bg-accent-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <Linkedin size={14} />
                                            LinkedIn
                                        </a>
                                    )}

                                    {consultantPublicInfo.social_networks.twitter && (
                                        <a
                                            href={consultantPublicInfo.social_networks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <Twitter size={14} />
                                            Twitter
                                        </a>
                                    )}

                                    {consultantPublicInfo.social_networks.facebook && (
                                        <a
                                            href={consultantPublicInfo.social_networks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-accent-50 text-accent-700 hover:bg-accent-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <Facebook size={14} />
                                            Facebook
                                        </a>
                                    )}

                                    {consultantPublicInfo.social_networks.instagram && (
                                        <a
                                            href={consultantPublicInfo.social_networks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <Instagram size={14} />
                                            Instagram
                                        </a>
                                    )}

                                    {consultantPublicInfo.social_networks.youtube && (
                                        <a
                                            href={consultantPublicInfo.social_networks.youtube}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-red-50 text-red-700 hover:bg-red-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <Youtube size={14} />
                                            YouTube
                                        </a>
                                    )}

                                    {consultantPublicInfo.social_networks.github && (
                                        <a
                                            href={consultantPublicInfo.social_networks.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <Github size={14} />
                                            GitHub
                                        </a>
                                    )}

                                    {consultantPublicInfo.social_networks.other && (
                                        <a
                                            href={consultantPublicInfo.social_networks.other}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'} rounded-lg transition-colors text-sm`}
                                        >
                                            <MessageCircle size={14} />
                                            Autre
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Note */}
            <p className={`text-xs ${isDark ? 'text-white/30' : 'text-neutral-400'} pt-4`}>
                Vous recevrez un rappel par email 24h et 1h avant le rendez-vous.
            </p>
        </div>
    );
}

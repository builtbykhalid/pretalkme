import { useState } from 'react';
import { Calendar as CalendarIcon, ListIcon, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useBooking } from '../../../hooks/useBooking';
import { useFeedback } from '../../../context/FeedbackContext';
import CalendarBooking from '../../CalendarBooking';
import UnifiedEmptyState from '../../ui/UnifiedEmptyState';

export default function MeetingsHub() {
    const { bookings } = useApp();
    const { showFeedback } = useFeedback();
    const { cancelBooking, rescheduleBooking, isLoading } = useBooking();
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

    // Modals state
    const [cancelModalOpen, setCancelModalOpen] = useState<any>(null); // holds booking object
    const [cancelReason, setCancelReason] = useState('');
    const [cancelSuccess, setCancelSuccess] = useState(false);

    const [rescheduleModalOpen, setRescheduleModalOpen] = useState<any>(null); // holds booking object
    const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

    const filteredMeetings = (bookings || []).filter(m => {
        const now = new Date();
        const meetingDate = new Date(m.scheduled_at);

        if (filter === 'upcoming') return m.status !== 'cancelled' && meetingDate >= now;
        if (filter === 'past') return m.status === 'completed' || (m.status !== 'cancelled' && meetingDate < now);
        if (filter === 'cancelled') return m.status === 'cancelled';
        return true;
    });

    // Calculate counts for filters
    const counts = {
        upcoming: (bookings || []).filter(m => m.status !== 'cancelled' && new Date(m.scheduled_at) >= new Date()).length,
        past: (bookings || []).filter(m => m.status === 'completed' || (m.status !== 'cancelled' && new Date(m.scheduled_at) < new Date())).length,
        cancelled: (bookings || []).filter(m => m.status === 'cancelled').length
    };

    return (
        <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark tracking-tight flex items-center gap-2">
                <ListIcon className="w-5 h-5 text-primary-500" />
                Liste des Rendez-vous
            </h3>

            {/* FILTERS */}
            <div className="flex gap-2 mb-4">
                {[
                    { id: 'upcoming', label: `À venir ${counts.upcoming}` },
                    { id: 'past', label: `Passés ${counts.past > 0 ? counts.past : ''}` },
                    { id: 'cancelled', label: `Annulés ${counts.cancelled > 0 ? counts.cancelled : ''}` },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.id
                            ? 'bg-dark text-white shadow-md'
                            : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                    >
                        {f.label.trim()}
                    </button>
                ))}
            </div>

            {/* MEETINGS LIST */}
            <div className="space-y-4">
                {filteredMeetings.length === 0 ? (
                    <div className="py-6 flex flex-col items-center justify-center">
                        <UnifiedEmptyState
                            layout="centered"
                            hook="Vos rendez-vous"
                            title={`Aucun rendez-vous ${filter === 'upcoming' ? 'à venir' : (filter === 'past' ? 'passé' : 'annulé')}.`}
                            subtitle="Synchronisez votre calendrier pour transformer vos créneaux en opportunités de vente."
                            primaryAction={filter === 'upcoming' ? { label: "Voir mes horaires", onClick: () => {} } : undefined}
                            demoImage="/demo/availabilities-demo.png"
                        />
                    </div>
                ) : (
                    filteredMeetings.map(meeting => {
                        const startDate = new Date(meeting.scheduled_at);
                        const endDate = new Date(startDate.getTime() + (meeting.duration_minutes || 30) * 60 * 1000);

                        return (
                            <div key={meeting.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md transition-shadow relative group">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-bold text-dark">{meeting.guest_name || 'Anonyme'}</h4>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${meeting.status === 'confirmed' || meeting.status === 'pending' ? 'bg-primary-50 text-primary-700' :
                                                meeting.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                                    'bg-rose-50 text-rose-700'
                                                }`}>
                                                {meeting.status === 'confirmed' ? 'Confirmé' : meeting.status === 'pending' ? 'En attente' : meeting.status === 'completed' ? 'Terminé' : 'Annulé'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500">{meeting.guest_email}</p>

                                        <div className="pt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarIcon className="w-4 h-4 text-neutral-400" />
                                                {startDate.toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <RefreshCw className="w-4 h-4 text-neutral-400" />
                                                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {meeting.meeting_type === 'in_person' ? (
                                                    <>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Présentiel
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Visio
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS (Only for upcoming) */}
                                    {filter === 'upcoming' && (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => setRescheduleModalOpen(meeting)}
                                                disabled={isLoading}
                                                className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-bold text-dark hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200">
                                                <span>Reprogrammer</span>
                                            </button>
                                            <button
                                                onClick={() => setCancelModalOpen(meeting)}
                                                disabled={isLoading}
                                                className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors border border-transparent">
                                                <span>Annuler</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL ANNULATION */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative border border-neutral-200">
                        {cancelSuccess ? (
                            <div className="p-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-dark">Annulation réussie</h3>
                                <p className="text-sm text-neutral-500">
                                    Le rendez-vous a été annulé avec succès et le client sera notifié.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-6 px-6 py-2.5 bg-dark text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                                >
                                    Fermer et recharger
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* HEADER */}
                                <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                                    <h3 className="text-lg font-semibold text-dark">Annuler le rendez-vous</h3>
                                    <button
                                        onClick={() => {
                                            setCancelModalOpen(null);
                                            setCancelReason('');
                                            setCancelSuccess(false);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* CONTENT */}
                                <div className="p-5 space-y-4">
                                    <p className="text-sm text-neutral-600">
                                        Vous êtes sur le point d'annuler le rendez-vous avec <strong className="text-dark">{cancelModalOpen.guest_name || cancelModalOpen.guest_email}</strong>.
                                        L'événement sera supprimé de votre Google Calendar.
                                    </p>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-dark">Motif d'annulation (Optionnel)</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none h-24"
                                            placeholder="Expliquez brièvement pourquoi le rendez-vous est annulé..."
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* ACTIONS */}
                                <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setCancelModalOpen(null);
                                            setCancelReason('');
                                            setCancelSuccess(false);
                                        }}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const success = await cancelBooking(cancelModalOpen.id, cancelReason || 'Annulé manuellement depuis le Dashboard');
                                            if (success) {
                                                setCancelSuccess(true);
                                            } else {
                                                showFeedback('error', {
                                                    message: "Une erreur est survenue lors de l'annulation."
                                                });
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-2"
                                    >
                                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                        Confirmer l'annulation
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL REPROGRAMMATION */}
            {rescheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden relative border border-neutral-200 flex flex-col max-h-[90vh]">
                        {rescheduleSuccess ? (
                            <div className="p-16 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-semibold text-dark">Reprogrammation réussie</h3>
                                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                                    Le rendez-vous a été déplacé à la nouvelle date. L'événement est mis à jour sur Google Calendar et un e-mail a été envoyé à l'invité.
                                </p>
                                <div className="pt-6">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-8 py-3 bg-dark text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                                    >
                                        Fermer et recharger
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* HEADER */}
                                <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold text-dark">Reprogrammer le rendez-vous</h3>
                                        <p className="text-xs text-neutral-500">Avec {rescheduleModalOpen.guest_name}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setRescheduleModalOpen(null);
                                            setRescheduleSuccess(false);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* CONTENT: USES CALENDAR BOOKING WIDGET */}
                                <div className="overflow-y-auto">
                                    <div className="p-4 bg-amber-50 text-amber-800 text-xs font-bold text-center border-b border-amber-100">
                                        Choisissez la nouvelle date. L'événement sera automatiquement décalé dans votre calendrier.
                                    </div>
                                    <CalendarBooking
                                        formId={rescheduleModalOpen.form_id}
                                        onSlotSelected={async (slot) => {
                                            // Call reschedule
                                            const success = await rescheduleBooking(rescheduleModalOpen.id, slot.slot_start);
                                            if (success) {
                                                setRescheduleSuccess(true);
                                            } else {
                                                showFeedback('error', {
                                                    message: 'Erreur lors de la reprogrammation.'
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

import { Calendar, Clock3, Save } from 'lucide-react';
import AvailabilityConfigurator from './calendar/AvailabilityConfigurator';
import EventTypesList from './calendar/EventTypesList';
import IntegrationsProviders from './calendar/IntegrationsProviders';
import MeetingsHub from './calendar/MeetingsHub';
import { useFeedback } from '../../context/FeedbackContext';

export default function CalendarSettings() {
    const { showFeedback } = useFeedback();

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-lg font-bold text-dark mb-1">Calendrier & Disponibilités</h2>
                <p className="text-sm text-neutral-500">Gérez vos jours de travail, de repos, et vos moyens de rendez-vous.</p>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 text-center">
                <Clock3 className="w-12 h-12 text-primary-500 mx-auto" strokeWidth={1.5} />
                <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-primary-900 tracking-tight">Configuration Initiale</h3>
                    <p className="text-sm sm:text-base text-primary-700 max-w-md mx-auto mt-2 font-medium">
                        Connectez votre calendrier, définissez vos jours ouvrables, et permettez à vos prospects de prendre rendez-vous facilement.
                    </p>
                    <p className="text-xs text-primary-700/80 max-w-md mx-auto mt-2">
                        Les réglages se sauvegardent section par section dans les blocs ci-dessous.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN */}
                <div className="space-y-8">
                    {/* 1. Integrations (Google Meet, Address, etc.) */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-neutral-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
                        <IntegrationsProviders />
                    </div>

                    {/* 2. Availability (Days & Hours) */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-neutral-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
                        <AvailabilityConfigurator />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                    {/* 3. Event Types (Appel, Stratégie, etc.) */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-neutral-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
                        <EventTypesList />
                    </div>

                    {/* 4. Meetings Hub (upcoming/past list) */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-neutral-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
                        <MeetingsHub />
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar for Calendar Settings */}
            <div className="sticky bottom-6 sm:bottom-8 z-30 flex items-center justify-between p-4 sm:p-6 bg-dark rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <div className="flex items-center gap-3 sm:gap-4 pl-1 sm:pl-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 text-white rounded-full flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </div>
                    <div className="hidden xs:block">
                        <p className="text-xs sm:text-sm font-bold text-white">Modifications</p>
                        <p className="text-xs sm:text-xs text-white/50 font-medium italic">Pensez à sauvegarder vos horaires</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        showFeedback('success', {
                            message: 'Les paramètres du calendrier se sauvegardent dans chaque section.'
                        });
                    }}
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-dark font-semibold rounded-2xl sm:rounded-3xl hover:bg-neutral-100 transition-all active:scale-95 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm shadow-xl"
                >
                    <Save className="w-4 h-4" />
                    Enregistrer
                </button>
            </div>
        </div>
    );
}

import { CalendarIcon, Video, Plus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Link } from 'react-router-dom';

export default function EventTypesList() {
    const { forms } = useApp();

    // Filter forms that have calendar enabled in their steps_config
    const eventTypes = (forms || []).filter(f => f.steps_config?.calendar_enabled);

    return (
        <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-500" />
                Types de Rendez-vous
            </h3>

            <div className="grid gap-4">
                {eventTypes.length === 0 ? (
                    <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                        <p className="text-sm text-neutral-500 font-medium">Aucun type de rendez-vous configuré.</p>
                    </div>
                ) : (
                    eventTypes.map(type => (
                        <Link
                            key={type.id}
                            to={`/forms/${type.id}`}
                            className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary-300 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
                        >
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-dark group-hover:text-primary-600 transition-colors">{type.title}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500 font-medium">
                                        <span>{type.booking_config?.duration_minutes || 30} minutes</span>
                                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                        <span>{type.slug ? `/${type.slug}` : 'Lien prêt'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}

                <Link to="/forms/new" className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-neutral-200 hover:border-primary-400 hover:bg-primary-50 text-neutral-500 hover:text-primary-600 font-bold transition-all text-sm group">
                    <Plus className="w-4 h-4" />
                    Créer un nouveau type d'événement
                </Link>

            </div>
        </div>
    );
}

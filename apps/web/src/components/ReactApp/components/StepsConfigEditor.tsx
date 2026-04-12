import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Calendar,
    FileText,
    Bot,
    GripVertical,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    ChevronUp,
    Info,
    Settings,
    AlertCircle,
    ArrowRight,
    Clock,
    Video,
    MapPin,
    Check,
    Mic,
    Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFeedback } from '../context/FeedbackContext';
import type { Service } from '../context/AppContext';
import type { StepsConfig, BookingConfig, FormStepType } from '../types/booking';
import AIEnhancer from './ui/AIEnhancer';

interface StepsConfigEditorProps {
    stepsConfig: StepsConfig;
    bookingConfig: BookingConfig;
    onStepsConfigChange: (config: StepsConfig) => void;
    onBookingConfigChange: (config: BookingConfig) => void;
    showServicesOnThankYou?: boolean;
    thankYouServices?: string[];
    onShowServicesChange?: (show: boolean) => void;
    onThankYouServicesChange?: (services: string[]) => void;
    thankYouTitle?: string;
    thankYouDescription?: string;
    onThankYouTitleChange?: (title: string) => void;
    onThankYouDescriptionChange?: (desc: string) => void;
    primaryColor?: string;
}

const STEP_ICONS: Record<FormStepType, React.ReactNode> = {
    calendar: <Calendar size={18} />,
    form: <FileText size={18} />,
    ai: <Bot size={18} />,
};

const STEP_LABELS: Record<FormStepType, string> = {
    calendar: 'Prise de rendez-vous',
    form: 'Formulaire de qualification',
    ai: 'Questions intelligentes (IA)',
};

const STEP_DESCRIPTIONS: Record<FormStepType, string> = {
    calendar: 'Le client choisit un créneau dans votre calendrier',
    form: 'Le client répond à vos questions de qualification',
    ai: 'L\'IA pose des questions personnalisées selon les réponses',
};

export default function StepsConfigEditor({
    stepsConfig,
    bookingConfig,
    onStepsConfigChange,
    onBookingConfigChange,
    showServicesOnThankYou = false,
    thankYouServices = [],
    onShowServicesChange,
    onThankYouServicesChange,
    thankYouTitle = '',
    thankYouDescription = '',
    onThankYouTitleChange,
    onThankYouDescriptionChange,
    primaryColor = '#6366f1',
}: StepsConfigEditorProps) {
    const { services, userProfile } = useApp();
    const { showFeedback } = useFeedback();
    const [expandedSection, setExpandedSection] = React.useState<'steps' | 'booking' | 'success' | null>('steps');

    const toggleStep = (step: FormStepType) => {
        const key = `${step}_enabled` as keyof StepsConfig;
        const isCurrentlyEnabled = stepsConfig[key] as boolean;
        // Warn when enabling calendar without Google Calendar connected
        if (step === 'calendar' && !isCurrentlyEnabled && !userProfile?.google_calendar_connected) {
            showFeedback('warning', {
                message: 'Google Agenda non connecté: pensez à connecter votre calendrier avant publication.'
            });
        }
        onStepsConfigChange({ ...stepsConfig, [key]: !isCurrentlyEnabled });
    };

    const moveStep = (step: FormStepType, direction: 'up' | 'down') => {
        const currentIndex = stepsConfig.steps_order.indexOf(step);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= stepsConfig.steps_order.length) return;
        const newOrder = [...stepsConfig.steps_order];
        [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
        onStepsConfigChange({ ...stepsConfig, steps_order: newOrder });
    };

    const updateBookingConfig = (updates: Partial<BookingConfig>) => {
        onBookingConfigChange({ ...bookingConfig, ...updates });
    };

    // Ensure BYOC is active when calendar step is enabled and an external url is set.
    React.useEffect(() => {
        if (stepsConfig.calendar_enabled) {
            if (bookingConfig.external_booking_url && bookingConfig.booking_display_mode === 'none') {
                updateBookingConfig({ booking_display_mode: 'external' });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepsConfig.calendar_enabled, bookingConfig.external_booking_url]);

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(stepsConfig.steps_order);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onStepsConfigChange({ ...stepsConfig, steps_order: items });
    };

    // The detailed native availability UI is intentionally hidden (ON HOLD).

    return (
        <div className="space-y-6">
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'steps' ? null : 'steps')}
                    className="w-full px-4 py-4 flex items-center justify-between bg-white hover:bg-neutral-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                            <Settings size={20} style={{ color: primaryColor }} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-dark">Parcours client</h3>
                            <p className="text-xs text-neutral-500">Ordre et activation des étapes</p>
                        </div>
                    </div>
                    {expandedSection === 'steps' ? (<ChevronUp size={20} className="text-neutral-400" />) : (<ChevronDown size={20} className="text-neutral-400" />)}
                </button>

                {expandedSection === 'steps' && (
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
                        <div className="flex items-start gap-2 p-3 bg-accent-50 border border-accent-100 rounded-xl text-sm text-accent-700">
                            <Info size={16} className="mt-0.5 flex-shrink-0" />
                            <p>Réorganisez les étapes dans l'ordre souhaité. Les étapes désactivées ne seront pas affichées au client.</p>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="steps-list">
                                {(provided) => (
                                    <div
                                        className="space-y-2"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {stepsConfig.steps_order.map((step, index) => {
                                            const isEnabled = stepsConfig[`${step}_enabled` as keyof StepsConfig] as boolean;
                                            const isFirst = index === 0;
                                            const isLast = index === stepsConfig.steps_order.length - 1;

                                            return (
                                                <Draggable key={step} draggableId={step} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`flex items-center gap-3 p-3 bg-white border rounded-xl transition-all ${isEnabled ? 'border-neutral-200' : 'border-dashed border-neutral-200 opacity-60'} ${snapshot.isDragging ? 'shadow-lg border-primary-500 ring-2 ring-primary-500/20' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div {...provided.dragHandleProps} className="p-1 -ml-1 hover:bg-neutral-50 rounded cursor-grab active:cursor-grabbing">
                                                                    <GripVertical size={16} className="text-neutral-300" />
                                                                </div>
                                                                <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: isEnabled ? primaryColor : '#9ca3af' }}>{index + 1}</span>
                                                            </div>
                                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: isEnabled ? `${primaryColor}15` : '#f3f4f6', color: isEnabled ? primaryColor : '#9ca3af' }}>{STEP_ICONS[step]}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-dark text-sm truncate">{STEP_LABELS[step]}</p>
                                                                <p className="text-xs text-neutral-500 truncate">{STEP_DESCRIPTIONS[step]}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={() => moveStep(step, 'up')} disabled={isFirst} className="p-1.5 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"><ChevronUp size={16} className="text-neutral-500" /></button>
                                                                <button onClick={() => moveStep(step, 'down')} disabled={isLast} className="p-1.5 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"><ChevronDown size={16} className="text-neutral-500" /></button>
                                                                <button onClick={() => toggleStep(step)} className="p-1.5 hover:bg-neutral-100 rounded-lg">{isEnabled ? (<ToggleRight size={24} style={{ color: primaryColor }} />) : (<ToggleLeft size={24} className="text-neutral-400" />)}</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-dark">Mode Multi-étapes (Sections)</p>
                                <p className="text-xs text-neutral-500">Activé automatiquement lorsque vous ajoutez des sections dans l'onglet Structure.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-lg ${stepsConfig.sections_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400'}`}>
                                    {stepsConfig.sections_enabled ? 'Activé' : 'Désactivé'}
                                </span>
                            </div>
                        </div>

                        {/* 
                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                            <div>
                                    {userProfile?.plan !== 'pro' && userProfile?.plan !== 'growth' && userProfile?.plan !== 'enterprise' && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-500 to-indigo-600 text-white">Pro</span>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500">Permet au client de dicter ses réponses. L'IA remplit les champs automatiquement.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'growth' || userProfile?.plan === 'enterprise';
                                        if (!isPro) {
                                            showFeedback('warning', {
                                                message: "L'enregistrement vocal est une fonctionnalité Pro."
                                            });
                                            return;
                                        }
                                        onStepsConfigChange({ ...stepsConfig, voice_recorder_enabled: !stepsConfig.voice_recorder_enabled });
                                    }}
                                    className="focus:outline-none"
                                >
                                    {stepsConfig.voice_recorder_enabled ? (
                                        <ToggleRight size={28} style={{ color: primaryColor }} />
                                    ) : (
                                        <ToggleLeft size={28} className={`text-neutral-400 ${userProfile?.plan !== 'pro' && userProfile?.plan !== 'growth' && userProfile?.plan !== 'enterprise' ? 'opacity-50' : ''}`} />
                                    )}
                                </button>
                            </div>
                        </div>
                        */}
                    </div>
                )}
            </div>

            {
                stepsConfig.calendar_enabled && (
                    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                        <button onClick={() => setExpandedSection(expandedSection === 'booking' ? null : 'booking')} className="w-full px-4 py-4 flex items-center justify-between bg-white hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}><Calendar size={20} style={{ color: primaryColor }} /></div>
                                <div className="text-left"><h3 className="font-bold text-dark">Configuration du calendrier</h3><p className="text-xs text-neutral-500">Disponibilités et type de rendez-vous</p></div>
                            </div>
                            {expandedSection === 'booking' ? (<ChevronUp size={20} className="text-neutral-400" />) : (<ChevronDown size={20} className="text-neutral-400" />)}
                        </button>

                        {expandedSection === 'booking' && (
                            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-6">
                                {/* Google Calendar connection warning */}
                                {!userProfile?.google_calendar_connected && (
                                    <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                                        <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-rose-800">Google Agenda non connecté</p>
                                            <p className="text-xs text-rose-700 mt-1 mb-3">
                                                Connectez votre Google Agenda pour que les rendez-vous soient automatiquement créés et que vos créneaux soient synchronisés.
                                            </p>
                                            <Link
                                                to="/disponibilites"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
                                            >
                                                Connecter Google Agenda <ArrowRight size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {/* Duration Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-dark flex items-center gap-2">
                                        <Clock size={16} className="text-primary-600" />
                                        Durée du rendez-vous
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {[15, 30, 45, 60, 90, 120].map((duration) => (
                                            <button
                                                key={duration}
                                                onClick={() => updateBookingConfig({ duration_minutes: duration })}
                                                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${bookingConfig.duration_minutes === duration
                                                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                                                    }`}
                                            >
                                                {duration < 60 ? `${duration} min` : `${duration / 60}h${duration % 60 || ''}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Meeting Types Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-dark flex items-center gap-2">
                                        <Video size={16} className="text-primary-600" />
                                        Options de rencontre
                                    </label>
                                    <p className="text-xs text-neutral-500 mb-2">
                                        Quelles options proposez-vous à vos clients ? Si vous en cochez plusieurs, le client pourra choisir.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { id: 'google_meet', label: 'Visioconférence', icon: <Video className="w-5 h-5" />, desc: 'Google Meet (automatique)' },
                                            { id: 'in_person', label: 'Présentiel', icon: <MapPin className="w-5 h-5" />, desc: 'Rendez-vous physique' }
                                        ].map((type) => {
                                            const isSelected = (bookingConfig.allowed_meeting_types || ['google_meet']).includes(type.id as any);
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => {
                                                        const current = bookingConfig.allowed_meeting_types || ['google_meet'];
                                                        let next;
                                                        if (isSelected) {
                                                            // Prevent unselecting all
                                                            if (current.length <= 1) return;
                                                            next = current.filter(t => t !== type.id);
                                                        } else {
                                                            next = [...current, type.id as any];
                                                        }
                                                        updateBookingConfig({ allowed_meeting_types: next });
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${isSelected
                                                        ? 'bg-primary-50 border-primary-500 shadow-sm'
                                                        : 'bg-white border-neutral-100 hover:border-neutral-200'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                                        {type.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isSelected ? 'text-primary-900' : 'text-dark'}`}>{type.label}</p>
                                                        <p className="text-xs text-neutral-500">{type.desc}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="ml-auto">
                                                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                                <Check size={12} className="text-white" strokeWidth={4} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {bookingConfig.allowed_meeting_types?.includes('in_person') && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-semibold text-neutral-400 mb-1 block pl-1">Adresse ou Lieu</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 12 rue de la Paix, Paris ou 'À convenir'"
                                                value={bookingConfig.custom_location || ''}
                                                onChange={(e) => updateBookingConfig({ custom_location: e.target.value })}
                                                className="w-full p-3 text-sm bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-dark"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-neutral-100">
                                    <label className="text-sm font-semibold text-dark flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-primary-600" />
                                            Infos de contact en première étape ?
                                        </div>
                                        <button
                                            onClick={() => onStepsConfigChange({ ...stepsConfig, booking_info_enabled: !stepsConfig.booking_info_enabled })}
                                            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                                        >
                                            {stepsConfig.booking_info_enabled ? <ToggleRight size={24} style={{ color: primaryColor }} /> : <ToggleLeft size={24} className="text-neutral-400" />}
                                        </button>
                                    </label>
                                    <p className="text-xs text-neutral-500 block">
                                        Affiche un court formulaire pour demander le nom et l'email du prospect {stepsConfig.steps_order.indexOf('calendar') < stepsConfig.steps_order.indexOf('form') ? "juste après la sélection du créneau." : "lors de la réservation."}
                                        <br />
                                        <span className="font-semibold text-neutral-700">Désactivez-le pour éviter les questions en double</span> si vous demandez déjà ces informations dans le formulaire principal. Le rendez-vous sera alors confirmé à la toute fin du parcours.
                                    </p>
                                    <div className="mt-2">
                                        <Link
                                            to="/disponibilites?tab=contact"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                                        >
                                            Gérer ce formulaire et ajouter des champs <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-4 bg-white border border-neutral-200 rounded-xl mt-4">
                                    <h4 className="text-sm font-bold text-dark mb-2 flex items-center gap-2">
                                        <Calendar size={16} className="text-primary-600" />
                                        Disponibilités natives
                                    </h4>
                                    <p className="text-xs text-neutral-500 mb-4 block">
                                        Vos formulaires utilisent désormais le module de réservation natif Pretalk.
                                        Les leads pourront choisir un créneau directement à la fin du formulaire sans friction.
                                    </p>

                                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-800 mb-1">
                                                Configuration requise
                                            </p>
                                            <p className="text-xs text-amber-700 mb-3">
                                                Assurez-vous d'avoir configuré vos horaires et connecté votre calendrier pour que ce module fonctionne correctement.
                                            </p>
                                            <Link
                                                to="/disponibilites"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
                                            >
                                                Gérer mes disponibilités <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Success Page & Recommendations */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'success' ? null : 'success')}
                    className="w-full px-4 py-4 flex items-center justify-between bg-white hover:bg-neutral-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                            <ArrowRight size={20} style={{ color: primaryColor }} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-dark">Page de succès</h3>
                            <p className="text-xs text-neutral-500">Recommandation de services et remerciements</p>
                        </div>
                    </div>
                    {expandedSection === 'success' ? (<ChevronUp size={20} className="text-neutral-400" />) : (<ChevronDown size={20} className="text-neutral-400" />)}
                </button>

                {expandedSection === 'success' && (
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                        <div className="space-y-4 pt-2 border-t border-neutral-100">
                            <div>
                                <label className="text-xs font-semibold text-neutral-400 mb-2 block">Titre de remerciement</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Merci pour votre confiance !"
                                    value={thankYouTitle}
                                    onChange={(e) => onThankYouTitleChange?.(e.target.value)}
                                    className="w-full p-3 text-sm bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-dark"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-400 mb-2 block">Message de remerciement</label>
                                <div className="relative group/thank">
                                    <textarea
                                        placeholder="Ex: Nous avons bien reçu vos informations. Nous vous contacterons très prochainement."
                                        value={thankYouDescription}
                                        onChange={(e) => onThankYouDescriptionChange?.(e.target.value)}
                                        className="w-full p-3 pr-10 text-sm bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-dark h-20 resize-none"
                                    />
                                    {(thankYouDescription || '').length > 0 && onThankYouDescriptionChange && (
                                        <div className="absolute right-2 bottom-2 max-w-[200px] opacity-0 group-hover/thank:opacity-100 transition-opacity">
                                            <AIEnhancer
                                                text={thankYouDescription || ''}
                                                onEnhanced={onThankYouDescriptionChange}
                                                context="Message de confirmation de rendez-vous ou de reçu de formulaire"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${showServicesOnThankYou ? 'bg-primary-50 text-primary-600' : 'bg-neutral-50 text-neutral-400'}`}>
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-dark">Afficher des services recommandés</p>
                                    <p className="text-xs text-neutral-500">Proposez vos offres sur la page de remerciement.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onShowServicesChange?.(!showServicesOnThankYou)}
                                className="focus:outline-none"
                            >
                                {showServicesOnThankYou ? <ToggleRight size={28} style={{ color: primaryColor }} /> : <ToggleLeft size={28} className="text-neutral-400" />}
                            </button>
                        </div>

                        {showServicesOnThankYou && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-semibold text-neutral-400 ml-1">Sélectionner les services à mettre en avant</label>
                                {services.length === 0 ? (
                                    <div className="p-4 bg-white rounded-xl border border-dashed border-neutral-200 text-center">
                                        <p className="text-xs text-neutral-500 mb-2">Vous n'avez pas encore créé de services.</p>
                                        <Link to="/services" className="text-xs font-semibold text-primary-600 hover:underline">Créer mon premier service →</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {services.filter((s: Service) => s.is_active).map((service: Service) => {
                                            const isSelected = thankYouServices.includes(service.id);
                                            return (
                                                <button
                                                    key={service.id}
                                                    onClick={() => {
                                                        const next = isSelected
                                                            ? thankYouServices.filter(id => id !== service.id)
                                                            : [...thankYouServices, service.id];
                                                        onThankYouServicesChange?.(next);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? 'bg-white border-primary-500 shadow-sm' : 'bg-white/50 border-neutral-100 hover:border-neutral-200'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                                        {isSelected ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-neutral-300" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-dark truncate">{service.name}</p>
                                                        <p className="text-xs text-neutral-400 truncate">{service.price_type === 'free' ? 'Gratuit' : `${service.price_amount}€`}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}

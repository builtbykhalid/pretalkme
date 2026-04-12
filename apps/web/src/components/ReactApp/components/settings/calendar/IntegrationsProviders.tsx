import { useState } from 'react';
import { Database, Link as LinkIcon, CheckCircle, Video, MessageSquare as MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';

export default function IntegrationsProviders() {
    const { signInWithGoogle } = useAuth();
    const { userProfile } = useApp();
    const [address, setAddress] = useState('');
    const [addressSaved, setAddressSaved] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const isConnected = !!userProfile?.google_calendar_connected;

    const handleGoogleConnect = async () => {
        setConnecting(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Google connect error:', error);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-500" />
                Lieu & Intégrations Visio
            </h3>

            <div className="grid grid-cols-1 gap-4">
                {/* IN-PERSON LOCATION */}
                <div className="bg-white border-2 border-primary-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-dark flex items-center gap-2">
                                    Présentiel
                                    {addressSaved && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                </h4>
                                <p className="text-xs text-neutral-500 mt-1 max-w-[280px]">Obligatoire si vous souhaitez proposer des rendez-vous physiques.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <input
                            type="text"
                            placeholder="Votre adresse (ex: 12 rue de la Paix, Paris)"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                setAddressSaved(false);
                            }}
                            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none placeholder:italic"
                        />
                        <button
                            onClick={() => {
                                if (address) setAddressSaved(true);
                            }}
                            className="px-4 py-2 bg-dark text-white text-sm font-bold rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
                        >
                            Sauvegarder l'adresse
                        </button>
                    </div>
                </div>

                {/* GOOGLE MEET (OAUTH) */}
                <div className={`bg-white border-2 ${isConnected ? 'border-emerald-500' : 'border-emerald-100'} rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all`}>
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full ${isConnected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0 transition-colors`}>
                            {isConnected ? (
                                <CheckCircle className="w-6 h-6" />
                            ) : (
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-dark">Google Meet</h4>
                            <p className="text-xs text-neutral-500 mt-1">
                                {isConnected ? 'Connecté avec succès' : 'Génération automatique des liens Meet'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleGoogleConnect}
                        disabled={connecting || isConnected}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 ${isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-neutral-200 hover:bg-neutral-50'} border shadow-sm text-dark font-bold rounded-lg transition-colors shrink-0 disabled:opacity-70`}
                    >
                        {connecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <img src="/assets/google.svg" alt="G" className="w-4 h-4 object-contain" />
                        )}
                        {isConnected ? 'Connecté' : 'Connecter Google Agenda'}
                    </button>
                </div>

                {/* ZOOM (COMING SOON) */}
                <div className="bg-white border border-neutral-100 opacity-60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none relative overflow-hidden">
                    <div className="absolute top-2 right-2 rotate-12">
                        <span className="text-xs text-white bg-neutral-800 px-2 py-0.5 rounded-full tracking-widest">
                            Bientôt disponible
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0b5cff]/10 text-[#0b5cff] flex items-center justify-center shrink-0">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-neutral-400">Zoom</h4>
                            <p className="text-xs text-neutral-400 mt-1">Connexion OAuth Zoom</p>
                        </div>
                    </div>
                    <button disabled className="px-6 py-2.5 bg-neutral-100 text-neutral-400 font-bold rounded-lg cursor-not-allowed">
                        Connecter
                    </button>
                </div>

                {/* MS TEAMS (COMING SOON) */}
                <div className="bg-white border border-neutral-100 opacity-60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none relative overflow-hidden">
                    <div className="absolute top-2 right-2 rotate-12">
                        <span className="text-xs text-white bg-neutral-800 px-2 py-0.5 rounded-full tracking-widest">
                            Bientôt disponible
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] flex items-center justify-center shrink-0">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-neutral-400">Microsoft Teams</h4>
                            <p className="text-xs text-neutral-400 mt-1">Office 365 Calendar</p>
                        </div>
                    </div>
                    <button disabled className="px-6 py-2.5 bg-neutral-100 text-neutral-400 font-bold rounded-lg cursor-not-allowed">
                        Connecter
                    </button>
                </div>

                {/* PIPEDREAM (COMING SOON) */}
                <div className="bg-white border border-neutral-100 opacity-60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none relative overflow-hidden">
                    <div className="absolute top-2 right-2 rotate-12">
                        <span className="text-xs text-white bg-neutral-800 px-2 py-0.5 rounded-full tracking-widest">
                            Bientôt disponible
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#1db559]/10 text-[#1db559] flex items-center justify-center shrink-0">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-neutral-400">Pipedream / Webhooks</h4>
                            <p className="text-xs text-neutral-400 mt-1">Envoyez les données où vous voulez</p>
                        </div>
                    </div>
                    <button disabled className="px-6 py-2.5 bg-neutral-100 text-neutral-400 font-bold rounded-lg cursor-not-allowed">
                        Configurer
                    </button>
                </div>

            </div>
        </div>
    );
}

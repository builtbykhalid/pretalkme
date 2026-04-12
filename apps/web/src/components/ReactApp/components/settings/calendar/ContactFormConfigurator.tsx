import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { ToggleRight, ToggleLeft, Phone, Building, FileText, Save, Loader2, Contact } from 'lucide-react';
import type { BookingConfig } from '../../../types/booking';

export default function ContactFormConfigurator() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<BookingConfig | null>(null);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Fetch user's global booking_config from profiles table
    useEffect(() => {
        const loadConfig = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('booking_config')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                // Initialize defaults if they're missing
                const baseConfig = data?.booking_config || {};
                setConfig({
                    ...baseConfig,
                    ask_guest_phone: baseConfig.ask_guest_phone ?? false,
                    ask_guest_company: baseConfig.ask_guest_company ?? false,
                    ask_notes: baseConfig.ask_notes ?? false
                });
            } catch (error) {
                console.error('Error loading booking config:', error);
            } finally {
                setLoading(false);
            }
        };
        loadConfig();
    }, [user]);

    const handleSave = async () => {
        if (!user || !config) return;
        setSaving(true);
        setSavedMessage(null);
        setSaveError(null);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ booking_config: config })
                .eq('id', user.id);

            if (error) throw error;
            setSavedMessage("Configuration sauvegardée avec succès !");
            setTimeout(() => setSavedMessage(null), 3000);
        } catch (error) {
            console.error('Error saving config:', error);
            setSaveError("Impossible de sauvegarder pour le moment. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-semibold text-dark mb-2 flex items-center gap-3">
                    <Contact className="w-6 h-6 text-primary-600" />
                    Formulaire de réservation
                </h2>
                <p className="text-neutral-500 font-medium max-w-2xl">
                    Personnalisez les informations que vous demandez à vos prospects lorsqu'ils prennent un rendez-vous directement via votre calendrier (Nom et Email sont toujours requis).
                </p>
            </div>

            <div className="space-y-4 max-w-2xl">
                {/* Ask Phone */}
                <div className="flex items-start gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:border-primary-200 transition-colors">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-dark">Ligne téléphonique</h3>
                            <button
                                onClick={() => setConfig(prev => prev ? { ...prev, ask_guest_phone: !prev.ask_guest_phone } : null)}
                                type="button"
                                aria-label={config?.ask_guest_phone ? 'Désactiver le champ téléphone' : 'Activer le champ téléphone'}
                                aria-pressed={!!config?.ask_guest_phone}
                                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                            >
                                {config?.ask_guest_phone ? (
                                    <ToggleRight className="w-8 h-8 text-primary-500" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                            Demander le numéro de téléphone du prospect.
                        </p>
                    </div>
                </div>

                {/* Ask Company */}
                <div className="flex items-start gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:border-primary-200 transition-colors">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <Building className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-dark">Entreprise</h3>
                            <button
                                onClick={() => setConfig(prev => prev ? { ...prev, ask_guest_company: !prev.ask_guest_company } : null)}
                                type="button"
                                aria-label={config?.ask_guest_company ? 'Désactiver le champ entreprise' : 'Activer le champ entreprise'}
                                aria-pressed={!!config?.ask_guest_company}
                                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                            >
                                {config?.ask_guest_company ? (
                                    <ToggleRight className="w-8 h-8 text-primary-500" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                            Demander le nom de la société de votre prospect.
                        </p>
                    </div>
                </div>

                {/* Ask Notes */}
                <div className="flex items-start gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:border-primary-200 transition-colors">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-dark">Notes et détails</h3>
                            <button
                                onClick={() => setConfig(prev => prev ? { ...prev, ask_notes: !prev.ask_notes } : null)}
                                type="button"
                                aria-label={config?.ask_notes ? 'Désactiver le champ notes' : 'Activer le champ notes'}
                                aria-pressed={!!config?.ask_notes}
                                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
                            >
                                {config?.ask_notes ? (
                                    <ToggleRight className="w-8 h-8 text-primary-500" />
                                ) : (
                                    <ToggleLeft className="w-8 h-8 text-neutral-400" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                            Permettre au prospect de laisser un commentaire ou des détails sur l'appel.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between max-w-2xl">
                {savedMessage ? (
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-in fade-in zoom-in">
                        {savedMessage}
                    </span>
                ) : saveError ? (
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 animate-in fade-in zoom-in">
                        {saveError}
                    </span>
                ) : <span />}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-dark text-white font-bold rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer les préférences
                </button>
            </div>
        </div>
    );
}

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X as CloseIcon, Settings, Save, AlertCircle } from 'lucide-react';

import { useApp } from '../context/AppContext';
import { useFeedback } from '../context/FeedbackContext';

interface LeadSettingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LeadSettingsDrawer({ isOpen, onClose }: LeadSettingsDrawerProps) {
    const { userProfile, updateProfile } = useApp();
    const { showFeedback } = useFeedback();

    // Initialize state from profile
    const [settings, setSettings] = useState({
        scoringThreshold: 50,
        notifyHighScore: userProfile?.notification_preferences?.newLead || true,
        autoGenerateAudit: userProfile?.automations_config?.auto_step_audit || false,
        autoSendAudit: userProfile?.email_automation_preferences?.auto_send_audit || false,
        archiveAfterDays: '30',
        alertNewLead: userProfile?.notification_preferences?.newLead || true,
        alertToReviewDays: 3,
        notifyToReview: true,
        templateAudit: userProfile?.email_automation_preferences?.audit_template_type || 'executive',
        templateOffer: userProfile?.email_automation_preferences?.proposal_template_type || 'default',
        templateContract: userProfile?.email_automation_preferences?.contract_template_type || 'default'
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                notification_preferences: {
                    ...userProfile?.notification_preferences,
                    newLead: settings.alertNewLead,
                },
                automations_config: {
                    ...userProfile?.automations_config,
                    auto_step_audit: settings.autoGenerateAudit,
                },
                email_automation_preferences: {
                    ...userProfile?.email_automation_preferences,
                    auto_send_audit: settings.autoSendAudit,
                    audit_template_type: settings.templateAudit,
                    proposal_template_type: settings.templateOffer,
                    contract_template_type: settings.templateContract,
                }
            });
            showFeedback('success', { message: 'Paramètres mis à jour avec succès' });
            onClose();
        } catch (error) {
            showFeedback('error', { message: 'Erreur lors de la mise à jour des paramètres' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-xl">
                                    <div className="flex h-full flex-col bg-white shadow-2xl overflow-hidden">
                                        {/* Header */}
                                        <div className="px-6 sm:px-10 py-8 bg-[#FBFBFB] border-b border-[#E8E8E8] shrink-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-[#0D0D0D] text-white rounded-2xl shadow-lg shadow-black/10">
                                                        <Settings size={22} className="animate-spin-slow" />
                                                    </div>
                                                    <div>
                                                        <Dialog.Title className="text-xl font-black text-[#0D0D0D] uppercase tracking-tight">
                                                            Paramètres Leads
                                                        </Dialog.Title>
                                                        <p className="text-[11px] font-bold text-[#9A9A9A] mt-1 uppercase tracking-widest">Automatisations & Configuration Globale</p>
                                                    </div>
                                                </div>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="rounded-full p-2 bg-white text-[#9A9A9A] hover:bg-[#0D0D0D] hover:text-white transition-all shadow-sm border border-[#E8E8E8]"
                                                        onClick={onClose}
                                                    >
                                                        <span className="sr-only">Fermer</span>
                                                        <CloseIcon size={18} aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto bg-white p-6 sm:p-10 scrollbar-thin">
                                            <div className="space-y-12">
                                                
                                                {/* Section: Scoring IA */}
                                                <section className="space-y-6">
                                                    <h3 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E8E8] pb-3">
                                                        <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span> Scoring IA
                                                    </h3>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <label className="text-[11px] font-bold text-[#6B6B6B] block">Seuil de qualification automatique</label>
                                                                <span className="text-[11px] font-black text-[#0D0D0D] px-2 py-1 bg-[#F4F4F4] rounded-lg">{settings.scoringThreshold}/100</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={settings.scoringThreshold}
                                                                onChange={(e) => handleChange('scoringThreshold', parseInt(e.target.value))}
                                                                className="w-full h-2 bg-[#E8E8E8] rounded-lg appearance-none cursor-pointer accent-[#0D0D0D]"
                                                            />
                                                            <p className="text-[10px] text-[#9A9A9A] mt-2 italic">Les prospects au-dessus de ce score seront marqués comme prioritaires.</p>
                                                        </div>
                                                        <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-2xl bg-[#FBFBFB]">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-[#0D0D0D]">Notification Haut Score</p>
                                                                <p className="text-[10px] text-[#6B6B6B]">M'alerter si le score dépasse le seuil.</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" checked={settings.notifyHighScore} onChange={(e) => handleChange('notifyHighScore', e.target.checked)} />
                                                                <div className="w-11 h-6 bg-[#E8E8E8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#9A9A9A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Section: Workflow Automatique */}
                                                <section className="space-y-6">
                                                    <h3 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E8E8] pb-3">
                                                        <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Workflow Automatique
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-2xl bg-[#FBFBFB]">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-[#0D0D0D]">Générer l'audit automatiquement</p>
                                                                <p className="text-[10px] text-[#6B6B6B]">Dès la complétion du formulaire de prise de contact (Gain de temps).</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" checked={settings.autoGenerateAudit} onChange={(e) => handleChange('autoGenerateAudit', e.target.checked)} />
                                                                <div className="w-11 h-6 bg-[#E8E8E8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#9A9A9A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                                                            </label>
                                                        </div>

                                                        {settings.autoGenerateAudit && (
                                                            <div className="flex items-center justify-between p-4 border border-[#DCFCE7] bg-[#F0FDF4] rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1.5"><AlertCircle size={14}/> Envoyer PDF audit par email auto.</p>
                                                                    <p className="text-[10px] text-[#16A34A]/80">Attention: envoi immédiat sans relecture.</p>
                                                                </div>
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input type="checkbox" className="sr-only peer" checked={settings.autoSendAudit} onChange={(e) => handleChange('autoSendAudit', e.target.checked)} />
                                                                    <div className="w-11 h-6 bg-[#16A34A]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#16A34A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A34A]"></div>
                                                                </label>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label className="text-[11px] font-bold text-[#6B6B6B] block mb-2">Archiver les leads inactifs après</label>
                                                            <select
                                                                value={settings.archiveAfterDays}
                                                                onChange={(e) => handleChange('archiveAfterDays', e.target.value)}
                                                                className="w-full p-4 text-[11px] font-bold text-[#0D0D0D] bg-[#FBFBFB] border border-[#E8E8E8] focus:border-[#0D0D0D] rounded-2xl outline-none transition-all appearance-none"
                                                            >
                                                                <option value="7">7 jours</option>
                                                                <option value="30">30 jours</option>
                                                                <option value="90">90 jours</option>
                                                                <option value="never">Jamais</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Section: Notifications */}
                                                <section className="space-y-6">
                                                    <h3 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E8E8] pb-3">
                                                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span> Notifications
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-2xl bg-[#FBFBFB]">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-[#0D0D0D]">Alerte nouveau lead</p>
                                                                <p className="text-[10px] text-[#6B6B6B]">Recevoir un email à chaque entrée.</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" checked={settings.alertNewLead} onChange={(e) => handleChange('alertNewLead', e.target.checked)} />
                                                                <div className="w-11 h-6 bg-[#E8E8E8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#9A9A9A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                                                            </label>
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-2xl bg-[#FBFBFB]">
                                                            <div className="flex-1 mr-4">
                                                                <p className="text-[11px] font-bold text-[#0D0D0D]">Rappel lead "À réviser"</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-[10px] text-[#6B6B6B]">Au bout de</span>
                                                                    <input 
                                                                        type="number" 
                                                                        min="1" max="14" 
                                                                        value={settings.alertToReviewDays} 
                                                                        onChange={(e) => handleChange('alertToReviewDays', parseInt(e.target.value))}
                                                                        className="w-14 p-1 text-center bg-white border border-[#E8E8E8] rounded text-[11px] outline-none" 
                                                                    />
                                                                    <span className="text-[10px] text-[#6B6B6B]">jours</span>
                                                                </div>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" checked={settings.notifyToReview} onChange={(e) => handleChange('notifyToReview', e.target.checked)} />
                                                                <div className="w-11 h-6 bg-[#E8E8E8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#9A9A9A] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Section: Templates */}
                                                <section className="space-y-6 pb-20">
                                                    <h3 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest flex items-center gap-2 border-b border-[#E8E8E8] pb-3">
                                                        <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span> Templates par défaut
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[11px] font-bold text-[#6B6B6B] block mb-2">Template Audit PDF</label>
                                                            <select
                                                                value={settings.templateAudit}
                                                                onChange={(e) => handleChange('templateAudit', e.target.value)}
                                                                className="w-full p-4 text-[11px] font-bold text-[#0D0D0D] bg-[#FBFBFB] border border-[#E8E8E8] focus:border-[#0D0D0D] rounded-2xl outline-none transition-all appearance-none"
                                                            >
                                                                <option value="default">Semrush SEO</option>
                                                                <option value="data_driven">Data Driven</option>
                                                                <option value="executive">Executive Impact</option>
                                                                <option value="storytelling">Storytelling</option>
                                                                <option value="minimal_clarity">Minimal Clarity</option>
                                                                <option value="bold_impact">Bold Impact</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-bold text-[#6B6B6B] block mb-2">Template Offres Client</label>
                                                            <select
                                                                value={settings.templateOffer}
                                                                onChange={(e) => handleChange('templateOffer', e.target.value)}
                                                                className="w-full p-4 text-[11px] font-bold text-[#0D0D0D] bg-[#FBFBFB] border border-[#E8E8E8] focus:border-[#0D0D0D] rounded-2xl outline-none transition-all appearance-none"
                                                            >
                                                                <option value="default">Semrush SEO</option>
                                                                <option value="data_driven">Data Driven</option>
                                                                <option value="executive">Executive Impact</option>
                                                                <option value="storytelling">Storytelling</option>
                                                                <option value="minimal_clarity">Minimal Clarity</option>
                                                                <option value="bold_impact">Bold Impact</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-bold text-[#6B6B6B] block mb-2">Template Contrat</label>
                                                            <select
                                                                value={settings.templateContract}
                                                                onChange={(e) => handleChange('templateContract', e.target.value)}
                                                                className="w-full p-4 text-[11px] font-bold text-[#0D0D0D] bg-[#FBFBFB] border border-[#E8E8E8] focus:border-[#0D0D0D] rounded-2xl outline-none transition-all appearance-none"
                                                            >
                                                                <option value="default">Semrush SEO</option>
                                                                <option value="data_driven">Data Driven</option>
                                                                <option value="executive">Executive Impact</option>
                                                                <option value="storytelling">Storytelling</option>
                                                                <option value="minimal_clarity">Minimal Clarity</option>
                                                                <option value="bold_impact">Bold Impact</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-6 sm:px-10 py-6 bg-white border-t border-[#E8E8E8] shrink-0">
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="flex-1 py-4 bg-white text-[#9A9A9A] text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#F4F4F4] transition-all border border-[#E8E8E8]"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="flex-[2] py-4 bg-[#0D0D0D] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {isSaving ? <Settings size={16} className="animate-spin" /> : <Save size={16} />}
                                                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}


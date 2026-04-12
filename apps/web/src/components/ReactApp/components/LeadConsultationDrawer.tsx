import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X as CloseIcon, MessageSquare, CheckCircle, ChevronRight, Send, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsultationNotes {
    besoin?: string;
    budget?: string;
    objections?: string;
    feeling?: 'positive' | 'neutral' | 'negative' | null;
    transcription?: string;
}

interface LeadConsultationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any | null;
    respondentName: string;
}

export default function LeadConsultationDrawer({ isOpen, onClose, lead, respondentName }: LeadConsultationDrawerProps) {
    const navigate = useNavigate();

    // The current UI requires AI generated strategic questions and a live assistant zone.
    // For now we mock these based on user request if not present in the lead object.
    const aiQuestions = [
        "Quel est l'impact financier de ne pas résoudre ce problème aujourd'hui ?",
        "Comment la prise de décision s'organise-t-elle chez eux ?",
        "Quelles solutions ont-ils déjà essayées avant nous ?"
    ];

    const notes: ConsultationNotes = lead?.ai_analysis_json?.consultation_notes || {};

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
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                    <div className="flex h-full flex-col bg-white shadow-2xl overflow-hidden">
                                        {/* Header */}
                                        <div className="px-6 sm:px-10 py-6 bg-[#0D0D0D] text-white shrink-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white/10 rounded-2xl shadow-lg shadow-black/10">
                                                        <MessageSquare size={22} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <Dialog.Title className="text-xl font-black uppercase tracking-tight">
                                                            Notes de Session
                                                        </Dialog.Title>
                                                        <p className="text-[11px] font-bold text-white/50 mt-1 uppercase tracking-widest">
                                                            {respondentName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5"
                                                    onClick={onClose}
                                                >
                                                    <CloseIcon size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto bg-[#FBFBFB] p-6 sm:p-10 scrollbar-thin space-y-10">
                                            
                                            {/* AI Strategic Questions */}
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest flex items-center gap-2">
                                                    <AlertCircle size={14} className="text-[#3B82F6]" />
                                                    Questions stratégiques suggérées (IA)
                                                </h4>
                                                <div className="grid gap-3">
                                                    {aiQuestions.map((q, idx) => (
                                                        <div key={idx} className="p-4 bg-white border border-[#3B82F6]/20 rounded-2xl shadow-sm text-xs font-bold text-[#0D0D0D] flex items-start gap-3">
                                                            <span className="text-[#3B82F6] opacity-50">{idx+1}.</span>
                                                            <p className="leading-relaxed">{q}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Live Assistant / Input Zone */}
                                            <div className="bg-white rounded-3xl p-6 border border-[#E8E8E8] shadow-sm space-y-4">
                                                <h4 className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest flex items-center gap-2 mb-2">
                                                    <MessageSquare size={14} className="text-[#7C3AED]" />
                                                    Live Assistant (Prise de notes)
                                                </h4>
                                                <textarea 
                                                    className="w-full min-h-[100px] p-4 text-sm font-medium bg-[#FBFBFB] border border-[#E8E8E8] rounded-2xl outline-none focus:border-[#7C3AED] transition-all resize-none placeholder:text-[#9A9A9A]"
                                                    placeholder="Prenez vos notes ici pendant le call..."
                                                />
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1.5 bg-[#F4F4F4] text-[#6B6B6B] rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-[#E8E8E8]">#Budget</span>
                                                    <span className="px-3 py-1.5 bg-[#F4F4F4] text-[#6B6B6B] rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-[#E8E8E8]">#Objection</span>
                                                    <span className="px-3 py-1.5 bg-[#F4F4F4] text-[#6B6B6B] rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-[#E8E8E8]">#Besoin</span>
                                                </div>
                                                <button className="w-full flex justify-center items-center gap-2 py-3 bg-[#F4F4F4] text-[#0D0D0D] text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E8E8E8] transition-all">
                                                    Sauvegarder les notes <Send size={14}/>
                                                </button>
                                            </div>

                                            {!notes.besoin && !notes.budget && !notes.objections && !lead?.ai_analysis_json?.consultation_notes ? (
                                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#E8E8E8]">
                                                    <p className="text-sm font-bold text-[#9A9A9A] uppercase tracking-widest">En attente de compte-rendu IA</p>
                                                    <button
                                                        onClick={() => { onClose(); navigate(`/consultation/${lead?.id}`); }}
                                                        className="mt-6 px-6 py-3 bg-[#0D0D0D] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10"
                                                    >
                                                        Ouvrir l'outil de consultation complet
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest">Synthèse de la consultation</h4>
                                                    
                                                    <div className="grid gap-4">
                                                        <div className="bg-white rounded-2xl p-6 border border-[#E8E8E8] space-y-3">
                                                            <label className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest block">🎯 Besoin Stratégique</label>
                                                            <p className="text-xs font-bold text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
                                                                {notes.besoin || "Non spécifié"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-2xl p-6 border border-[#E8E8E8] space-y-3">
                                                            <label className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest block">💰 Budget & Échéance</label>
                                                            <p className="text-xs font-bold text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
                                                                {notes.budget || "Non spécifié"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-2xl p-6 border border-[#E8E8E8] space-y-3">
                                                            <label className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest block">🛡️ Objections & Freins</label>
                                                            <p className="text-xs font-bold text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
                                                                {notes.objections || "Aucune objection relevée"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-2xl p-6 border border-[#E8E8E8] space-y-3 flex items-center justify-between">
                                                            <label className="text-[10px] font-black text-[#9A9A9A] uppercase tracking-widest">🧠 Feeling Expert</label>
                                                            <div className="flex items-center gap-3">
                                                                {notes.feeling === 'positive' && (
                                                                    <div className="flex items-center gap-2 text-[#22C55E] font-black text-xs uppercase tracking-widest">
                                                                        <CheckCircle size={18} /> Excellent
                                                                    </div>
                                                                )}
                                                                {notes.feeling === 'neutral' && (
                                                                    <div className="flex items-center gap-2 text-[#D97706] font-black text-xs uppercase tracking-widest">
                                                                        <div className="w-2 h-2 rounded-full bg-[#D97706]" /> Neutre
                                                                    </div>
                                                                )}
                                                                {notes.feeling === 'negative' && (
                                                                    <div className="flex items-center gap-2 text-[#EF4444] font-black text-xs uppercase tracking-widest">
                                                                        <div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Difficile
                                                                    </div>
                                                                )}
                                                                {!notes.feeling && (
                                                                    <span className="text-[#9A9A9A] text-xs font-bold italic">Non évalué</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {notes.transcription && (
                                                        <details className="group bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                                                            <summary className="flex items-center justify-between p-6 cursor-pointer select-none bg-white hover:bg-[#FBFBFB]">
                                                                <span className="text-[10px] font-black text-[#0D0D0D] uppercase tracking-widest flex items-center gap-2">
                                                                    <MessageSquare size={14} className="text-[#9A9A9A]" />
                                                                    Transcription Brute
                                                                </span>
                                                                <ChevronRight size={16} className="text-[#9A9A9A] group-open:rotate-90 transition-transform" />
                                                            </summary>
                                                            <div className="p-6 pt-0 text-xs font-medium text-[#6B6B6B] leading-loose max-h-[300px] overflow-y-auto whitespace-pre-wrap border-t border-[#E8E8E8]">
                                                                {notes.transcription}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-6 bg-white border-t border-[#E8E8E8] shrink-0">
                                            <button
                                                onClick={onClose}
                                                className="w-full py-4 bg-[#22C55E] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#16A34A] transition-all shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-2"
                                            >
                                                Pousser vers l'Audit <FileText size={16} />
                                            </button>
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

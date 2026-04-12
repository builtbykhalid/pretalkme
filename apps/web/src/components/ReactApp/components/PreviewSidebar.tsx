import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, Monitor, Eye } from 'lucide-react';
import RealTimeProfilePreview from './RealTimeProfilePreview';
import RealTimeFormPreview from './RealTimeFormPreview';
import type { PageConfig, ProfileTab } from '../context/AppContext';
import type { DesignConfig } from '../pages/FormBuilder';

interface PreviewSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    profile?: any;
    pageConfig?: PageConfig;
    profileStructure?: ProfileTab[];
    socialNetworks?: { id: string; url: string; platform: string }[];
    forms?: any[];
    autoOpen?: boolean; // Si true, pas de bouton fermer, mais strip plus discret
    mode?: 'profile' | 'form'; // Mode d'affichage
    // Props pour le mode 'form'
    title?: string;
    description?: string;
    questions?: any[];
    designConfig?: DesignConfig;
    brandColor?: string;
}

export default function PreviewSidebar({
    isOpen,
    onClose,
    profile,
    pageConfig,
    profileStructure,
    socialNetworks,
    forms,
    autoOpen = false,
    mode = 'profile',
    title,
    description,
    questions,
    designConfig,
    brandColor
}: PreviewSidebarProps) {
    const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
    const [previewStep, setPreviewStep] = useState<'profile' | 'forms' | 'social'>('profile');

    return createPortal(
        <>
            {/* Backdrop */}
            {!autoOpen && isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-screen bg-neutral-50/95 backdrop-blur-md border-l border-neutral-200 z-50 transition-all duration-500 flex flex-col overflow-hidden ${
                isOpen 
                    ? 'w-[500px] shadow-2xl opacity-100 pointer-events-auto' 
                    : 'w-0 opacity-0 pointer-events-none'
            }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <Eye size={18} className="text-indigo-600" />
                        <h2 className="text-sm font-semibold text-dark  tracking-tight">Aperçu</h2>
                    </div>
                    {!autoOpen && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-dark"
                            title="Fermer"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Controls */}
                <div className="px-6 py-4 border-b border-neutral-200 bg-white/50 shrink-0 space-y-4">
                    {/* Device Selector */}
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-2">Appareil</p>
                        <div className="flex bg-white rounded-xl p-1.5 border border-neutral-200 shadow-sm">
                            <button
                                onClick={() => setDevice('mobile')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs transition-all ${
                                    device === 'mobile'
                                        ? 'bg-dark text-white shadow-md'
                                        : 'text-neutral-500 hover:text-dark hover:bg-neutral-50'
                                }`}
                            >
                                <Smartphone size={14} />
                                Mobile
                            </button>
                            <button
                                onClick={() => setDevice('desktop')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs transition-all ${
                                    device === 'desktop'
                                        ? 'bg-dark text-white shadow-md'
                                        : 'text-neutral-500 hover:text-dark hover:bg-neutral-50'
                                }`}
                            >
                                <Monitor size={14} />
                                Desktop
                            </button>
                        </div>
                    </div>

                    {/* Step Selector - Only for profile mode */}
                    {mode === 'profile' && (
                        <div>
                            <p className="text-xs font-semibold text-neutral-500 mb-2">Pages</p>
                            <div className="flex flex-wrap gap-2">
                                {([
                                    { id: 'profile' as const, label: 'Profil' },
                                    { id: 'forms' as const, label: 'Formulaires' },
                                    { id: 'social' as const, label: 'Réseaux' }
                                ]).map((step) => (
                                    <button
                                        key={step.id}
                                        onClick={() => setPreviewStep(step.id)}
                                        className={`px-3 py-2 text-xs rounded-lg transition-all ${
                                            previewStep === step.id
                                                ? 'text-white shadow-md'
                                                : 'text-neutral-600 hover:text-dark bg-white border border-neutral-200 hover:border-neutral-300'
                                        }`}
                                        style={previewStep === step.id ? { backgroundColor: pageConfig?.color || '#6366F1' } : {}}
                                    >
                                        {step.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Container */}
                <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                    {mode === 'profile' ? (
                        <RealTimeProfilePreview
                            profile={profile}
                            pageConfig={pageConfig}
                            profileStructure={profileStructure}
                            socialNetworks={socialNetworks}
                            forms={forms || []}
                            device={device}
                            previewStep={previewStep}
                        />
                    ) : (
                        <RealTimeFormPreview
                            title={title || 'Mon formulaire'}
                            description={description}
                            questions={questions || []}
                            designConfig={designConfig || { primaryColor: 'indigo' }}
                            device={device}
                        />
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}

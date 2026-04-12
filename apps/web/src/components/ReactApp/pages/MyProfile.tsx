import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PageConfig, ProfileTab } from '../context/AppContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { Palette, Copy, Check, Save, Share2, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import ProfileStructureBuilder from '../components/profile/ProfileStructureBuilder';
import DesignModal from '../components/profile/DesignModal';
import ImmersivePhone from '../components/profile/ImmersivePhone';
import FloatingBuilderBar from '../components/profile/FloatingBuilderBar';

export default function MyProfile() {
    const { userProfile, updateProfile, forms, services } = useApp();
    const { handleFileUpload } = useFileUpload();

    // UI State
    const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('mobile');

    // Profile Data State
    const [pageConfig, setPageConfig] = useState<PageConfig>({
        theme: 'minimal', color: '#6366F1', font: 'inter', layout: 'linktree',
        hero_shape: 'rounded-rect', show_forms: true
    });
    const [profileStructure, setProfileStructure] = useState<ProfileTab[]>([]);
    const [socialArr, setSocialArr] = useState<{ id: string; url: string; platform: string }[]>([]);
    const [socialVisibility, setSocialVisibility] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // True if never went through onboarding AND has no structure set up
    const hasCompletedOnboarding = !!(userProfile?.page_config?.profile_structure || userProfile?.professional_status);
    const hasNoSections = !profileStructure || profileStructure.length === 0 || 
        profileStructure.every(tab => !tab.sections || tab.sections.length === 0);

    // Initialisation - reads profile_structure from page_config
    useEffect(() => {
        if (userProfile && !initialized) {
            setInitialized(true);
            if (userProfile.page_config) {
                setPageConfig(userProfile.page_config);
                if (userProfile.page_config.profile_structure && userProfile.page_config.profile_structure.length > 0) {
                    setProfileStructure(userProfile.page_config.profile_structure);
                } else {
                    // Create an initial tab with empty sections
                    const initialTab: ProfileTab = { id: crypto.randomUUID(), title: 'Ma Vitrine', sections: [] };
                    setProfileStructure([initialTab]);
                }
            } else {
                const initialTab: ProfileTab = { id: crypto.randomUUID(), title: 'Accueil', sections: [] };
                setProfileStructure([initialTab]);
            }
            if (userProfile.social_networks) {
                const arr = Object.entries(userProfile.social_networks)
                    .map(([key, value]) => ({ id: crypto.randomUUID(), url: value as string, platform: key }))
                    .filter(item => item.url);
                setSocialArr(arr.slice(0, 5));
            }
            setSocialVisibility(userProfile?.public_visibility?.social_networks ?? true);
        }
    }, [userProfile, initialized]);

    const handleSave = async () => {
        setSaving(true);
        const socialObj: Record<string, string> = {};
        socialArr.filter(item => item.url && item.platform).forEach(item => { socialObj[item.platform] = item.url; });
        try {
            await updateProfile({
                social_networks: socialObj,
                page_config: { ...pageConfig, profile_structure: profileStructure },
                public_visibility: {
                    ...userProfile?.public_visibility,
                    social_networks: socialVisibility
                }
            });
        } catch (error) { console.error(error); }
        finally { setSaving(false); }
    };

    const addFirstSection = () => {
        const newSection = { id: crypto.randomUUID(), title: 'Mes Liens', layout: 'list' as const, items: [] };
        if (profileStructure.length > 0) {
            setProfileStructure([{ ...profileStructure[0], sections: [newSection] }]);
        } else {
            setProfileStructure([{ id: crypto.randomUUID(), title: 'Ma Vitrine', sections: [newSection] }]);
        }
    };

    const addNewPage = () => {
        const newPage: ProfileTab = { 
            id: crypto.randomUUID(), 
            title: 'Nouvelle Page', 
            sections: [
                { id: crypto.randomUUID(), title: 'Ma Section', layout: 'list', items: [] }
            ] 
        };
        setProfileStructure([...profileStructure, newPage]);
        setViewMode('edit');
    };

    const publicUrl = userProfile?.username ? `${window.location.origin}/${userProfile.username}` : '';
    const copyUrl = () => { if (!publicUrl) return; navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-start p-4 bg-[#F8F8F8] animate-in fade-in zoom-in-95 duration-700 overflow-hidden relative">
            
            {/* Empty state — shown only if no sections configured */}
            {hasNoSections && viewMode === 'edit' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#F8F8F8] px-4">
                    <div className="max-w-md text-center space-y-6">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-[#0D0D0D] text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-black/20">
                            {hasCompletedOnboarding ? <Wand2 size={36} strokeWidth={1.5} /> : <Sparkles size={36} strokeWidth={1.5} />}
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-2xl font-semibold text-[#0D0D0D]">
                                {hasCompletedOnboarding
                                    ? 'Améliorez votre profil public'
                                    : 'Créez votre page profil'}
                            </h1>
                            <p className="text-sm text-[#9A9A9A] leading-relaxed max-w-sm mx-auto">
                                {hasCompletedOnboarding
                                    ? 'Votre espace est prêt. Ajoutez vos services, formulaires ou liens pour structurer votre vitrine en ligne.'
                                    : 'Personnalisez votre branding, organisez vos liens et présentez vos services dans une vitrine élégante.'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={addFirstSection}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-xl hover:bg-[#1A1A1A] transition-all active:scale-95 shadow-lg"
                            >
                                {hasCompletedOnboarding ? 'Ajouter une section' : 'Commencer la configuration'}
                                <ArrowRight size={16} />
                            </button>
                            {hasCompletedOnboarding && publicUrl && (
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F4F4F4] text-[#0D0D0D] text-sm font-semibold rounded-xl hover:bg-[#E8E8E8] transition-all border border-[#E8E8E8]"
                                >
                                    <Share2 size={16} />
                                    Voir mon profil
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Immersive Canvas */}
            <div className={`w-full max-w-6xl flex-1 flex flex-col items-center justify-start transition-all duration-700 ${hasNoSections && viewMode === 'edit' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <ImmersivePhone
                    viewMode={viewMode}
                    onModeChange={setViewMode}
                    deviceType={deviceType}
                    onDeviceChange={setDeviceType}
                >
                    {viewMode === 'preview' ? (
                        <iframe
                            src={`/${userProfile?.username}?preview=true`}
                            className="w-full h-full border-0"
                            title="Aperçu"
                        />
                    ) : (
                        <ProfileStructureBuilder
                            structure={profileStructure}
                            onChange={setProfileStructure}
                            availableForms={forms || []}
                            availableServices={services || []}
                            onUploadImage={async (file) => await handleFileUpload(file, 'forms', 'profile_structure')}
                        />
                    )}
                </ImmersivePhone>
            </div>

            {/* Floating Actions - always visible when not in empty state */}
            {(!hasNoSections || viewMode === 'preview') && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
                    <FloatingBuilderBar
                        onShare={copyUrl}
                        onAddPage={addNewPage}
                        onDesignClick={() => setIsDesignModalOpen(true)}
                        onSave={handleSave}
                        isSaving={saving}
                        isCopied={copied}
                    />
                </div>
            )}

            {/* Design Modal */}
            <DesignModal
                isOpen={isDesignModalOpen}
                onClose={() => setIsDesignModalOpen(false)}
                config={pageConfig}
                onChange={setPageConfig}
            />

            {/* Saving Indicator */}
            {saving && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border border-neutral-100 rounded-full text-xs font-bold text-dark shadow-xl">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Enregistrement en cours...
                    </div>
                </div>
            )}
        </div>
    );
}

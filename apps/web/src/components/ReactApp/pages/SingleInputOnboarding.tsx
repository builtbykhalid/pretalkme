import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mic,
    Square,
    Paperclip,
    Globe,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    User,
    Files,
    Plus,
    X,
    Camera,
    Target,
    Briefcase,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Palette,
    Link as LinkIcon,
    ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Logo from '../components/ui/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { N8N_ONBOARDING_WEBHOOK } from '../lib/n8n';

type OnboardingState = 'WELCOME' | 'STATUS' | 'ACTIVITY' | 'LINKS' | 'PHOTO_THEME' | 'LOADING' | 'WAITING_FORMS' | 'SUCCESS' | 'ERROR' | 'TIMEOUT';

interface OnboardingResults {
    publicProfileUrl: string;
    formsCount: number;
    userId?: string;
    timestamp?: string;
}

export default function SingleInputOnboarding() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { userProfile, updateProfile, refreshForms } = useApp();

    const [state, setState] = useState<OnboardingState>('WELCOME');
    
    // New Steps State
    const [welcomeIndex, setWelcomeIndex] = useState(0);
    const welcomeTexts = ['Welcome', 'Bienvenue', 'Bienvenido', 'Willkommen', 'Benvenuto'];
    
    const [userStatus, setUserStatus] = useState('');
    const [themeConfig, setThemeConfig] = useState({ color: 'primary', font: 'inter', layout: 'showcase' });
    
    // Existing State
    const [textInput, setTextInput] = useState('');
    const [links, setLinks] = useState<string[]>([]);
    const [pendingLink, setPendingLink] = useState<string | null>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [loadingText, setLoadingText] = useState('Extraction de votre profil pro...');
    const [results, setResults] = useState<OnboardingResults | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [webhookTimestamp, setWebhookTimestamp] = useState<string | null>(null);
    const [pollingAttempts, setPollingAttempts] = useState(0);

    const [website, setWebsite] = useState('');
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
        linkedin: '',
        twitter: '',
        behance: '',
        instagram: '',
        youtube: ''
    });
    const [activeSocial, setActiveSocial] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const pendingLinkRef = useRef<HTMLInputElement>(null);
    const plusMenuRef = useRef<HTMLDivElement>(null);
    const barsRef = useRef<HTMLDivElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const loadingTexts = [
        'Analyse de votre contenu...',
        'Extraction de votre profil pro...',
        "Configuration de l'espace de travail...",
        'Identification de vos services...',
        'Création de vos formulaires IA...',
        'Personnalisation de votre espace...',
        'Analyse de votre expertise...',
        'Optimisation de vos parcours clients...'
    ];

    // Welcome Step Timer
    useEffect(() => {
        if (state === 'WELCOME') {
            const int = setInterval(() => setWelcomeIndex(i => (i + 1) % welcomeTexts.length), 800);
            const tm = setTimeout(() => setState('STATUS'), 4000);
            return () => { clearInterval(int); clearTimeout(tm); };
        }
    }, [state]);

    // Polling for form generation
    const pollForForms = async (userId: string, timestamp: string, maxAttempts = 120) => {
        let attempts = 0;
        const checkForms = async (): Promise<boolean> => {
            try {
                attempts++;
                setPollingAttempts(attempts);
                const { data: forms, error } = await supabase
                    .from('forms')
                    .select('id, title, form_structure, ai_config, status, created_at')
                    .eq('user_id', userId)
                    .gte('created_at', new Date(timestamp).toISOString())
                    .limit(10);
                
                if (error) return false;
                
                const formCount = forms?.length || 0;
                
                if (formCount > 0) {
                    const formsWithQuestions = forms?.filter(f => {
                        const struct = f.form_structure as any;
                        return struct && struct.questions && Array.isArray(struct.questions) && struct.questions.length > 0;
                    }) || [];
                    
                    if (formsWithQuestions.length > 0) {
                        setResults({
                            publicProfileUrl: `/${(userProfile as any)?.username || 'user'}`,
                            formsCount: formCount,
                            userId,
                            timestamp,
                        });
                        await refreshForms();

                        // Auto-link generated forms into the profile structure
                        try {
                            const formItems = formsWithQuestions.map((f: any) => ({
                                id: `item_${f.id}`,
                                type: 'form',
                                targetId: f.id,
                                title: f.title || 'Formulaire',
                                subtitle: '',
                                imageUrl: '',
                                iconName: 'Sparkles'
                            }));

                            // Get current page_config from DB (not stale state)
                            const { data: freshProfile } = await supabase
                                .from('profiles')
                                .select('page_config')
                                .eq('id', userId)
                                .single();

                            const currentConfig = freshProfile?.page_config || {};
                            const currentStructure: any[] = currentConfig.profile_structure || [];

                            // Find the forms section and populate it
                            const updatedStructure = currentStructure.map((tab: any) => ({
                                ...tab,
                                sections: tab.sections.map((section: any) => {
                                    if (section.id === 'forms_section' || section.title === 'Questionnaires IA') {
                                        return { ...section, items: formItems };
                                    }
                                    return section;
                                })
                            }));

                            // If no forms_section exists, add forms to the resources tab or create one
                            const hasFormsSection = currentStructure.some((tab: any) =>
                                tab.sections?.some((s: any) => s.id === 'forms_section' || s.title === 'Questionnaires IA')
                            );

                            if (!hasFormsSection && updatedStructure.length > 0) {
                                // Append to last tab
                                const lastTabIdx = updatedStructure.length - 1;
                                updatedStructure[lastTabIdx] = {
                                    ...updatedStructure[lastTabIdx],
                                    sections: [
                                        ...(updatedStructure[lastTabIdx].sections || []),
                                        { id: 'forms_section', title: 'Questionnaires IA', layout: 'list', items: formItems }
                                    ]
                                };
                            }

                            await supabase.from('profiles').update({
                                page_config: { ...currentConfig, profile_structure: updatedStructure.length > 0 ? updatedStructure : currentStructure }
                            }).eq('id', userId);
                        } catch (linkErr) {
                            console.warn('Could not auto-link forms to profile structure:', linkErr);
                        }

                        setState('SUCCESS');
                        return true;
                    }
                }
                
                if (attempts >= maxAttempts) {
                    setResults({
                        publicProfileUrl: `/${(userProfile as any)?.username || 'user'}`,
                        formsCount: formCount,
                        userId,
                        timestamp,
                    });
                    setState('TIMEOUT');
                    return true;
                }
                return false;
            } catch (err) { return false; }
        };

        if (await checkForms()) return;
        const pollInterval = setInterval(async () => {
            if (await checkForms()) clearInterval(pollInterval);
        }, 1000);
        setTimeout(() => clearInterval(pollInterval), maxAttempts * 1000 + 1000);
    };

    useEffect(() => {
        if (state === 'LOADING' || state === 'WAITING_FORMS') {
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % loadingTexts.length;
                setLoadingText(loadingTexts[i]);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [state]);

    useEffect(() => {
        if (pendingLink !== null) {
            setTimeout(() => pendingLinkRef.current?.focus(), 0);
        }
    }, [pendingLink !== null]);

    // Webhook Execution
    const callWebhook = async (payload: Record<string, any>) => {
        const res = await fetch(N8N_ONBOARDING_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user?.id || '',
                user_email: user?.email || '',
                user_name: userProfile?.full_name || '',
                locale: 'fr',
                consultant_profile: {
                    full_name: userProfile?.full_name || '',
                    first_name: (userProfile as any)?.first_name || '',
                    last_name: (userProfile as any)?.last_name || '',
                    job_title: userProfile?.job_title || '',
                    professional_status: userProfile?.professional_status || userStatus || '',
                    bio: userProfile?.bio || '',
                    website: (userProfile as any)?.website || '',
                },
                ...payload,
            }),
        });
        if (!res.ok) throw new Error(`Erreur serveur (HTTP ${res.status})`);
        return res.json();
    };

    const uploadAvatar = async () => {
        if (!avatarFile || !user?.id) return;
        const ext = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${ext}`;
        await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (data?.publicUrl) {
            await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
        }
    };

    const { t, i18n } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setErrorMsg('');
        setState('LOADING');
        setLoadingText('Extraction de votre profil pro...');
        setPollingAttempts(0);
        
        try {
            // 1. Prepare updates for Profile table
            const defaultStructure = [
                {
                    id: 'principal',
                    title: 'Ma Vitrine',
                    sections: [
                        { id: 'services_selection', title: 'Services Recommandés', layout: 'carousel', items: [] },
                        { id: 'contact_section', title: 'Me Contacter', layout: 'list', items: [] }
                    ]
                },
                {
                    id: 'resources',
                    title: 'Ressources & Outils',
                    sections: [
                        { id: 'forms_section', title: 'Questionnaires IA', layout: 'list', items: [] }
                    ]
                }
            ];

            const updates: Record<string, any> = {
                professional_status: userStatus,
                website: website,
                social_networks: socialLinks,
                // profile_structure is stored INSIDE page_config so both MyProfile editor
                // and PublicProfile renderer can read it from config.profile_structure
                page_config: { 
                    ...(userProfile?.page_config || {}),
                    color: themeConfig.color,
                    font: themeConfig.font,
                    layout: themeConfig.layout || 'linktree',
                    services_layout: 'carousel',
                    links_layout: 'list',
                    show_forms: true,
                    services_position: 'before_links',
                    theme: 'minimal',
                    profile_structure: defaultStructure
                }
            };

            // 2. Handle Avatar Upload
            if (avatarFile && user?.id) {
                const ext = avatarFile.name.split('.').pop();
                const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;
                const { data: avatarData, error: avatarError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true });
                
                if (avatarError) {
                    console.error('Avatar upload error:', avatarError);
                } else if (avatarData) {
                    updates.avatar_url = supabase.storage.from('avatars').getPublicUrl(avatarData.path).data.publicUrl;
                }
            }

            // 3. Persist Profile
            await updateProfile(updates);
            localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');

            // 4. Prepare Webhook Payload (n8n)
            const payload: Record<string, any> = {
                user_id: user?.id,
                user_email: user?.email,
                user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
                consultant_profile: {
                    full_name: (userProfile as any)?.full_name || '',
                    job_title: (userProfile as any)?.job_title || '',
                    professional_status: userStatus || '',
                    bio: (userProfile as any)?.bio || '',
                    website: website,
                    social_networks: socialLinks
                },
                locale: i18n.language || 'fr',
                ai_config: { ...themeConfig }
            };

            // 5. Handle Audio/File inputs from previous steps
            if (audioBlob) {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(audioBlob);
                });
                payload.audio_base64 = base64;
            }

            if (attachedFile) {
                const filePath = `${user?.id}/${Date.now()}_${attachedFile.name}`;
                const { error: uploadError } = await supabase.storage.from('onboarding').upload(filePath, attachedFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('onboarding').getPublicUrl(filePath);
                payload.pdf_url = urlData.publicUrl;
            }

            if (links.length > 0) {
                payload.url = links[0];
                if (links[1]) payload.url_2 = links[1];
            }

            if (textInput.trim()) {
                payload.text = textInput;
            }

            // 6. Execute Webhook
            const data = await callWebhook(payload);
            if (data.error) throw new Error(data.message || `Erreur: ${data.error}`);
            
            if (data.success && data.user_id) {
                const userId = data.user_id || user?.id || '';
                const timestamp = data.timestamp || new Date().toISOString();
                setWebhookTimestamp(timestamp);
                setState('WAITING_FORMS');
                setLoadingText('Génération de vos formulaires IA...');
                pollForForms(userId, timestamp);
            } else {
                throw new Error(data.message || 'Réponse invalide du serveur');
            }
        } catch (err: any) {
            setIsSubmitting(false);
            setErrorMsg(err?.message || 'Une erreur est survenue.');
            setState('ERROR');
        }
    };

    // Derived states
    const hasAttachments = links.length > 0 || attachedFile !== null || audioBlob !== null;
    const canSubmitActivity = hasAttachments || textInput.trim().length > 0;
    const showAttachmentsRow = hasAttachments || pendingLink !== null;

    // Attachments functions
    const confirmPendingLink = () => {
        const trimmed = (pendingLink ?? '').trim();
        if (trimmed.startsWith('http') && links.length < 5) setLinks((prev) => [...prev, trimmed]);
        setPendingLink(null);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
        e.target.value = '';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100 flex flex-col relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-accent-400/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent-500/8 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

            <header className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-10 pt-6 flex items-center justify-between">
                <Logo size="lg" logoColor="primary" textColor="text-neutral-900" className="text-xl" />
                <LanguageSwitcher variant="minimal" className="text-neutral-700" />
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-[1600px] mx-auto px-6 md:px-10 py-4 md:py-8">
                
                {state === 'WELCOME' && (
                   <div className="flex flex-col flex-1 items-center justify-center w-full animate-in fade-in duration-700">
                      <h1 key={welcomeIndex} className="text-4xl md:text-6xl font-bold text-neutral-900 animate-in fade-in zoom-in duration-500 text-center">
                          {welcomeTexts[welcomeIndex]}
                      </h1>
                   </div>
                )}

                {state === 'STATUS' && (
                    <div className="flex flex-col flex-1 items-center justify-center w-full max-w-3xl mx-auto px-4 animate-in slide-in-from-bottom-8 duration-700">
                        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight text-center mb-10">
                            Quel est votre statut ?
                        </h1>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['Consultant', 'Gérant', 'Freelancer', 'Agence', 'Autre'].map(s => (
                                <button key={s} onClick={(e) => { e.preventDefault(); setUserStatus(s); setState('ACTIVITY'); }}
                                   className="px-6 py-4 bg-white/80 border border-neutral-200 hover:border-primary-500 hover:shadow-lg rounded-2xl text-lg font-semibold text-neutral-700 transition-all flex items-center group">
                                   {s}
                                </button>
                            ))}
                        </div>
                        <div className="mt-12">
                            <button onClick={() => setState('WELCOME')} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                <ChevronLeft size={18} /> Retour
                            </button>
                        </div>
                    </div>
                )}

                {state === 'ACTIVITY' && (
                    <div className="w-full max-w-3xl flex flex-col items-center text-center flex-1 md:flex-initial animate-in slide-in-from-bottom-8 duration-700">
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 pt-6 pb-6 md:py-0">
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
                                Configurons votre espace <span className="text-primary-500">Pretalk</span>
                            </h1>
                            <p className="text-neutral-500 text-sm md:text-base md:text-lg max-w-xl mx-auto">
                                Décrivez votre secteur d'activité, votre expertise et nous allons tout orchestrer.
                            </p>
                        </div>

                        <div className="relative w-full max-w-2xl mx-auto pb-2 md:pb-0 md:mt-10">
                            <div className="flex flex-col bg-white/80 backdrop-blur-xl border border-neutral-200/60 shadow-xl shadow-accent-500/5 rounded-2xl overflow-hidden">
                                <textarea
                                    placeholder="Ex: Je suis un consultant RH expert en gestion de conflits..."
                                    className="w-full bg-transparent border-none outline-none px-5 pt-4 pb-2 text-base text-neutral-900 placeholder:text-neutral-400 resize-none min-h-[80px] md:min-h-[120px] leading-relaxed"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    autoFocus
                                />
                                {showAttachmentsRow && (
                                    <div className="flex flex-wrap items-center gap-2 px-5 pb-2">
                                        {attachedFile && (
                                            <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-100 text-neutral-600 rounded-full px-3 py-1.5">
                                                <Paperclip size={11} className="text-accent-400 shrink-0" />
                                                {attachedFile.name.length > 26 ? attachedFile.name.slice(0, 24) + '…' : attachedFile.name}
                                                <button onClick={() => setAttachedFile(null)} className="ml-0.5 text-neutral-400"><X size={10} /></button>
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="flex items-center justify-between px-4 pb-4 pt-1">
                                    <label className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer">
                                        <Paperclip size={18} />
                                        <input type="file" className="hidden" accept="application/pdf,.pdf" onChange={(e) => {
                                            if(e.target.files) setAttachedFile(e.target.files[0]); e.target.value=''; 
                                        }} />
                                    </label>
                                    {canSubmitActivity && (
                                        <button onClick={() => setState('LINKS')} className="px-6 py-2 rounded-full bg-primary-500 text-white font-medium hover:bg-primary-600 transition-all flex items-center gap-2">
                                            Suivant <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {state === 'LINKS' && (
                    <div className="flex flex-col flex-1 items-center justify-center w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-8 duration-700">
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight leading-tight text-center mb-4">
                            Connectez vos réseaux
                        </h1>
                        <p className="text-neutral-500 text-center mb-10">
                            Ajoutez votre site et vos réseaux pour un profil public complet.
                        </p>
                        
                        <div className="w-full space-y-8">
                            {/* Website Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Site Web</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
                                        <Globe size={18} />
                                    </div>
                                    <input 
                                        type="url"
                                        placeholder="Entrez votre site web si dispo"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Social Icons Grid */}
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-neutral-700">Réseaux Sociaux</label>
                                <div className="flex justify-between gap-2">
                                    {[
                                        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                                        { id: 'twitter', icon: Twitter, label: 'X (Twitter)' },
                                        { id: 'behance', icon: Palette, label: 'Behance' },
                                        { id: 'instagram', icon: Instagram, label: 'Instagram' },
                                        { id: 'youtube', icon: Youtube, label: 'YouTube' }
                                    ].map((social) => {
                                        const hasLink = socialLinks[social.id]?.length > 0;
                                        return (
                                            <button 
                                                key={social.id}
                                                onClick={() => setActiveSocial(social.id)}
                                                className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all ${activeSocial === social.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-110' : hasLink ? 'bg-neutral-100 text-neutral-900' : 'bg-white border border-neutral-200 text-neutral-400 hover:border-primary-300 hover:text-primary-500'}`}
                                            >
                                                <social.icon size={24} />
                                                {hasLink && (
                                                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                                                        <CheckCircle2 size={12} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Social Input */}
                            {activeSocial && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                                            <LinkIcon size={18} />
                                        </div>
                                        <input 
                                            type="url"
                                            autoFocus
                                            placeholder={`Lien ${activeSocial.charAt(0).toUpperCase() + activeSocial.slice(1)}`}
                                            value={socialLinks[activeSocial]}
                                            onChange={(e) => setSocialLinks(prev => ({...prev, [activeSocial]: e.target.value}))}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-primary-500/30 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 w-full flex items-center justify-between">
                            <button onClick={() => setState('STATUS')} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                <ChevronLeft size={18} /> Retour
                            </button>
                            <button onClick={() => setState('PHOTO_THEME')} className="px-8 py-3.5 bg-neutral-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/10">
                                Continuer <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {state === 'PHOTO_THEME' && (
                    <div className="flex flex-col flex-1 items-center justify-center w-full max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight mb-4">
                                Personal Branding
                            </h1>
                            <p className="text-neutral-500 max-w-lg mx-auto">
                                Une photo pro et un thème personnalisé inspirent immédiatement confiance à vos prospects.
                            </p>
                        </div>

                        <div className="bg-white/90 p-8 pt-10 border border-neutral-200 shadow-2xl shadow-neutral-200/50 rounded-[2.5rem] w-full flex flex-col items-center gap-8 backdrop-blur-xl relative">
                            <div className="absolute -top-7">
                                <button onClick={() => avatarInputRef.current?.click()} className="group relative w-20 h-20 bg-white border-4 border-white rounded-full flex items-center justify-center overflow-hidden hover:border-primary-400 transition-all shadow-xl">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={28} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                                    )}
                                    <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </button>
                                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>

                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-neutral-700 block">Identité Visuelle</label>
                                    <div className="flex items-center gap-2">
                                        {['primary','blue','rose','emerald','amber','neutral'].map(c => (
                                            <button key={c} onClick={() => setThemeConfig(prev => ({...prev, color: c}))} className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform ${themeConfig.color === c ? 'border-neutral-900 scale-110' : 'border-transparent'}`}>
                                                <div className={`w-7 h-7 rounded-full bg-${c === 'primary' ? 'primary-500' : c + '-500'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-neutral-700 block">Typographie</label>
                                    <select 
                                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                                        value={themeConfig.font}
                                        onChange={(e) => setThemeConfig(prev => ({...prev, font: e.target.value as any}))}
                                    >
                                        <option value="inter">Inter (Moderne)</option>
                                        <option value="playfair">Playfair (Élégant)</option>
                                        <option value="space">Space Mono (Tech)</option>
                                        <option value="outfit">Outfit (Soft)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 w-full flex items-center justify-between">
                            <button onClick={() => setState('LINKS')} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                <ChevronLeft size={18} /> Retour
                            </button>
                            <button onClick={handleSubmit} className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                                Finaliser mon espace <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {(state === 'LOADING' || state === 'WAITING_FORMS') && (
                    <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
                        <div className="relative w-28 h-28">
                            <div className="absolute inset-0 rounded-full bg-primary-500/10 blur-xl animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-[3px] border-primary-500/10" />
                            <div className="absolute inset-0 rounded-full border-[3px] border-primary-500 border-t-transparent border-r-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 text-center max-w-md">
                            <p className="text-xl md:text-2xl font-bold text-neutral-900 transition-all duration-500">{loadingText}</p>
                            <p className="text-sm text-neutral-500">Veuillez patienter...</p>
                        </div>
                    </div>
                )}

                {state === 'ERROR' && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
                            <X size={36} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Une erreur est survenue</h2>
                            <p className="text-neutral-500 max-w-sm">{errorMsg}</p>
                        </div>
                        <button onClick={() => setState('WELCOME')} className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all">
                            Réessayer
                        </button>
                    </div>
                )}

                {(state === 'SUCCESS' || state === 'TIMEOUT') && (
                    <div className="space-y-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center gap-5">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${state === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}>
                                {state === 'SUCCESS' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight text-center">
                                {state === 'SUCCESS' ? 'Votre espace est prêt !' : 'Génération terminée.'}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            <div onClick={() => navigate('/app/forms')} className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-primary-400 transition-all cursor-pointer flex flex-col gap-4">
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Files size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900">Vos moyens de prospection</h3>
                                    <p className="text-sm text-neutral-500 mt-1">Générez des leads grâce à l'IA.</p>
                                </div>
                            </div>
                            
                            <div onClick={() => navigate('/app/services')} className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:emerald-400 transition-all cursor-pointer flex flex-col gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900">Vos services</h3>
                                    <p className="text-sm text-neutral-500 mt-1">Ce que vous proposez.</p>
                                </div>
                            </div>

                            <div 
                                onClick={() => {
                                    const url = results?.publicProfileUrl;
                                    if (url && url.startsWith('http')) {
                                        window.open(url, '_blank');
                                    } else if (url) {
                                        navigate(url);
                                    } else {
                                        navigate('/app/dashboard');
                                    }
                                }} 
                                className="group bg-neutral-900 rounded-2xl border border-neutral-800 p-6 hover:shadow-xl hover:shadow-neutral-900/30 transition-all cursor-pointer flex flex-col gap-4"
                            >
                                <div className="w-12 h-12 bg-neutral-800 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Profil Public</h3>
                                    <p className="text-sm text-neutral-400 mt-1">Découvrez la page générée.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-6">
                            <button onClick={() => navigate('/app/dashboard')} className="flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 border-b-2 border-transparent hover:border-primary-600 pb-0.5 transition-all">
                                Ton Dashboard <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-10 pb-6 flex flex-col items-center gap-4">
                {['WELCOME', 'STATUS', 'ACTIVITY', 'LINKS', 'PHOTO_THEME'].includes(state) && (
                    <button
                        onClick={() => {
                            if (user?.id) localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
                            navigate('/app/dashboard');
                        }}
                        className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        Passer l'onboarding →
                    </button>
                )}
            </footer>
        </div>
    );
}

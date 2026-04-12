import { useState, useEffect, useRef } from 'react';
import {
    CreditCard, Globe, Bell,
    ChevronRight, Shield, Mail, Key, LogOut, Trash2,
    CheckCircle2, AlertTriangle, HelpCircle, ExternalLink,
    Camera, Loader2, Sparkles, Smartphone, Languages,
    ToggleLeft, ToggleRight, Save, FileText,
    Linkedin, Twitter, Instagram, Youtube, Palette, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { useTranslation } from 'react-i18next';
import UserAvatar from '../components/ui/UserAvatar';
import AIEnhancer from '../components/ui/AIEnhancer';
import { useFeedback } from '../context/FeedbackContext';
import { supabase } from '../lib/supabase';
import { BillingSection } from '../components/settings/BillingSection';

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); onChange(!value); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${value
                ? 'bg-[#DCFCE7] text-[#16A34A]'
                : 'bg-[#F3F4F6] text-[#9A9A9A]'
                }`}
        >
            {value ? <ToggleRight size={14} strokeWidth={2.5} /> : <ToggleLeft size={14} strokeWidth={2.5} />}
            {value ? 'Public' : 'Masqué'}
        </button>
    );
}
export default function Settings() {
    const { user, signOut } = useAuth();
    const { userProfile, updateProfile } = useApp();
    const { confirm, showFeedback } = useFeedback();
    const { handleFileUpload } = useFileUpload();
    const { t } = useTranslation();

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    // Modals state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDomainModal, setShowDomainModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showRegionModal, setShowRegionModal] = useState(false);

    // Form inputs state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newDomain, setNewDomain] = useState('');
    const [tempNotifications, setTempNotifications] = useState({
        newLead: true,
        weeklyReport: true,
        marketing: false
    });
    const [tempRegion, setTempRegion] = useState({
        locale: 'fr',
        timezone: 'Europe/Paris'
    });

    // Profile state
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        phoneCountryCode: '+33',
        phoneNumber: '',
        locale: 'fr',
        timezone: 'Europe/Paris',
        jobTitle: '',
        professionalStatus: '',
        bio: '',
        website: ''
    });

    const [visibility, setVisibility] = useState({
        job_title: true,
        bio: true,
        website: true
    });

    const [notifications, setNotifications] = useState({
        newLead: true,
        weeklyReport: true,
        marketing: false
    });

    const [socialNetworks, setSocialNetworks] = useState({
        linkedin: '',
        twitter: '',
        behance: '',
        instagram: '',
        youtube: ''
    });

    const [domain, setDomain] = useState({
        custom_domain: '',
        company_logo_url: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data
    useEffect(() => {
        if (userProfile || user) {
            const phone = userProfile?.phone || '';
            const phoneCountryCode = userProfile?.phone_country_code || '+33';
            const phoneNumber = phone.startsWith(phoneCountryCode) ? phone.slice(phoneCountryCode.length) : phone;

            const currentProfile = {
                firstName: userProfile?.first_name || '',
                lastName: userProfile?.last_name || '',
                email: userProfile?.email || user?.email || '',
                username: userProfile?.username || '',
                phoneCountryCode: phoneCountryCode,
                phoneNumber: phoneNumber,
                locale: userProfile?.locale || 'fr',
                timezone: userProfile?.timezone || 'Europe/Paris',
                jobTitle: userProfile?.job_title || '',
                professionalStatus: userProfile?.professional_status || '',
                bio: userProfile?.bio || '',
                website: userProfile?.website || ''
            };

            setProfile(currentProfile);
            setVisibility({
                job_title: userProfile?.public_visibility?.job_title ?? true,
                bio: userProfile?.public_visibility?.bio ?? true,
                website: userProfile?.public_visibility?.website ?? true,
            });
            setTempRegion({ locale: currentProfile.locale, timezone: currentProfile.timezone });

            if (userProfile?.notification_preferences) {
                setNotifications(userProfile.notification_preferences);
                setTempNotifications(userProfile.notification_preferences);
            }

            const currentDomain = userProfile?.custom_domain || '';
            setDomain({
                custom_domain: currentDomain,
                company_logo_url: userProfile?.company_logo_url || ''
            });
            setNewDomain(currentDomain);

            if (userProfile?.social_networks) {
                setSocialNetworks({
                    linkedin: userProfile.social_networks.linkedin || '',
                    twitter: userProfile.social_networks.twitter || '',
                    behance: (userProfile.social_networks as any).behance || '',
                    instagram: userProfile.social_networks.instagram || '',
                    youtube: userProfile.social_networks.youtube || ''
                });
            }
        }
    }, [userProfile, user]);
    
    // Auto-scroll to billing if hash or path is present
    useEffect(() => {
        const isBillingRoute = window.location.pathname.endsWith('/billing') || window.location.hash === '#billing';
        if (isBillingRoute) {
            const el = document.getElementById('billing');
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    }, []);

    // Username check
    const checkUsernameUnique = async (value: string) => {
        if (!value) return true;
        const slug = value.toLowerCase().trim();
        try {
            const res = await supabase.from('profiles').select('id, username').ilike('username', slug);
            if (res.data && res.data.length > 0) {
                if (userProfile?.id && res.data[0].id === userProfile.id) return true;
                return false;
            }
            return true;
        } catch (e) { return true; }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail) return;
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;
            showFeedback('success', {
                title: 'Email envoyé',
                message: 'Un email de confirmation a été envoyé à votre nouvelle adresse.'
            });
            setShowEmailModal(false);
            setNewEmail('');
        } catch (e: any) {
            showFeedback('error', {
                message: e.message || 'Erreur lors de la mise à jour de l\'email'
            });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            showFeedback('error', { message: 'Les mots de passe ne correspondent pas' });
            return;
        }
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            showFeedback('success', {
                message: 'Mot de passe mis à jour avec succès'
            });
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            showFeedback('error', {
                message: e.message || 'Erreur lors de la mise à jour du mot de passe'
            });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdateDomain = async () => {
        setAuthLoading(true);
        try {
            await updateProfile({ custom_domain: newDomain });
            showSuccessToast();
            setShowDomainModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdateNotifications = async () => {
        setAuthLoading(true);
        try {
            await updateProfile({ notification_preferences: tempNotifications });
            showSuccessToast();
            setShowNotificationsModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdateRegion = async () => {
        setAuthLoading(true);
        try {
            await updateProfile({
                locale: tempRegion.locale,
                timezone: tempRegion.timezone
            });
            showSuccessToast();
            setShowRegionModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setAuthLoading(false);
        }
    };


    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const path = await handleFileUpload(file, 'avatars');
            if (path) await updateProfile({ avatar_url: path });
            showSuccessToast();
        } catch (err) { console.error(err); }
    };

    const handleDeleteAccount = async () => {
        const confirmed = await confirm({
            type: 'delete',
            title: 'Supprimer mon compte ?',
            message: 'Cette action est irréversible. Toutes vos données seront définitivement effacées.',
            confirmLabel: 'Supprimer mon compte',
            cancelLabel: 'Annuler'
        });

        if (confirmed) {
            showFeedback('info', {
                title: 'Assistance requise',
                message: 'Veuillez contacter le support à support@pretalk.me pour finaliser la suppression de votre compte.'
            });
        }
    };

    const showSuccessToast = () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-16 animate-in fade-in duration-700 min-h-screen">
            {/* Header */}
            <div className="space-y-4 border-b border-[#EEEEEE] pb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F4F4F4] text-[#0D0D0D] rounded-lg">
                        <Smartphone size={20} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs text-[#0D0D0D] bg-[#F4F4F4] px-2 py-0.5 rounded font-semibold">Gestion du compte</span>
                </div>
                <h1 className="page-title">{t('settings.title') || 'Compte'}</h1>
                <p className="page-subtitle">Gérez vos informations personnelles, votre sécurité et vos préférences globales.</p>
            </div>

            {/* Profile Section */}
            <section className="space-y-10">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white border border-[#E8E8E8] rounded-2xl transition-all duration-500 group">
                    <div className="relative">
                        <UserAvatar size={100} editable rounded="rounded-[2rem]" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2.5 bg-[#0D0D0D] text-white rounded-[10px] hover:bg-[#1A1A1A] active:scale-95 transition-all"
                        >
                            <Camera size={18} strokeWidth={2.5} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                        <h2 className="text-xl font-semibold text-dark leading-none">{profile.firstName} {profile.lastName}</h2>
                        <p className="text-sm text-[#9A9A9A]">@{profile.username || 'utilisateur'}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                            <span className="px-3 py-1 bg-[#DCFCE7] text-[#16A34A] text-xs rounded-full flex items-center gap-1.5 font-semibold">
                                <CheckCircle2 size={12} strokeWidth={3} />
                                Compte Vérifié
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#F4F4F4] hover:bg-[#E8E8E8] text-[#0D0D0D] text-sm rounded-[10px] transition-all active:scale-95 flex items-center gap-2"
                    >
                        Changer la photo
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {/* Nom Complet */}
                    <div className="p-6 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-colors text-left">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="field-label">Nom complet</p>
                                <p className="text-base text-dark">{profile.firstName} {profile.lastName}</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const newName = await confirm({
                                        title: 'Changer le nom',
                                        message: 'Entrez votre nouveau nom complet :',
                                        showInput: true,
                                        initialInputValue: `${profile.firstName} ${profile.lastName}`,
                                        confirmLabel: 'Enregistrer'
                                    });
                                    if (newName && typeof newName === 'string') {
                                        const parts = newName.trim().split(' ');
                                        const first = parts[0];
                                        const last = parts.slice(1).join(' ');
                                        await updateProfile({ first_name: first, last_name: last });
                                        showSuccessToast();
                                    }
                                }}
                                className="p-2 text-[#9A9A9A] hover:text-[#0D0D0D] hover:bg-[#F4F4F4] rounded-lg transition-all"
                            >
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Nom d'utilisateur */}
                    <div className="p-6 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-colors text-left">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="field-label">Nom d'utilisateur</p>
                                <p className="text-base text-dark">@{profile.username}</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const newUsername = await confirm({
                                        title: 'Changer le nom d\'utilisateur',
                                        message: 'Entrez votre nouveau nom d\'utilisateur :',
                                        showInput: true,
                                        initialInputValue: profile.username,
                                        confirmLabel: 'Enregistrer'
                                    });
                                    if (newUsername && typeof newUsername === 'string' && newUsername !== profile.username) {
                                        const ok = await checkUsernameUnique(newUsername);
                                        if (ok) {
                                            await updateProfile({ username: newUsername });
                                            showSuccessToast();
                                        } else {
                                            showFeedback('error', { message: 'Ce nom d\'utilisateur est déjà utilisé.' });
                                        }
                                    }
                                }}
                                className="p-2 text-[#9A9A9A] hover:text-[#0D0D0D] hover:bg-[#F4F4F4] rounded-lg transition-all"
                            >
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Titre / Fonction */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-all text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="field-label">Titre / Fonction</p>
                            <VisibilityToggle
                                value={visibility.job_title}
                                onChange={async (v) => {
                                    setVisibility(prev => ({ ...prev, job_title: v }));
                                    await updateProfile({
                                        public_visibility: { ...userProfile?.public_visibility, job_title: v }
                                    });
                                }}
                            />
                        </div>
                        <input
                            type="text"
                            value={profile.jobTitle}
                            onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                            onBlur={async () => {
                                if (profile.jobTitle !== userProfile?.job_title) {
                                    await updateProfile({ job_title: profile.jobTitle });
                                    showSuccessToast();
                                }
                            }}
                            className="w-full bg-white border border-[#E0E0E0] rounded-[10px] px-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all"
                            placeholder="Ex: Expert en Marketing SEO"
                        />
                    </div>

                    {/* Statut Professionnel */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-all text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="field-label">Statut Professionnel</p>
                        </div>
                        <select
                            value={profile.professionalStatus}
                            onChange={async (e) => {
                                const newStatus = e.target.value;
                                setProfile(prev => ({ ...prev, professionalStatus: newStatus }));
                                await updateProfile({ professional_status: newStatus });
                                showSuccessToast();
                            }}
                            className="w-full bg-white border border-[#E0E0E0] rounded-[10px] px-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all"
                        >
                            <option value="">Sélectionnez un statut</option>
                            <option value="Consultant">Consultant</option>
                            <option value="Gérant">Gérant</option>
                            <option value="Freelancer">Freelancer</option>
                            <option value="Agence">Agence</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>

                    {/* Site Web */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-all text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="field-label">Site Web</p>
                            <VisibilityToggle
                                value={visibility.website}
                                onChange={async (v) => {
                                    setVisibility(prev => ({ ...prev, website: v }));
                                    await updateProfile({
                                        public_visibility: { ...userProfile?.public_visibility, website: v }
                                    });
                                }}
                            />
                        </div>
                        <div className="relative group">
                            <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#AAAAAA] group-focus-within:text-[#0D0D0D] transition-colors" />
                            <input
                                type="url"
                                value={profile.website}
                                onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                                onBlur={async () => {
                                    if (profile.website !== userProfile?.website) {
                                        await updateProfile({ website: profile.website });
                                        showSuccessToast();
                                    }
                                }}
                                className="w-full bg-white border border-[#E0E0E0] rounded-[10px] pl-10 pr-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all"
                                placeholder="https://votre-site.com"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-all text-left md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <p className="field-label">Votre Bio</p>
                                <AIEnhancer
                                    text={profile.bio}
                                    onEnhanced={async (newText) => {
                                        setProfile(prev => ({ ...prev, bio: newText }));
                                        await updateProfile({ bio: newText });
                                        showSuccessToast();
                                    }}
                                    context="Professionnel"
                                />
                            </div>
                            <VisibilityToggle
                                value={visibility.bio}
                                onChange={async (v) => {
                                    setVisibility(prev => ({ ...prev, bio: v }));
                                    await updateProfile({
                                        public_visibility: { ...userProfile?.public_visibility, bio: v }
                                    });
                                }}
                            />
                        </div>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                            onBlur={async () => {
                                if (profile.bio !== userProfile?.bio) {
                                    await updateProfile({ bio: profile.bio });
                                    showSuccessToast();
                                }
                            }}
                            rows={4}
                            className="w-full bg-white border border-[#E0E0E0] rounded-[10px] px-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all resize-none leading-relaxed"
                            placeholder="Décrivez votre expertise en quelques mots..."
                        />
                    </div>

                    {/* Email */}
                    <div className="p-6 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-colors text-left">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-left">
                                <p className="field-label flex items-center gap-1.5 leading-none">
                                    <Mail size={12} />
                                    Adresse e-mail
                                </p>
                                <p className="text-base text-[#0D0D0D]">{profile.email}</p>
                            </div>
                            <button
                                onClick={() => setShowEmailModal(true)}
                                className="px-4 py-2 bg-[#F4F4F4] text-[#0D0D0D] text-xs font-semibold rounded-[10px] hover:bg-[#0D0D0D] hover:text-white transition-all"
                            >
                                Modifier
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="p-6 bg-white border border-[#E8E8E8] rounded-2xl space-y-4 hover:border-[#E0E0E0] transition-colors text-left">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-left">
                                <p className="field-label flex items-center gap-1.5 leading-none">
                                    <Shield size={12} />
                                    Mot de passe
                                </p>
                                <p className="text-base text-[#0D0D0D]">••••••••</p>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="px-4 py-2 bg-[#F4F4F4] text-[#0D0D0D] text-xs font-semibold rounded-[10px] hover:bg-[#0D0D0D] hover:text-white transition-all"
                            >
                                Changer
                            </button>
                        </div>
                    </div>
                    {/* Réseaux Sociaux */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-6 hover:border-[#E0E0E0] transition-all text-left md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="field-label font-bold text-dark">Réseaux Sociaux</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                                { id: 'twitter', icon: Twitter, label: 'X (Twitter)', placeholder: 'https://x.com/...' },
                                { id: 'behance', icon: Palette, label: 'Behance', placeholder: 'https://behance.net/...' },
                                { id: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/...' },
                                { id: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/...' }
                            ].map((social) => (
                                <div key={social.id} className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 ml-1">{social.label}</label>
                                    <div className="relative group">
                                        <social.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] group-focus-within:text-[#0D0D0D] transition-colors" />
                                        <input
                                            type="url"
                                            value={socialNetworks[social.id as keyof typeof socialNetworks]}
                                            onChange={(e) => setSocialNetworks(prev => ({ ...prev, [social.id]: e.target.value }))}
                                            onBlur={async () => {
                                                const currentLink = (userProfile?.social_networks as any)?.[social.id] || '';
                                                if (socialNetworks[social.id as keyof typeof socialNetworks] !== currentLink) {
                                                    await updateProfile({
                                                        social_networks: {
                                                            ...userProfile?.social_networks,
                                                            [social.id]: socialNetworks[social.id as keyof typeof socialNetworks]
                                                        }
                                                    });
                                                    showSuccessToast();
                                                }
                                            }}
                                            className="w-full bg-white border border-[#E0E0E0] rounded-[10px] pl-10 pr-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all"
                                            placeholder={social.placeholder}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscription Section */}
            <section id="billing" className="space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl">
                        <CreditCard size={18} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-base font-semibold text-[#0D0D0D] text-left">Plan & Facturation</h2>
                </div>
                
                <BillingSection />

                <div className="pt-2">
                    <button 
                        onClick={() => window.open('https://pretalk.lemonsqueezy.com/billing', '_blank')}
                        className="flex items-center justify-between w-full p-6 bg-white hover:bg-[#F4F4F4] border border-[#E8E8E8] rounded-xl text-[#0D0D0D] transition-all group"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-[#F4F4F4] text-[#9A9A9A] rounded-2xl">
                                <CreditCard size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <span className="text-sm font-medium">Portail de facturation Lemon Squeezy</span>
                                <p className="text-xs text-neutral-400 mt-0.5">Gérez vos abonnements, méthodes de paiement et téléchargez vos factures.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-500">
                            Gérer mon abonnement
                            <ExternalLink size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>
                </div>
            </section>

            {/* Additional Settings */}
            <section className="space-y-10">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl">
                        <LogOut size={18} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-base font-semibold text-[#0D0D0D] text-left">Paramètres additionnels</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Domain */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-6 hover:border-[#E0E0E0] transition-all group flex flex-col text-left">
                        <div className="p-4 bg-[#F4F4F4] text-[#0D0D0D] rounded-2xl w-fit">
                            <Globe size={24} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-semibold text-[#0D0D0D]">Marque blanche</h4>
                            <p className="text-xs text-[#9A9A9A] font-semibold leading-relaxed">{domain.custom_domain || 'pretalk.me/...'}</p>
                        </div>
                        <button onClick={() => setShowDomainModal(true)} className="w-full py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded-[10px] hover:bg-[#1A1A1A] transition-all">Configurer</button>
                    </div>

                    {/* Notifications */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-6 hover:border-[#E0E0E0] transition-all group flex flex-col text-left">
                        <div className="p-4 bg-[#F4F4F4] text-[#0D0D0D] rounded-2xl w-fit">
                            <Bell size={24} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-semibold text-[#0D0D0D]">Notifications</h4>
                            <p className="text-xs text-[#9A9A9A] font-semibold leading-relaxed">Alertes leads : {notifications.newLead ? 'Activé' : 'Désactivé'}</p>
                        </div>
                        <button onClick={() => setShowNotificationsModal(true)} className="w-full py-3 bg-[#F4F4F4] text-[#0D0D0D] text-xs font-semibold rounded-[10px] hover:bg-[#0D0D0D] hover:text-white transition-all">Gérer</button>
                    </div>


                    {/* Language & Regions */}
                    <div className="p-8 bg-white border border-[#E8E8E8] rounded-2xl space-y-6 hover:border-[#E0E0E0] transition-all group flex flex-col text-left">
                        <div className="p-4 bg-[#F4F4F4] text-[#0D0D0D] rounded-2xl w-fit">
                            <Languages size={24} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 space-y-1 text-left">
                            <h4 className="text-sm font-semibold text-[#0D0D0D]">Langue & Région</h4>
                            <p className="text-xs text-[#9A9A9A] leading-relaxed">{profile.locale} • {profile.timezone}</p>
                        </div>
                        <button onClick={() => setShowRegionModal(true)} className="w-full py-3 bg-[#F4F4F4] text-[#0D0D0D] text-xs font-semibold rounded-[10px] hover:bg-[#0D0D0D] hover:text-white transition-all">Modifier</button>
                    </div>
                </div>
            </section>

            {/* System / Critical Section */}
            <section className="space-y-8 bg-white p-10 rounded-2xl border border-[#E8E8E8] text-left">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl">
                        <Key size={18} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-base font-semibold text-[#0D0D0D]">Système & Sécurité</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-[#E8E8E8] rounded-2xl group gap-4 hover:border-[#E0E0E0] transition-all">
                        <div className="flex items-center gap-4 w-full">
                            <div className="p-3 bg-[#FEE2E2] text-[#DC2626] rounded-2xl">
                                <LogOut size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#0D0D0D] leading-none">Sessions actives</h4>
                                <p className="text-xs text-[#9A9A9A] font-semibold mt-1 leading-none">Connecté en tant que @{profile.username}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => supabase.auth.signOut({ scope: 'others' })} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#F4F4F4] hover:bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold rounded-[10px] transition-all">Autres</button>
                            <button onClick={signOut} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0D0D0D] text-white text-xs font-semibold rounded-[10px] hover:bg-[#1A1A1A] transition-all active:scale-95">Déconnexion</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white border border-[#E8E8E8] rounded-2xl group hover:border-[#E0E0E0] transition-all">
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-[#F4F4F4] text-[#9A9A9A] rounded-2xl">
                                <HelpCircle size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-[#0D0D0D] leading-none">Assistance</h4>
                                <p className="text-xs text-[#9A9A9A] font-semibold mt-1 text-left">Besoin d'aide ?</p>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 bg-[#F4F4F4] hover:bg-[#0D0D0D] text-[#0D0D0D] hover:text-white text-xs font-semibold rounded-[10px] transition-all flex items-center gap-2 leading-none">
                            Support
                            <ExternalLink size={12} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white border border-[#FEE2E2] rounded-2xl group hover:bg-[#FFF5F5] transition-all">
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-[#FEE2E2] text-[#DC2626] rounded-2xl">
                                <Trash2 size={20} strokeWidth={1.5} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-semibold text-[#DC2626] leading-none">Suppression</h4>
                                <p className="text-xs text-[#DC2626]/60 font-semibold mt-1 text-left">Action irréversible.</p>
                            </div>
                        </div>
                        <button onClick={handleDeleteAccount} className="px-5 py-2.5 bg-white text-[#DC2626] text-xs font-semibold rounded-[10px] hover:bg-[#DC2626] hover:text-white transition-all border border-[#FEE2E2] active:scale-95">Supprimer</button>
                    </div>
                </div>
            </section>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed bottom-10 right-10 z-[200] flex items-center gap-3 px-6 py-4 bg-[#0D0D0D] text-white rounded-[10px] shadow-lg animate-in slide-in-from-bottom-5 duration-500">
                    <CheckCircle2 size={20} strokeWidth={3} className="text-[#22C55E]" />
                    <span className="text-xs">Mis à jour !</span>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowEmailModal(false)} />
                    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl p-8 w-full max-w-lg space-y-8 shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Mail size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-dark leading-none">Nouvel e-mail</h3>
                            <p className="text-sm page-subtitle leading-relaxed">Un lien de confirmation sera envoyé à votre nouvelle adresse.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-xs text-neutral-400 ml-1">Adresse e-mail</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-6 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-dark outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all font-bold placeholder:text-neutral-300 shadow-inner"
                                    placeholder="nouvel.expert@pretalk.me"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="flex-1 px-5 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-dark text-sm rounded-xl transition-all border border-neutral-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpdateEmail}
                                    disabled={authLoading || !newEmail}
                                    className="flex-1 px-5 py-2.5 bg-dark text-white text-sm rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-dark/20"
                                >
                                    {authLoading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl p-8 w-full max-w-lg space-y-8 shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Shield size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-dark leading-none">Sécurité</h3>
                            <p className="text-sm page-subtitle leading-relaxed">Utilisez au moins 8 caractères.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-xs text-neutral-400 ml-1">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-6 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-dark outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-200 transition-all font-bold placeholder:text-neutral-300 shadow-inner"
                                    placeholder="••••••••••••"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs text-neutral-400 ml-1">Confirmer</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-6 py-5 bg-white border border-[#E0E0E0] rounded-[10px] text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all font-semibold placeholder:text-[#AAAAAA]"
                                    placeholder="••••••••••••"
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                                    <AlertTriangle size={18} />
                                    <p className="text-xs">Incohérence</p>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-5 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-dark text-sm rounded-xl transition-all border border-neutral-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={authLoading || !newPassword || newPassword !== confirmPassword}
                                    className="flex-1 px-5 py-2.5 bg-dark text-white text-sm rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-dark/20"
                                >
                                    {authLoading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Mettre à jour'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Domain Modal */}
            {showDomainModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowDomainModal(false)} />
                    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl p-8 w-full max-w-lg space-y-8 shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Globe size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-dark leading-none">Marque blanche</h3>
                            <p className="text-sm page-subtitle leading-relaxed">Personnalisez votre URL pour une image de marque cohérente.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-xs text-neutral-400 ml-1">Domaine Personnalisé</label>
                                <input
                                    type="text"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    className="w-full px-6 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-dark outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all font-bold placeholder:text-neutral-300 shadow-inner"
                                    placeholder="audits.votre-agence.com"
                                />
                                <p className="text-xs text-neutral-400 ml-1 mt-2">Pensez à configurer votre CNAME chez votre hôte DNS.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button onClick={() => setShowDomainModal(false)} className="flex-1 px-5 py-2.5 bg-[#F4F4F4] hover:bg-[#E8E8E8] text-[#0D0D0D] text-sm rounded-[10px] transition-all">Annuler</button>
                                <button onClick={handleUpdateDomain} disabled={authLoading} className="flex-1 px-5 py-2.5 bg-[#0D0D0D] text-white text-sm rounded-[10px] hover:bg-[#1A1A1A] active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Sauvegarder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Modal */}
            {showNotificationsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowNotificationsModal(false)} />
                    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl p-8 w-full max-w-lg space-y-8 shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Bell size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-dark leading-none">Notifications</h3>
                            <p className="text-sm page-subtitle leading-relaxed">Gérez comment vous êtes alerté de l'activité de vos leads.</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'newLead', label: 'Nouveaux Leads', desc: 'Alertes instantanées dès qu\'un lead est qualifié' },
                                { id: 'weeklyReport', label: 'Rapport Hebdomadaire', desc: 'Résumé de vos performances chaque lundi matin' },
                                { id: 'marketing', label: 'E-mails Marketing', desc: 'Nouveautés produits et conseils stratégiques' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTempNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof tempNotifications] }))}
                                    className="w-full flex items-center justify-between p-6 bg-[#F8F8F8] hover:bg-white border border-[#E8E8E8] hover:border-[#E0E0E0] rounded-2xl transition-all text-left group"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm text-[#0D0D0D] leading-none">{item.label}</p>
                                        <p className="text-xs text-[#9A9A9A]">{item.desc}</p>
                                    </div>
                                    <div className={`p-2 rounded-full transition-all ${tempNotifications[item.id as keyof typeof tempNotifications] ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F3F4F6] text-[#AAAAAA]'}`}>
                                        {tempNotifications[item.id as keyof typeof tempNotifications] ? <ToggleRight size={24} strokeWidth={2.5} /> : <ToggleLeft size={24} strokeWidth={2.5} />}
                                    </div>
                                </button>
                            ))}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button onClick={() => setShowNotificationsModal(false)} className="flex-1 px-5 py-2.5 bg-[#F4F4F4] hover:bg-[#E8E8E8] text-[#0D0D0D] text-sm rounded-[10px] transition-all">Annuler</button>
                                <button onClick={handleUpdateNotifications} disabled={authLoading} className="flex-1 px-5 py-2.5 bg-[#0D0D0D] text-white text-sm rounded-[10px] hover:bg-[#1A1A1A] active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Appliquer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Region Modal */}
            {showRegionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowRegionModal(false)} />
                    <div className="relative bg-white border border-[#E8E8E8] rounded-2xl p-8 w-full max-w-lg space-y-8 shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="space-y-3 text-center">
                            <div className="w-16 h-16 bg-[#F4F4F4] text-[#0D0D0D] rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Languages size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-dark leading-none">Langue & Région</h3>
                            <p className="text-sm page-subtitle leading-relaxed">Adaptez votre interface à votre zone géographique.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-xs text-neutral-400 ml-1">Langue de l'interface</label>
                                    <select
                                        value={tempRegion.locale}
                                        onChange={(e) => setTempRegion(prev => ({ ...prev, locale: e.target.value }))}
                                        className="w-full px-6 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-dark outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-200 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="fr">Français (FR)</option>
                                        <option value="en">English (US)</option>
                                        <option value="es">Español (ES)</option>
                                        <option value="ar">العربية (AR)</option>
                                    </select>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-xs text-neutral-400 ml-1">Fuseau Horaire</label>
                                    <select
                                        value={tempRegion.timezone}
                                        onChange={(e) => setTempRegion(prev => ({ ...prev, timezone: e.target.value }))}
                                        className="w-full px-6 py-5 bg-white border border-[#E0E0E0] rounded-[10px] text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] transition-all font-semibold appearance-none cursor-pointer"
                                    >
                                        <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                                        <option value="Africa/Algiers">Africa/Algiers (GMT+1)</option>
                                        <option value="Africa/Tunis">Africa/Tunis (GMT+1)</option>
                                        <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                                        <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</option>
                                        <option value="Europe/Paris">Europe/Paris (CET)</option>
                                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                                        <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                                        <option value="Europe/Madrid">Europe/Madrid (CET)</option>
                                        <option value="Europe/Brussels">Europe/Brussels (CET)</option>
                                        <option value="America/New_York">America/New_York (EST/EDT)</option>
                                        <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                                        <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                                        <option value="America/Sao_Paulo">America/Sao_Paulo (BRT)</option>
                                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                        <option value="Asia/Hong_Kong">Asia/Hong_Kong (HKT)</option>
                                        <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                                        <option value="UTC">Universal Time (UTC)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button onClick={() => setShowRegionModal(false)} className="flex-1 px-5 py-2.5 bg-[#F4F4F4] hover:bg-[#E8E8E8] text-[#0D0D0D] text-sm rounded-[10px] transition-all">Annuler</button>
                                <button onClick={handleUpdateRegion} disabled={authLoading} className="flex-1 px-5 py-2.5 bg-[#0D0D0D] text-white text-sm rounded-[10px] hover:bg-[#1A1A1A] active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

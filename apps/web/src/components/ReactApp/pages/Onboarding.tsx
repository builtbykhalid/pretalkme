import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
  TrendingUp,
  Code,
  Users,
  Target,
  Mail,
  Zap,
  Globe,
  Clock,
  Link,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Wand2,
  Rocket,
  Loader2,
  Plus,
  X,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useCerveauInteractif } from '../hooks/useCerveauInteractif';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { supabase } from '../lib/supabase';
import { LANGUAGES } from '../i18n';
import { COUNTRY_CODES } from '../data/countryCodes';
import { EXTENDED_TIMEZONE_OPTIONS } from '../data/timeZones';
import Logo from '../components/ui/Logo';
import AIEnhancer from '../components/ui/AIEnhancer';

type Testimonial = {
  text: string;
  author: string;
  handle: string | null;
};

// ─── Expertise areas ───
interface ExpertiseArea {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  template: string;
}

const EXPERTISE_AREAS: ExpertiseArea[] = [
  { id: 'marketing', title: 'Marketing / SEO', icon: TrendingUp, description: 'Audits de visibilité, stratégies digitales, SEO', template: 'marketing_audit' },
  { id: 'tech', title: 'Tech / Développement', icon: Code, description: 'Audits techniques, performance, architecture', template: 'tech_audit' },
  { id: 'sales', title: 'Vente / Business', icon: Users, description: 'Diagnostics commerciaux, processus de vente', template: 'sales_audit' },
  { id: 'other', title: 'Autre', icon: Target, description: 'Domaine spécialisé ou personnalisé.', template: 'custom_audit' },
];

const inputClass = "w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all";
const selectClass = "px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-base text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all";

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, addForm, userProfile } = useApp();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();

  const [currentStep, setCurrentStep] = useState(1);
  const [quotes, setQuotes] = useState<Testimonial[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Step 1: Profile
  const [firstName, setFirstName] = useState(userProfile?.first_name || '');
  const [lastName, setLastName] = useState(userProfile?.last_name || '');
  const [jobTitle, setJobTitle] = useState(userProfile?.job_title || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState(userProfile?.phone_country_code || '+33');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone?.replace(userProfile?.phone_country_code || '', '') || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile?.avatar_url || null);
  const [website, setWebsite] = useState(userProfile?.website || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [locale, setLocale] = useState(userProfile?.locale || 'fr');
  const [timezone, setTimezone] = useState(userProfile?.timezone || 'Europe/Paris');
  const [socialNetworks, setSocialNetworks] = useState(userProfile?.social_networks as any || { linkedin: '', twitter: '', facebook: '', instagram: '', youtube: '', github: '', other: '' });
  const [publicVisibility, setPublicVisibility] = useState(userProfile?.public_visibility as any || { phone: false, job_title: false, website: false, bio: false, social_networks: false });

  // Step 2: Expertise
  const [expertise, setExpertise] = useState('');

  // Step 3: Service
  const [serviceName, setServiceName] = useState('');
  const [userAnswers, setUserAnswers] = useState({ challenge: '', goal: '' });

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('content, author_name, author_handle')
        .eq('is_active', true)
        .eq('display_on_onboarding', true);

      if (data && data.length > 0) {
        setQuotes(data.map(q => ({
          text: q.content,
          author: q.author_name,
          handle: q.author_handle
        })));
      }
    };
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [quotes]);

  const handleProfileSave = async () => {
    try {
      const fullPhone = phoneNumber ? `${phoneCountryCode}${phoneNumber}` : '';
      await updateProfile({
        firstName, lastName,
        job_title: jobTitle,
        phone: fullPhone,
        phone_country_code: phoneCountryCode,
        website, bio, locale, timezone,
        social_networks: socialNetworks,
        public_visibility: publicVisibility
      });
      setCurrentStep(2);
    } catch (err) {
      console.error('Profile save error:', err);
      showFeedback('error', { message: 'Erreur lors de la sauvegarde du profil' });
    }
  };

  const handleExpertiseSelect = (expertiseId: string) => {
    setExpertise(expertiseId);
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handleSkip = () => {
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    navigate('/');
  };

  const handleFinish = async () => {
    if (user?.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    localStorage.setItem('user_expertise', expertise);
    localStorage.setItem('service_name', serviceName);
    navigate('/');
    try {
      await addForm({
        title: serviceName ? `Formulaire - ${serviceName}` : `Formulaire - ${expertise || 'Mon Service'}`,
        status: 'Active' as const,
        form_structure: [] as any[],
        ai_config: {},
        design_config: { primaryColor: 'indigo', backgroundColor: '#ffffff', font: 'sans', buttonStyle: 'rounded-xl' },
        steps_config: { steps_order: ['form'], form_enabled: true, calendar_enabled: false, ai_enabled: false },
        booking_config: {},
        color: 'bg-primary-50 text-primary-600'
      });
    } catch (err) {
      console.warn('Could not create default form:', err);
    }
  };

  const stepLabels = ['Profil', 'Expertise', 'Service', 'Prêt'];

  return (
    <div className="min-h-screen flex bg-neutral-950">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-neutral-50 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-8">
          <div className="mb-6">
            <Logo
              size="lg"
              logoColor="primary"
              textColor="text-neutral-900"
              className="text-xl"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-neutral-400/20 p-8 lg:p-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className={`h-px flex-1 ${i < currentStep ? 'bg-primary-500' : 'bg-neutral-200'}`} />}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${i + 1 < currentStep ? 'bg-primary-500 text-white' :
                      i + 1 === currentStep ? 'bg-primary-600 text-white' :
                        'bg-neutral-100 text-neutral-400'
                      }`}>
                      {i + 1 < currentStep ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:inline ${i + 1 === currentStep ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl text-neutral-900 mb-1">Informations personnelles</h2>
                  <p className="text-base text-neutral-500">Complétez votre profil pour commencer</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1.5">Prénom *</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1.5">Nom *</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1.5">Poste / Fonction *</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Ex: Consultant marketing senior" className={`flex-1 ${inputClass}`} required />
                    <label className="flex items-center gap-1 text-xs text-neutral-500 cursor-pointer whitespace-nowrap">
                      <input type="checkbox" checked={publicVisibility.job_title} onChange={(e) => setPublicVisibility({ ...publicVisibility, job_title: e.target.checked })} className="rounded" />
                      {publicVisibility.job_title ? <Eye size={12} /> : <EyeOff size={12} />}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1.5">Téléphone</label>
                  <div className="flex gap-2">
                    <select value={phoneCountryCode} onChange={(e) => setPhoneCountryCode(e.target.value)} className={`${selectClass} min-w-[110px]`}>
                      {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="6 12 34 56 78" className={`flex-1 ${inputClass}`} />
                    <label className="flex items-center gap-1 text-xs text-neutral-500 cursor-pointer whitespace-nowrap">
                      <input type="checkbox" checked={publicVisibility.phone} onChange={(e) => setPublicVisibility({ ...publicVisibility, phone: e.target.checked })} className="rounded" />
                      {publicVisibility.phone ? <Eye size={12} /> : <EyeOff size={12} />}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1.5">Site web</label>
                  <div className="flex items-center gap-2">
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://votresite.com" className={`flex-1 ${inputClass}`} />
                    <label className="flex items-center gap-1 text-xs text-neutral-500 cursor-pointer whitespace-nowrap">
                      <input type="checkbox" checked={publicVisibility.website} onChange={(e) => setPublicVisibility({ ...publicVisibility, website: e.target.checked })} className="rounded" />
                      {publicVisibility.website ? <Eye size={12} /> : <EyeOff size={12} />}
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm text-neutral-700 font-bold">Biographie</label>
                    <AIEnhancer
                      text={bio}
                      onEnhanced={(newText: string) => setBio(newText)}
                      onLoading={setIsBioLoading}
                      context="Consultant"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Décrivez brièvement votre expertise..." className={`flex-1 ${inputClass} resize-none ${isBioLoading ? 'animate-ai-loading' : ''}`} />
                    <label className="flex items-center gap-1 text-xs text-neutral-500 cursor-pointer whitespace-nowrap pt-3">
                      <input type="checkbox" checked={publicVisibility.bio} onChange={(e) => setPublicVisibility({ ...publicVisibility, bio: e.target.checked })} className="rounded" />
                      {publicVisibility.bio ? <Eye size={12} /> : <EyeOff size={12} />}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1.5 flex items-center gap-1.5"><Globe size={14} /> Langue</label>
                    <select value={locale} onChange={(e) => setLocale(e.target.value)} className={`w-full ${selectClass}`}>
                      {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1.5 flex items-center gap-1.5"><Clock size={14} /> Fuseau horaire</label>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={`w-full ${selectClass}`}>
                      {EXTENDED_TIMEZONE_OPTIONS.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                    </select>
                  </div>
                </div>

                <details className="group">
                  <summary className="text-sm text-primary-600 cursor-pointer flex items-center gap-1.5 select-none font-bold">
                    <Link size={14} /> Réseaux sociaux (optionnel)
                  </summary>
                  <div className="mt-3 space-y-2">
                    {[
                      { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                      { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/...' },
                      { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                      { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
                    ].map((n) => (
                      <div key={n.key} className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 min-w-[65px]">{n.label}</span>
                        <input
                          type="url"
                          value={socialNetworks[n.key] || ''}
                          onChange={(e) => setSocialNetworks({ ...socialNetworks, [n.key]: e.target.value })}
                          placeholder={n.placeholder}
                          className={`flex-1 ${inputClass} !py-2 !text-sm`}
                        />
                      </div>
                    ))}
                    <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer mt-2">
                      <input type="checkbox" checked={publicVisibility.social_networks} onChange={(e) => setPublicVisibility({ ...publicVisibility, social_networks: e.target.checked })} className="rounded" />
                      {publicVisibility.social_networks ? <Eye size={12} /> : <EyeOff size={12} />}
                      Afficher publiquement
                    </label>
                  </div>
                </details>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1.5 font-bold">Photo de profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary-600 text-sm">{(firstName?.charAt(0) || 'U') + (lastName?.charAt(0) || '')}</span>
                      )}
                    </div>
                    <div>
                      <input type="file" accept="image/*" id="avatar-input" onChange={(e) => {
                        const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f));
                      }} className="hidden" />
                      <div className="flex items-center gap-3">
                        <label htmlFor="avatar-input" className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl cursor-pointer text-sm font-bold hover:bg-neutral-200 transition-colors">
                          <Upload size={14} /> Choisir
                        </label>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={() => setAvatarPreview(null)}
                            className="text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProfileSave}
                  disabled={!firstName.trim() || !lastName.trim() || !jobTitle.trim()}
                  className="w-full py-3 bg-primary-600 text-white text-base font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl text-neutral-900 mb-1">Votre domaine d'expertise</h2>
                  <p className="text-base text-neutral-500">Choisissez celui qui correspond le mieux</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {EXPERTISE_AREAS.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => handleExpertiseSelect(area.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary-300 hover:bg-primary-50 ${expertise === area.id ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                          <area.icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-neutral-900 mb-0.5">{area.title}</h3>
                          <p className="text-sm text-neutral-500">{area.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-bold">
                  <ChevronLeft size={16} /> Retour
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl text-neutral-900 mb-1">Décrivez votre service</h2>
                  <p className="text-base text-neutral-500">Personnalisez votre offre</p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1.5 font-bold">Nom du service *</label>
                  <input
                    type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ex: Audit Marketing Complet" maxLength={100}
                    className={inputClass}
                  />
                  <p className="text-xs text-neutral-400 mt-1">{serviceName.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1.5 font-bold">Description courte</label>
                  <textarea
                    value={userAnswers.challenge} onChange={(e) => setUserAnswers({ ...userAnswers, challenge: e.target.value })}
                    placeholder="Décrivez brièvement ce que vous proposez..." maxLength={200} rows={3}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-neutral-400 mt-1">{userAnswers.challenge.length}/200</p>
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                  <p className="text-sm text-primary-900">
                    <span className="mr-1.5">💡</span>
                    Un bon nom de service est clair, spécifique et met en avant la valeur que vous apportez.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setCurrentStep(2)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-bold">
                    <ChevronLeft size={16} /> Retour
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    disabled={!serviceName.trim()}
                    className="py-3 px-6 bg-primary-600 text-white text-base font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary-200"
                  >
                    Continuer <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300 text-center">
                <div>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl text-neutral-900 mb-1">Félicitations !</h2>
                  <p className="text-base text-neutral-500">Votre outil d'audit IA est opérationnel</p>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm shrink-0">✓</div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-neutral-900">Formulaire configuré</p>
                    <p className="text-xs text-neutral-500">Prêt à recevoir vos premiers leads</p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Actif</span>
                </div>

                <div>
                  <p className="text-sm text-neutral-700 mb-3 text-left font-bold">Prochaines étapes :</p>
                  <div className="grid grid-cols-3 gap-3 text-left">
                    <div className="bg-primary-50 rounded-xl p-3">
                      <Mail className="h-4 w-4 text-primary-600 mb-1" />
                      <p className="text-xs font-bold text-primary-900">Connecter Gmail</p>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-3">
                      <Zap className="h-4 w-4 text-neutral-600 mb-1" />
                      <p className="text-xs font-bold text-neutral-900">Intégrer n8n</p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-3">
                      <Target className="h-4 w-4 text-primary-600 mb-1" />
                      <p className="text-xs font-bold text-primary-900">Configurer Stripe</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full py-3 bg-primary-600 text-white text-base font-bold rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                  Accéder au dashboard <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            {currentStep < 4 && (
              <button onClick={handleSkip} className="text-xs text-neutral-600 hover:text-neutral-900 underline transition-colors font-bold">
                Passer l'onboarding
              </button>
            )}
            <p className="mt-3 text-xs text-neutral-600 leading-relaxed px-4">
              En continuant, vous acceptez les{' '}
              <a href="#" className="underline hover:text-neutral-900">conditions d'utilisation</a>
              {' '}et la{' '}
              <a href="#" className="underline hover:text-neutral-900">politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg px-12 xl:px-16">
          <div className="text-primary-500/30 text-[120px] leading-none mb-4 -ml-4">"</div>

          {quotes.length > 0 && (
            <div key={quoteIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-2xl xl:text-[28px] text-white leading-relaxed mb-10">
                "{quotes[quoteIndex].text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg font-semibold">
                  {quotes[quoteIndex].author[0]}
                </div>
                <div>
                  <p className="text-base text-neutral-200 font-bold">{quotes[quoteIndex].author}</p>
                  <p className="text-sm text-neutral-500">{quotes[quoteIndex].handle}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-12">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === quoteIndex ? 'w-8 bg-primary-500' : 'w-2 bg-neutral-800 hover:bg-neutral-700'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

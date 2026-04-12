import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2, Eye, EyeOff, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import Logo from '../components/ui/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';

type Mode = 'login' | 'register' | 'magic' | 'forgot' | 'verify-otp';

const OTP_RESEND_COOLDOWN = 60; // seconds

export default function Login() {
    const { user, loading: authLoading, signIn, signUp, signInWithMagicLink, verifyOtp, resendSignupOtp, resetPassword } = useAuth();

    const [mode, setMode] = useState<Mode>('login');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [pageReady, setPageReady] = useState(false);

    // OTP state
    const [otpValue, setOtpValue] = useState('');
    const [otpType, setOtpType] = useState<'signup' | 'email'>('signup');
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setPageReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Cleanup cooldown timer on unmount
    useEffect(() => {
        return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
    }, []);

    const startResendCooldown = () => {
        setResendCooldown(OTP_RESEND_COOLDOWN);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const switchMode = (next: Mode) => { setMode(next); setMessage(null); };

    // ── Loading screen ────────────────────────────────────────────────────
    if (authLoading || !pageReady) {
        return (
            <div className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-neutral-50 to-neutral-100 flex flex-col items-center justify-center gap-6">
                <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary-500/6 rounded-full blur-[100px] pointer-events-none" />
                <Logo size="xl" logoColor="primary" textColor="text-neutral-900" className="text-2xl" />
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-accent-300/30" />
                        <div className="absolute inset-0 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-neutral-500 text-sm font-medium animate-pulse">Chargement de votre espace...</p>
                </div>
                <div className="absolute bottom-8 text-neutral-400 text-xs text-center px-4">
                    <a href="https://pretalk.me" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">Pretalk</a> powered by <a href="https://elevyup.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">elevyup</a>
                </div>
            </div>
        );
    }

    if (user) return <Navigate to="/dashboard" replace />;

    // ── Handlers ──────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'forgot') {
                const { error } = await resetPassword(email);
                if (error) setMessage({ type: 'error', text: error.message });
                else setMessage({ type: 'success', text: 'Email envoyé ! Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });

            } else if (mode === 'magic') {
                const { error } = await signInWithMagicLink(email);
                if (error) setMessage({ type: 'error', text: error.message });
                else setMessage({ type: 'success', text: 'Lien envoyé ! Vérifiez votre boîte mail (et vos spams).' });

            } else if (mode === 'register') {
                if (!fullName.trim()) {
                    setMessage({ type: 'error', text: 'Veuillez entrer votre nom complet.' });
                    setLoading(false);
                    return;
                }
                const { error } = await signUp(email, password, fullName);
                if (error) {
                    let text = error.message;
                    if (text.toLowerCase().includes('leaked') || text.toLowerCase().includes('compromised')) {
                        text = 'Ce mot de passe a été compromis dans une fuite de données. Choisissez-en un autre.';
                    }
                    setMessage({ type: 'error', text });
                } else {
                    // Supabase sent OTP — switch to verification screen
                    setOtpType('signup');
                    setOtpValue('');
                    startResendCooldown();
                    switchMode('verify-otp');
                }

            } else { // login
                const { error } = await signIn(email, password);
                if (error) {
                    if (error.message.toLowerCase().includes('email not confirmed') ||
                        error.message.toLowerCase().includes('not confirmed')) {
                        // Email OTP not yet confirmed — show OTP screen
                        setOtpType('signup');
                        setOtpValue('');
                        startResendCooldown();
                        setMessage(null);
                        switchMode('verify-otp');
                    } else {
                        setMessage({ type: 'error', text: 'Email ou mot de passe incorrect.' });
                    }
                }
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Une erreur est survenue.' });
        }

        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpValue.length !== 6) return;
        setLoading(true);
        setMessage(null);

        const { error } = await verifyOtp(email, otpValue, otpType);
        if (error) {
            setMessage({ type: 'error', text: 'Code invalide ou expiré. Vérifiez le code et réessayez.' });
        }
        // On success Supabase sets the session → AuthContext picks it up → user is set → Navigate fires
        setLoading(false);
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        setMessage(null);
        const { error } = await resendSignupOtp(email);
        if (error) setMessage({ type: 'error', text: error.message });
        else { setMessage({ type: 'success', text: 'Nouveau code envoyé !' }); startResendCooldown(); }
        setLoading(false);
    };

    // Auto-submit OTP when 6 chars entered
    const handleOtpChange = (val: string) => {
        const clean = val.replace(/\D/g, '').slice(0, 6);
        setOtpValue(clean);
        if (clean.length === 6) {
            // Trigger verify after short delay for UX
            setTimeout(() => {
                document.getElementById('otp-submit-btn')?.click();
            }, 120);
        }
    };

    // ── UI ────────────────────────────────────────────────────────────────

    const title = {
        login: 'Bienvenue',
        register: 'Créer un compte',
        forgot: 'Mot de passe oublié',
        magic: 'Lien magique',
        'verify-otp': 'Vérification email',
    }[mode];

    const subtitle = {
        login: 'Connectez-vous à votre espace',
        register: 'Commencez gratuitement en quelques secondes',
        forgot: 'Recevez un lien de réinitialisation',
        magic: 'Recevez un lien de connexion par email',
        'verify-otp': `Code envoyé à ${email}`,
    }[mode];

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-50/50">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
                    <div className="absolute top-[10%] left-[15%] w-80 h-80 md:w-[500px] md:h-[500px] bg-accent-400/10 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-72 h-72 md:w-96 md:h-96 bg-accent-500/8 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px]" />
                </div>
                <div className="absolute inset-0 backdrop-blur-xl bg-white/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col py-6 px-4 sm:px-6 lg:px-8">
                {/* Top bar */}
                <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between mb-4 shrink-0">
                    <Logo size="lg" logoColor="primary" textColor="text-neutral-900" className="text-xl" />
                    <LanguageSwitcher variant="minimal" className="text-neutral-700" />
                </div>

                {/* Card */}
                <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
                    <div className="w-full max-w-[410px] mx-auto animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-full">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 border border-neutral-100 p-5 md:p-6 overflow-y-auto">

                            {/* Header */}
                            <div className="mb-4 text-center shrink-0">
                                {mode === 'verify-otp' && (
                                    <div className="flex justify-center mb-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                                            <ShieldCheck size={24} className="text-primary-500" />
                                        </div>
                                    </div>
                                )}
                                <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mb-1">{title}</h1>
                                <p className="text-xs md:text-sm text-neutral-500">{subtitle}</p>
                            </div>

                            {/* ── OTP Verify form ── */}
                            {mode === 'verify-otp' ? (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-neutral-700 mb-1.5 text-center">
                                            Entrez le code à 6 chiffres reçu par email
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            placeholder="000000"
                                            value={otpValue}
                                            onChange={(e) => handleOtpChange(e.target.value)}
                                            maxLength={6}
                                            autoFocus
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-2xl font-mono font-bold text-center text-neutral-900 placeholder:text-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all tracking-[0.5em]"
                                        />
                                    </div>

                                    <button
                                        id="otp-submit-btn"
                                        type="submit"
                                        disabled={loading || otpValue.length !== 6}
                                        className="w-full py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                                    >
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Vérification...</> : 'Confirmer mon email'}
                                    </button>

                                    {message && (
                                        <div className={`p-3 rounded-xl text-[11px] ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    {/* Resend + Back */}
                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            type="button"
                                            onClick={() => switchMode('register')}
                                            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
                                        >
                                            <ArrowLeft size={13} /> Retour
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={resendCooldown > 0 || loading}
                                            className="flex items-center gap-1.5 text-[11px] text-accent-700 hover:text-accent-900 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            <RefreshCw size={13} className={resendCooldown > 0 ? '' : ''} />
                                            {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* ── Main forms ── */
                                <>
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        {mode === 'register' && (
                                            <div>
                                                <label className="block text-xs text-neutral-700 mb-1">Nom complet</label>
                                                <input
                                                    type="text"
                                                    placeholder="Jean Dupont"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs text-neutral-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                placeholder="vous@exemple.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                            />
                                        </div>

                                        {mode !== 'magic' && mode !== 'forgot' && (
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs text-neutral-700">Mot de passe</label>
                                                    {mode === 'login' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => switchMode('forgot')}
                                                            className="text-[10px] text-accent-700 hover:text-accent-950 transition-colors"
                                                        >
                                                            Oublié ?
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        minLength={8}
                                                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all pr-12"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {mode === 'register' && (
                                                    <p className="text-[10px] text-neutral-400 mt-1">8 caractères minimum</p>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 mt-1"
                                        >
                                            {loading ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" />Chargement...</>
                                            ) : (
                                                <>
                                                    {mode === 'login' && 'Se connecter'}
                                                    {mode === 'register' && 'Créer mon compte'}
                                                    {mode === 'magic' && 'Envoyer le lien magique'}
                                                    {mode === 'forgot' && 'Envoyer le lien'}
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Message */}
                                    {message && (
                                        <div className={`mt-3 p-3 rounded-xl text-[11px] ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    {/* Magic link option (login & register only) */}
                                    {(mode === 'login' || mode === 'register') && (
                                        <>
                                            <div className="relative my-4">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-neutral-200" />
                                                </div>
                                                <div className="relative flex justify-center text-[10px]">
                                                    <span className="px-3 bg-white text-neutral-400">ou</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => switchMode('magic')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-xs md:text-sm text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                                            >
                                                <Mail size={16} />
                                                Connexion par lien magique
                                            </button>
                                        </>
                                    )}

                                    {/* Toggle between login/register/back */}
                                    <p className="mt-4 text-center text-[10px] md:text-xs text-neutral-500">
                                        {mode === 'register' ? (
                                            <>Déjà un compte ?{' '}<button onClick={() => switchMode('login')} className="text-accent-700 hover:underline font-medium">Se connecter</button></>
                                        ) : mode === 'magic' ? (
                                            <>Revenir à la{' '}<button onClick={() => switchMode('login')} className="text-accent-700 hover:underline font-medium">connexion</button></>
                                        ) : mode === 'forgot' ? (
                                            <>Retour à la{' '}<button onClick={() => switchMode('login')} className="text-accent-700 hover:underline font-medium">connexion</button></>
                                        ) : (
                                            <>Pas de compte ?{' '}<button onClick={() => switchMode('register')} className="text-accent-700 hover:underline font-medium">S'inscrire</button></>
                                        )}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Legal */}
                        <p className="mt-6 text-center text-xs text-neutral-500 leading-relaxed px-4">
                            En continuant, vous acceptez les{' '}
                            <a href="/terms" className="underline hover:text-neutral-800 transition-colors">conditions d'utilisation</a>
                            {' '}et la{' '}
                            <a href="/privacy" className="underline hover:text-neutral-800 transition-colors">politique de confidentialité</a>.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-neutral-400 text-xs">
                        <a href="https://pretalk.me" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">Pretalk</a> powered by <a href="https://elevyup.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">elevyup</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import {
    Globe, Send, MessageCircle, Mail, Loader2, CheckCircle2,
    AlertTriangle, RefreshCw, Copy, Eye, EyeOff,
    Zap, Save, X, Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// ─── Types ──────────────────────────────────────────────────────
interface Integration {
    id?: string;
    user_id?: string;
    type: 'telegram' | 'whatsapp' | 'smtp' | 'domain';
    label?: string;
    config: Record<string, any>;
    status: 'active' | 'error' | 'pending' | 'disabled';

    // Phase 2: Engagement
    enable_outreach: boolean;
    ai_agent_id: number | null;
    message_template: string | null;

    last_validated_at?: string;
    created_at?: string;
    updated_at?: string;
}

type IntegrationType = Integration['type'];

const INTEGRATION_META: Record<IntegrationType, {
    title: string;
    desc: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    badge: string;
}> = {
    telegram: {
        title: 'Telegram',
        desc: 'Recevez des notifications push instantanées sur Telegram pour chaque nouveau lead.',
        icon: Send,
        color: 'text-sky-600',
        bg: 'bg-sky-50',
        border: 'border-sky-100',
        badge: 'Quick Win',
    },
    whatsapp: {
        title: 'WhatsApp Business',
        desc: 'Envoyez des messages WhatsApp de qualification à vos prospects automatiquement.',
        icon: MessageCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        badge: 'Avancé',
    },
    smtp: {
        title: 'Email (SMTP)',
        desc: 'Envoyez vos e-mails et PDFs depuis votre propre adresse contact@votre-agence.com.',
        icon: Mail,
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        badge: 'Essentiel',
    },
    domain: {
        title: 'Domaine Personnalisé',
        desc: 'Marque blanche : utilisez votre propre domaine au lieu de pretalk.me.',
        icon: Globe,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        badge: 'Marque Blanche',
    },
};

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
    active: { label: 'Connecté', class: 'bg-[#DCFCE7] text-[#16A34A] border-emerald-100' },
    pending: { label: 'En attente', class: 'bg-neutral-100 text-[#6B6B6B] border-neutral-200' },
    error: { label: 'Erreur', class: 'bg-rose-50 text-rose-600 border-rose-100' },
    disabled: { label: 'Désactivé', class: 'bg-neutral-50 text-neutral-300 border-neutral-100' },
};

// ─── Component ──────────────────────────────────────────────────
export default function IntegrationsTab() {
    const { user } = useAuth();
    const [integrations, setIntegrations] = useState<Record<IntegrationType, Integration | null>>({
        telegram: null,
        whatsapp: null,
        smtp: null,
        domain: null,
    });
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
    const [saving, setSaving] = useState<IntegrationType | null>(null);
    const [activeModal, setActiveModal] = useState<IntegrationType | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    // Form drafts per type
    const [drafts, setDrafts] = useState<Record<IntegrationType, Record<string, string>>>({
        telegram: { bot_token: '', enable_outreach: 'false', ai_agent_id: '', message_template: '' },
        whatsapp: { phone_number_id: '', waba_id: '', access_token: '', enable_outreach: 'false', ai_agent_id: '', message_template: '' },
        smtp: { host: '', port: '587', user: '', pass: '', enable_outreach: 'false', ai_agent_id: '', message_template: '' },
        domain: { domain: '', enable_outreach: 'false', ai_agent_id: '', message_template: '' },
    });

    // ── Fetch existing integrations & agents ─────────────────────
    const fetchIntegrations = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch agents library
            const { data: agentsData } = await supabase.from('agents_library').select('id, name');
            if (agentsData) setAgents(agentsData);

            // Fetch user integrations
            const { data, error } = await supabase
                .from('user_integrations')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            const map: Record<IntegrationType, Integration | null> = {
                telegram: null, whatsapp: null, smtp: null, domain: null,
            };

            (data || []).forEach((row: Integration) => {
                map[row.type] = row;
                // Pre-fill drafts from existing config & preferences
                setDrafts(prev => ({
                    ...prev,
                    [row.type]: {
                        ...prev[row.type],
                        enable_outreach: String(row.enable_outreach),
                        ai_agent_id: String(row.ai_agent_id || ''),
                        message_template: row.message_template || '',
                        ...Object.fromEntries(
                            Object.entries(row.config || {}).map(([k, v]) => [k, String(v)])
                        ),
                    },
                }));
            });

            setIntegrations(map);
        } catch (err) {
            console.error('Error fetching integrations:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    // ── Save / Upsert an integration ────────────────────────────
    const handleSave = async (type: IntegrationType) => {
        if (!user?.id) return;
        setSaving(type);
        try {
            const fullDraft = drafts[type];
            const preferences = {
                enable_outreach: fullDraft.enable_outreach === 'true',
                ai_agent_id: fullDraft.ai_agent_id ? parseInt(fullDraft.ai_agent_id) : null,
                message_template: fullDraft.message_template || null,
            };

            const config = { ...fullDraft };
            // Clean preferences and empty values from config
            ['enable_outreach', 'ai_agent_id', 'message_template'].forEach(k => delete config[k]);
            Object.keys(config).forEach(k => { if (!config[k]) delete config[k]; });

            const existing = integrations[type];

            if (existing?.id) {
                // Update
                const { error } = await supabase
                    .from('user_integrations')
                    .update({
                        config,
                        ...preferences,
                        status: 'pending',
                        label: INTEGRATION_META[type].title
                    })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('user_integrations')
                    .insert({
                        user_id: user.id,
                        type,
                        label: INTEGRATION_META[type].title,
                        config,
                        ...preferences,
                        status: 'pending',
                    });
                if (error) throw error;
            }

            showToast(`${INTEGRATION_META[type].title} sauvegardé !`);
            setActiveModal(null);
            await fetchIntegrations();
        } catch (err: any) {
            console.error('Save integration error:', err);
            showToast(`Erreur : ${err.message || 'Une erreur est survenue'}`);
        } finally {
            setSaving(null);
        }
    };

    // ── Delete / Disconnect an integration ──────────────────────
    const handleDisconnect = async (type: IntegrationType) => {
        const existing = integrations[type];
        if (!existing?.id) return;
        if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${INTEGRATION_META[type].title} ?`)) return;

        setSaving(type);
        try {
            const { error } = await supabase
                .from('user_integrations')
                .delete()
                .eq('id', existing.id);
            if (error) throw error;

            showToast(`${INTEGRATION_META[type].title} déconnecté.`);
            // Reset draft
            setDrafts(prev => ({
                ...prev,
                [type]: type === 'telegram' ? { bot_token: '' }
                    : type === 'whatsapp' ? { phone_number_id: '', waba_id: '', access_token: '' }
                        : type === 'smtp' ? { host: '', port: '587', user: '', pass: '' }
                            : { domain: '' },
            }));
            await fetchIntegrations();
        } catch (err: any) {
            showToast(`Erreur : ${err.message}`);
        } finally {
            setSaving(null);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const updateDraft = (type: IntegrationType, field: string, value: string) => {
        setDrafts(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
    };


    // ─── Loading state ──────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 col-span-full">
                <Loader2 className="animate-spin text-[#0D0D0D]" size={32} />
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────
    return (
        <>
            {(Object.keys(INTEGRATION_META) as IntegrationType[]).map((type) => {
                const meta = INTEGRATION_META[type];
                const integration = integrations[type];
                const statusInfo = integration ? STATUS_LABELS[integration.status] : null;
                const Icon = meta.icon;

                return (
                    <div
                        key={type}
                        className={`premium-card p-6 flex flex-col group transition-all relative overflow-hidden ${integration?.status === 'active' ? `border-emerald-200 shadow-sm` : ''}`}
                    >
                        {/* Background decoration */}
                        <div className={`absolute -top-12 -right-12 w-32 h-32 ${meta.bg} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />

                        {/* Top row */}
                        <div className="flex items-start justify-between relative z-10 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-[#F4F4F4] text-[#0D0D0D] group-hover:bg-[#0D0D0D] group-hover:text-white`}>
                                <Icon size={22} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                {statusInfo && (
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusInfo.class}`}>
                                        {statusInfo.label}
                                    </span>
                                )}
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${meta.bg} ${meta.color} border border-transparent`}>
                                    {meta.badge}
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2 relative z-10 mb-6">
                            <h3 className="text-base font-semibold text-[#0D0D0D] tracking-tight">{meta.title}</h3>
                            <p className="text-xs text-[#6B6B6B] leading-relaxed italic line-clamp-2">{meta.desc}</p>
                        </div>

                        {/* Action */}
                        <div className="flex gap-2 relative z-10 pt-4 border-t border-[#F8F8F8]">
                            <button
                                onClick={() => setActiveModal(type)}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${integration?.status === 'active'
                                    ? 'bg-[#F4F4F4] text-[#0D0D0D] hover:bg-[#E8E8E8]'
                                    : 'bg-[#0D0D0D] text-white hover:bg-[#1A1A1A] shadow-sm'
                                    }`}
                            >
                                {integration?.status === 'active' ? (
                                    <>
                                        <RefreshCw size={14} strokeWidth={2.5} /> Configurer
                                    </>
                                ) : (
                                    <>
                                        <Zap size={14} strokeWidth={2.5} /> Connecter
                                    </>
                                )}
                            </button>
                            {integration?.status === 'active' && (
                                <button
                                    onClick={() => handleDisconnect(type)}
                                    className="w-11 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
                                    title="Déconnecter"
                                >
                                    <X size={16} strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* ─── Config Modals ──────────────────────────────── */}
            {activeModal && (
                <ConfigModal
                    type={activeModal}
                    draft={drafts[activeModal]}
                    agents={agents}
                    meta={INTEGRATION_META[activeModal]}
                    saving={saving === activeModal}
                    showSecrets={showSecrets}
                    onToggleSecret={(field) => setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))}
                    onUpdateDraft={(field, value) => updateDraft(activeModal, field, value)}
                    onSave={() => handleSave(activeModal)}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3.5 bg-[#0D0D0D] text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-500 border border-white/10">
                    <CheckCircle2 size={18} strokeWidth={3} className="text-emerald-400" />
                    <span className="text-xs font-bold tracking-tight">{toast}</span>
                </div>
            )}
        </>
    );
}

// ─── Config Modal ───────────────────────────────────────────────
function ConfigModal({
    type,
    draft,
    agents,
    meta,
    saving,
    showSecrets,
    onToggleSecret,
    onUpdateDraft,
    onSave,
    onClose,
}: {
    type: IntegrationType;
    draft: Record<string, string>;
    agents: { id: number; name: string }[];
    meta: typeof INTEGRATION_META[IntegrationType];
    saving: boolean;
    showSecrets: Record<string, boolean>;
    onToggleSecret: (field: string) => void;
    onUpdateDraft: (field: string, value: string) => void;
    onSave: () => void;
    onClose: () => void;
}) {
    const Icon = meta.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white border border-[#EEEEEE] rounded-[32px] p-8 md:p-10 w-full max-w-lg space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className={`w-20 h-20 ${meta.bg} ${meta.color} rounded-[24px] flex items-center justify-center mx-auto shadow-inner border ${meta.border}`}>
                        <Icon size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-[#0D0D0D] tracking-tight">
                            {meta.title}
                        </h3>
                        <p className="text-xs text-[#6B6B6B] font-medium leading-relaxed max-w-[280px] mx-auto italic">
                            {meta.desc}
                        </p>
                    </div>
                </div>

                {/* Form fields per type */}
                <div className="space-y-5">
                    {type === 'telegram' && (
                        <TelegramFields draft={draft} showSecrets={showSecrets} onToggleSecret={onToggleSecret} onUpdate={onUpdateDraft} />
                    )}
                    {type === 'whatsapp' && (
                        <WhatsAppFields draft={draft} showSecrets={showSecrets} onToggleSecret={onToggleSecret} onUpdate={onUpdateDraft} />
                    )}
                    {type === 'smtp' && (
                        <SmtpFields draft={draft} showSecrets={showSecrets} onToggleSecret={onToggleSecret} onUpdate={onUpdateDraft} />
                    )}
                    {type === 'domain' && (
                        <DomainFields draft={draft} onUpdate={onUpdateDraft} />
                    )}

                    {/* Behavior Settings (Phase 2) */}
                    <BehaviorSettings
                        draft={draft}
                        agents={agents}
                        onUpdate={onUpdateDraft}
                        type={type}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-[#F8F8F8]">
                    <button
                        onClick={onClose}
                        className="flex-1 px-8 py-4 bg-[#F8F8F8] text-[#6B6B6B] font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-[#F4F4F4] hover:text-[#0D0D0D] transition-all active:scale-95"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-2 px-8 py-4 bg-[#0D0D0D] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-[#1A1A1A] transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Behavioral Components ─────────────────────────────────────

function BehaviorSettings({ draft, agents, onUpdate, type }: {
    draft: Record<string, string>;
    agents: { id: number; name: string }[];
    onUpdate: (f: string, v: string) => void;
    type: IntegrationType;
}) {
    if (type === 'domain') return null; // Domain behavior is fixed

    return (
        <div className="pt-6 mt-6 border-t border-neutral-50 space-y-5">
            <div className="flex items-center gap-2.5 mb-1 px-1">
                <div className="p-2 bg-accent-50 text-accent-600 rounded-lg">
                    <Zap size={14} strokeWidth={2.5} />
                </div>
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Contact Client & IA</h4>
            </div>

            <div className="flex items-center justify-between p-5 bg-[#F8F8F8] rounded-2xl border border-transparent transition-all hover:bg-white hover:border-[#EEEEEE] group shadow-sm">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-[#0D0D0D] tracking-tight">Activer pour les prospects</p>
                    <p className="text-[11px] text-[#6B6B6B] font-medium italic">Utiliser ce canal pour contacter vos clients.</p>
                </div>
                <button
                    onClick={() => onUpdate('enable_outreach', draft.enable_outreach === 'true' ? 'false' : 'true')}
                    className={`w-11 h-6 rounded-full transition-all relative ${draft.enable_outreach === 'true' ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${draft.enable_outreach === 'true' ? 'right-1' : 'left-1'}`} />
                </button>
            </div>

            {draft.enable_outreach === 'true' && (
                <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                        <label className="field-label">Agent IA Référent</label>
                        <select
                            value={draft.ai_agent_id || ''}
                            onChange={(e) => onUpdate('ai_agent_id', e.target.value)}
                            className="w-full px-5 py-3.5 bg-[#F8F8F8] border border-transparent focus:bg-white focus:border-[#0D0D0D] rounded-xl text-sm font-semibold text-[#0D0D0D] transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="">-- Aucun agent (Manuel) --</option>
                            {agents.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="field-label">Message d'accueil personnalisé</label>
                        <textarea
                            value={draft.message_template || ''}
                            onChange={(e) => onUpdate('message_template', e.target.value)}
                            placeholder="Ex: Bonjour {{firstName}}, j'ai analysé vos réponses..."
                            rows={4}
                            className="w-full px-5 py-4 bg-[#F8F8F8] border border-transparent focus:bg-white focus:border-[#0D0D0D] rounded-xl text-sm font-semibold text-[#0D0D0D] transition-all outline-none shadow-inner placeholder:text-neutral-300 resize-none"
                        />
                        <p className="text-[10px] text-neutral-400 font-bold ml-1 uppercase tracking-wider italic">Utilisez {"{{firstName}}"} pour personnaliser le message.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Field Components ───────────────────────────────────────────

function FieldInput({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    isSecret = false,
    showSecret = false,
    onToggleSecret,
    hint,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    isSecret?: boolean;
    showSecret?: boolean;
    onToggleSecret?: () => void;
    hint?: string;
}) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="field-label">{label}</label>
            <div className="relative">
                <input
                    type={isSecret && !showSecret ? 'password' : type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-5 py-3.5 bg-[#F8F8F8] border border-transparent focus:bg-white focus:border-[#0D0D0D] rounded-xl text-sm font-semibold text-[#0D0D0D] transition-all outline-none placeholder:text-neutral-300 pr-14"
                    placeholder={placeholder}
                />
                {isSecret && onToggleSecret && (
                    <button
                        type="button"
                        onClick={onToggleSecret}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                    >
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {hint && (
                <p className="text-xs text-neutral-400 font-bold ml-1 flex items-start gap-1.5 leading-relaxed">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    {hint}
                </p>
            )}
        </div>
    );
}

function TelegramFields({ draft, showSecrets, onToggleSecret, onUpdate }: {
    draft: Record<string, string>;
    showSecrets: Record<string, boolean>;
    onToggleSecret: (f: string) => void;
    onUpdate: (f: string, v: string) => void;
}) {
    return (
        <>
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-sky-700 flex items-center gap-2">
                    <Send size={14} /> Comment obtenir votre Token ?
                </p>
                <ol className="text-xs text-sky-600 font-medium space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Ouvrez Telegram et cherchez <strong>@BotFather</strong></li>
                    <li>Envoyez la commande <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono">/newbot</code></li>
                    <li>Suivez les instructions et copiez le <strong>Token API</strong></li>
                </ol>
            </div>
            <FieldInput
                label="Bot Token"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={draft.bot_token || ''}
                onChange={(v) => onUpdate('bot_token', v)}
                isSecret
                showSecret={!!showSecrets['bot_token']}
                onToggleSecret={() => onToggleSecret('bot_token')}
                hint="Le token fourni par @BotFather lors de la création de votre bot."
            />
        </>
    );
}

function WhatsAppFields({ draft, showSecrets, onToggleSecret, onUpdate }: {
    draft: Record<string, string>;
    showSecrets: Record<string, boolean>;
    onToggleSecret: (f: string) => void;
    onUpdate: (f: string, v: string) => void;
}) {
    return (
        <>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-2">
                    <MessageCircle size={14} /> API WhatsApp Cloud (Meta)
                </p>
                <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                    Vous devez créer une application sur{' '}
                    <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="underline font-bold hover:text-emerald-800">
                        Meta for Developers
                    </a>{' '}
                    et activer l'API WhatsApp Business. Utilisez uniquement des templates approuvés par Meta.
                </p>
            </div>
            <FieldInput
                label="Phone Number ID"
                placeholder="1234567890123456"
                value={draft.phone_number_id || ''}
                onChange={(v) => onUpdate('phone_number_id', v)}
                hint="L'ID du numéro de téléphone dans votre compte Meta Business."
            />
            <FieldInput
                label="WhatsApp Business Account ID"
                placeholder="1234567890123456"
                value={draft.waba_id || ''}
                onChange={(v) => onUpdate('waba_id', v)}
                hint="L'identifiant de votre compte WhatsApp Business."
            />
            <FieldInput
                label="Access Token"
                placeholder="EAAG..."
                value={draft.access_token || ''}
                onChange={(v) => onUpdate('access_token', v)}
                isSecret
                showSecret={!!showSecrets['access_token']}
                onToggleSecret={() => onToggleSecret('access_token')}
                hint="Le token d'accès permanent de l'application Meta."
            />
        </>
    );
}

function SmtpFields({ draft, showSecrets, onToggleSecret, onUpdate }: {
    draft: Record<string, string>;
    showSecrets: Record<string, boolean>;
    onToggleSecret: (f: string) => void;
    onUpdate: (f: string, v: string) => void;
}) {
    return (
        <>
            <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-violet-700 flex items-center gap-2">
                    <Mail size={14} /> Configuration SMTP
                </p>
                <p className="text-xs text-violet-600 font-medium leading-relaxed">
                    Vos e-mails partiront de votre propre adresse au lieu de noreply@pretalk.me. Pour Gmail, utilisez un{' '}
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" className="underline font-bold hover:text-violet-800">
                        Mot de passe d'application
                    </a>.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FieldInput
                    label="Serveur SMTP"
                    placeholder="smtp.gmail.com"
                    value={draft.host || ''}
                    onChange={(v) => onUpdate('host', v)}
                />
                <FieldInput
                    label="Port"
                    placeholder="587"
                    value={draft.port || ''}
                    onChange={(v) => onUpdate('port', v)}
                    type="number"
                />
            </div>
            <FieldInput
                label="Adresse e-mail (expéditeur)"
                placeholder="contact@votre-agence.com"
                value={draft.user || ''}
                onChange={(v) => onUpdate('user', v)}
                type="email"
            />
            <FieldInput
                label="Mot de passe / App Password"
                placeholder="••••••••"
                value={draft.pass || ''}
                onChange={(v) => onUpdate('pass', v)}
                isSecret
                showSecret={!!showSecrets['smtp_pass']}
                onToggleSecret={() => onToggleSecret('smtp_pass')}
                hint="Ce mot de passe est stocké de manière sécurisée et ne sera jamais affiché en clair."
            />
        </>
    );
}

function DomainFields({ draft, onUpdate }: {
    draft: Record<string, string>;
    onUpdate: (f: string, v: string) => void;
}) {
    const cnameTarget = 'cname.pretalk.me';

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(cnameTarget);
        } catch { /* ignore */ }
    };

    return (
        <>
            <FieldInput
                label="Votre Domaine Personnalisé"
                placeholder="audit.votre-agence.com"
                value={draft.domain || ''}
                onChange={(v) => onUpdate('domain', v)}
            />
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4">
                <p className="text-xs font-semibold text-indigo-700 flex items-center gap-2">
                    <Globe size={14} /> Configuration DNS requise
                </p>
                <div className="space-y-3">
                    <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                        Ajoutez un enregistrement <strong>CNAME</strong> chez votre hébergeur DNS (OVH, GoDaddy, Cloudflare...) :
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-white border border-indigo-100 rounded-xl">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-neutral-400">Valeur CNAME</p>
                            <p className="text-sm font-semibold text-dark font-mono">{cnameTarget}</p>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-95"
                            title="Copier"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-indigo-500 font-bold leading-relaxed flex items-start gap-1.5">
                        <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                        La propagation DNS peut prendre jusqu'à 48h. Le certificat SSL sera généré automatiquement via Cloudflare.
                    </p>
                </div>
            </div>
        </>
    );
}

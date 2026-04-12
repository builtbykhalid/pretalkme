import { Loader2, Save, Send, Sparkles, FileText, RefreshCw, Plus, CheckCircle } from 'lucide-react';
import type { PhaseId } from './PipelineSidebar';

interface ActionDef {
    id: string;
    label: string;
    loadingLabel?: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    disabledTitle?: string;
    loading?: boolean;
    variant: 'primary' | 'secondary' | 'success' | 'ghost';
    hidden?: boolean;
}

interface LeadActionBarProps {
    phase: PhaseId;
    // Phase A
    onGenerateAudit?: () => void;
    generatingAudit?: boolean;
    hasAudit?: boolean;
    // Phase B
    onSave?: () => void;
    saving?: boolean;
    hasChanges?: boolean;
    onRegenerateAudit?: () => void;
    regenerating?: boolean;
    onGeneratePdf?: () => void;
    generatingPdf?: boolean;
    hasPdf?: boolean;
    onSendAudit?: () => void;
    // Phase C
    onGenerateProposal?: () => void;
    generatingProposal?: boolean;
    hasProposals?: boolean;
    onGenerateAllDevis?: () => void;
    generatingDevis?: boolean;
    hasDevis?: boolean;
    onSendProposal?: () => void;
    // Phase D
    onGenerateContract?: () => void;
    generatingContract?: boolean;
    hasContract?: boolean;
    onMarkContractSigned?: () => void;
    contractSigned?: boolean;
    // Phase E
    onGenerateKickoff?: () => void;
    generatingKickoff?: boolean;
    hasKickoff?: boolean;
    onSendKickoff?: () => void;
    sendingKickoff?: boolean;
    // Phase F
    onAddDeal?: () => void;
    onSaveClause?: (index: number, text: string) => void;
}

const Btn = ({ action }: { action: ActionDef }) => {
    if (action.hidden) return null;

    const variantClass = {
        primary: 'bg-[#0D0D0D] text-white hover:bg-[#1a1a1a] shadow-sm',
        secondary: 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]',
        success: 'bg-[#22C55E] text-white hover:bg-[#16A34A] shadow-sm shadow-green-500/20',
        ghost: 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]',
    }[action.variant];

    return (
        <button
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            title={action.disabled ? action.disabledTitle : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${variantClass}`}
        >
            {action.loading
                ? <Loader2 size={13} className="animate-spin shrink-0" />
                : <span className="shrink-0">{action.icon}</span>
            }
            <span>{action.loading ? (action.loadingLabel || 'En cours...') : action.label}</span>
        </button>
    );
};

export default function LeadActionBar(props: LeadActionBarProps) {
    const { phase } = props;

    const leftActions: ActionDef[] = [];
    const rightActions: ActionDef[] = [];

    if (phase === 'A') {
        rightActions.push({
            id: 'generate_audit',
            label: props.hasAudit ? 'Ré-générer l\'audit' : 'Générer l\'audit',
            loadingLabel: 'Génération en cours...',
            icon: <Sparkles size={13} />,
            onClick: props.onGenerateAudit || (() => {}),
            loading: props.generatingAudit,
            variant: 'primary',
        });
    }

    if (phase === 'B') {
        leftActions.push({
            id: 'save',
            label: 'Enregistrer',
            icon: <Save size={13} />,
            onClick: props.onSave || (() => {}),
            loading: props.saving,
            disabled: !props.hasChanges,
            variant: 'secondary',
        });
        leftActions.push({
            id: 'regen',
            label: 'Ré-générer',
            icon: <RefreshCw size={13} />,
            onClick: props.onRegenerateAudit || (() => {}),
            loading: props.regenerating,
            variant: 'ghost',
        });
        rightActions.push({
            id: 'send_audit',
            label: 'Envoyer l\'audit',
            icon: <Send size={13} />,
            onClick: props.onSendAudit || (() => {}),
            disabled: !props.hasAudit || props.generatingPdf,
            disabledTitle: 'Générez d\'abord l\'audit avant d\'envoyer',
            variant: 'success',
        });
    }

    if (phase === 'C') {
        leftActions.push({
            id: 'save',
            label: 'Enregistrer',
            icon: <Save size={13} />,
            onClick: props.onSave || (() => {}),
            loading: props.saving,
            disabled: !props.hasChanges,
            variant: 'secondary',
        });
        rightActions.push({
            id: 'ia_boost',
            label: props.hasProposals ? 'Ré-générer offres' : 'Générer offres IA',
            loadingLabel: 'Génération IA...',
            icon: <Sparkles size={13} />,
            onClick: props.onGenerateProposal || (() => {}),
            loading: props.generatingProposal,
            variant: 'primary',
        });
        rightActions.push({
            id: 'send_proposal',
            label: 'Envoyer les offres',
            icon: <Send size={13} />,
            onClick: props.onSendProposal || (() => {}),
            disabled: !props.hasProposals,
            disabledTitle: 'Générez d\'abord les offres',
            variant: 'success',
        });
    }

    if (phase === 'D') {
        leftActions.push({
            id: 'save',
            label: 'Enregistrer',
            icon: <Save size={13} />,
            onClick: props.onSave || (() => {}),
            loading: props.saving,
            disabled: !props.hasChanges,
            variant: 'secondary',
        });
        rightActions.push({
            id: 'generate_contract',
            label: props.hasContract ? 'Ré-générer contrat' : 'Générer contrat',
            loadingLabel: 'Génération contrat...',
            icon: <FileText size={13} />,
            onClick: props.onGenerateContract || (() => {}),
            loading: props.generatingContract,
            variant: 'primary',
        });
        rightActions.push({
            id: 'mark_signed',
            label: props.contractSigned ? 'Contrat signé ✓' : 'Marquer signé',
            icon: <CheckCircle size={13} />,
            onClick: props.onMarkContractSigned || (() => {}),
            disabled: !props.hasContract || props.contractSigned,
            variant: 'success',
        });
    }

    if (phase === 'E') {
        rightActions.push({
            id: 'generate_kickoff',
            label: props.hasKickoff ? 'Ré-générer formulaire' : 'Générer formulaire',
            loadingLabel: 'Génération...',
            icon: <Sparkles size={13} />,
            onClick: props.onGenerateKickoff || (() => {}),
            loading: props.generatingKickoff,
            variant: 'primary',
        });
        rightActions.push({
            id: 'send_kickoff',
            label: 'Envoyer email kickoff',
            loadingLabel: 'Envoi...',
            icon: <Send size={13} />,
            onClick: props.onSendKickoff || (() => {}),
            loading: props.sendingKickoff,
            disabled: !props.hasKickoff,
            disabledTitle: 'Générez d\'abord le formulaire',
            variant: 'success',
        });
    }

    if (phase === 'F') {
        rightActions.push({
            id: 'add_deal',
            label: 'Enregistrer un deal',
            icon: <Plus size={13} />,
            onClick: props.onAddDeal || (() => {}),
            variant: 'primary',
        });
    }

    const hasActions = leftActions.length > 0 || rightActions.length > 0;
    if (!hasActions) return null;

    return (
        <div className="shrink-0 h-16 bg-white border-t border-[#E5E7EB] px-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                {leftActions.map(a => <Btn key={a.id} action={a} />)}
            </div>
            <div className="flex items-center gap-2">
                {rightActions.map(a => <Btn key={a.id} action={a} />)}
            </div>
        </div>
    );
}

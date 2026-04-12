import { Check, Circle, Settings, Calendar, ChevronRight } from 'lucide-react';

export type PhaseId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface PipelinePhase {
    id: PhaseId;
    label: string;
    shortLabel: string;
    state: 'active' | 'completed' | 'available' | 'alert';
    description?: string;
}

interface PipelineSidebarProps {
    phases: PipelinePhase[];
    activePhase: PhaseId;
    onPhaseClick: (id: PhaseId) => void;
    leadName: string;
    companyName: string;
    score?: number;
    leadStatus?: string;
    onSettingsClick?: () => void;
    onConsultationClick?: () => void;
}

const PHASE_DESCRIPTIONS: Record<PhaseId, string> = {
    A: 'Vue d\'ensemble',
    B: 'Rapport IA',
    C: 'Propositions',
    D: 'Clauses & signature',
    E: 'Démarrage projet',
    F: 'Facturation',
};

const getScoreColor = (score: number) => {
    if (score >= 70) return { text: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' };
    if (score >= 40) return { text: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' };
    return { text: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' };
};

const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        new: 'Nouveau',
        qualified: 'Qualifié',
        audited: 'Audité',
        proposal_sent: 'Offre envoyée',
        won: 'Converti',
        lost: 'Perdu',
        in_progress: 'En cours',
    };
    return map[status] || status;
};

export default function PipelineSidebar({
    phases,
    activePhase,
    onPhaseClick,
    leadName,
    companyName,
    score = 0,
    leadStatus = '',
    onSettingsClick,
    onConsultationClick,
}: PipelineSidebarProps) {
    const scoreColors = getScoreColor(score);

    return (
        <aside className="w-56 shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col h-full overflow-hidden">

            {/* Lead identity */}
            <div className="px-4 pt-5 pb-4 border-b border-[#F3F4F6]">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">Lead</p>
                <h2 className="text-[13px] font-bold text-[#111827] leading-tight truncate">{leadName}</h2>
                <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{companyName}</p>
            </div>

            {/* Pipeline steps */}
            <div className="py-3 px-2 border-b border-[#F3F4F6]">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] px-2 mb-2">Pipeline</p>
                <nav className="space-y-0.5">
                    {phases.map((phase, index) => {
                        const isActive = phase.id === activePhase;
                        const isCompleted = phase.state === 'completed';
                        const isAvailable = phase.state === 'available' || phase.state === 'alert';
                        const isLast = index === phases.length - 1;

                        return (
                            <div key={phase.id} className="relative">
                                {/* Vertical connector */}
                                {!isLast && (
                                    <div className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%_-_16px)] z-0 transition-colors duration-300 ${
                                        isCompleted ? 'bg-[#22C55E]' : 'bg-[#E5E7EB]'
                                    }`} />
                                )}

                                <button
                                    onClick={() => onPhaseClick(phase.id)}
                                    className={`relative z-10 w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                                        isActive
                                            ? 'bg-[#F0FDF4] text-[#16A34A]'
                                            : 'hover:bg-[#F9FAFB] text-[#374151]'
                                    }`}
                                >
                                    {/* Phase dot/icon */}
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-200 ${
                                        isCompleted
                                            ? 'bg-[#22C55E] border-[#22C55E]'
                                            : isActive
                                                ? 'bg-white border-[#22C55E] ring-2 ring-[#22C55E]/20'
                                                : phase.state === 'alert'
                                                    ? 'bg-[#FFFBEB] border-[#F59E0B]'
                                                    : 'bg-white border-[#D1D5DB]'
                                    }`}>
                                        {isCompleted ? (
                                            <Check size={11} strokeWidth={3} className="text-white" />
                                        ) : isActive ? (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                                            </span>
                                        ) : phase.state === 'alert' ? (
                                            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[12px] font-semibold leading-tight truncate ${
                                            isActive ? 'text-[#16A34A]' : isCompleted ? 'text-[#374151]' : 'text-[#9CA3AF]'
                                        }`}>
                                            {phase.label}
                                        </p>
                                        <p className="text-[10px] text-[#9CA3AF] leading-tight truncate mt-0.5">
                                            {PHASE_DESCRIPTIONS[phase.id]}
                                        </p>
                                    </div>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <ChevronRight size={12} className="text-[#22C55E] shrink-0" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

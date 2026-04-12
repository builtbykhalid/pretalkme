import { Check, Lock, AlertCircle, CircleDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type PhaseId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface PipelinePhase {
    id: PhaseId;
    label: string;
    shortLabel: string;
    state: 'locked' | 'active' | 'completed' | 'alert';
}

interface LeadPipelineStepperProps {
    phases: PipelinePhase[];
    onPhaseClick: (id: PhaseId) => void;
}

export default function LeadPipelineStepper({ phases, onPhaseClick }: LeadPipelineStepperProps) {
    const { t } = useTranslation();

    const getPhaseColors = (state: PipelinePhase['state']) => {
        switch (state) {
            case 'completed':
                return 'bg-[#22C55E] text-white border-[#22C55E] shadow-lg shadow-[#22C55E]/20';
            case 'active':
                return 'bg-[#DCFCE7] text-[#16A34A] border-[#22C55E] ring-2 ring-[#22C55E]/20';
            case 'alert':
                return 'bg-[#FFFBEB] text-[#D97706] border-[#F59E0B]';
            case 'locked':
            default:
                return 'bg-[#F4F4F4] text-[#9A9A9A] border-[#E8E8E8]';
        }
    };

    const getPhaseIcon = (state: PipelinePhase['state']) => {
        switch (state) {
            case 'completed':
                return <Check size={14} className="stroke-[3]" />;
            case 'active':
                return (
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]"></span>
                    </span>
                );
            case 'alert':
                return <AlertCircle size={14} />;
            case 'locked':
            default:
                return <Lock size={14} />;
        }
    };

    return (
        <div className="w-full bg-white border-b border-[#E8E8E8] px-4 md:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center max-w-5xl mx-auto gap-3 sm:gap-0">
                {phases.map((phase, index) => {
                    const isLast = index === phases.length - 1;
                    const isClickable = phase.state === 'completed' || phase.state === 'active' || phase.state === 'alert';

                    return (
                        <div key={phase.id} className="flex items-center">
                            {/* Phase Item */}
                            <div
                                onClick={() => isClickable && onPhaseClick(phase.id)}
                                className={`flex items-center gap-3 transition-all duration-300 group
                                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                                `}
                                title={phase.state === 'locked' ? 'Étape verrouillée' : phase.label}
                            >
                                <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${getPhaseColors(phase.state)}
                                        ${isClickable && phase.state !== 'active' ? 'group-hover:scale-110' : ''}
                                        ${phase.state === 'locked' ? 'opacity-70' : ''}
                                    `}
                                >
                                    {getPhaseIcon(phase.state)}
                                </div>
                                <div className="hidden sm:block mr-2">
                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1
                                        ${phase.state === 'active' ? 'text-[#16A34A]' : 'text-[#9A9A9A]'}
                                    `}>
                                        Phase {phase.id}
                                    </p>
                                    <p className={`text-sm font-bold leading-none
                                        ${phase.state === 'locked' ? 'text-[#9A9A9A]' : 'text-[#0D0D0D]'}
                                        ${phase.state === 'active' ? 'text-[#0D0D0D]' : ''}
                                    `}>
                                        {phase.label}
                                    </p>
                                </div>
                                {/* Mobile Short Label */}
                                <div className="sm:hidden mr-2">
                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none
                                        ${phase.state === 'locked' ? 'text-[#9A9A9A]' : 'text-[#0D0D0D]'}
                                    `}>
                                        {phase.shortLabel}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="w-6 h-6 sm:h-auto sm:w-8 md:w-20 mx-2 flex-shrink-0 flex items-center justify-center">
                                    <div className={`w-[2px] h-full sm:h-[2px] sm:w-full rounded-full transition-colors duration-500
                                        ${phase.state === 'completed' ? 'bg-[#22C55E]' : 'bg-[#E8E8E8]'}
                                    `} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { Share2, Save, Eye, Edit3, Sparkles, Layout, Settings, FileText, Check } from 'lucide-react';

interface FormFloatingBarProps {
    activeTab: 'structure' | 'intelligence' | 'steps' | 'design';
    onTabChange: (tab: 'structure' | 'intelligence' | 'steps' | 'design') => void;
    onShare: () => void;
    onSave: (publish?: boolean) => void;
    isSaving: boolean;
    isCopied?: boolean;
}

export default function FormFloatingBar({
    activeTab,
    onTabChange,
    onShare,
    onSave,
    isSaving,
    isCopied,
}: FormFloatingBarProps) {
    const tabs = [
        { id: 'structure', icon: Layout, label: 'Questions' },
        { id: 'intelligence', icon: Sparkles, label: 'Intelligence' },
        { id: 'design', icon: PaletteIcon, label: 'Design' },
        { id: 'steps', icon: Settings, label: 'Étapes' },
    ];

    return (
        <div className="flex items-center gap-4 p-2 bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as any)}
                            className={`flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-bold transition-all duration-300 ${isActive ? 'bg-white text-dark shadow-sm px-4' : 'text-neutral-500 hover:text-dark'}`}
                            title={tab.label}
                        >
                            <tab.icon size={isActive ? 16 : 18} />
                            {isActive && (
                                <span className="animate-in slide-in-from-left-2 fade-in duration-300">
                                    {tab.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onShare}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 shadow-lg ${isCopied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-dark text-white shadow-dark/20 hover:bg-neutral-800'}`}
                    title={isCopied ? 'Lien copié !' : 'Partager'}
                >
                    {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                </button>

                <button
                    onClick={() => onSave()}
                    disabled={isSaving}
                    className={`flex items-center gap-2 h-9 px-4 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-emerald-500/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSaving ? <Check size={14} className="animate-pulse" /> : <Save size={14} />}
                    Enregistrer
                </button>
            </div>
        </div>
    );
}

const PaletteIcon = ({ size }: { size: number }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.6 1.5-1.5 0-.4-.1-.8-.4-1.1-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h1.1c2.7 0 4.8-2.1 4.8-4.8C20.5 5.5 16.7 2 12 2z"/>
    </svg>
);

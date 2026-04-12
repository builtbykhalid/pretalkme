import { Share2, Plus, Palette, Save, Check } from 'lucide-react';

interface FloatingBuilderBarProps {
    onShare: () => void;
    onAddPage: () => void;
    onDesignClick: () => void;
    onSave: () => void;
    isCopied?: boolean;
    isSaving?: boolean;
}

export default function FloatingBuilderBar({
    onShare,
    onAddPage,
    onDesignClick,
    onSave,
    isCopied,
    isSaving
}: FloatingBuilderBarProps) {
    return (
        <div className="flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
                onClick={onShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all active:scale-95 shadow-lg ${isCopied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-dark text-white shadow-dark/20'}`}
            >
                {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                {isCopied ? 'Lien copié !' : 'Partager mon lien'}
            </button>

            <div className="w-px h-6 bg-neutral-200 mx-1" />

            <div className="flex items-center gap-1">
                <button 
                    onClick={onAddPage}
                    className="p-2.5 text-neutral-500 hover:text-dark hover:bg-neutral-100 rounded-xl transition-all"
                    title="Ajouter une page"
                >
                    <Plus size={18} />
                </button>
                <button 
                    onClick={onDesignClick}
                    className="p-2.5 text-neutral-500 hover:text-dark hover:bg-neutral-100 rounded-xl transition-all"
                    title="Couleurs & Design"
                >
                    <Palette size={18} />
                </button>
                <div className="w-px h-6 bg-neutral-200 mx-1" />
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className={`p-2.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all ${isSaving ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
                    title="Enregistrer les modifications"
                >
                    <Save size={18} />
                </button>
            </div>
        </div>
    );
}

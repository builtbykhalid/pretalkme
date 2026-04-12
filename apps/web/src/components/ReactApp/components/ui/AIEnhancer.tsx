import { useState, useRef, useEffect } from 'react';
import { Wand2, Loader2, Sparkles, SpellCheck, Briefcase, Type, RotateCcw } from 'lucide-react';
import { N8N_AI_ASSIST_TEXT_WEBHOOK } from '../../lib/n8n';

interface AIEnhancerProps {
    text: string;
    onEnhanced: (newText: string) => void;
    onLoading?: (isLoading: boolean) => void;
    context?: string;
    action?: 'enhance_description' | 'fix_spelling' | 'make_professional' | 'generate_titles';
    className?: string;
}

export default function AIEnhancer({
    text,
    onEnhanced,
    onLoading,
    context = 'Consultant B2B',
    action: initialAction = 'enhance_description',
    className = ''
}: AIEnhancerProps) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [originalText, setOriginalText] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleEnhance = async (selectedAction: string) => {
        if (!text || text.trim().length < 3) {
            alert('Veuillez saisir un texte avant de demander une amélioration.');
            return;
        }

        setLoading(true);
        onLoading?.(true);
        setIsOpen(false);
        if (!originalText) setOriginalText(text);

        try {
            const response = await fetch(N8N_AI_ASSIST_TEXT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: selectedAction,
                    text: text,
                    context
                })
            });

            if (!response.ok) throw new Error('Erreur réseau');

            const data = await response.json();
            if (data.success && data.result) {
                // Return result properly
                onEnhanced(data.result);
            } else if (data.result) {
                // Fallback if success flag is missing but result exists
                onEnhanced(data.result);
            } else {
                throw new Error(data.error || 'Erreur lors de la génération');
            }
        } catch (err) {
            console.error('AI Enhance Error:', err);
            alert('Impossible de générer le texte pour le moment. Réessayez plus tard.');
        } finally {
            setLoading(false);
            onLoading?.(false);
        }
    };

    const handleUndo = () => {
        if (originalText !== null) {
            onEnhanced(originalText);
            setOriginalText(null);
        }
    };

    // Auto close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const actions = [
        { id: 'enhance_description', label: 'Améliorer (IA)', icon: Sparkles, color: 'text-violet-500' },
        { id: 'make_professional', label: 'Professionnaliser', icon: Briefcase, color: 'text-blue-500' },
        { id: 'fix_spelling', label: 'Corriger orthographe', icon: SpellCheck, color: 'text-emerald-500' },
        { id: 'generate_titles', label: 'Générer des titres', icon: Type, color: 'text-amber-500' },
    ];

    return (
        <div ref={dropdownRef} className={`relative flex items-center gap-1 ${className}`}>
            {originalText && !loading && (
                <button
                    type="button"
                    onClick={handleUndo}
                    className="p-1.5 text-neutral-400 hover:text-dark hover:bg-neutral-100 rounded-lg transition-all"
                    title="Retour au texte original"
                >
                    <RotateCcw size={14} />
                </button>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`p-1.5 rounded-lg transition-all shadow-sm ${loading
                    ? 'bg-neutral-100 text-neutral-400'
                    : 'bg-white text-primary-500 hover:bg-primary-50 hover:shadow-primary-500/10 active:scale-90 border border-primary-100'
                    }`}
                title="Assistant IA Pretalk"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-primary-500" />}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-neutral-100 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-bold text-neutral-400 border-b border-neutral-50 mb-1">
                        Actions Magiques IA
                    </div>
                    {actions.map((act) => (
                        <button
                            key={act.id}
                            type="button"
                            onClick={() => handleEnhance(act.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                        >
                            <act.icon size={14} className={act.color} />
                            <span className="text-sm font-medium text-dark">{act.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

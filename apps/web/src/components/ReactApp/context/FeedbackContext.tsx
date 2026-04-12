import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'delete' | 'loading';

interface FeedbackOptions {
    type?: FeedbackType;
    title?: string;
    message: string;
    duration?: number;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: (value?: string) => void | Promise<void>;
    onCancel?: () => void;
    showInput?: boolean;
    inputPlaceholder?: string;
    initialInputValue?: string;
}

interface FeedbackState extends FeedbackOptions {
    isOpen: boolean;
    type: FeedbackType;
}

interface FeedbackContextType {
    showFeedback: (type: FeedbackType, options: FeedbackOptions) => void;
    hideFeedback: () => void;
    confirm: (options: FeedbackOptions) => Promise<boolean | string>;
    showErrorToast: (message: string, options?: Omit<FeedbackOptions, 'message'>) => void;
    showSuccessToast: (message: string, options?: Omit<FeedbackOptions, 'message'>) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<FeedbackState>({
        isOpen: false,
        type: 'info',
        message: '',
    });

    const [confirmResolver, setConfirmResolver] = useState<((value: any) => void) | null>(null);

    const showFeedback = useCallback((type: FeedbackType, options: FeedbackOptions) => {
        setState({
            isOpen: true,
            type,
            ...options,
        });
        if (options.duration) {
            setTimeout(() => {
                setState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
            }, options.duration);
        }
    }, []);

    const showErrorToast = useCallback((message: string, options?: Omit<FeedbackOptions, 'message'>) => {
        showFeedback('error', { message, ...options });
    }, [showFeedback]);

    const showSuccessToast = useCallback((message: string, options?: Omit<FeedbackOptions, 'message'>) => {
        showFeedback('success', { message, ...options });
    }, [showFeedback]);

    const hideFeedback = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
        if (confirmResolver) {
            confirmResolver(false);
            setConfirmResolver(null);
        }
    }, [confirmResolver]);

    const confirm = useCallback((options: FeedbackOptions): Promise<boolean | string> => {
        return new Promise((resolve) => {
            setConfirmResolver(() => resolve);
            setState({
                isOpen: true,
                type: options.type || 'confirm',
                ...options,
            });
        });
    }, []);

    const handleConfirm = async (value?: string) => {
        if (state.onConfirm) {
            await state.onConfirm(value || '');
        }
        if (confirmResolver) {
            confirmResolver(value !== undefined ? value : true);
            setConfirmResolver(null);
        }
        setState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (state.onCancel) {
            state.onCancel();
        }
        if (confirmResolver) {
            confirmResolver(false);
            setConfirmResolver(null);
        }
        setState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <FeedbackContext.Provider value={{ showFeedback, hideFeedback, confirm, showErrorToast, showSuccessToast }}>
            {children}
            {state.isOpen && (
                <FeedbackModal 
                    state={state} 
                    onConfirm={handleConfirm} 
                    onCancel={handleCancel} 
                />
            )}
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
}

import { CheckCircle2, AlertTriangle, Info, XCircle, Trash2, X, Loader2 } from 'lucide-react';

function FeedbackModal({ state, onConfirm, onCancel }: { 
    state: FeedbackState, 
    onConfirm: (value?: string) => void, 
    onCancel: () => void 
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(state.initialInputValue || '');

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(state.showInput ? inputValue : undefined);
        } finally {
            setIsLoading(false);
        }
    };

    const config = {
        success: {
            icon: <CheckCircle2 className="text-emerald-500" size={32} />,
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
            title: state.title || 'Succès'
        },
        error: {
            icon: <XCircle className="text-rose-500" size={32} />,
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
            title: state.title || 'Erreur'
        },
        warning: {
            icon: <AlertTriangle className="text-amber-500" size={32} />,
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
            title: state.title || 'Attention'
        },
        info: {
            icon: <Info className="text-blue-500" size={32} />,
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200',
            title: state.title || 'Information'
        },
        confirm: {
            icon: <AlertTriangle className="text-primary-500" size={32} />,
            bg: 'bg-primary-50',
            border: 'border-primary-100',
            button: 'bg-primary-500 hover:bg-primary-600 shadow-primary-200',
            title: state.title || 'Confirmation'
        },
        delete: {
            icon: <Trash2 className="text-rose-600" size={32} />,
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
            title: state.title || 'Suppression'
        },
        loading: {
            icon: <Loader2 className="text-primary-500 animate-spin" size={32} />,
            bg: 'bg-primary-50',
            border: 'border-primary-100',
            button: 'hidden',
            title: state.title || 'Chargement...'
        }
    }[state.type];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" 
                onClick={onCancel}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl shadow-black/10 overflow-hidden border border-neutral-100 animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">
                {/* Close Button */}
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-full transition-all"
                >
                    <X size={18} />
                </button>

                <div className="p-8">
                    {/* Icon Header */}
                    <div className={`w-16 h-16 ${config.bg} ${config.border} border rounded-[22px] flex items-center justify-center mb-6`}>
                        {config.icon}
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mb-8">
                        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                            {config.title}
                        </h3>
                        <p className="text-neutral-500 leading-relaxed text-[15px]">
                            {state.message}
                        </p>
                        {state.showInput && (
                            <div className="mt-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={state.inputPlaceholder || "Tapez votre réponse..."}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-[15px] focus:border-primary-500 focus:bg-white outline-none transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && inputValue.trim()) handleConfirm();
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`w-full py-3.5 px-6 rounded-[16px] text-white font-bold text-[15px] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 ${config.button}`}
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                state.confirmLabel || (state.type === 'confirm' || state.type === 'delete' ? 'Confirmer' : 'D’accord')
                            )}
                        </button>
                        
                        {(state.type === 'confirm' || state.type === 'delete') && (
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="w-full py-3.5 px-6 rounded-[16px] text-neutral-500 font-semibold text-[15px] hover:bg-neutral-50 hover:text-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {state.cancelLabel || 'Annuler'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

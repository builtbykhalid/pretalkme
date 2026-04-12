import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, changeLanguage, type LanguageCode } from '../i18n';

interface LanguageSwitcherProps {
    variant?: 'default' | 'compact' | 'minimal';
    className?: string;
}

export default function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code: LanguageCode) => {
        changeLanguage(code);
        setIsOpen(false);
    };

    if (variant === 'minimal') {
        return (
            <div ref={dropdownRef} className={`relative ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-white bg-opacity-90 text-neutral-700 border border-neutral-200 rounded-lg hover:bg-opacity-100 transition-all shadow-sm"
                >
                    <Globe size={16} />
                    <span>{currentLanguage.code.toUpperCase()}</span>
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-2 left-0 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 min-w-[140px] z-50 backdrop-blur-sm">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${lang.code === currentLanguage.code
                                    ? 'bg-primary-100 text-primary-700 font-semibold'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                            >
                                <span className="text-base">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {lang.code === currentLanguage.code && <Check size={16} className="ml-auto text-primary-600" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div ref={dropdownRef} className={`relative ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg transition-all shadow-sm font-medium backdrop-blur-sm"
                >
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <span className="text-inherit text-sm font-bold">{currentLanguage.name}</span>
                    <ChevronDown size={14} className={`text-inherit transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-2 right-0 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 min-w-[180px] z-50 backdrop-blur-sm text-dark">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${lang.code === currentLanguage.code
                                    ? 'bg-primary-100 text-primary-700 font-semibold'
                                    : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="flex-1">{lang.name}</span>
                                {lang.code === currentLanguage.code && <Check size={16} className="text-primary-600" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors"
            >
                <Globe size={18} className="text-neutral-500" />
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <span className="text-sm font-medium text-neutral-700">{currentLanguage.name}</span>
                </div>
                <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors ${lang.code === currentLanguage.code ? 'bg-primary-50' : ''
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className={`text-sm flex-1 ${lang.code === currentLanguage.code ? 'font-semibold text-primary-600' : 'text-neutral-700'}`}>
                                {lang.name}
                            </span>
                            {lang.code === currentLanguage.code && <Check size={16} className="text-primary-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

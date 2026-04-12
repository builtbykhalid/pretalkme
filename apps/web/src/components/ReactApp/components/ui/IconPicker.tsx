import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

interface Props {
    value?: string;
    onChange: (iconName: string) => void;
    onClose: () => void;
}

const ALL_ICONS = Object.keys(LucideIcons).filter(key => {
    // Filter out internal stuff, functions that are not icons
    return typeof (LucideIcons as any)[key] === 'object' || typeof (LucideIcons as any)[key] === 'function';
}).filter(key => !['createLucideIcon', 'LucideProps'].includes(key));

export default function IconPicker({ value, onChange, onClose }: Props) {
    const [search, setSearch] = useState('');

    const filteredIcons = useMemo(() => {
        const s = search.toLowerCase();
        return ALL_ICONS.filter(name => name.toLowerCase().includes(s)).slice(0, 100);
    }, [search]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[550px] transform transition-all duration-300 scale-100 border border-neutral-200">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="text"
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un icône..."
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:border-primary-500 transition-all font-bold"
                        />
                    </div>
                    <button onClick={onClose} className="ml-3 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {filteredIcons.map(name => {
                            const Icon = (LucideIcons as any)[name];
                            if (!Icon || typeof Icon !== 'function' && typeof Icon !== 'object') return null;

                            return (
                                <button
                                    key={name}
                                    onClick={() => {
                                        onChange(name);
                                        onClose();
                                    }}
                                    className={`aspect-square flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${value === name ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-neutral-100 hover:border-primary-200 hover:bg-neutral-50 text-neutral-500'
                                        }`}
                                    title={name}
                                >
                                    {/* @ts-ignore */}
                                    <Icon size={20} strokeWidth={2} />
                                    <span className="text-xs truncate w-full text-center">{name}</span>
                                </button>
                            );
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <div className="text-center py-12 text-neutral-400">
                            <p className="text-sm font-bold">Aucun icône trouvé</p>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
                    <p className="text-xs font-semibold text-neutral-400">
                        {ALL_ICONS.length} icônes disponibles
                    </p>
                </div>
            </div>
        </div>
    );
}

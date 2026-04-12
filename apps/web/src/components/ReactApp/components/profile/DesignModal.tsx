import React from 'react';
import { X, Check, Palette, Type, Layout, Hexagon, RefreshCcw } from 'lucide-react';
import type { PageConfig } from '../context/AppContext';

interface DesignModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: PageConfig;
    onChange: (newConfig: PageConfig) => void;
}

const THEMES: { id: PageConfig['theme']; label: string; bg: string; card: string }[] = [
    { id: 'minimal', label: 'Minimal', bg: '#ffffff', card: '#f5f5f5' },
    { id: 'dark', label: 'Dark', bg: '#221A40', card: '#2d2252' },
    { id: 'black', label: 'Black', bg: '#000000', card: '#1a1a1a' },
    { id: 'glass', label: 'Glass', bg: '#221A40', card: '#3a2d5e' },
];

const FONTS: { id: PageConfig['font']; label: string; family: string; preview: string }[] = [
    { id: 'inter', label: 'Inter', family: 'Inter, sans-serif', preview: 'Moderne & net' },
    { id: 'outfit', label: 'Outfit', family: 'Outfit, sans-serif', preview: 'Élégant & fluide' },
    { id: 'playfair', label: 'Playfair', family: 'Playfair Display, serif', preview: 'Classique & noble' },
    { id: 'space', label: 'Space', family: 'Space Grotesk, sans-serif', preview: 'Futuriste & brutal' },
];

const HERO_SHAPES: { id: NonNullable<PageConfig['hero_shape']>; label: string }[] = [
    { id: 'rounded-rect', label: 'Rectangle' },
    { id: 'circle', label: 'Cercle' },
    { id: 'square', label: 'Carré' },
    { id: 'diamond', label: 'Losange' },
    { id: 'hexagon', label: 'Hexagone' },
    { id: 'arch', label: 'Arche' },
];

const PRESET_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#000000'];

export default function DesignModal({ isOpen, onClose, config, onChange }: DesignModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white border border-neutral-100 rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Palette size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-dark tracking-tight leading-none">Design & Style</h3>
                            <p className="text-xs font-semibold text-neutral-400 mt-1">Personnalisez votre apparence</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-dark rounded-full flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">

                    {/* Layouts */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Layout size={14} className="text-indigo-500" />
                            <h4 className="text-xs font-semibold text-neutral-400">Structure de page</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'linktree', label: 'Linktree', desc: 'Classique & efficace' },
                                { id: 'showcase', label: 'Showcase', desc: 'Visuel & immersif' }
                            ].map(layout => (
                                <button
                                    key={layout.id}
                                    onClick={() => onChange({ ...config, layout: layout.id as any })}
                                    className={`relative p-5 rounded-[2rem] border-2 transition-all text-left ${config.layout === layout.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-neutral-50 hover:border-neutral-100'}`}
                                >
                                    <div className="w-full aspect-[16/10] bg-neutral-100 rounded-xl mb-3 overflow-hidden border border-neutral-200/50 flex flex-col relative">
                                        {layout.id === 'linktree' ? (
                                            <div className="flex-1 flex flex-col items-center pt-2 px-4 gap-1">
                                                <div className="w-6 h-6 rounded-full bg-neutral-300" />
                                                <div className="w-full h-2 bg-neutral-200 rounded-full" />
                                                <div className="w-full h-2 bg-neutral-200 rounded-full" />
                                                <div className="w-full h-2 bg-neutral-200 rounded-full" />
                                            </div>
                                        ) : (
                                            <div className="flex-1 grid grid-cols-2 gap-1 p-2">
                                                <div className="aspect-square bg-neutral-300 rounded-lg" />
                                                <div className="aspect-square bg-neutral-300 rounded-lg" />
                                                <div className="aspect-square bg-neutral-300 rounded-lg" />
                                                <div className="aspect-square bg-neutral-300 rounded-lg" />
                                            </div>
                                        )}
                                        {config.layout === layout.id && (
                                            <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                                                <Check size={24} className="text-indigo-600" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-semibold block ${config.layout === layout.id ? 'text-indigo-600' : 'text-dark'}`}>{layout.label}</span>
                                    <span className="text-xs text-neutral-400 font-bold">{layout.desc}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Themes - Hidden as requested
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Palette size={14} className="text-indigo-500" />
                            <h4 className="text-xs font-semibold text-neutral-400">Thème visuel</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => onChange({ ...config, theme: theme.id })}
                                    className={`relative group p-4 rounded-2xl border-2 transition-all text-left ${config.theme === theme.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-neutral-50 hover:border-neutral-100'}`}
                                >
                                    <div className="w-full aspect-square rounded-xl shadow-sm border border-neutral-100 overflow-hidden mb-3 relative">
                                        <div className="absolute inset-0" style={{ backgroundColor: theme.bg }}></div>
                                        <div className="absolute inset-y-2 inset-x-2 rounded-lg" style={{ backgroundColor: theme.card }}></div>
                                    </div>
                                    <span className={`text-xs font-semibold ${config.theme === theme.id ? 'text-indigo-600' : 'text-dark'}`}>{theme.label}</span>
                                    {config.theme === theme.id && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                    */}

                    {/* Colors */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-3 h-3 rounded-full bg-indigo-500" />
                            <h4 className="text-xs font-semibold text-neutral-400">Couleur des boutons & titres</h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => onChange({ ...config, color })}
                                    className={`w-10 h-10 rounded-2xl transition-all relative ${config.color === color ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-neutral-200' : 'hover:scale-105 shadow-sm'}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {config.color === color && <Check size={16} className="text-white absolute inset-0 m-auto drop-shadow-md" strokeWidth={3} />}
                                </button>
                            ))}
                            <div className="relative group">
                                <input
                                    type="color"
                                    value={config.color}
                                    onChange={(e) => onChange({ ...config, color: e.target.value })}
                                    className="w-10 h-10 rounded-2xl border-none p-0 overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Fonts */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Type size={14} className="text-indigo-500" />
                            <h4 className="text-xs font-semibold text-neutral-400">Typographie</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {FONTS.map(font => (
                                <button
                                    key={font.id}
                                    onClick={() => onChange({ ...config, font: font.id })}
                                    className={`p-5 rounded-[1.5rem] border-2 transition-all text-left relative ${config.font === font.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-neutral-50 hover:border-neutral-100'}`}
                                    style={{ fontFamily: font.family }}
                                >
                                    <span className="text-xl font-semibold text-dark block leading-none mb-1">{font.label}</span>
                                    <span className="text-xs text-neutral-400 font-sans font-bold">{font.preview}</span>
                                    {config.font === font.id && (
                                        <div className="absolute top-4 right-4 text-indigo-600">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Shapes - Hidden as requested
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Hexagon size={14} className="text-indigo-500" />
                            <h4 className="text-xs font-semibold text-neutral-400">Forme des cartes</h4>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {HERO_SHAPES.map(shape => (
                                <button
                                    key={shape.id}
                                    onClick={() => onChange({ ...config, hero_shape: shape.id })}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${config.hero_shape === shape.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-neutral-50 hover:border-neutral-100'}`}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center text-indigo-500">
                                        {shape.id === 'rounded-rect' && <div className="w-7 h-7 border-2 border-current rounded-lg" />}
                                        {shape.id === 'circle' && <div className="w-7 h-7 border-2 border-current rounded-full" />}
                                        {shape.id === 'square' && <div className="w-7 h-7 border-2 border-current rounded-sm" />}
                                        {shape.id === 'diamond' && <div className="w-5 h-5 border-2 border-current rotate-45 rounded-sm" />}
                                        {shape.id === 'hexagon' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
                                        {shape.id === 'arch' && <div className="w-5 h-7 border-2 border-current rounded-t-full border-b-0" />}
                                    </div>
                                    <span className="text-xs font-semibold text-dark">{shape.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                    */}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-neutral-50 bg-neutral-50/50 flex items-center justify-between">
                    <button 
                        onClick={() => {
                            if (confirm('Voulez-vous vraiment réinitialiser le design de votre profil ?')) {
                                onChange({ 
                                    theme: 'minimal', 
                                    color: '#6366F1', 
                                    font: 'inter', 
                                    layout: 'linktree', 
                                    hero_shape: 'circle',
                                    show_forms: true
                                });
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-all group"
                    >
                        <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        Réinitialiser le design
                    </button>
                    <button onClick={onClose} className="px-8 py-3 bg-dark text-white rounded-2xl text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95">
                        Terminé
                    </button>
                </div>
            </div>
        </div>
    );
}

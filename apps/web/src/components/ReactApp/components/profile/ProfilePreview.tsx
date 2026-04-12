import React from 'react';
import {
    Globe, Linkedin, Twitter, Instagram, Github, Youtube, Facebook,
    MonitorPlay, MessageCircle, Sparkles, Zap, Calendar, Box, ChevronRight, Link2, Star, Briefcase
} from 'lucide-react';
import type { PageConfig, ProfileTab, ProfileItem, ProfileSection } from '../context/AppContext';

const ICON_COMPONENTS: Record<string, any> = {
    Linkedin, Twitter, Instagram, Github, Youtube, Facebook,
    MonitorPlay, MessageCircle, Sparkles, Zap, Calendar, Box, Link2, Star, Briefcase
};

const getHeroShapeClass = (shape?: string): string => {
    switch (shape) {
        case 'circle':
            return 'rounded-full';
        case 'square':
            return 'rounded-md';
        case 'rounded-rect':
            return 'rounded-xl';
        default:
            return 'rounded-2xl';
    }
};

interface ProfilePreviewProps {
    profile: any;
    pageConfig: PageConfig;
    structure: ProfileTab[];
}

export default function ProfilePreview({ profile, pageConfig, structure }: ProfilePreviewProps) {
    const isDark = pageConfig.theme === 'dark' || pageConfig.theme === 'black' || pageConfig.theme === 'glass';
    const brandColor = pageConfig.color || '#6366F1';

    const bgColor = pageConfig.theme === 'minimal' ? '#ffffff'
        : pageConfig.theme === 'black' ? '#000000'
            : pageConfig.theme === 'dark' ? '#221A40'
                : '#221A40'; // glass uses dark bg

    const textColor = isDark ? 'text-white' : 'text-black';
    const subtextColor = isDark ? 'text-white/60' : 'text-neutral-500';
    const heroShapeClass = getHeroShapeClass(pageConfig.hero_shape);

    return (
        <div className="flex flex-col items-center justify-center p-4 sticky top-8">
            <div className="text-xs font-semibold text-neutral-400 mb-4">Aperçu en direct</div>

            {/* Mobile Frame */}
            <div className="relative w-[320px] h-[640px] bg-neutral-900 rounded-[3rem] border-[8px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-50"></div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative" style={{ backgroundColor: bgColor }}>
                    {pageConfig.theme === 'glass' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    )}

                    <div className="p-6 flex flex-col items-center min-h-full">
                        {/* Avatar / Logo */}
                        <div className="mt-8 mb-6 relative">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className={`w-20 h-20 ${heroShapeClass} object-cover ring-4 ring-white shadow-xl`} alt="Avatar" />
                            ) : (
                                <div className={`w-20 h-20 ${heroShapeClass} bg-neutral-200 flex items-center justify-center ring-4 ring-white shadow-xl`}>
                                    <Globe size={32} className="text-neutral-400" />
                                </div>
                            )}
                        </div>

                        {/* Name & Bio */}
                        <div className="text-center mb-6 space-y-1">
                            <h2 className={`text-xl font-semibold ${textColor}`}>
                                {profile?.first_name} {profile?.last_name}
                            </h2>
                            {profile?.job_title && (profile?.public_visibility?.job_title ?? true) && (
                                <p className={`text-xs font-bold ${brandColor === '#000000' && isDark ? 'text-white/40' : ''}`} style={{ color: brandColor !== '#000000' ? brandColor : undefined }}>
                                    {profile.job_title}
                                </p>
                            )}
                            {profile?.bio && (profile?.public_visibility?.bio ?? true) && (
                                <p className={`text-sm font-medium leading-relaxed max-w-[240px] mt-2 ${subtextColor}`}>
                                    {profile.bio}
                                </p>
                            )}
                        </div>

                        {/* Website */}
                        {profile?.website && (profile?.public_visibility?.website ?? true) && (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className={`mb-6 px-4 py-2 rounded-xl text-xs border flex items-center gap-2 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-neutral-50 border-neutral-200 text-dark'} hover:scale-105 active:scale-95`}>
                                <Globe size={14} />
                                Visiter le site
                            </a>
                        )}

                        {/* Social Links */}
                        {profile?.social_networks && Object.keys(profile.social_networks).length > 0 && (profile?.public_visibility?.social_networks ?? true) && (
                            <div className="flex flex-wrap justify-center gap-3 mb-8">
                                {Object.entries(profile.social_networks).map(([platform, url]: [string, any]) => {
                                    if (!url) return null;
                                    const Icon = ICON_COMPONENTS[platform] || Globe;
                                    return (
                                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-neutral-50 border-neutral-100 text-black hover:bg-neutral-100'}`}>
                                            <Icon size={16} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* Dynamic Structure */}
                        <div className="w-full space-y-8 flex-1">
                            {structure.map(tab => (
                                <div key={tab.id} className="space-y-6">
                                    {tab.sections.map(section => (
                                        <div key={section.id} className="space-y-4">
                                            {section.title && (
                                                <h3 className={`text-xs text-center tracking-widest ${subtextColor}`}>
                                                    {section.title}
                                                </h3>
                                            )}

                                            <div className={section.layout === 'carousel' ? 'flex gap-3 overflow-x-auto no-scrollbar pb-2' : 'space-y-3'}>
                                                {section.items.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className={`relative overflow-hidden group transition-all p-4 flex items-center gap-4 ${section.layout === 'carousel' ? 'min-w-[140px] aspect-square flex-col justify-center text-center' : 'w-full'}`}
                                                        style={{
                                                            borderRadius: '1.25rem',
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                                            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
                                                        }}
                                                    >
                                                        {item.imageUrl && (
                                                            <div className={section.layout === 'carousel' ? 'w-full h-full absolute inset-0' : 'w-10 h-10 rounded-lg overflow-hidden shrink-0'}>
                                                                <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                                                                {section.layout === 'carousel' && <div className="absolute inset-0 bg-black/40"></div>}
                                                            </div>
                                                        )}

                                                        {item.iconName && ICON_COMPONENTS[item.iconName] && !item.imageUrl && (
                                                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-100'}`}>
                                                                {React.createElement(ICON_COMPONENTS[item.iconName], { size: 18, style: { color: brandColor } })}
                                                            </div>
                                                        )}

                                                        {!item.imageUrl && !item.iconName && (
                                                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-100'}`}>
                                                                {item.type === 'link' && <Link2 size={18} className={subtextColor} />}
                                                                {item.type === 'form' && <Star size={18} className={subtextColor} />}
                                                                {item.type === 'service' && <Briefcase size={18} className={subtextColor} />}
                                                                {item.type === 'calendar' && <Calendar size={18} className={subtextColor} />}
                                                            </div>
                                                        )}

                                                        <div className={`relative z-10 flex-1 min-w-0 ${section.layout === 'carousel' ? 'flex flex-col items-center' : ''}`}>
                                                            <h4 className={`text-sm font-semibold truncate ${section.layout === 'carousel' ? 'text-white' : textColor}`}>
                                                                {item.title}
                                                            </h4>
                                                            {item.subtitle && (
                                                                <p className={`text-xs font-bold truncate ${section.layout === 'carousel' ? 'text-white/60' : subtextColor}`}>
                                                                    {item.subtitle}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {section.layout === 'list' && <ChevronRight size={14} className={subtextColor} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Branding */}
                        <div className="mt-12 mb-8 flex flex-col items-center gap-4">
                            <div className="px-5 py-2.5 rounded-full bg-black text-white text-xs flex items-center gap-2">
                                <Sparkles size={12} style={{ color: brandColor }} />
                                Créer un Pretalk
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useAnnouncements } from '../../hooks/useAnnouncements';

export default function AnnouncementRenderer() {
    const { priorityAnnouncement, dismissAnnouncement, trackEvent } = useAnnouncements();
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (priorityAnnouncement) {
            // 1. apply delay
            const delayMs = (priorityAnnouncement.delay_seconds || 0) * 1000;

            const renderTimer = setTimeout(() => {
                setShouldRender(true);
                // Track view when it actually renders
                trackEvent(priorityAnnouncement.id, 'view');

                // Add small delay for animation entry after mount
                setTimeout(() => setMounted(true), 100);
            }, delayMs);

            return () => clearTimeout(renderTimer);
        } else {
            setMounted(false);
            setTimeout(() => setShouldRender(false), 500); // Wait for exit anim
        }
    }, [priorityAnnouncement]);

    if (!shouldRender || !priorityAnnouncement) return null;

    const ann = priorityAnnouncement;

    if (ann.layout_type === 'split_modal') {
        return (
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-out ${mounted ? 'opacity-100' : 'opacity-0 pointer-events-none delay-100'}`}>
                {/* Backdrop overlay */}
                <div className="absolute inset-0 bg-dark/60 backdrop-blur-md" onClick={() => dismissAnnouncement(ann.id)}></div>

                {/* Modal Content */}
                <div
                    className={`relative bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-transform duration-500 ease-out ${mounted ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
                    style={{ background: 'var(--violet-vif-gradient, white)' }}
                >
                    {/* Close Button mobile */}
                    <button
                        onClick={() => dismissAnnouncement(ann.id)}
                        className="md:hidden absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-dark backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>

                    {/* Left Side (Text) */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <h2 className="text-3xl md:text-4xl font-semibold text-dark tracking-tight mb-4 leading-tight">
                            {ann.content_title}
                        </h2>
                        {ann.content_text && (
                            <p className="text-neutral-500 text-lg mb-8 font-medium leading-relaxed">
                                {ann.content_text}
                            </p>
                        )}

                        <div className="flex flex-col items-center sm:items-start gap-4 mt-auto md:mt-0">
                            {ann.cta_text && (
                                <a
                                    href={ann.cta_link || '#'}
                                    target={ann.cta_link?.startsWith('http') ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    onClick={() => trackEvent(ann.id, 'click')}
                                    className="w-full sm:w-auto px-8 py-4 bg-dark hover:bg-black text-white rounded-2xl text-base font-semibold transition-all shadow-xl shadow-neutral-200 text-center"
                                >
                                    {ann.cta_text}
                                </a>
                            )}
                            <button
                                onClick={() => dismissAnnouncement(ann.id)}
                                className="text-sm font-bold text-neutral-400 hover:text-dark transition-colors px-2 py-1"
                            >
                                Peut-être plus tard
                            </button>
                        </div>
                    </div>

                    {/* Right Side (Color/Image) */}
                    <div className="relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden" style={{ backgroundColor: ann.theme_color }}>
                        {/* Close Button desktop */}
                        <button
                            onClick={() => dismissAnnouncement(ann.id)}
                            className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white backdrop-blur-md shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        {ann.image_url && (
                            <img
                                src={ann.image_url}
                                alt="Announcement"
                                className="w-full h-auto max-h-[80%] object-contain drop-shadow-2xl animate-in zoom-in duration-700 delay-200 slide-in-from-bottom-8"
                                style={{ animationName: 'float', animationDuration: '6s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}
                            />
                        )}
                        {!ann.image_url && (
                            <div className="text-white/20 font-semibold text-9xl">P.</div>
                        )}
                    </div>
                </div>

                {/* Global CSS for floating animation if not in tailwind */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
        `}} />
            </div>
        );
    }

    if (ann.layout_type === 'top_banner') {
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '72, 217, 81';
        };
        const rgbColor = hexToRgb(ann.theme_color || '#48D951');

        return (
            <div
                className={`relative w-full z-[70] text-white shadow-lg transition-all duration-700 ease-out ${mounted ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                style={{ 
                    backgroundColor: ann.theme_color,
                    backgroundImage: `radial-gradient(circle at 70% -20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 10% 120%, rgba(0,0,0,0.1) 0%, transparent 40%)`
                }}
            >
                <div className="pl-4 pr-12 py-3 mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 relative min-h-[50px] overflow-hidden">
                    {/* Irregular blur spots */}
                    <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-black/10 blur-3xl rounded-full translate-y-1/2"></div>
                    
                    <div className="text-sm sm:text-base font-bold tracking-tight text-center relative z-10 flex items-center gap-2">
                        <Sparkles size={16} className="text-white/80 animate-pulse" />
                        {ann.content_title}
                        {ann.content_text && <span className="hidden md:inline font-medium opacity-90 ml-2">— {ann.content_text}</span>}
                    </div>

                    {ann.cta_text && (
                        <a
                            href={ann.cta_link || '#'}
                            target={ann.cta_link?.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            onClick={() => trackEvent(ann.id, 'click')}
                            className="px-6 py-2 bg-white text-dark rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex-shrink-0 relative z-10"
                            style={{ color: ann.theme_color }}
                        >
                            {ann.cta_text}
                        </a>
                    )}

                    <button
                        onClick={() => dismissAnnouncement(ann.id)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    if (ann.layout_type === 'bottom_right_card') {
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '79, 70, 229';
        };

        const rgbColor = hexToRgb(ann.theme_color || '#4f46e5');

        return (
            <div
                className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'}`}
            >
                <div
                    className="relative bg-white rounded-[28px] overflow-hidden"
                    style={{
                        boxShadow: `0 24px 48px -12px rgba(${rgbColor}, 0.2), 0 0 0 1px rgba(${rgbColor}, 0.05)`,
                        background: '#FFFFFF'
                    }}
                >
                    <button
                        onClick={() => dismissAnnouncement(ann.id)}
                        className="absolute top-4 right-4 p-2 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-dark z-20"
                        title="Fermer"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>

                    <div className="p-7">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div
                                    className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-inner"
                                    style={{ backgroundColor: `rgba(${rgbColor}, 0.1)`, color: ann.theme_color }}
                                >
                                    <Sparkles size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex-1 pr-4">
                                <h3 className="text-[17px] font-semibold text-dark mb-2 leading-tight">
                                    {ann.content_title}
                                </h3>
                                {ann.content_text && (
                                    <p className="text-[13px] text-neutral-500 font-medium leading-[1.6]">
                                        {ann.content_text}
                                    </p>
                                )}
                            </div>
                        </div>

                        {ann.cta_text && (
                            <div className="mt-6 flex justify-end">
                                <a
                                    href={ann.cta_link || '#'}
                                    target={ann.cta_link?.startsWith('http') ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    onClick={() => trackEvent(ann.id, 'click')}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.97] bg-primary-500 shadow-xl shadow-primary-500/20"
                                >
                                    {ann.cta_text}
                                    <ArrowRight size={16} strokeWidth={2.5} />
                                </a>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-7 opacity-30 select-none">
                            <p className="text-[8px] font-bold tracking-[0.15em] uppercase text-[#9A9A9A]">
                                <a href="https://pretalk.me" target="_blank" rel="noopener noreferrer" className="hover:text-dark transition-colors font-bold">Pretalk</a> powered by <a href="https://elevyup.com" target="_blank" rel="noopener noreferrer" className="hover:text-dark transition-colors">elevyup</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

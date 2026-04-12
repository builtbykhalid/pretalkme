import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface LivePreviewProps {
    url: string; // Full URL to load in iframe (e.g., /username or /app/form/123)
    refreshKey?: number | string; // Change this to refresh iframe
    device?: 'mobile' | 'desktop';
    title?: string;
    showControls?: boolean;
}

export default function LivePreview({ 
    url, 
    refreshKey = 0, 
    device = 'mobile',
    title = 'Aperçu en direct',
    showControls = true
}: LivePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Refresh iframe when refreshKey changes
    useEffect(() => {
        if (iframeRef.current) {
            setRefreshing(true);
            iframeRef.current.src = `${url}?bust=${Date.now()}`;
        }
    }, [refreshKey, url]);

    const handleIframeLoad = () => {
        setLoading(false);
        setRefreshing(false);
        setError(null);
    };

    const handleIframeError = () => {
        setLoading(false);
        setRefreshing(false);
        setError('Impossible de charger l\'aperçu');
    };

    const manualRefresh = () => {
        if (iframeRef.current) {
            setRefreshing(true);
            iframeRef.current.src = `${url}?bust=${Date.now()}`;
        }
    };

    return (
        <section className="hidden lg:flex flex-col items-center bg-neutral-100/50 p-8 sticky top-[105px] h-[calc(100vh-180px)] overflow-hidden transition-all duration-500 w-[420px] 2xl:w-[500px] shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-6 relative z-20">
                <span className="text-xs font-semibold text-neutral-400">
                    {title}
                </span>
                {showControls && (
                    <button
                        onClick={manualRefresh}
                        disabled={refreshing || loading}
                        className={`p-2 rounded-lg transition-all ${
                            refreshing || loading
                                ? 'text-neutral-300 cursor-not-allowed'
                                : 'text-neutral-500 hover:text-dark hover:bg-white active:scale-95'
                        }`}
                        title="Rafraîchir l'aperçu"
                    >
                        <RotateCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>

            {/* Device Frame Container */}
            <div className="relative w-full flex-1 flex items-center justify-center">
                {error && (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-4 text-center">
                        <AlertTriangle size={48} className="text-amber-400" />
                        <div>
                            <p className="text-sm font-bold text-dark">{error}</p>
                            <p className="text-xs text-neutral-500 mt-1">Vérifiez que votre profil est publié</p>
                        </div>
                        <button
                            onClick={manualRefresh}
                            className="mt-4 px-4 py-2 bg-dark text-white text-xs font-bold rounded-lg hover:scale-105 transition-all"
                        >
                            Réessayer
                        </button>
                    </div>
                )}

                {/* Device Shell */}
                <div
                    className={`relative transition-all duration-700 ease-in-out bg-neutral-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)]
                        ${
                            device === 'mobile'
                                ? 'w-[320px] h-[650px] rounded-[3.5rem] p-3 border-[6px] border-neutral-800'
                                : 'w-full max-w-sm h-[550px] rounded-3xl p-4 pt-12 border-[8px] border-neutral-800'
                        }`}
                >
                    {/* Device Top Decorations */}
                    {device === 'mobile' ? (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-3xl z-50 flex items-center justify-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800/80" />
                            <div className="w-10 h-1.5 rounded-full bg-neutral-800/80" />
                        </div>
                    ) : (
                        <div className="absolute top-0 left-0 right-0 h-10 bg-neutral-800 rounded-t-lg flex items-center px-4 gap-1.5 z-50">
                            <div className="w-3 h-3 rounded-full bg-neutral-600" />
                            <div className="w-3 h-3 rounded-full bg-neutral-600" />
                            <div className="w-3 h-3 rounded-full bg-neutral-600" />
                            <div className="ml-4 flex-1 max-w-xs h-5 bg-neutral-700 rounded-md flex items-center px-3">
                                <span className="text-xs text-neutral-500 font-mono truncate">
                                    {url.replace(/\?.*/, '')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* iFrame Content */}
                    <div
                        className={`w-full h-full overflow-hidden relative
                            ${device === 'mobile' ? 'rounded-[2.75rem]' : 'rounded-xl'}`}
                    >
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-dark animate-spin" />
                                    <span className="text-xs font-bold text-neutral-500">Chargement...</span>
                                </div>
                            </div>
                        )}

                        {!error && (
                            <iframe
                                ref={iframeRef}
                                src={`${url}?bust=${Date.now()}`}
                                className="w-full h-full border-none"
                                onLoad={handleIframeLoad}
                                onError={handleIframeError}
                                title="Live Preview"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                        )}
                    </div>
                </div>

                {/* Background Blur Decoration */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-indigo-500/20 rounded-full blur-[120px] opacity-50" />
            </div>
        </section>
    );
}

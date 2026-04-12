import React, { useRef, useEffect } from 'react';

interface RealTimeProfilePreviewProps {
    username?: string;
    refreshKey?: number;
}

export default function RealTimeProfilePreview({
    username,
    refreshKey = 0,
}: RealTimeProfilePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Reload iframe when refreshKey changes (after save)
    useEffect(() => {
        if (refreshKey > 0 && iframeRef.current) {
            iframeRef.current.src = `/${username}?t=${Date.now()}`;
        }
    }, [refreshKey, username]);

    if (!username) return null;

    // Phone frame dimensions
    const PHONE_W = 340;
    const PHONE_H = 700;
    // Render iframe at mobile viewport width, scale to fit screen area
    const VIEWPORT_W = 390;
    // Screen area inside phone (after p-3 padding + border-[5px])
    const SCREEN_W = PHONE_W - 24 - 10; // 306px
    const SCREEN_H = PHONE_H - 24 - 10; // 666px
    const SCALE = SCREEN_W / VIEWPORT_W; // ~0.785
    const VIEWPORT_H = SCREEN_H / SCALE; // ~848px

    return (
        <div className="flex justify-center">
            <div
                className="relative bg-neutral-900 rounded-[3rem] p-3 border-[5px] border-neutral-800 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.25)]"
                style={{ width: PHONE_W, height: PHONE_H }}
            >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-neutral-900 rounded-b-2xl z-20 flex items-center justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-neutral-800" />
                    <div className="w-8 h-1.5 rounded-full bg-neutral-800" />
                </div>

                {/* Screen */}
                <div className="w-full h-full rounded-[2.25rem] overflow-hidden bg-[#221A40]">
                    <iframe
                        ref={iframeRef}
                        src={`/${username}`}
                        className="border-0 origin-top-left"
                        style={{
                            width: VIEWPORT_W,
                            height: VIEWPORT_H,
                            transform: `scale(${SCALE})`,
                        }}
                        title="Aperçu du profil"
                    />
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-neutral-700" />
            </div>
        </div>
    );
}

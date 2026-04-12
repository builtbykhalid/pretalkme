import React from 'react';
import { Eye, Edit3, Smartphone, Monitor } from 'lucide-react';

interface ImmersivePhoneProps {
    viewMode: 'edit' | 'preview';
    onModeChange: (mode: 'edit' | 'preview') => void;
    deviceType: 'mobile' | 'desktop';
    onDeviceChange: (device: 'mobile' | 'desktop') => void;
    children: React.ReactNode;
}

export default function ImmersivePhone({
    viewMode,
    onModeChange,
    deviceType,
    onDeviceChange,
    children
}: ImmersivePhoneProps) {
    const isMobile = deviceType === 'mobile';

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-start pt-12">
            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 5px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #E5E5E5;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #D4D4D4;
                    }
                `}
            </style>
            {/* External Controls Wrapper */}
            <div className="flex items-center gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* Device Switcher */}
                <div className="flex items-center gap-1 bg-white border border-neutral-200 p-1 rounded-xl shadow-sm">
                    <button
                        onClick={() => onDeviceChange('mobile')}
                        className={`p-1.5 rounded-lg transition-all ${isMobile ? 'bg-dark text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-50'}`}
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => onDeviceChange('desktop')}
                        className={`p-1.5 rounded-lg transition-all ${!isMobile ? 'bg-dark text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-50'}`}
                    >
                        <Monitor size={16} />
                    </button>
                </div>

                {/* Mode Switcher (Now External) */}
                <div className="flex items-center gap-1 bg-white border border-neutral-200 p-1 rounded-xl shadow-sm">
                    <button
                        onClick={() => onModeChange('edit')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'edit' ? 'bg-dark text-white shadow-sm' : 'text-neutral-400 hover:bg-neutral-50'}`}
                    >
                        <Edit3 size={14} />
                        Editeur
                    </button>
                    <button
                        onClick={() => onModeChange('preview')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-dark text-white shadow-sm' : 'text-neutral-400 hover:bg-neutral-50'}`}
                    >
                        <Eye size={14} />
                        Preview
                    </button>
                </div>
            </div>

            {/* Immersive Frame - Focused on Top Part */}
            <div
                className={`relative transition-all duration-700 ease-in-out bg-white border border-[#0D0D0D] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden rounded-t-[40px] border-b-0 ${isMobile
                        ? 'w-[360px] h-[800px]'
                        : 'w-[90%] max-w-[1200px] h-[800px]'
                    }`}
            >
                {/* Content Area - Added huge bottom padding for readability in cropped view */}
                <div className="w-full h-full pt-8 pb-[450px] overflow-y-auto bg-[#FBFBFB] custom-scrollbar">
                    {children}
                </div>

                {/* Notch for mobile */}
                {isMobile && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0D0D0D] rounded-b-2xl z-40" />
                )}
            </div>
        </div>
    );
}

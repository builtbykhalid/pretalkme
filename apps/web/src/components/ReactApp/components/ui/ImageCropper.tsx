import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
    image: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onCancel }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: any) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: any
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        // Set canvas size to the requested 225x225
        canvas.width = 225;
        canvas.height = 225;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            225,
            225
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    };

    const handleDone = async () => {
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
            if (croppedBlob) {
                onCropComplete(croppedBlob);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-300 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col h-[600px] border border-white/20">

                {/* Header */}
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div>
                        <h3 className="text-lg font-semibold text-dark tracking-tight">Recadrer l'image</h3>
                        <p className="text-xs font-bold text-neutral-400 mt-1">Zone fixe 225 x 225 px</p>
                    </div>
                    <button onClick={onCancel} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="flex-1 relative bg-black/5">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                        objectFit="contain"
                        showGrid={true}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 bg-white space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut size={16} className="text-neutral-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                        <ZoomIn size={16} className="text-neutral-400" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
                            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 transition-all active:scale-95"
                        >
                            <RotateCcw size={14} />Réinitialiser
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onCancel}
                                className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-dark transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDone}
                                className="flex items-center gap-2 px-8 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Check size={16} /> Terminer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

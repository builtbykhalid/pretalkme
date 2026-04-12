import { useState } from 'react';
import { useApp } from '../context/AppContext';

// In-memory URL cache to avoid creating/revoking object URLs repeatedly
// and to avoid repeated signed URL fetches.
const urlCache: Map<string, { url: string; expiresAt: number; isObjectUrl?: boolean }> = new Map();

// Validate that a file is actually an image by checking its magic bytes
async function validateImageFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            if (!buffer) {
                resolve(false);
                return;
            }
            const bytes = new Uint8Array(buffer, 0, 4);
            // Check magic bytes for common image formats
            if (bytes.length < 4) {
                resolve(false);
                return;
            }

            // PNG: 89 50 4E 47
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                resolve(true);
                return;
            }

            // JPEG: FF D8 FF
            if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                resolve(true);
                return;
            }

            // WebP: 52 49 46 46 (RIFF)
            if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
                resolve(true);
                return;
            }

            // GIF: 47 49 46 38
            if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
                resolve(true);
                return;
            }

            resolve(false);
        };
        reader.onerror = () => resolve(false);
        reader.readAsArrayBuffer(file.slice(0, 4));
    });
}

interface UploadProgress {
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export function useFileUpload() {
    const { uploadFile, deleteFile, getSignedUrl } = useApp();
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        isUploading: false,
        progress: 0,
        error: null
    });

    const handleFileUpload = async (
        file: File,
        bucket: 'avatars' | 'documents' | 'logos' | 'forms',
        folder?: string
    ): Promise<string | null> => {
        setUploadProgress({ isUploading: true, progress: 0, error: null });

        try {
            // Validate file size
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                setUploadProgress({
                    isUploading: false,
                    progress: 0,
                    error: 'Image trop lourde (max 2 Mo)'
                });
                return null;
            }

            // Validate file type based on bucket
            const validMimes: Record<string, string[]> = {
                avatars: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                logos: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'],
                forms: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            };

            // Normalize the MIME type (strip charset) before validation
            const rawType = file.type || '';
            const mimeType = rawType.split(';')[0].trim();

            if (!validMimes[bucket].includes(mimeType)) {
                setUploadProgress({
                    isUploading: false,
                    progress: 0,
                    error: `Type de fichier non supporté pour ${bucket} (${rawType})`
                });
                return null;
            }

            // For image buckets, validate that the file content is actually an image
            if (bucket === 'avatars' || bucket === 'logos' || bucket === 'forms') {
                const isValidImage = await validateImageFile(file);
                if (!isValidImage) {
                    setUploadProgress({
                        isUploading: false,
                        progress: 0,
                        error: 'Le fichier sélectionné n\'est pas une image valide'
                    });
                    return null;
                }
            }

            // Upload file
            setUploadProgress({ isUploading: true, progress: 50, error: null });
            const filePath = await uploadFile(file, bucket, folder);

            if (!filePath) {
                setUploadProgress({
                    isUploading: false,
                    progress: 0,
                    error: 'Erreur lors de l\'upload'
                });
                return null;
            }

            setUploadProgress({ isUploading: false, progress: 100, error: null });
            return filePath;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            setUploadProgress({
                isUploading: false,
                progress: 0,
                error: errorMessage
            });
            return null;
        }
    };

    const handleFileDelete = async (path: string, bucket: 'avatars' | 'documents' | 'logos' | 'forms'): Promise<boolean> => {
        try {
            const success = await deleteFile(path, bucket);
            if (!success) {
                setUploadProgress({
                    isUploading: false,
                    progress: 0,
                    error: 'Erreur lors de la suppression'
                });
            }
            return success;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            setUploadProgress({
                isUploading: false,
                progress: 0,
                error: errorMessage
            });
            return false;
        }
    };

    const cacheUrl = (key: string, url: string, ttlMs: number, isObjectUrl: boolean = false) => {
        urlCache.set(key, { url, expiresAt: Date.now() + ttlMs, isObjectUrl });
        // schedule a cleanup for object URLs when TTL expires
        setTimeout(() => {
            const entry = urlCache.get(key);
            if (!entry) return;
            if (entry.expiresAt <= Date.now()) {
                if (entry.isObjectUrl) {
                    try { URL.revokeObjectURL(entry.url); } catch (e) { }
                }
                urlCache.delete(key);
            }
        }, ttlMs + 1000);
    };

    const clearCachedUrl = (path?: string) => {
        if (path) {
            const entry = urlCache.get(path);
            if (entry && entry.isObjectUrl) {
                try { URL.revokeObjectURL(entry.url); } catch (e) { }
            }
            urlCache.delete(path);
            return;
        }
        for (const [k, entry] of urlCache.entries()) {
            if (entry.isObjectUrl) {
                try { URL.revokeObjectURL(entry.url); } catch (e) { }
            }
            urlCache.delete(k);
        }
    };

    const getFileUrl = async (path: string, bucket: 'avatars' | 'documents' | 'logos' | 'forms', expiresIn: number = 3600): Promise<string | null> => {
        try {
            if (!path) return null;

            // Return cached URL when available
            const cached = urlCache.get(path);
            if (cached && cached.expiresAt > Date.now()) {
                return cached.url;
            }

            // If it's already a full URL
            if (path.startsWith('http://') || path.startsWith('https://')) {
                cacheUrl(path, path, 24 * 60 * 60 * 1000, false);
                return path;
            }

            // Data URL -> create object URL (no fetch), cache it for 30 minutes
            if (path.startsWith('data:')) {
                const obj = dataUrlToObjectUrl(path);
                if (obj) {
                    cacheUrl(path, obj, 30 * 60 * 1000, true);
                    return obj;
                }
                cacheUrl(path, path, 30 * 60 * 1000, false);
                return path;
            }

            // Otherwise resolve via getSignedUrl (or public URL). Cache for slightly less than expiresIn.
            const url = await getSignedUrl(path, bucket, expiresIn);
            if (url) {
                const ttl = Math.max(5 * 60 * 1000, (expiresIn - 10) * 1000); // at least 5min
                cacheUrl(path, url, ttl, false);
                return url;
            }

            return null;
        } catch (error) {
            console.error('Error getting file URL:', error);
            return null;
        }
    };

    // Helper: convert data:<mime>;base64,... to an object URL without using fetch
    const dataUrlToObjectUrl = (dataUrl: string): string | null => {
        try {
            // Format: data:[<mime type>][;base64],<data>
            const match = dataUrl.match(/^data:(.+?)(;base64)?,(.*)$/);
            if (!match) return null;
            const mime = match[1];
            const isBase64 = !!match[2];
            const dataPart = match[3] || '';

            let byteString: string;
            if (isBase64) {
                // atob may throw for invalid input
                byteString = atob(dataPart);
            } else {
                byteString = decodeURIComponent(dataPart);
            }

            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mime });
            return URL.createObjectURL(blob);
        } catch (err) {
            console.warn('dataUrlToObjectUrl failed:', err);
            return null;
        }
    };


    return {
        uploadProgress,
        handleFileUpload,
        handleFileDelete,
        getFileUrl,
        clearCachedUrl,
    };
}

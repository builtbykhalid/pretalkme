import React, { useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadProps {
    bucket: 'avatars' | 'documents' | 'logos';
    folder?: string;
    onSuccess: (filePath: string) => void;
    onError?: (error: string) => void;
    accept?: string;
    maxSize?: number; // in MB
    label?: string;
    currentFile?: string;
}

export function FileUpload({
    bucket,
    folder,
    onSuccess,
    onError,
    accept = 'image/*',
    maxSize = 5,
    label = 'Uploader un fichier',
    currentFile
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { uploadProgress, handleFileUpload, handleFileDelete } = useFileUpload();

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await handleFileUpload(file, bucket, folder);
        
        if (result) {
            onSuccess(result);
            // Reset input
            if (inputRef.current) inputRef.current.value = '';
        } else if (onError) {
            onError(uploadProgress.error || 'Upload failed');
        }
    };

    const handleDelete = async () => {
        if (!currentFile) return;
        const success = await handleFileDelete(currentFile, bucket);
        if (success && onSuccess) {
            onSuccess(''); // Clear the file
        }
    };

    return (
        <div className="space-y-3">
            {uploadProgress.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} />
                    {uploadProgress.error}
                </div>
            )}

            {!currentFile ? (
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleChange}
                        disabled={uploadProgress.isUploading}
                        className="hidden"
                    />
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploadProgress.isUploading}
                        className="w-full py-3 px-4 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 font-medium hover:border-primary-400 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Upload size={18} />
                        {uploadProgress.isUploading ? `Uploading (${uploadProgress.progress}%)` : label}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <span className="text-sm text-neutral-700 truncate">{currentFile.split('/').pop()}</span>
                    <button
                        onClick={handleDelete}
                        disabled={uploadProgress.isUploading}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <p className="text-xs text-neutral-500">
                Max {maxSize}MB • Formats acceptés: {accept}
            </p>
        </div>
    );
}






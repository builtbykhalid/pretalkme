import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFileUpload } from '../../hooks/useFileUpload';
import ImageCropper from './ImageCropper';

interface UserAvatarProps {
    /** Size in pixels */
    size?: number;
    /** Allow clicking to upload a new avatar */
    editable?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Border radius class override (default: rounded-lg) */
    rounded?: string;
}

export default function UserAvatar({
    size = 32,
    editable = false,
    className = '',
    rounded = 'rounded-lg'
}: UserAvatarProps) {
    const { userProfile, updateProfile } = useApp();
    const { handleFileUpload, getFileUrl } = useFileUpload();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [cropperImage, setCropperImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Resolve avatar URL from userProfile.avatar_url
    useEffect(() => {
        const loadAvatar = async () => {
            if (!userProfile?.avatar_url) {
                setAvatarUrl(null);
                return;
            }

            // If it's already a full URL (e.g. from Google OAuth)
            if (userProfile.avatar_url.startsWith('http')) {
                setAvatarUrl(userProfile.avatar_url);
                return;
            }

            // Otherwise resolve from Supabase storage
            const url = await getFileUrl(userProfile.avatar_url, 'avatars');
            setAvatarUrl(url);
        };
        loadAvatar();
    }, [userProfile?.avatar_url, getFileUrl]);

    const initials = userProfile?.first_name && userProfile?.last_name
        ? `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
        : userProfile?.email?.[0]?.toUpperCase() || 'U';

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropperImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = async (blob: Blob) => {
        setCropperImage(null);
        setUploading(true);
        try {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            const filePath = await handleFileUpload(file, 'avatars');
            if (filePath) {
                const url = await getFileUrl(filePath, 'avatars');
                if (url) {
                    setAvatarUrl(url);
                }
                await updateProfile({ avatar_url: filePath });
            }
        } catch (err) {
            console.error('Avatar upload failed:', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const sizeStyle = { width: size, height: size, minWidth: size, minHeight: size };
    const fontSize = Math.max(10, Math.round(size * 0.35));

    return (
        <div className={`relative inline-flex group ${className}`}>
            {editable && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleUpload}
                    className="hidden"
                />
            )}

            <button
                type="button"
                onClick={editable ? () => fileInputRef.current?.click() : undefined}
                className={`${rounded} overflow-hidden flex items-center justify-center transition-all ${editable ? 'cursor-pointer hover:ring-2 hover:ring-primary-300 hover:ring-offset-1' : 'cursor-default'
                    }`}
                style={sizeStyle}
                title={editable ? 'Changer la photo de profil' : userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : 'Profil'}
            >
                {uploading ? (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <Loader2 size={Math.round(size * 0.4)} className="animate-spin text-primary-600" />
                    </div>
                ) : avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name}` : 'Avatar'}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarUrl(null)}
                    />
                ) : (
                    <div
                        className="w-full h-full bg-primary-600 text-white flex items-center justify-center"
                        style={{ fontSize }}
                    >
                        {initials}
                    </div>
                )}

                {/* Edit overlay on hover */}
                {editable && !uploading && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[inherit]">
                        <Camera size={Math.round(size * 0.3)} className="text-white" />
                    </div>
                )}
            </button>

            {/* Delete button (top-right absolute) */}
            {editable && avatarUrl && !uploading && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setAvatarUrl(null);
                        updateProfile({ avatar_url: null });
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Supprimer la photo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}

            {cropperImage && (
                <ImageCropper
                    image={cropperImage}
                    onCancel={() => setCropperImage(null)}
                    onCropComplete={onCropComplete}
                />
            )}
        </div>
    );
}

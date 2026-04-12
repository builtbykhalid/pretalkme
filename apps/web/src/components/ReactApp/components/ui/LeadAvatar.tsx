import React from 'react';

interface LeadAvatarProps {
    name?: string;
    id?: string | number;
    sizeClassName?: string;
    fontSizeClassName?: string;
    roundedClassName?: string;
    className?: string;
}

const COLORS = [
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-sky-100', text: 'text-sky-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
];

export const LeadAvatar = ({
    name = 'Lead',
    id,
    sizeClassName = 'w-11 h-11',
    fontSizeClassName = 'text-sm',
    roundedClassName = 'rounded-lg',
    className = ''
}: LeadAvatarProps) => {
    // Determine initials
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'L';

    // Simple hash to select a color consistenly
    const hashString = (id?.toString() || name || '');
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
        hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % COLORS.length;
    const color = COLORS[colorIndex];

    return (
        <div 
            className={`${sizeClassName} ${roundedClassName} ${color.bg} ${color.text} flex items-center justify-center ${fontSizeClassName} font-bold shadow-sm ${className}`}
            title={name}
        >
            {initials}
        </div>
    );
};

export default LeadAvatar;

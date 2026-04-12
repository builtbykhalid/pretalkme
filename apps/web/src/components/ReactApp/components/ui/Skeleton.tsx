import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
}) => {
    const baseClass = "animate-pulse bg-[#EEEEEE]";
    const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded-md h-4' : 'rounded-2xl';

    const style: React.CSSProperties = {
        width: width || undefined,
        height: height || undefined,
    };

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`}
            style={style}
        />
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="w-full space-y-4">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-[2rem] border border-neutral-100">
                    <Skeleton variant="circular" width={48} height={48} className="shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="60%" />
                    </div>
                    <Skeleton variant="rectangular" width={100} height={40} className="hidden md:block" />
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(cards)].map((_, i) => (
                <div key={i} className="premium-card p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
                        <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="40%" />
                    </div>
                    <div className="pt-4 border-t border-neutral-50 flex gap-2">
                        <Skeleton variant="rectangular" width="100%" height={40} />
                        <Skeleton variant="rectangular" width={40} height={40} />
                    </div>
                </div>
            ))}
        </div>
    );
};

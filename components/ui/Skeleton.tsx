import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular'
}) => {
    const baseClasses = 'animate-pulse bg-gray-700/50';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            aria-live="polite"
            aria-busy="true"
        />
    );
};

export default Skeleton;

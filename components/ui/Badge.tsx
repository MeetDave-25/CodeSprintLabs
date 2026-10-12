import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
    className?: string;
    pulse?: boolean;
    dot?: boolean;
}

const variants = {
    default: 'bg-white/[0.06] text-gray-300 ring-white/10',
    success: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
    danger: 'bg-red-500/10 text-red-300 ring-red-500/25',
    info: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
    brand: 'bg-brand-500/10 text-brand-300 ring-brand-500/25',
};

const dots = {
    default: 'bg-gray-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-sky-400',
    brand: 'bg-brand-400',
};

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className,
    pulse = false,
    dot = false,
}) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap',
                variants[variant],
                className
            )}
        >
            {(dot || pulse) && (
                <span className="relative flex h-1.5 w-1.5">
                    {pulse && <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', dots[variant])} />}
                    <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dots[variant])} />
                </span>
            )}
            {children}
        </span>
    );
};

export default Badge;

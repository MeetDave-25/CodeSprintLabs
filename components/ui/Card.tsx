'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover3d?: boolean;
    glow?: boolean;
    onClick?: () => void;
}

// Plain div (no per-card motion): hundreds of cards render across the app,
// and calm hover states read more premium than scaling.
export const Card: React.FC<CardProps> = ({
    children,
    className,
    hover3d = false,
    glow = false,
    onClick
}) => {
    const interactive = hover3d || !!onClick;

    return (
        <div
            className={cn(
                'surface rounded-xl p-6 transition-[transform,border-color,box-shadow] duration-200 ease-out',
                interactive && 'hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-elevated',
                glow && 'hover:shadow-glow hover:border-brand-500/30',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return (
        <div className={cn('mb-4', className)}>
            {children}
        </div>
    );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return (
        <h3 className={cn('text-lg font-semibold tracking-tight text-white', className)}>
            {children}
        </h3>
    );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return (
        <p className={cn('text-gray-400 text-sm mt-1 leading-relaxed', className)}>
            {children}
        </p>
    );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return (
        <div className={cn('mt-4 pt-4 border-t border-white/[0.07]', className)}>
            {children}
        </div>
    );
};

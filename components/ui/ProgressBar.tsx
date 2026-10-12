'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    animated?: boolean;
}

const variants = {
    default: 'from-brand-500 to-brand-400',
    success: 'from-emerald-500 to-teal-400',
    warning: 'from-amber-500 to-yellow-400',
    danger: 'from-red-500 to-rose-400',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    className,
    showLabel = true,
    variant = 'default',
    animated = true,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-end items-center mb-1.5 text-xs">
                    <span className="font-mono font-medium text-gray-200 tabular-nums">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div
                className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden ring-1 ring-inset ring-white/[0.04]"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: animated ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] }}
                    className={cn('h-full bg-gradient-to-r rounded-full', variants[variant])}
                />
            </div>
        </div>
    );
};

export default ProgressBar;

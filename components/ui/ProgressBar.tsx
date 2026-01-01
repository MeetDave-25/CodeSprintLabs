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

const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    className,
    showLabel = true,
    variant = 'default',
    animated = true,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
        default: 'from-purple-600 to-pink-600',
        success: 'from-green-500 to-emerald-500',
        warning: 'from-yellow-500 to-orange-500',
        danger: 'from-red-500 to-pink-500',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className="flex justify-between items-center mb-2">
                {showLabel && (
                    <span className="text-sm font-medium text-gray-300">
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
                    className={cn(
                        'h-full bg-gradient-to-r rounded-full',
                        variants[variant]
                    )}
                />
            </div>
        </div>
    );
};

export default ProgressBar;

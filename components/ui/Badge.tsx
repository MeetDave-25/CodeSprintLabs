'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
    pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className,
    pulse = false
}) => {
    const variants = {
        default: 'bg-gray-600 text-white',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    };

    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                variants[variant],
                pulse && 'animate-pulse',
                className
            )}
        >
            {children}
        </motion.span>
    );
};

export default Badge;

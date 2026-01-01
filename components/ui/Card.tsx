'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover3d?: boolean;
    glow?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    hover3d = false,
    glow = false,
    onClick
}) => {
    return (
        <motion.div
            whileHover={hover3d ? { scale: 1.01 } : { scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className={cn(
                'glass rounded-xl p-6 transition-all duration-300',
                glow && 'hover:shadow-glow',
                hover3d && 'card-3d',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </motion.div>
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
        <h3 className={cn('text-xl font-bold text-white', className)}>
            {children}
        </h3>
    );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return (
        <p className={cn('text-gray-400 text-sm mt-1', className)}>
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
        <div className={cn('mt-4 pt-4 border-t border-white/10', className)}>
            {children}
        </div>
    );
};

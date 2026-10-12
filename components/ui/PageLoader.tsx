import React from 'react';
import { LogoMark } from '@/components/ui/Logo';

/** Full-screen branded loading state. */
const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-5">
            <div className="relative">
                <span className="absolute inset-0 -m-3 rounded-2xl bg-brand-500/20 blur-xl animate-pulse-slow" />
                <LogoMark size={44} className="relative" />
            </div>
            <div className="h-[3px] w-32 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-shimmer bg-[length:200%_100%]" />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-gray-500">{label}</span>
        </div>
    </div>
);

export default PageLoader;

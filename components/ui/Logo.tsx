import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
    className?: string;
    size?: number;
}

/** Square brand mark: a code chevron with a sprint "speed" bar. */
export const LogoMark: React.FC<LogoMarkProps> = ({ className, size = 32 }) => (
    <span
        className={cn(
            'relative inline-flex shrink-0 items-center justify-center rounded-[28%] text-ink-950',
            'bg-brand-400',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_0_0_1px_rgba(198,255,46,0.4),0_6px_24px_-6px_rgba(198,255,46,0.6)]',
            className
        )}
        style={{ width: size, height: size }}
        aria-hidden
    >
        <svg viewBox="0 0 24 24" fill="none" width={size * 0.6} height={size * 0.6}>
            <path d="M9 7l-5 5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 8h7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
            <path d="M13 12h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
            <path d="M13 16h3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
        </svg>
    </span>
);

interface LogoProps {
    href?: string;
    className?: string;
    size?: number;
    /** Hide the wordmark (icon only). */
    compact?: boolean;
    /** Small caption under the wordmark, e.g. "Admin". */
    caption?: string;
    wordmarkClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ href = '/', className, size = 32, compact = false, caption, wordmarkClassName }) => {
    const content = (
        <>
            <LogoMark size={size} />
            {!compact && (
                <span className={cn('flex flex-col leading-none', wordmarkClassName)}>
                    <span className="text-[15px] font-semibold tracking-tight text-white whitespace-nowrap">
                        CodeSprint<span className="text-gray-500 font-medium"> Labs</span>
                    </span>
                    {caption && (
                        <span className="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-brand-300/80 whitespace-nowrap">
                            {caption}
                        </span>
                    )}
                </span>
            )}
        </>
    );

    return (
        <Link href={href} className={cn('inline-flex items-center gap-2.5 rounded-lg', className)} aria-label="CodeSprint Labs home">
            {content}
        </Link>
    );
};

export default Logo;

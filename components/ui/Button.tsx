import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

const baseStyles =
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium select-none ' +
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 ' +
    'active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';

const variants = {
    primary:
        'text-ink-950 font-semibold bg-brand-400 shadow-button hover:bg-brand-300',
    secondary:
        'text-white bg-white/[0.06] border border-white/10 shadow-card hover:bg-white/[0.1] hover:border-white/15',
    outline:
        'text-gray-100 border border-white/15 bg-transparent hover:bg-white/[0.06] hover:border-white/25',
    ghost:
        'text-gray-300 hover:bg-white/[0.06] hover:text-white',
    danger:
        'text-white bg-red-600 bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_4px_16px_-4px_rgba(220,38,38,0.5)] hover:from-red-400 hover:to-red-600',
    white:
        'text-ink-900 bg-white shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(255,255,255,0.25)] hover:bg-gray-100',
};

const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
};

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps & { href?: string }>(
    ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, href, ...props }, ref) => {
        const classes = cn(baseStyles, variants[variant], sizes[size], className);

        if (href) {
            return (
                <Link
                    href={href}
                    className={classes}
                    // @ts-ignore
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    {...(props as any)}
                >
                    {children}
                </Link>
            );
        }

        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                className={classes}
                disabled={disabled || isLoading}
                aria-busy={isLoading || undefined}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        <span>Please wait…</span>
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;

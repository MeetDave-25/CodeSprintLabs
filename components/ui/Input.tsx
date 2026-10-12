import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    /** Element rendered inside the right edge of the field (e.g. a show-password toggle). */
    rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, icon, rightElement, type = 'text', id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id ?? generatedId;
        const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-200 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                            {icon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        type={type}
                        ref={ref}
                        aria-invalid={!!error || undefined}
                        aria-describedby={describedBy}
                        className={cn(
                            'w-full h-11 px-3.5 rounded-lg text-[15px] text-white placeholder:text-gray-500',
                            'bg-white/[0.03] border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]',
                            'hover:border-white/[0.16]',
                            'focus:outline-none focus:border-brand-500/70 focus:bg-white/[0.045]',
                            icon && 'pl-10',
                            rightElement && 'pr-11',
                            error && 'border-red-500/60 focus:border-red-500/80',
                            className
                        )}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
                            {rightElement}
                        </div>
                    )}
                </div>
                {error ? (
                    <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-400">{error}</p>
                ) : hint ? (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

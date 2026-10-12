'use client';

import React from 'react';
import Link from 'next/link';
import { FACILITY, FOUNDER } from '@/components/home/facility';
import { Brand } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

// Only routes that exist in the app — no dead links.
const columns = [
    {
        title: 'Programs',
        links: [
            { label: 'Internships', href: '/internships' },
            { label: 'Courses', href: '/courses' },
            { label: 'Verify a certificate', href: '/verify-certificate' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Founder', href: FOUNDER.portfolio, external: true },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Sign in', href: '/auth/login' },
            { label: 'Create account', href: '/auth/register' },
            { label: 'Student dashboard', href: '/student/dashboard' },
        ],
    },
];

/**
 * Black footer. `variant="light"` is used on the cream marketing pages and
 * adds a cream gutter plus the oversized wordmark.
 */
const Footer: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'dark' }) => {
    const light = variant === 'light';
    const year = new Date().getFullYear();

    return (
        <footer className={cn(light && 'bg-cream px-3 pb-3 md:px-4 md:pb-4')}>
            <div className={cn('overflow-hidden bg-ink-950 text-white', light ? 'rounded-[36px]' : 'border-t border-white/[0.08]')}>
                <div className="mx-auto max-w-[1200px] px-5 pt-14 md:px-8">
                    <div className="grid gap-10 md:grid-cols-12">
                        <div className="md:col-span-5">
                            <Brand tone="dark" />
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
                                Structured internships, daily coding tasks, mentor reviews and certificates employers can verify.
                            </p>
                        </div>
                        {columns.map((col) => (
                            <div key={col.title} className="md:col-span-2">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">{col.title}</h3>
                                <ul className="mt-4 space-y-3">
                                    {col.links.map((l) => (
                                        <li key={l.label}>
                                            {'external' in l && l.external ? (
                                                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 transition-colors hover:text-white">{l.label}</a>
                                            ) : (
                                                <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">{l.label}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {light && (
                    <div className="select-none overflow-hidden px-4 pb-3 pt-10" aria-hidden>
                        <div className="whitespace-nowrap text-center text-[12.8vw] font-bold leading-[0.85] tracking-[-0.06em] text-white/[0.07]">
                            CodeSprint<span className="text-brand-400/60">Labs</span>
                        </div>
                    </div>
                )}

                <div className="mx-auto flex max-w-[1200px] flex-col gap-3 border-t border-white/10 px-5 py-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between md:px-8">
                    <span>Copyright © {year} CodeSprint Labs. All rights reserved.</span>
                    <span className="flex flex-wrap gap-x-5 gap-y-1">
                        <a href={`mailto:${FACILITY.email}`} className="hover:text-white">{FACILITY.email}</a>
                        <a href={FACILITY.phoneHref} className="hover:text-white">{FACILITY.phone}</a>
                        <span>{FACILITY.city.replace(', IN', ', India')}</span>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

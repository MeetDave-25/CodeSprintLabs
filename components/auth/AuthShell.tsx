'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CheckCircle2, Flame, ShieldCheck } from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const highlights = [
    { icon: Flame, title: 'Daily, real-world tasks', body: 'Build momentum with streaks and mentor reviews.' },
    { icon: CheckCircle2, title: 'Structured programs', body: 'Clear milestones from day one to completion.' },
    { icon: Award, title: 'Verifiable certificates', body: 'Every certificate has a unique public verification code.' },
];

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Form column */}
            <div className="relative flex flex-col px-6 py-8 sm:px-10">
                <div className="flex items-center justify-between">
                    <Logo size={30} />
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white">
                        <ArrowLeft size={15} /> Home
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-[400px]"
                    >
                        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
                        <p className="mt-2 text-gray-400">{subtitle}</p>
                        <div className="mt-8">{children}</div>
                        {footer && <div className="mt-8 text-center text-sm text-gray-400">{footer}</div>}
                    </motion.div>
                </div>

                <p className="text-center text-xs text-gray-600">© {new Date().getFullYear()} CodeSprint Labs</p>
            </div>

            {/* Brand panel */}
            <div className="relative hidden overflow-hidden border-l border-white/[0.06] bg-ink-900 lg:block">
                <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
                <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-brand-600/25 blur-[120px]" aria-hidden />
                <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-brand-600/15 blur-[120px]" aria-hidden />

                <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
                    <div className="eyebrow">CodeSprint Labs</div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-md"
                    >
                        <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight">
                            <span className="text-fade">Where students become</span>{' '}
                            <span className="gradient-text">engineers.</span>
                        </h2>
                        <ul className="mt-10 space-y-6">
                            {highlights.map((h) => (
                                <li key={h.title} className="flex gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-300 shadow-card">
                                        <h.icon size={18} />
                                    </span>
                                    <div>
                                        <div className="font-medium text-white">{h.title}</div>
                                        <div className="mt-0.5 text-sm text-gray-400">{h.body}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <div className="surface flex max-w-md items-center gap-4 rounded-2xl p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                            <ShieldCheck size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white">Certificate verified</div>
                            <div className="truncate font-mono text-xs text-gray-500">Publicly verifiable by code</div>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/25">Valid</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

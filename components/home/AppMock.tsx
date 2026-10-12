'use client';

import React, { useEffect, useState } from 'react';
import { Award, Check, Clock, Download, FileText, Flame, GraduationCap, Lock, Send, ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * Illustrative product UI (student portal) used on the marketing page.
 * Cream / ink / neon palette. All data shown is sample data.
 */

const paper = 'rounded-2xl bg-[#fffdf7] text-ink-950 shadow-[0_1px_0_rgba(0,0,0,0.04),0_14px_30px_-14px_rgba(0,0,0,0.35)]';

const TASK_STATES = [
    { label: 'In progress', cls: 'bg-white/10 text-white', icon: Clock },
    { label: 'Submitted', cls: 'bg-white text-ink-950', icon: Send },
    { label: 'Approved · +50', cls: 'bg-brand-400 text-ink-950', icon: Check },
];

/** Hero card: dark student dashboard whose task moves through review. */
export function DashboardCard({ className }: { className?: string }) {
    const [state, setState] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setState((s) => (s + 1) % TASK_STATES.length), 2600);
        return () => clearInterval(id);
    }, []);
    const st = TASK_STATES[state];
    const points = state === 2 ? 1290 : 1240;

    return (
        <div className={cn('w-full overflow-hidden rounded-[28px] border border-white/10 bg-ink-900 text-white shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]', className)}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <span className="text-xs text-white/50">Student dashboard</span>
                <span className="flex items-center gap-1.5 text-xs text-brand-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" /> Live</span>
            </div>

            <div className="space-y-4 p-5">
                <div>
                    <div className="text-xs text-white/50">Web Development · Week 3 of 8</div>
                    <div className="mt-1 flex items-end justify-between">
                        <div className="text-2xl font-semibold tracking-[-0.02em]">Good morning, Aarav</div>
                        <div className="text-sm text-white/60">62%</div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[62%] rounded-full bg-brand-400" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { l: 'Tasks done', v: '18' },
                        { l: 'Streak', v: '12d' },
                        { l: 'Points', v: points.toLocaleString('en-IN'), neon: true },
                    ].map((k) => (
                        <div key={k.l} className="rounded-2xl bg-white/[0.06] p-3.5">
                            <div className="text-[11px] text-white/50">{k.l}</div>
                            <div className={cn('mt-1 text-2xl font-semibold tracking-[-0.02em] tabular-nums', k.neon && 'text-brand-400')}>{k.v}</div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Task #12 · Backend</span>
                        <span>Due in 6h</span>
                    </div>
                    <div className="mt-1.5 text-[15px] font-medium">Build a REST API with Laravel</div>
                    <div key={state} className={cn('mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', st.cls)}>
                        <st.icon size={13} /> {st.label}
                    </div>
                </div>

                <div className="divide-y divide-white/10 rounded-2xl bg-white/[0.06] text-[13px]">
                    {[
                        { n: 'Offer letter', s: 'Issued', ok: true, i: Download },
                        { n: 'Certificate', s: 'On completion', ok: false, i: Lock },
                    ].map((d) => (
                        <div key={d.n} className="flex items-center justify-between px-4 py-2.5">
                            <span className="flex items-center gap-2.5"><FileText size={14} className="text-white/50" /> {d.n}</span>
                            <span className={cn('flex items-center gap-1.5 text-xs', d.ok ? 'text-brand-400' : 'text-white/40')}>{d.s} <d.i size={12} /></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Small floating cards that orbit the dashboard in the hero. */
export function FloatApproved({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-3 rounded-2xl bg-brand-400 px-4 py-3 text-ink-950 shadow-[0_20px_40px_-16px_rgba(120,160,0,0.7)]', className)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-brand-400"><Check size={18} strokeWidth={3} /></span>
            <div>
                <div className="text-sm font-semibold leading-tight">Task approved</div>
                <div className="text-xs opacity-70">+50 points</div>
            </div>
        </div>
    );
}

export function FloatCert({ className }: { className?: string }) {
    return (
        <div className={cn(paper, 'flex items-center gap-3 px-4 py-3', className)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-brand-400"><ShieldCheck size={18} /></span>
            <div>
                <div className="text-sm font-semibold leading-tight">Certificate verified</div>
                <div className="font-mono text-[11px] opacity-60">CERT-2026-8F3K2Q1M</div>
            </div>
        </div>
    );
}

export function FloatStreak({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_30px_-12px_rgba(0,0,0,0.6)]', className)}>
            <Flame size={16} className="text-orange-400" /> 12-day streak
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Pieces used inside bento tiles and the step viewer                  */
/* ------------------------------------------------------------------ */

export function TaskUI() {
    return (
        <div className={cn(paper, 'w-full max-w-md p-5')}>
            <div className="flex items-center justify-between text-xs">
                <span className="opacity-60">Task #12 · Backend</span>
                <span className="rounded-full bg-brand-400 px-2.5 py-0.5 font-medium">Submitted</span>
            </div>
            <div className="mt-2 text-[17px] font-semibold tracking-[-0.01em]">Build a REST API with Laravel</div>
            <div className="mt-3 rounded-xl bg-ink-950 p-3.5 font-mono text-[12px] leading-relaxed text-white/90">
                <div><span className="text-brand-400">Route</span>::apiResource(&apos;tasks&apos;, TaskController::class);</div>
                <div className="text-white/40">{'// 4 endpoints · tests passing'}</div>
            </div>
        </div>
    );
}

export function StreakUI() {
    return (
        <div className={cn(paper, 'w-full max-w-[290px] p-5')}>
            <div className="flex items-center gap-2 text-xs opacity-60"><Flame size={14} className="text-orange-500" /> Current streak</div>
            <div className="mt-1 text-3xl font-semibold tracking-[-0.02em]">12 days</div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 14 }).map((_, i) => (
                    <span key={i} className={cn('aspect-square rounded-[6px]', i < 12 ? 'bg-ink-950' : 'bg-cream-2')} />
                ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-xs">
                <span className="opacity-60">Points</span>
                <span className="font-semibold">1,240</span>
            </div>
        </div>
    );
}

export function ReviewUI() {
    return (
        <div className={cn(paper, 'w-full max-w-md p-5')}>
            <div className="flex items-center justify-between">
                <span className="text-xs opacity-60">Submission #12 · Mentor review</span>
                <span className="flex items-center gap-1 rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-medium"><Check size={12} /> Approved</span>
            </div>
            <div className="mt-3 rounded-xl bg-cream p-3.5 text-[13px] leading-relaxed">
                Clean resource routes. Next, add request validation to <span className="font-mono text-[12px]">POST /tasks</span>.
            </div>
            <div className="mt-3 text-right text-xs font-semibold">+50 points</div>
        </div>
    );
}

export function DocsUI() {
    return (
        <div className={cn(paper, 'w-full max-w-md divide-y divide-black/10')}>
            {[
                { n: 'Offer_letter.pdf', s: 'Issued', ok: true },
                { n: 'Completion_letter.pdf', s: 'Pending', ok: false },
            ].map((d) => (
                <div key={d.n} className="flex items-center justify-between px-5 py-3.5 text-[13px]">
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-950 text-brand-400"><FileText size={15} /></span>
                        <span className="truncate">{d.n}</span>
                    </span>
                    <span className={cn('shrink-0 pl-3 text-xs', d.ok ? 'font-semibold' : 'opacity-50')}>{d.s}</span>
                </div>
            ))}
        </div>
    );
}

export function CertUI() {
    return (
        <div className={cn(paper, 'w-full max-w-sm p-6 text-center')}>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ink-950 text-brand-400"><Award size={20} /></div>
            <div className="mt-3 text-[11px] uppercase tracking-[0.14em] opacity-60">Certificate of completion</div>
            <div className="mt-1 text-lg font-semibold tracking-[-0.01em]">Web Development Internship</div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-cream px-3.5 py-2.5">
                <span className="font-mono text-xs">CERT-2026-8F3K2Q1M</span>
                <span className="flex items-center gap-1 text-xs font-semibold"><ShieldCheck size={13} /> Valid</span>
            </div>
        </div>
    );
}

export function ApplyUI() {
    return (
        <div className={cn(paper, 'w-full max-w-md p-5')}>
            <div className="text-xs opacity-60">Internships · Open</div>
            <div className="mt-1 text-xl font-semibold tracking-[-0.02em]">Web Development</div>
            <div className="mt-1 text-xs opacity-60">8 weeks · Remote · Beginner</div>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink-950 py-2.5 text-sm font-medium text-white">
                <Send size={14} /> Request enrollment
            </div>
        </div>
    );
}

export function CourseUI() {
    return (
        <div className={cn(paper, 'w-full max-w-[280px] overflow-hidden')}>
            <div className="flex h-24 items-center justify-center bg-ink-950 text-brand-400"><GraduationCap size={30} /></div>
            <div className="p-4">
                <div className="text-[15px] font-semibold">JavaScript Essentials</div>
                <div className="mt-1 flex items-center gap-1 text-xs opacity-60"><Star size={12} className="fill-amber-400 text-amber-400" /> Self-paced · 12 lessons</div>
                <div className="mt-3 h-1.5 rounded-full bg-cream-2"><div className="h-full w-[40%] rounded-full bg-ink-950" /></div>
            </div>
        </div>
    );
}

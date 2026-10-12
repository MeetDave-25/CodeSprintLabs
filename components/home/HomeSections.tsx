'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Search } from 'lucide-react';
import type { Course } from '@/types';
import { cn } from '@/lib/utils';
import { FOUNDER } from '@/components/home/facility';
import {
    CertUI,
    CourseUI,
    DocsUI,
    ReviewUI,
    StreakUI,
    TaskUI,
} from '@/components/home/AppMock';

const ease = [0.22, 1, 0.36, 1] as const;
const container = 'mx-auto max-w-[1200px] px-5 md:px-8';

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay, ease }}
        >
            {children}
        </motion.div>
    );
}

/** Neon marker highlight behind a word. */
function Mark({ children }: { children: React.ReactNode }) {
    return <span className="rounded-[0.18em] bg-brand-400 px-[0.14em] [box-decoration-break:clone]">{children}</span>;
}

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium', dark ? 'border-white/15 text-white/70' : 'border-black/15 text-ink-950/70')}>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 ring-1 ring-ink-950/20" /> {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
const FALLBACK_TRACKS = ['Web Development', 'Python', 'Java', 'DSA', 'C++', 'Machine Learning'];

export function Ticker({ items }: { items: string[] }) {
    const list = items.length ? items : FALLBACK_TRACKS;
    const row = [...list, ...list];
    return (
        <div className="overflow-hidden border-y border-black bg-ink-950 py-5 text-white" aria-hidden>
            <div className="flex w-max animate-marquee items-center whitespace-nowrap">
                {[0, 1].map((half) => (
                    <div key={half} className="flex items-center">
                        {row.map((d, i) => (
                            <span key={i} className="flex items-center gap-8 pr-8 text-[28px] font-semibold tracking-[-0.03em] md:text-[40px]">
                                {d}
                                <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
export function Stats({ stats }: { stats: { label: string; value: string }[] | null }) {
    if (!stats) return null;
    return (
        <section className="bg-cream">
            <div className={cn(container, 'grid grid-cols-2 gap-y-10 py-16 md:grid-cols-4')}>
                {stats.map((s, i) => (
                    <FadeIn key={s.label} delay={i * 0.06} className={cn('px-2', i > 0 && 'md:border-l md:border-black/10 md:pl-8')}>
                        <div className="text-[44px] font-bold tracking-[-0.04em] text-ink-950 md:text-[56px]">{s.value}</div>
                        <div className="mt-1 text-sm text-cream-muted">{s.label}</div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
function Tile({ title, text, children, className, tone = 'cream' }: { title: string; text: string; children: React.ReactNode; className?: string; tone?: 'cream' | 'ink' | 'neon' }) {
    const tones = {
        cream: 'bg-cream-2 text-ink-950',
        ink: 'bg-ink-950 text-white',
        neon: 'bg-brand-400 text-ink-950',
    };
    return (
        <FadeIn className={cn('flex flex-col overflow-hidden rounded-[32px] p-8 md:p-10', tones[tone], className)}>
            <h3 className="text-[26px] font-bold leading-[1.05] tracking-[-0.03em] md:text-[32px]">{title}</h3>
            <p className={cn('mt-3 max-w-sm text-[16px] leading-relaxed', tone === 'ink' ? 'text-white/65' : 'opacity-70')}>{text}</p>
            <div className="mt-8 flex flex-1 items-end justify-center">{children}</div>
        </FadeIn>
    );
}

export function Features() {
    return (
        <section className="bg-cream pb-24 pt-8 md:pb-32">
            <div className={container}>
                <FadeIn className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <Eyebrow>The workspace</Eyebrow>
                        <h2 className="mt-5 max-w-2xl text-[40px] font-bold leading-[1] tracking-[-0.045em] text-ink-950 md:text-[64px]">
                            Everything an internship needs, <span className="font-serif font-normal italic tracking-[-0.02em]">in one place.</span>
                        </h2>
                    </div>
                    <p className="max-w-xs text-[16px] leading-relaxed text-cream-muted">From the first task to the final certificate — nothing lives in spreadsheets or chat threads.</p>
                </FadeIn>

                <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
                    <Tile tone="ink" className="lg:col-span-2" title="Daily tasks that feel like real work." text="A focused task from your track every day. Build it, submit it, watch your progress compound.">
                        <TaskUI />
                    </Tile>
                    <Tile tone="neon" title="Streaks & points." text="Consistency, made visible — and rewarded.">
                        <StreakUI />
                    </Tile>
                    <Tile title="Reviewed by mentors." text="Every submission gets real, specific feedback.">
                        <ReviewUI />
                    </Tile>
                    <Tile title="Documents, automatic." text="Offer and completion letters appear in your dashboard.">
                        <DocsUI />
                    </Tile>
                    <Tile tone="ink" title="Certificates you can prove." text="A unique public code anyone can verify.">
                        <CertUI />
                    </Tile>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
const studentFeatures = ['Dashboard with progress, streak and points', 'All your internships, week by week', "Today's task, one click to submit", 'Self-paced courses alongside', 'Offer letter, completion letter, certificates'];
const adminFeatures = ['Approve or decline enrollment requests', 'Task library, scheduled per program', 'Review submissions and award points', 'Completion reviews and certificate issuing', 'Payments, announcements, students and team'];

export function Platform() {
    return (
        <section className="bg-cream py-24 md:py-32">
            <div className={container}>
                <FadeIn className="mb-12 max-w-3xl">
                    <Eyebrow>Two workspaces</Eyebrow>
                    <h2 className="mt-5 text-[40px] font-bold leading-[1] tracking-[-0.045em] text-ink-950 md:text-[64px]">
                        Built for students. <span className="font-serif font-normal italic tracking-[-0.02em]">Run by mentors.</span>
                    </h2>
                </FadeIn>
                <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                    {[
                        { label: 'For students', title: 'Student portal', items: studentFeatures, cta: { href: '/auth/register', text: 'Create your account' }, tone: 'neon' as const },
                        { label: 'For mentors & admins', title: 'Admin console', items: adminFeatures, cta: { href: '/contact', text: 'Talk to the team' }, tone: 'ink' as const },
                    ].map((c, i) => (
                        <FadeIn key={c.title} delay={i * 0.08} className={cn('flex flex-col rounded-[32px] p-8 md:p-10', c.tone === 'neon' ? 'bg-brand-400 text-ink-950' : 'bg-ink-950 text-white')}>
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">{c.label}</div>
                            <h3 className="mt-2 text-[34px] font-bold tracking-[-0.04em]">{c.title}</h3>
                            <ul className="mt-7 flex-1 space-y-3.5">
                                {c.items.map((it) => (
                                    <li key={it} className="flex items-start gap-3 text-[16px]">
                                        <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', c.tone === 'neon' ? 'bg-ink-950 text-brand-400' : 'bg-brand-400 text-ink-950')}><Check size={12} strokeWidth={3} /></span>
                                        {it}
                                    </li>
                                ))}
                            </ul>
                            <Link href={c.cta.href} className={cn('group mt-9 inline-flex w-fit items-center gap-2 rounded-full py-2.5 pl-6 pr-2.5 text-[15px] font-medium', c.tone === 'neon' ? 'bg-ink-950 text-white' : 'bg-white text-ink-950')}>
                                {c.cta.text}
                                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:rotate-45', c.tone === 'neon' ? 'bg-brand-400 text-ink-950' : 'bg-brand-400')}><ArrowUpRight size={16} /></span>
                            </Link>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
export function Tracks({ domains, courses }: { domains: { name: string; count: number }[]; courses: Course[] }) {
    const tracks = domains.length ? domains : FALLBACK_TRACKS.map((name) => ({ name, count: -1 }));
    return (
        <section className="bg-cream pb-24 md:pb-32">
            <div className={container}>
                <FadeIn className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <h2 className="text-[40px] font-bold leading-[1] tracking-[-0.045em] text-ink-950 md:text-[56px]">
                        Choose your <span className="font-serif font-normal italic tracking-[-0.02em]">track.</span>
                    </h2>
                    <Link href="/internships" className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink-950 underline underline-offset-4">
                        All internships <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </FadeIn>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tracks.map((t, i) => (
                        <FadeIn key={t.name} delay={(i % 3) * 0.06}>
                            <Link
                                href={`/internships?domain=${encodeURIComponent(t.name)}`}
                                className="group flex items-center justify-between rounded-[24px] border border-black/10 bg-white/50 px-6 py-5 transition-all hover:border-ink-950 hover:bg-ink-950 hover:text-white"
                            >
                                <div>
                                    <div className="text-[20px] font-semibold tracking-[-0.02em]">{t.name}</div>
                                    <div className="mt-0.5 text-sm opacity-60">{t.count >= 0 ? `${t.count} internship${t.count === 1 ? '' : 's'} open` : 'View internships'}</div>
                                </div>
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-white transition-all group-hover:rotate-45 group-hover:bg-brand-400 group-hover:text-ink-950">
                                    <ArrowUpRight size={18} />
                                </span>
                            </Link>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn className="mt-5 grid items-center gap-10 rounded-[32px] bg-cream-2 p-8 md:grid-cols-2 md:p-12">
                    <div>
                        <Eyebrow>Courses</Eyebrow>
                        <h3 className="mt-5 text-[32px] font-bold leading-[1.02] tracking-[-0.04em] text-ink-950 md:text-[44px]">
                            Learn alongside <span className="font-serif font-normal italic tracking-[-0.02em]">your internship.</span>
                        </h3>
                        <p className="mt-3 max-w-md text-[16px] leading-relaxed text-cream-muted">Self-paced courses that strengthen the fundamentals your daily tasks build on.</p>
                        <Link href="/courses" className="group mt-6 inline-flex items-center gap-2 rounded-full bg-ink-950 py-2.5 pl-6 pr-2.5 text-[15px] font-medium text-white">
                            Browse courses
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 text-ink-950 transition-transform group-hover:rotate-45"><ArrowUpRight size={16} /></span>
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {courses.length > 0 ? (
                            courses.slice(0, 2).map((c) => (
                                <Link key={c.id} href={`/courses/${c.id}`} className="w-full max-w-[260px] overflow-hidden rounded-2xl bg-[#fffdf7] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1">
                                    <div className="h-28 bg-ink-950">
                                        {c.thumbnail && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="line-clamp-2 text-[15px] font-semibold text-ink-950">{c.title}</div>
                                        <div className="mt-1 text-xs text-cream-muted">{c.level} · {c.duration} · {c.price > 0 ? `₹${c.price.toLocaleString('en-IN')}` : 'Free'}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <CourseUI />
                        )}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
export function Verify() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const c = code.trim();
        if (c) router.push(`/verify-certificate/${encodeURIComponent(c)}`);
    };
    return (
        <section className="bg-brand-400 py-24 text-ink-950 md:py-28">
            <div className={cn(container, 'grid items-center gap-12 md:grid-cols-2')}>
                <FadeIn>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">For employers</div>
                    <h2 className="mt-3 text-[40px] font-bold leading-[1] tracking-[-0.045em] md:text-[60px]">
                        Verify any certificate <span className="font-serif font-normal italic tracking-[-0.02em]">in seconds.</span>
                    </h2>
                    <p className="mt-4 max-w-md text-[17px] leading-relaxed opacity-75">Every CodeSprint Labs certificate carries a unique code. Check it here — no account needed.</p>
                    <form onSubmit={submit} className="mt-8 flex max-w-md items-center gap-2 rounded-full bg-ink-950 p-1.5 pl-5">
                        <Search size={18} className="shrink-0 text-white/50" />
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="CERT-2026-AB12CD34"
                            aria-label="Certificate code"
                            className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-[14px] text-white placeholder:text-white/35 focus:outline-none !shadow-none"
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <button type="submit" disabled={!code.trim()} className="rounded-full bg-brand-400 px-6 py-2.5 text-[14px] font-semibold text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-50">
                            Verify
                        </button>
                    </form>
                </FadeIn>
                <FadeIn delay={0.1} className="flex justify-center"><CertUI /></FadeIn>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
export function Founder() {
    return (
        <section className="bg-cream py-20 md:py-24">
            <div className={container}>
                <FadeIn className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center md:flex-row md:text-left">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-cream-3 ring-4 ring-brand-400">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/founder/parth-arms-crossed.webp" alt={FOUNDER.name} className="h-auto w-full translate-y-1 scale-[1.9] object-cover object-top [transform-origin:50%_8%]" loading="lazy" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-muted">Founder</div>
                        <div className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-ink-950">{FOUNDER.name}</div>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-cream-muted">{FOUNDER.role}</p>
                        <a href={FOUNDER.portfolio} target="_blank" rel="noopener noreferrer" className="group mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-950 underline underline-offset-4">
                            Read his story <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
export function ClosingCTA() {
    return (
        <section className="bg-cream pb-6 md:pb-8">
            <div className={container}>
                <FadeIn className="relative overflow-hidden rounded-[40px] bg-ink-950 px-8 py-20 text-center text-white md:py-28">
                    <div className="pointer-events-none absolute left-1/2 top-full h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(198,255,46,0.55),transparent)]" />
                    <div className="relative">
                        <h2 className="mx-auto max-w-3xl text-[40px] font-bold leading-[1] tracking-[-0.045em] md:text-[72px]">
                            Your internship <span className="font-serif font-normal italic tracking-[-0.02em] text-brand-400">starts here.</span>
                        </h2>
                        <p className="mx-auto mt-5 max-w-lg text-[17px] text-white/65">Create a free account and apply to your first program today.</p>
                        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                            <Link href="/auth/register" className="group inline-flex items-center gap-2 rounded-full bg-brand-400 py-3.5 pl-7 pr-3 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300">
                                Get started free
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-brand-400 transition-transform group-hover:rotate-45"><ArrowUpRight size={16} /></span>
                            </Link>
                            <Link href="/contact" className="rounded-full border border-white/25 px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/10">
                                Contact us
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

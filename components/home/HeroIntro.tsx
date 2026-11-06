'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import Mascot from '@/components/home/Mascot';
import { FloatApproved, FloatStreak } from '@/components/home/AppMock';

/*
 * Hero section — always visible, no scroll-based reveal animation.
 * Shows headline, CTA buttons, the creature mascot and floating product cards.
 */

export default function HeroIntro({ activeInternships }: { activeInternships?: number }) {
    return (
        <div className="relative min-h-[calc(100svh-56px)] overflow-hidden bg-cream text-ink-950 flex items-center">
            {/* backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(10,10,10,0.09)_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="pointer-events-none absolute left-1/2 top-[58%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(198,255,46,0.55),transparent)]" />

            {/* creature mascot — right side */}
            <div className="pointer-events-none absolute bottom-0 right-[-4%] z-20 aspect-[878/1067] h-[30%] sm:h-[44%] lg:right-[8%] lg:h-[70%]">
                <Mascot src="/mascot/mascot-wave.webp" alt="CodeSprint mascot waving hello" width={878} height={1067} origin="50% 70%" strength={0.6} className="h-full w-full" />
                <div className="absolute -top-2 left-[-6%] hidden rounded-2xl rounded-bl-sm bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:block lg:left-[-20%] lg:top-[6%]">
                    Hey! Ready to ship? <span className="text-brand-400">👋</span>
                </div>
            </div>

            {/* product cards — only on large screens */}
            <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
                <div className="mx-auto h-full max-w-[1200px] px-8">
                    <div className="relative ml-auto h-full w-[52%]">
                        <div className="absolute left-0 top-[16%]"><FloatApproved /></div>
                        <div className="absolute bottom-[12%] left-[6%]"><FloatStreak /></div>
                    </div>
                </div>
            </div>

            {/* hero copy */}
            <div className="relative z-30 mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8">
                <div className="max-w-[600px]">
                    <Link href="/internships" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/70 py-1.5 pl-1.5 pr-4 text-[13px] backdrop-blur transition-colors hover:bg-white">
                        <span className="rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-semibold">New</span>
                        {activeInternships ? `${activeInternships} internships open now` : 'Internships open for enrollment'}
                        <ArrowRight size={14} />
                    </Link>

                    <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[56px] lg:text-[64px]">
                        <span className="block">Learn by shipping.</span>
                        <span className="block">
                            Graduate with{' '}
                            <span className="font-serif font-normal italic tracking-[-0.02em]">
                                <span className="rounded-[0.18em] bg-brand-400 px-[0.14em]">proof.</span>
                            </span>
                        </span>
                    </h1>

                    <p className="mt-5 max-w-md text-[17px] leading-relaxed text-cream-muted md:text-[18px]">
                        Structured internships with daily coding tasks, real mentor reviews and certificates employers can verify — in one workspace.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <Link href="/auth/register" className="group inline-flex items-center gap-2 rounded-full bg-ink-950 py-3 pl-6 pr-2.5 text-[15px] font-medium text-white transition-colors hover:bg-ink-800">
                            Get started free
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 text-ink-950 transition-transform group-hover:rotate-45"><ArrowUpRight size={16} /></span>
                        </Link>
                        <Link href="/internships" className="rounded-full border border-black/20 bg-cream/70 px-6 py-3 text-[15px] font-medium backdrop-blur transition-colors hover:bg-white">
                            Explore internships
                        </Link>
                    </div>

                    <ul className="mt-7 hidden flex-wrap gap-x-5 gap-y-2 text-[13px] text-cream-muted sm:flex">
                        {['Free to sign up', 'Mentor-reviewed tasks', 'Verifiable certificates'].map((t) => (
                            <li key={t} className="flex items-center gap-2"><Check size={14} className="rounded-full bg-brand-400 p-0.5 text-ink-950" strokeWidth={3} /> {t}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

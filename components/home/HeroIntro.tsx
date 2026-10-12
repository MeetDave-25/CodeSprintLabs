'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import CoderMascot from '@/components/home/CoderMascot';
import Mascot from '@/components/home/Mascot';
import { FloatApproved, FloatStreak } from '@/components/home/AppMock';

/*
 * Opening scene. Starts on the coder: a student at a laptop, in front of a
 * giant "Code Sprint" title, eyes following the cursor. Scrolling pins the
 * scene: the title lifts away, the coder sinks out of view, and the blue-
 * creature mascot pops up on the right as the headline, buttons and product
 * cards reveal. Two characters: coder up top, creature in the scrolled state.
 */

const HEADER_H = 56;
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function HeroIntro({ activeInternships }: { activeInternships?: number }) {
    const root = useRef<HTMLDivElement>(null);

    useIsoLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(root.current);
            const coder = q('[data-coder]')[0];
            const creature = q('[data-creature]')[0];
            const bubble = q('[data-bubble]')[0];
            const words = q('[data-word]');
            const lines = q('[data-line]');
            const fades = q('[data-fade]');
            const cards = q('[data-card]');
            const hint = q('[data-hint]');
            const copy = q('[data-copy]')[0];

            gsap.set(coder, { xPercent: -50 });
            gsap.set(lines, { yPercent: 140 });

            if (reduced) {
                // No scroll choreography: show the final (scrolled) layout straight away.
                gsap.set(words, { opacity: 0 });
                gsap.set(hint, { opacity: 0 });
                gsap.set(lines, { yPercent: 0 });
                gsap.set([...fades, ...cards, creature, bubble], { opacity: 1, y: 0, scale: 1 });
                gsap.set(coder, { opacity: 0 });
                gsap.set(copy, { pointerEvents: 'auto' });
                return;
            }

            // Intro on load: coder rises in, title rises behind it.
            gsap.from(coder, { yPercent: 25, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 });
            gsap.from(q('[data-title]')[0], { y: 80, opacity: 0, duration: 1.1, ease: 'power3.out' });

            const mm = gsap.matchMedia();
            mm.add({ lg: '(min-width: 1024px)', sm: '(max-width: 1023px)' }, (c) => {
                const lg = c.conditions?.lg;
                const tl = gsap.timeline({
                    defaults: { ease: 'none' },
                    scrollTrigger: {
                        trigger: root.current,
                        start: `top ${HEADER_H}px`,
                        end: '+=110%',
                        pin: true,
                        scrub: 0.7,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });

                tl.to(hint, { opacity: 0, y: 20, duration: 0.15 }, 0)
                    .to(words[0], { xPercent: -30, yPercent: -40, opacity: 0, duration: 0.5 }, 0)
                    .to(words[1], { xPercent: 30, yPercent: -40, opacity: 0, duration: 0.5 }, 0)
                    // coder sinks out of view…
                    .to(coder, { yPercent: 70, scale: 0.85, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0.05)
                    // …and the blue creature pops up on the right
                    .fromTo(creature, { opacity: 0, yPercent: 60, rotate: lg ? 8 : 6 }, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.45, ease: 'back.out(1.5)' }, 0.45)
                    .fromTo(bubble, { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'back.out(2)' }, 0.8)
                    .to(lines, { yPercent: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' }, 0.35)
                    .fromTo(fades, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }, 0.5)
                    .fromTo(cards, { opacity: 0, scale: 0.6, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)' }, 0.65)
                    .set(copy, { pointerEvents: 'auto' }, 0.6)
                    .to({}, { duration: 0.15 }); // brief hold at the end
            });
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={root} className="relative overflow-hidden bg-cream text-ink-950" style={{ height: `calc(100svh - ${HEADER_H}px)` }}>
            {/* backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(10,10,10,0.09)_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="pointer-events-none absolute left-1/2 top-[58%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(198,255,46,0.55),transparent)]" />

            {/* giant title behind the coder */}
            <div data-title className="pointer-events-none absolute inset-x-0 top-[12%] flex items-center justify-center gap-[2vw] whitespace-nowrap px-4 md:top-[10%]" aria-hidden>
                <span data-word className="inline-block text-[21vw] font-bold leading-none tracking-[-0.06em] lg:text-[17vw]">Code</span>
                <span data-word className="inline-block font-serif text-[21vw] italic leading-none tracking-[-0.03em] lg:text-[17vw]">Sprint</span>
            </div>

            {/* coder: student at a laptop, follows the cursor (top of hero) */}
            <div data-coder className="absolute bottom-[6%] left-1/2 z-10 aspect-[400/520] h-[54%] max-h-[560px] origin-bottom will-change-transform sm:h-[60%] md:h-[66%]">
                <CoderMascot className="h-full w-full" />
            </div>

            {/* creature: blue mascot revealed on scroll (right side) */}
            <div data-creature className="pointer-events-none absolute bottom-0 right-[-4%] z-20 aspect-[878/1067] h-[30%] sm:h-[44%] lg:right-[8%] lg:h-[70%]" style={{ opacity: 0 }}>
                <Mascot src="/mascot/mascot-wave.webp" alt="CodeSprint mascot waving hello" width={878} height={1067} origin="50% 70%" strength={0.6} className="h-full w-full" />
                <div data-bubble className="absolute -top-2 left-[-6%] hidden rounded-2xl rounded-bl-sm bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:block lg:left-[-20%] lg:top-[6%]" style={{ opacity: 0 }}>
                    Hey! Ready to ship? <span className="text-brand-400">👋</span>
                </div>
            </div>

            {/* product cards that pop in around the mascot */}
            <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
                <div className="mx-auto h-full max-w-[1200px] px-8">
                    <div className="relative ml-auto h-full w-[52%]">
                        <div data-card className="absolute left-0 top-[16%]" style={{ opacity: 0 }}><FloatApproved /></div>
                        <div data-card className="absolute bottom-[12%] left-[6%]" style={{ opacity: 0 }}><FloatStreak /></div>
                    </div>
                </div>
            </div>

            {/* copy (revealed on scroll) */}
            <div data-copy className="pointer-events-none absolute inset-0 z-30" >
                <div className="mx-auto flex h-full max-w-[1200px] items-start px-5 pt-[6vh] md:px-8 lg:items-center lg:pt-0">
                    <div className="max-w-[600px]">
                        <div data-fade style={{ opacity: 0 }}>
                            <Link href="/internships" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/70 py-1.5 pl-1.5 pr-4 text-[13px] backdrop-blur transition-colors hover:bg-white">
                                <span className="rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-semibold">New</span>
                                {activeInternships ? `${activeInternships} internships open now` : 'Internships open for enrollment'}
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                        <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[56px] lg:text-[64px]">
                            <span className="block overflow-hidden pb-1"><span data-line className="block">Learn by shipping.</span></span>
                            <span className="block overflow-hidden pb-2">
                                <span data-line className="block">
                                    Graduate with{' '}
                                    <span className="font-serif font-normal italic tracking-[-0.02em]"><span className="rounded-[0.18em] bg-brand-400 px-[0.14em]">proof.</span></span>
                                </span>
                            </span>
                        </h1>
                        <p data-fade style={{ opacity: 0 }} className="mt-5 max-w-md text-[17px] leading-relaxed text-cream-muted md:text-[18px]">
                            Structured internships with daily coding tasks, real mentor reviews and certificates employers can verify — in one workspace.
                        </p>
                        <div data-fade style={{ opacity: 0 }} className="mt-7 flex flex-wrap items-center gap-3">
                            <Link href="/auth/register" className="group inline-flex items-center gap-2 rounded-full bg-ink-950 py-3 pl-6 pr-2.5 text-[15px] font-medium text-white transition-colors hover:bg-ink-800">
                                Get started free
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 text-ink-950 transition-transform group-hover:rotate-45"><ArrowUpRight size={16} /></span>
                            </Link>
                            <Link href="/internships" className="rounded-full border border-black/20 bg-cream/70 px-6 py-3 text-[15px] font-medium backdrop-blur transition-colors hover:bg-white">
                                Explore internships
                            </Link>
                        </div>
                        <ul data-fade style={{ opacity: 0 }} className="mt-7 hidden flex-wrap gap-x-5 gap-y-2 text-[13px] text-cream-muted sm:flex">
                            {['Free to sign up', 'Mentor-reviewed tasks', 'Verifiable certificates'].map((t) => (
                                <li key={t} className="flex items-center gap-2"><Check size={14} className="rounded-full bg-brand-400 p-0.5 text-ink-950" strokeWidth={3} /> {t}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* scroll hint (start state) */}
            <div data-hint className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 justify-center lg:left-8 lg:translate-x-0">
                <span className="flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2 text-xs font-medium text-white shadow-lg">
                    <ArrowDown size={14} className="animate-bounce text-brand-400" /> Scroll to begin
                </span>
            </div>
        </div>
    );
}

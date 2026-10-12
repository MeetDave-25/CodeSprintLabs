'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * Scroll story: a pinned scene where each scroll step reveals the next chapter.
 * GSAP ScrollTrigger drives the pinned, scrubbed timeline (PNG layers fly in and
 * recede, background shifts cream -> ink -> neon). Framer Motion drives the
 * prologue text. Artwork lives in /public/story/*.png.
 */

const CREAM = '#f4f2eb';
const INK = '#0a0a0a';
const NEON = '#c6ff2e';
const HEADER_H = 56; // fixed site header height in px

interface Layer {
    src: string;
    w: number;
    h: number;
    /** Tailwind classes controlling display size. */
    size: string;
}

interface Chapter {
    kicker: string;
    title: [string, string];
    body: string;
    bg: string;
    fg: string;
    rot: number;
    main: Layer;
    extra?: { layer: Layer; from: 'left' | 'right'; wrapper: string };
}

const CHAPTERS: Chapter[] = [
    {
        kicker: 'Apply',
        title: ['Pick a track.', 'Send one request.'],
        body: 'Browse open internships across Web, Python, Java, DSA and more. Request enrollment in a click — no long forms.',
        bg: CREAM, fg: INK, rot: -3,
        main: { src: '/story/apply.png', w: 516, h: 260, size: 'w-[min(88%,540px)]' },
    },
    {
        kicker: 'Approved',
        title: ['Approved.', 'Offer letter, delivered.'],
        body: 'The team reviews every request. Once you are in, your offer letter and documents appear right in your dashboard.',
        bg: INK, fg: CREAM, rot: 3,
        main: { src: '/story/offer.png', w: 516, h: 471, size: 'w-[min(78%,460px)]' },
    },
    {
        kicker: 'Build',
        title: ['Real tasks.', 'Every single day.'],
        body: 'Each day brings a focused task from your track. Submit your work, keep your streak alive and collect points.',
        bg: NEON, fg: INK, rot: -2,
        main: { src: '/story/task.png', w: 536, h: 269, size: 'w-[min(90%,560px)]' },
        extra: { layer: { src: '/story/streak.png', w: 386, h: 320, size: 'w-full' }, from: 'right', wrapper: 'right-[3%] bottom-[14%] w-[32%] max-w-[200px]' },
    },
    {
        kicker: 'Review',
        title: ['Mentors read', 'your work.'],
        body: 'Every submission gets specific feedback, so tomorrow’s task is better than today’s.',
        bg: CREAM, fg: INK, rot: 2,
        main: { src: '/story/review.png', w: 536, h: 267, size: 'w-[min(90%,560px)]' },
        extra: { layer: { src: '/story/mentor.png', w: 291, h: 900, size: 'w-full' }, from: 'left', wrapper: 'left-[-3%] bottom-[1%] w-[22%] max-w-[160px] lg:left-[-8%] lg:w-[24%]' },
    },
    {
        kicker: 'Certify',
        title: ['Finish.', 'Get certified.'],
        body: 'Complete the program and receive a completion letter and a certificate with a unique code anyone can verify.',
        bg: INK, fg: CREAM, rot: -2,
        main: { src: '/story/certificate.png', w: 656, h: 471, size: 'w-[min(96%,660px)]' },
    },
];

const N = CHAPTERS.length;
const TOTAL = N + 0.5; // timeline length in "chapter units"

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------ */
/* Prologue (Framer Motion): words light up as you scroll              */
/* ------------------------------------------------------------------ */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
    const opacity = useTransform(progress, range, [0.16, 1]);
    return <motion.span style={{ opacity }} className="mr-[0.22em] inline-block">{children}</motion.span>;
}

function Prologue() {
    const ref = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 88%', 'end 55%'] });
    const words = 'Every internship is a story. Here is yours — told one chapter at a time. Keep scrolling.'.split(' ');
    return (
        <section className="bg-cream pb-16 pt-24 md:pb-24 md:pt-32">
            <div className="mx-auto max-w-[1200px] px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-1 text-xs font-medium text-ink-950/70"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400 ring-1 ring-ink-950/20" /> The story
                </motion.div>
                <p ref={ref} className="mt-6 max-w-4xl text-[34px] font-bold leading-[1.08] tracking-[-0.04em] text-ink-950 md:text-[64px]">
                    {words.map((w, i) => (
                        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                            {w}
                        </Word>
                    ))}
                </p>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Pinned scene (GSAP)                                                 */
/* ------------------------------------------------------------------ */
function Layer({ layer, alt, className }: { layer: Layer; alt: string; className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={layer.src} alt={alt} width={layer.w * 2} height={layer.h * 2} decoding="async" draggable={false} className={cn('h-auto select-none', layer.size, className)} />
    );
}

function Scene() {
    const root = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    useIsoLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            const pin = root.current!;
            const q = gsap.utils.selector(pin);
            const texts = q('[data-text]');
            const mains = q('[data-main]');
            const ghosts = q('[data-ghost]');
            const extras = q('[data-extra]');
            const final = q('[data-final]')[0];
            const bar = q('[data-bar]')[0];

            const tl = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: pin,
                    start: `top ${HEADER_H}px`,
                    end: () => `+=${window.innerHeight * TOTAL}`,
                    pin: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const idx = Math.min(N - 1, Math.max(0, Math.floor(self.progress * TOTAL + 0.1)));
                        setActive((prev) => (prev === idx ? prev : idx));
                    },
                },
            });

            // spacer so timeline length === TOTAL (keeps progress -> chapter mapping exact)
            tl.to({}, { duration: 0.0001 }, TOTAL - 0.0001);
            tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: 'none' }, 0);

            gsap.set(mains[0], { rotate: CHAPTERS[0].rot });

            CHAPTERS.forEach((c, i) => {
                const text = texts[i];
                const main = mains[i];
                const ghost = ghosts[i];
                const extra = extras.find((e) => e.getAttribute('data-extra') === String(i));

                if (i > 0) {
                    tl.to(pin, { backgroundColor: c.bg, color: c.fg, duration: 0.3, ease: 'power1.inOut' }, i - 0.15);
                    tl.fromTo(text, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, i + 0.02);
                    tl.fromTo(
                        main,
                        { yPercent: 120, rotate: c.rot + 14, scale: 0.9, opacity: 0 },
                        { yPercent: 0, rotate: c.rot, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' },
                        i - 0.2
                    );
                    tl.fromTo(ghost, { opacity: 0, scale: 0.8 }, { opacity: 0.2, scale: 1, duration: 0.4, ease: 'power2.out' }, i - 0.1);
                }

                if (extra) {
                    const fromRight = (c.extra?.from ?? 'right') === 'right';
                    tl.fromTo(
                        extra,
                        { opacity: 0, x: fromRight ? 140 : -140, scale: 0.9 },
                        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
                        i + 0.1
                    );
                }

                if (i < N - 1) {
                    // text leaves, layers recede into a stack, then fade
                    tl.to(text, { opacity: 0, y: -60, duration: 0.2, ease: 'power2.in' }, i + 0.8);
                    tl.to(ghost, { opacity: 0, scale: 1.15, duration: 0.3 }, i + 0.8);
                    tl.to(main, { scale: 0.88, yPercent: -14, rotate: c.rot * 0.3, opacity: 0.3, duration: 0.4, ease: 'power2.inOut' }, i + 0.8);
                    tl.to(main, { opacity: 0, duration: 0.3 }, i + 1.7 > TOTAL ? TOTAL - 0.3 : i + 1.7);
                    if (extra) tl.to(extra, { opacity: 0, y: -30, duration: 0.25 }, i + 0.8);
                }
            });

            // Finale: copy swaps to the call to action; certificate stays on stage
            tl.to(texts[N - 1], { opacity: 0, y: -60, duration: 0.2, ease: 'power2.in' }, N - 0.2);
            tl.fromTo(final, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, N - 0.05);
            tl.set(final, { pointerEvents: 'auto' }, N - 0.05);
            tl.to(mains[N - 1], { scale: 1.04, rotate: 0, duration: 0.4, ease: 'power2.inOut' }, N - 0.1);

        }, root);

        // Images/fonts settling can shift layout; re-measure once everything has loaded.
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener('load', onLoad);

        return () => {
            window.removeEventListener('load', onLoad);
            ctx.revert();
        };
    }, []);

    return (
        <div
            ref={root}
            className="relative overflow-hidden"
            style={{ height: `calc(100svh - ${HEADER_H}px)`, backgroundColor: CREAM, color: INK }}
        >
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* top bar */}
            <div className="absolute inset-x-0 top-0 z-20">
                <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 pt-5 text-xs font-medium md:px-8">
                    <span className="flex items-center gap-3">
                        <span className="rounded-full border border-current px-2.5 py-1 font-semibold tabular-nums">0{active + 1} / 0{N}</span>
                        <span className="hidden uppercase tracking-[0.14em] opacity-60 sm:inline">{CHAPTERS[active].kicker}</span>
                    </span>
                    <span className="flex items-center gap-1.5" aria-hidden>
                        {CHAPTERS.map((c, i) => (
                            <span key={c.kicker} className={cn('h-1.5 rounded-full transition-all duration-300', i === active ? 'w-6 bg-current' : 'w-1.5 bg-current opacity-25')} />
                        ))}
                    </span>
                </div>
                <div className="mx-auto mt-3 h-px max-w-[1200px] bg-current opacity-10" />
            </div>

            <div className="relative z-10 mx-auto grid h-full max-w-[1200px] grid-rows-[44%_56%] px-5 pt-14 md:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:pt-16">
                {/* Stage (PNG layers) */}
                <div className="relative order-1 lg:order-2 lg:col-span-7">
                    {CHAPTERS.map((c, i) => (
                        <div key={`g${i}`} data-ghost className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity: i === 0 ? 0.2 : 0 }} aria-hidden>
                            <span className="text-[44vw] font-bold leading-none tracking-[-0.06em] [-webkit-text-fill-color:transparent] [-webkit-text-stroke:2px_currentColor] lg:text-[22rem]">0{i + 1}</span>
                        </div>
                    ))}
                    {CHAPTERS.map((c, i) => (
                        <div key={`m${i}`} className="absolute inset-0 flex items-center justify-center">
                            <div data-main style={{ opacity: i === 0 ? 1 : 0 }} className="flex w-full justify-center will-change-transform">
                                <Layer layer={c.main} alt={`${c.kicker} — product preview`} />
                            </div>
                        </div>
                    ))}
                    {CHAPTERS.map((c, i) =>
                        c.extra ? (
                            <div key={`x${i}`} className={cn('pointer-events-none absolute', c.extra.wrapper)}>
                                <div data-extra={i} style={{ opacity: 0 }} className="will-change-transform">
                                    <Layer layer={c.extra.layer} alt="" />
                                </div>
                            </div>
                        ) : null
                    )}
                </div>

                {/* Copy */}
                <div className="relative order-2 lg:order-1 lg:col-span-5">
                    {CHAPTERS.map((c, i) => (
                        <div key={c.kicker} data-text style={{ opacity: i === 0 ? 1 : 0 }} className="absolute inset-0 flex flex-col justify-start pt-2 lg:justify-center lg:pt-0">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Chapter 0{i + 1} — {c.kicker}</div>
                            <h3 className="mt-3 text-[34px] font-bold leading-[1.02] tracking-[-0.045em] md:text-[52px] lg:text-[58px]">
                                {c.title[0]}
                                <br />
                                <span className="font-serif font-normal italic tracking-[-0.02em]">{c.title[1]}</span>
                            </h3>
                            <p className="mt-4 max-w-md text-[16px] leading-relaxed opacity-70 md:text-[18px]">{c.body}</p>
                            {i === 0 && (
                                <div className="mt-6 flex items-center gap-2 text-xs font-medium opacity-60">
                                    <ArrowDown size={14} className="animate-bounce" /> Keep scrolling
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Finale */}
                    <div data-final style={{ opacity: 0, pointerEvents: 'none' }} className="absolute inset-0 flex flex-col justify-start pt-2 lg:justify-center lg:pt-0">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">The end — and the start</div>
                        <h3 className="mt-3 text-[40px] font-bold leading-[1] tracking-[-0.05em] md:text-[64px]">
                            Your turn.
                            <br />
                            <span className="font-serif font-normal italic tracking-[-0.02em] text-brand-400">Start chapter one.</span>
                        </h3>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link href="/auth/register" className="group inline-flex items-center gap-2 rounded-full bg-brand-400 py-3 pl-6 pr-2.5 text-[15px] font-semibold text-ink-950 transition-colors hover:bg-brand-300">
                                Get started free
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-brand-400 transition-transform group-hover:rotate-45"><ArrowUpRight size={16} /></span>
                            </Link>
                            <Link href="/internships" className="rounded-full border border-current/30 px-6 py-3 text-[15px] font-medium opacity-90 transition-opacity hover:opacity-100">
                                Browse internships
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* progress */}
            <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-current opacity-10" />
            <div data-bar className="absolute inset-x-0 bottom-0 z-20 h-1 origin-left bg-brand-400" style={{ transform: 'scaleX(0)' }} />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Reduced motion: same story as a calm, static list                   */
/* ------------------------------------------------------------------ */
function StaticStory() {
    return (
        <section className="bg-cream py-16 text-ink-950">
            <div className="mx-auto max-w-[1200px] space-y-16 px-5 md:px-8">
                {CHAPTERS.map((c, i) => (
                    <article key={c.kicker} className="grid items-center gap-8 md:grid-cols-2">
                        <div className={cn(i % 2 === 1 && 'md:order-2')}>
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">Chapter 0{i + 1} — {c.kicker}</div>
                            <h3 className="mt-3 text-[34px] font-bold leading-[1.02] tracking-[-0.045em] md:text-[48px]">
                                {c.title[0]} <span className="font-serif font-normal italic tracking-[-0.02em]">{c.title[1]}</span>
                            </h3>
                            <p className="mt-4 max-w-md text-[17px] leading-relaxed opacity-70">{c.body}</p>
                        </div>
                        <div className="flex justify-center rounded-[32px] bg-cream-2 p-8">
                            <Layer layer={{ ...c.main, size: 'w-full max-w-[460px]' }} alt={`${c.kicker} — product preview`} />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Story() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const on = () => setReduced(mq.matches);
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);

    return (
        <>
            <Prologue />
            {reduced ? <StaticStory /> : <Scene />}
        </>
    );
}

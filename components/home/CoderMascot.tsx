'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/*
 * Hand-drawn SVG mascot: a student coder at a laptop.
 *  - the head tilts toward the cursor and the pupils clearly follow it
 *  - eyebrows lift when you move above, the eyes blink on their own
 *  - the laptop screen "types" lines of code on a loop
 * When the cursor is idle — or on touch devices — it glances around itself.
 */

const SKIN = '#eab088';
const SKIN_SHADE = '#d4976c';
const INK = '#0a0a0a';
const NEON = '#c6ff2e';
const HOODIE = '#17181c';
const HOODIE_HI = '#24262c';
const PAPER = '#fffdf7';

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

// Each "line" of code on the screen: [indent in px, width in px, colour].
const CODE_LINES: [number, number, string][] = [
    [0, 48, NEON],
    [10, 70, '#ffffff'],
    [10, 54, '#8fd2ff'],
    [20, 40, '#ffffff'],
    [10, 62, '#ffd36e'],
    [0, 34, NEON],
];

export default function CoderMascot({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 90, damping: 15, mass: 0.6 });
    const sy = useSpring(my, { stiffness: 90, damping: 15, mass: 0.6 });
    // pupils react faster and travel further so the tracking is obvious
    const px = useSpring(mx, { stiffness: 220, damping: 18 });
    const py = useSpring(my, { stiffness: 220, damping: 18 });

    const headRot = useTransform(sx, [-1, 1], [-8, 8]);
    const headX = useTransform(sx, [-1, 1], [-10, 10]);
    const headY = useTransform(sy, [-1, 1], [-7, 6]);
    const pupilX = useTransform(px, [-1, 1], [-11, 11]);
    const pupilY = useTransform(py, [-1, 1], [-9, 9]);
    const browY = useTransform(sy, [-1, 1], [-6, 2]);
    const bodyRot = useTransform(sx, [-1, 1], [-2, 2]);

    const [blink, setBlink] = useState(false);
    const [codeStep, setCodeStep] = useState(0);

    useEffect(() => {
        let last = 0;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse' || !ref.current) return;
            const r = ref.current.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height * 0.32; // eye level
            mx.set(clamp((e.clientX - cx) / (window.innerWidth * 0.42)));
            my.set(clamp((e.clientY - cy) / (window.innerHeight * 0.45)));
            last = Date.now();
        };
        window.addEventListener('pointermove', onMove, { passive: true });

        const idle = setInterval(() => {
            if (Date.now() - last < 3500) return;
            mx.set((Math.random() * 2 - 1) * 0.75);
            my.set((Math.random() * 2 - 1) * 0.45);
        }, 2300);

        let blinkTimer: ReturnType<typeof setTimeout>;
        const scheduleBlink = () => {
            blinkTimer = setTimeout(() => {
                setBlink(true);
                setTimeout(() => setBlink(false), 130);
                scheduleBlink();
            }, 2400 + Math.random() * 2800);
        };
        scheduleBlink();

        const code = setInterval(() => setCodeStep((s) => (s + 1) % (CODE_LINES.length + 2)), 650);

        return () => {
            window.removeEventListener('pointermove', onMove);
            clearInterval(idle);
            clearInterval(code);
            clearTimeout(blinkTimer);
        };
    }, [mx, my]);

    const eye = (cx: number) => (
        <g>
            <ellipse cx={cx} cy={206} rx={25} ry={26} fill={PAPER} />
            <motion.g style={{ x: pupilX, y: pupilY }}>
                <motion.g animate={{ scaleY: blink ? 0.12 : 1 }} transition={{ duration: 0.06 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                    <circle cx={cx} cy={206} r={11} fill={INK} />
                    <circle cx={cx + 4} cy={202} r={3.4} fill={PAPER} />
                </motion.g>
            </motion.g>
            <ellipse cx={cx} cy={206} rx={25} ry={26} fill="none" stroke={INK} strokeWidth={4.5} />
        </g>
    );

    return (
        <div ref={ref} className={cn('relative', className)}>
            <svg viewBox="0 0 400 520" className="h-full w-full overflow-visible" role="img" aria-label="CodeSprint mascot: a student coding on a laptop, watching your cursor">
                {/* soft neon glow behind */}
                <ellipse cx={200} cy={250} rx={150} ry={160} fill={NEON} opacity={0.1} />

                {/* body / hoodie */}
                <motion.g style={{ rotate: bodyRot, transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
                    <path d="M44 520 C 44 406, 104 350, 200 350 C 296 350, 356 406, 356 520 Z" fill={HOODIE} />
                    <path d="M120 366 C 150 350, 250 350, 280 366 L 268 380 C 240 366, 160 366, 132 380 Z" fill={HOODIE_HI} />
                    {/* hoodie strings */}
                    <line x1={184} y1={370} x2={178} y2={424} stroke={NEON} strokeWidth={4} strokeLinecap="round" />
                    <line x1={216} y1={370} x2={222} y2={424} stroke={NEON} strokeWidth={4} strokeLinecap="round" />
                    <circle cx={178} cy={428} r={5} fill={NEON} />
                    <circle cx={222} cy={428} r={5} fill={NEON} />
                    {/* neck */}
                    <rect x={176} y={300} width={48} height={60} rx={22} fill={SKIN_SHADE} />
                </motion.g>

                {/* head */}
                <motion.g style={{ rotate: headRot, x: headX, y: headY, transformBox: 'fill-box', transformOrigin: '50% 95%' }}>
                    {/* ears */}
                    <circle cx={112} cy={210} r={17} fill={SKIN_SHADE} />
                    <circle cx={288} cy={210} r={17} fill={SKIN_SHADE} />
                    {/* face */}
                    <ellipse cx={200} cy={200} rx={94} ry={104} fill={SKIN} />
                    {/* hair */}
                    <path d="M104 188 C 94 104, 160 72, 214 80 C 276 88, 310 128, 298 196 C 282 156, 250 146, 220 150 C 188 154, 156 140, 136 124 C 124 146, 112 166, 104 188 Z" fill={INK} />

                    {/* eyebrows */}
                    <motion.g style={{ y: browY }}>
                        <path d="M138 166 Q 162 154 186 164" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
                        <path d="M214 164 Q 238 154 262 166" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
                    </motion.g>

                    {/* glasses + eyes */}
                    {eye(162)}
                    {eye(238)}
                    <line x1={187} y1={206} x2={213} y2={206} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />

                    {/* nose + smile + cheeks */}
                    <path d="M197 230 Q 200 244 207 240" fill="none" stroke={SKIN_SHADE} strokeWidth={4} strokeLinecap="round" />
                    <ellipse cx={142} cy={252} rx={14} ry={9} fill="#f5a088" opacity={0.4} />
                    <ellipse cx={258} cy={252} rx={14} ry={9} fill="#f5a088" opacity={0.4} />
                    <path d="M176 262 Q 200 286 224 262 Q 200 276 176 262 Z" fill={INK} />

                    {/* headphones */}
                    <path d="M98 212 C 90 92, 310 92, 302 212" fill="none" stroke={NEON} strokeWidth={13} strokeLinecap="round" />
                    <rect x={82} y={186} width={32} height={60} rx={13} fill={INK} />
                    <rect x={90} y={198} width={6} height={36} rx={3} fill={NEON} />
                    <rect x={286} y={186} width={32} height={60} rx={13} fill={INK} />
                    <rect x={304} y={198} width={6} height={36} rx={3} fill={NEON} />
                </motion.g>

                {/* laptop held in front — the "coding" */}
                <g>
                    <rect x={86} y={384} width={228} height={150} rx={16} fill="#101216" stroke="#2a2d34" strokeWidth={3} />
                    <rect x={100} y={398} width={200} height={122} rx={8} fill="#0a0c10" />
                    {/* code lines that type on a loop */}
                    {CODE_LINES.map((ln, i) => {
                        const visible = i < codeStep;
                        const typing = i === codeStep - 1;
                        return (
                            <g key={i} opacity={visible ? 1 : 0.12}>
                                <rect x={112 + ln[0]} y={410 + i * 17} width={typing ? ln[1] * 0.6 : ln[1]} height={6} rx={3} fill={ln[2]} opacity={visible ? 0.9 : 0.25} />
                                {typing && <rect x={112 + ln[0] + ln[1] * 0.6 + 3} y={409 + i * 17} width={3} height={8} fill={NEON} className="animate-pulse" />}
                            </g>
                        );
                    })}
                    {/* lid light bar */}
                    <rect x={86} y={384} width={228} height={6} rx={3} fill={NEON} opacity={0.5} />
                    {/* hands resting on the keyboard edge */}
                    <ellipse cx={96} cy={420} rx={22} ry={16} fill={SKIN} />
                    <ellipse cx={304} cy={420} rx={22} ry={16} fill={SKIN} />
                </g>
            </svg>
        </div>
    );
}

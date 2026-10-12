'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

/*
 * Raster mascot that looks at the cursor:
 *  - the head turns in 3D perspective (pivoting near the neck)
 *  - optionally, the irises move inside each eye (separate masked layers)
 * When the pointer is idle — or on touch devices — it glances around itself.
 */

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

type Box = [number, number, number, number]; // x1, y1, x2, y2 in source pixels

export interface EyeRig {
    /** Base image with the irises painted out. */
    base: string;
    eyes: { mask: string; iris: string; box: Box; ibox: Box }[];
}

interface MascotProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    /** 0–1.5: how strongly the head follows the cursor. */
    strength?: number;
    /** Transform origin, e.g. '50% 85%' to pivot at the neck. */
    origin?: string;
    priority?: boolean;
    rig?: EyeRig;
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function Eye({ eye, W, H, ex, ey }: { eye: EyeRig['eyes'][number]; W: number; H: number; ex: MotionValue<string>; ey: MotionValue<string> }) {
    const [x1, y1, x2, y2] = eye.box;
    const [ix1, iy1, ix2, iy2] = eye.ibox;
    const bw = x2 - x1;
    const bh = y2 - y1;
    const mask = {
        WebkitMaskImage: `url(${eye.mask})`,
        maskImage: `url(${eye.mask})`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
    } as React.CSSProperties;
    return (
        <div className="absolute" style={{ left: pct(x1, W), top: pct(y1, H), width: pct(bw, W), height: pct(bh, H), ...mask }} aria-hidden>
            <motion.img
                src={eye.iris}
                alt=""
                draggable={false}
                className="absolute max-w-none select-none"
                style={{ left: pct(ix1 - x1, bw), top: pct(iy1 - y1, bh), width: pct(ix2 - ix1, bw), height: pct(iy2 - iy1, bh), x: ex, y: ey }}
            />
        </div>
    );
}

export default function Mascot({ src, alt, width, height, className, strength = 1, origin = '50% 80%', priority, rig }: MascotProps) {
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 90, damping: 15, mass: 0.7 });
    const sy = useSpring(my, { stiffness: 90, damping: 15, mass: 0.7 });
    // eyes react a little faster than the head
    const ex1 = useSpring(mx, { stiffness: 220, damping: 20 });
    const ey1 = useSpring(my, { stiffness: 220, damping: 20 });

    const rotateY = useTransform(sx, [-1, 1], [-16 * strength, 16 * strength]);
    const rotateX = useTransform(sy, [-1, 1], [9 * strength, -9 * strength]);
    const rotate = useTransform(sx, [-1, 1], [-4 * strength, 4 * strength]);
    const x = useTransform(sx, [-1, 1], [-14 * strength, 14 * strength]);
    const y = useTransform(sy, [-1, 1], [-6 * strength, 4 * strength]);
    const eyeX = useTransform(ex1, [-1, 1], ['-8%', '8%']);
    const eyeY = useTransform(ey1, [-1, 1], ['-5%', '5%']);
    // light shifts opposite the turn so the fur reads as 3D
    const glowX = useTransform(sx, [-1, 1], ['35%', '65%']);
    const glowY = useTransform(sy, [-1, 1], ['30%', '50%']);
    const glow = useTransform([glowX, glowY], ([gx, gy]) => `radial-gradient(40% 35% at ${gx} ${gy}, rgba(255,255,255,0.45), transparent 70%)`);

    useEffect(() => {
        let last = 0;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse' || !ref.current) return;
            const r = ref.current.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height * 0.5; // eye level
            mx.set(clamp((e.clientX - cx) / (window.innerWidth * 0.4)));
            my.set(clamp((e.clientY - cy) / (window.innerHeight * 0.45)));
            last = Date.now();
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        const idle = setInterval(() => {
            if (Date.now() - last < 3500) return;
            mx.set((Math.random() * 2 - 1) * 0.7);
            my.set((Math.random() * 2 - 1) * 0.4);
        }, 2400);
        return () => {
            window.removeEventListener('pointermove', onMove);
            clearInterval(idle);
        };
    }, [mx, my]);

    const maskStyle = (url: string) =>
        ({
            WebkitMaskImage: `url(${url})`,
            maskImage: `url(${url})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'bottom',
            maskPosition: 'bottom',
        }) as React.CSSProperties;

    return (
        <div ref={ref} className={cn('relative [perspective:1100px]', className)}>
            <div className="h-full w-full animate-float-slow">
                <motion.div
                    style={{ rotateX, rotateY, rotate, x, y, transformOrigin: origin }}
                    className="relative h-full w-full [transform-style:preserve-3d] will-change-transform"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={rig ? rig.base : src}
                        alt={alt}
                        width={width}
                        height={height}
                        draggable={false}
                        fetchPriority={priority ? 'high' : undefined}
                        className="h-full w-full select-none object-contain object-bottom drop-shadow-[0_30px_40px_rgba(10,10,10,0.18)]"
                    />
                    {rig && (
                        <div className="absolute inset-0">
                            {rig.eyes.map((eye) => (
                                <Eye key={eye.iris} eye={eye} W={width} H={height} ex={eyeX} ey={eyeY} />
                            ))}
                        </div>
                    )}
                    {/* moving rim light */}
                    <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: glow, ...maskStyle(src) }} />
                </motion.div>
            </div>
        </div>
    );
}

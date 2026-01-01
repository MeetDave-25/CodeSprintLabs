'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RocketParticles = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 -z-10">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full"
                    style={{
                        left: '50%',
                        top: '50%',
                    }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 100],
                        y: [0, (Math.random() - 0.5) * 100],
                        opacity: [1, 0],
                        scale: [1, 0],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
};

interface FloatingRocketProps {
    className?: string;
}

export const FloatingRocket: React.FC<FloatingRocketProps> = ({ className = '' }) => {
    return (
        <div className={`w-full h-full flex items-center justify-center ${className}`}>
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="relative"
            >
                {/* Rocket SVG */}
                <svg
                    width="300"
                    height="300"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-2xl"
                >
                    {/* Flame/Exhaust */}
                    <motion.g
                        animate={{
                            opacity: [0.6, 1, 0.6],
                            scaleY: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <ellipse cx="100" cy="155" rx="15" ry="25" fill="url(#flame1)" />
                        <ellipse cx="85" cy="150" rx="8" ry="15" fill="url(#flame2)" />
                        <ellipse cx="115" cy="150" rx="8" ry="15" fill="url(#flame2)" />
                    </motion.g>

                    {/* Rocket Body */}
                    <path
                        d="M100 20 L120 60 L120 130 L80 130 L80 60 Z"
                        fill="url(#rocketBody)"
                        stroke="#667eea"
                        strokeWidth="2"
                    />

                    {/* Rocket Nose Cone */}
                    <path
                        d="M100 10 L120 60 L80 60 Z"
                        fill="url(#noseCone)"
                        stroke="#a855f7"
                        strokeWidth="2"
                    />

                    {/* Window */}
                    <circle cx="100" cy="70" r="12" fill="url(#window)" stroke="#667eea" strokeWidth="2" />
                    <circle cx="100" cy="70" r="8" fill="#1a1a2e" opacity="0.3" />

                    {/* Text: "CodeSprint Labs" on rocket body */}
                    <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"
                        letterSpacing="0.5"
                    >
                        CodeSprint
                    </text>
                    <text
                        x="100"
                        y="107"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"
                        letterSpacing="0.5"
                    >
                        Labs
                    </text>

                    {/* Left Fin */}
                    <path
                        d="M80 100 L60 140 L80 130 Z"
                        fill="url(#fin)"
                        stroke="#ec4899"
                        strokeWidth="2"
                    />

                    {/* Right Fin */}
                    <path
                        d="M120 100 L140 140 L120 130 Z"
                        fill="url(#fin)"
                        stroke="#ec4899"
                        strokeWidth="2"
                    />

                    {/* Details/Stripes */}
                    <rect x="85" y="85" width="30" height="3" fill="#a855f7" opacity="0.6" rx="1.5" />
                    <rect x="85" y="115" width="30" height="3" fill="#a855f7" opacity="0.6" rx="1.5" />

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                        <linearGradient id="noseCone" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient id="fin" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f093fb" />
                        </linearGradient>
                        <radialGradient id="window">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#667eea" stopOpacity="0.6" />
                        </radialGradient>
                        <linearGradient id="flame1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <linearGradient id="flame2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fcd34d" />
                            <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Particle Effects */}
                <RocketParticles />

                {/* Glow Effect */}
                <motion.div
                    className="absolute inset-0 -z-20 blur-3xl"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                </motion.div>
            </motion.div>
        </div>
    );
};

import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
            screens: { '2xl': '1280px' },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-inter, system-ui)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono, ui-monospace)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
                serif: ['var(--font-serif, Georgia)', 'Iowan Old Style', 'Georgia', 'serif'],
            },
            colors: {
                // Primary brand scale (neon lime). Use `brand-*` for all new UI.
                // 300-400 are the neon tones: pair them with black text (see `.on-neon`).
                brand: {
                    50: '#f8ffe5',
                    100: '#efffc2',
                    200: '#e2ff8c',
                    300: '#d4ff57',
                    400: '#c6ff2e',
                    500: '#a9e20b',
                    600: '#86b300',
                    700: '#658700',
                    800: '#4c6600',
                    900: '#354700',
                    950: '#1c2600',
                },
                // Marketing palette: cream + ink + neon (brand-400)
                cream: {
                    DEFAULT: '#f4f2eb',
                    2: '#ebe8de',
                    3: '#dfdbcd',
                    muted: '#6b6a63',
                },
                // Calm marketing palette (Apple-like neutrals + navy accent)
                mk: {
                    bg: '#ffffff',
                    alt: '#f5f5f7',
                    line: '#e5e5ea',
                    text: '#1d1d1f',
                    muted: '#6e6e73',
                    link: '#0066cc',
                },
                navy: {
                    50: '#f0f4fa',
                    100: '#dde6f3',
                    200: '#b9cbe6',
                    300: '#8aa7d3',
                    400: '#5a80bd',
                    500: '#3a62a6',
                    600: '#284c8c',
                    700: '#1f3c72',
                    800: '#172d57',
                    900: '#0f1f3f',
                    950: '#0a1428',
                },
                // Industrial paper (marketing pages)
                paper: {
                    DEFAULT: '#ecebe4',
                    2: '#e3e1d8',
                    line: '#cfcbbd',
                    ink: '#0b0d0a',
                },
                // Warm off-white replaces pure white everywhere
                white: '#f5f4ef',
                // True neutrals (no blue cast) for a premium black UI
                gray: colors.neutral,
                // Neutral surfaces for the dark UI
                ink: {
                    950: '#050505',
                    900: '#0a0a0a',
                    850: '#0f0f0f',
                    800: '#141414',
                    700: '#1b1b1b',
                    600: '#262626',
                },
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                accent: {
                    purple: '#a855f7',
                    pink: '#ec4899',
                    orange: '#f97316',
                    cyan: '#06b6d4',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-primary': 'linear-gradient(135deg, #c6ff2e 0%, #86b300 100%)',
                'gradient-accent': 'linear-gradient(135deg, #f5f4ef 0%, #c6ff2e 100%)',
                'gradient-success': 'linear-gradient(135deg, #34d399 0%, #22d3ee 100%)',
                'gradient-warm': 'linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 8s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
                'fade-in': 'fadeIn 0.5s ease-in',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'shimmer': 'shimmer 1.8s linear infinite',
                'marquee': 'marquee 40s linear infinite',
                'float-slow': 'floatSlow 7s ease-in-out infinite',
                'float-slower': 'floatSlow 9s ease-in-out infinite reverse',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(12px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-12px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.96)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
            boxShadow: {
                'glow': '0 0 0 1px rgba(198,255,46,0.25), 0 8px 32px -8px rgba(198,255,46,0.3)',
                'glow-lg': '0 0 0 1px rgba(198,255,46,0.3), 0 16px 48px -12px rgba(198,255,46,0.4)',
                'neon': '0 0 5px theme("colors.brand.500"), 0 0 20px theme("colors.brand.500")',
                'card': 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 1px 2px 0 rgba(0,0,0,0.4)',
                'elevated': 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 24px 48px -12px rgba(0,0,0,0.6)',
                'button': 'inset 0 1px 0 0 rgba(255,255,255,0.45), 0 1px 2px 0 rgba(0,0,0,0.3), 0 6px 24px -6px rgba(198,255,46,0.55)',
            },
        },
    },
    plugins: [],
};

export default config;

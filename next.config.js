/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Performance optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Optimize package imports
    experimental: {
        optimizePackageImports: ['framer-motion', 'lucide-react', '@react-three/fiber', '@react-three/drei'],
    },

    images: {
        domains: [],
        formats: ['image/avif', 'image/webp'],
    },

    async headers() {
        const securityHeaders = [
            { key: 'X-DNS-Prefetch-Control', value: 'on' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
            },
        ];

        return [
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },

    async redirects() {
        return [
            // Redirect www to non-www (adjust if you use www as canonical)
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'www.codesprintlabs.com' }],
                destination: 'https://codesprintlabs.com/:path*',
                permanent: true,
            },
        ];
    },

    // Rewrites: local app/api/* routes execute first; unmigrated endpoints proxy cleanly without browser CORS
    async rewrites() {
        const backendUrl = process.env.BACKEND_API_URL || 'https://codesprintlabs.onrender.com';
        return {
            fallback: [
                {
                    source: '/api/:path*',
                    destination: `${backendUrl}/api/:path*`,
                },
            ],
        };
    },

    webpack: (config) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });
        return config;
    },
};

module.exports = nextConfig;

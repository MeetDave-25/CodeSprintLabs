import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/student/',
                    '/api/',
                    '/thank-you',
                    '/auth/callback',
                    '/auth/verify-email',
                ],
            },
        ],
        sitemap: 'https://codesprintlabs.com/sitemap.xml',
    };
}

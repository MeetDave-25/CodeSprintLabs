import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with CodeSprint Labs. Have questions about internships, courses or certificates? We respond within 24 hours.',
    openGraph: {
        title: 'Contact CodeSprint Labs',
        description: 'Have questions about internships, courses or certificates? We respond within 24 hours.',
        url: 'https://codesprintlabs.com/contact',
    },
    twitter: {
        title: 'Contact CodeSprint Labs',
        description: 'Have questions about internships, courses or certificates? We respond within 24 hours.',
    },
    alternates: { canonical: 'https://codesprintlabs.com/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

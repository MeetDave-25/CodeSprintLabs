import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about CodeSprint Labs — our mission to bridge the gap between education and employment with real-world internships, mentor reviews, and verifiable certificates.',
    openGraph: {
        title: 'About CodeSprint Labs',
        description: 'Our mission: make industry-ready tech education accessible to every aspiring developer in India.',
        url: 'https://codesprintlabs.com/about',
    },
    twitter: {
        title: 'About CodeSprint Labs',
        description: 'Our mission: make industry-ready tech education accessible to every aspiring developer in India.',
    },
    alternates: { canonical: 'https://codesprintlabs.com/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

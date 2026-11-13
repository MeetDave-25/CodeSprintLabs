import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Read the CodeSprint Labs Privacy Policy — how we collect, use, and protect your personal data.',
    alternates: { canonical: 'https://codesprintlabs.com/privacy' },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

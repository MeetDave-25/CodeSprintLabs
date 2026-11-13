import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'Learn how CodeSprint Labs uses cookies and similar technologies on our platform.',
    alternates: { canonical: 'https://codesprintlabs.com/cookies' },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ',
    description: 'Answers to the most common questions about CodeSprint Labs internships, courses, certificates, refunds and support.',
    alternates: { canonical: 'https://codesprintlabs.com/faq' },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

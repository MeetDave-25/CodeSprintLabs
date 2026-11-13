import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Verify Certificate',
    description: 'Instantly verify any CodeSprint Labs certificate using its unique code. No account required.',
    openGraph: {
        title: 'Verify Certificate – CodeSprint Labs',
        description: 'Instantly verify any CodeSprint Labs certificate. No account required.',
        url: 'https://codesprintlabs.com/verify-certificate',
    },
    alternates: { canonical: 'https://codesprintlabs.com/verify-certificate' },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

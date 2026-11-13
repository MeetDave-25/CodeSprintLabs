import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create a free CodeSprint Labs account and apply to your first internship program today.',
    openGraph: {
        title: 'Create a Free Account – CodeSprint Labs',
        description: 'Sign up free and start your first internship today.',
        url: 'https://codesprintlabs.com/auth/register',
    },
    alternates: { canonical: 'https://codesprintlabs.com/auth/register' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

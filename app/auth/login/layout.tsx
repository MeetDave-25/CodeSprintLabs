import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your CodeSprint Labs account to access your internship dashboard, tasks, courses and certificates.',
    robots: { index: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

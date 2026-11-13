import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thank You',
    description: 'Your submission has been received. The CodeSprint Labs team will be in touch soon.',
    robots: { index: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

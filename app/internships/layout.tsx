import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Internships',
    description: 'Browse industry-ready internship programs in Web Development, Python, Java, DSA, C++ and more. Daily tasks, mentor reviews and a certificate on completion.',
    openGraph: {
        title: 'Internships – CodeSprint Labs',
        description: 'Browse industry-ready internship programs with daily tasks, mentor reviews and verifiable certificates.',
        url: 'https://codesprintlabs.com/internships',
    },
    twitter: {
        title: 'Internships – CodeSprint Labs',
        description: 'Browse industry-ready internship programs with daily tasks, mentor reviews and verifiable certificates.',
    },
    alternates: { canonical: 'https://codesprintlabs.com/internships' },
};

export default function InternshipsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

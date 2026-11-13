import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Courses',
    description: 'Self-paced courses in Web Development, Python, Java, DSA and more. Strengthen the fundamentals your internship daily tasks build on.',
    openGraph: {
        title: 'Courses – CodeSprint Labs',
        description: 'Self-paced courses taught by industry experts. Learn alongside your internship.',
        url: 'https://codesprintlabs.com/courses',
    },
    twitter: {
        title: 'Courses – CodeSprint Labs',
        description: 'Self-paced courses taught by industry experts. Learn alongside your internship.',
    },
    alternates: { canonical: 'https://codesprintlabs.com/courses' },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

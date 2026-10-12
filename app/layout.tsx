import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Inter is self-hosted: next/font/google produced mismatched class hashes between
// the server and client builds, which silently dropped the font.
const inter = localFont({
    src: './fonts/Inter-Variable-latin.woff2',
    weight: '100 900',
    display: 'swap',
    variable: '--font-inter',
    fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
});

const mono = JetBrains_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-mono',
    weight: ['400', '500'],
});

// Editorial accent face for single highlighted words on marketing pages
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--font-serif' });

export const metadata: Metadata = {
    title: {
        default: "CodeSprint Labs - Industry-Ready Internships",
        template: "%s · CodeSprint Labs",
    },
    description: "Join CodeSprint Labs for real-world internships, daily coding tasks, and skill development courses. Build your career with hands-on experience.",
    keywords: "internship, coding, programming, web development, python, java, DSA, courses",
};

export const viewport: Viewport = {
    themeColor: '#0b0d0a',
    colorScheme: 'dark',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable} ${serif.variable}`}>
            <body className={`${inter.className} antialiased`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

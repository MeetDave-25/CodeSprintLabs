import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--font-serif' });

const siteUrl = 'https://codesprintlabs.com';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "CodeSprint Labs - Industry-Ready Internships",
        template: "%s · CodeSprint Labs",
    },
    description: "Join CodeSprint Labs for real-world internships, daily coding tasks, and skill development courses. Build your career with hands-on experience.",
    keywords: ["internship", "coding", "programming", "web development", "python", "java", "DSA", "courses", "tech education", "India"],
    authors: [{ name: 'CodeSprint Labs', url: siteUrl }],
    creator: 'CodeSprint Labs',
    publisher: 'CodeSprint Labs',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: siteUrl,
        siteName: 'CodeSprint Labs',
        title: 'CodeSprint Labs – Industry-Ready Internships',
        description: 'Real-world internships, daily coding tasks, mentor reviews and verifiable certificates. Build your tech career with hands-on experience.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'CodeSprint Labs – Industry-Ready Internships',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CodeSprint Labs – Industry-Ready Internships',
        description: 'Real-world internships, daily coding tasks, mentor reviews and verifiable certificates.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
};

export const viewport: Viewport = {
    themeColor: '#0b0d0a',
    colorScheme: 'dark',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
                {GA_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_ID}');
                            `}
                        </Script>
                    </>
                )}
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Optimize font loading
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: "CodeSprint Labs - Industry-Ready Internships",
    description: "Join CodeSprint Labs for real-world internships, daily coding tasks, and skill development courses. Build your career with hands-on experience.",
    keywords: "internship, coding, programming, web development, python, java, DSA, courses",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={inter.variable}>
            <body className={`${inter.className} antialiased`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

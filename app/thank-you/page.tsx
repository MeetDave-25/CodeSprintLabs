'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Home, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

type ThankYouType = 'contact' | 'enrollment' | 'withdrawal' | 'general';

const messages: Record<ThankYouType, { title: string; body: string; nextLabel: string; nextHref: string }> = {
    contact: {
        title: 'Message received!',
        body: 'Thank you for reaching out. Our team will get back to you within 24 hours.',
        nextLabel: 'Back to home',
        nextHref: '/',
    },
    enrollment: {
        title: 'Application submitted!',
        body: 'Your internship enrollment request has been received. We will review it and send you an offer letter once approved.',
        nextLabel: 'View my internships',
        nextHref: '/student/my-internships',
    },
    withdrawal: {
        title: 'Withdrawal requested',
        body: 'Your withdrawal request has been submitted. Our team will process it shortly and confirm via email.',
        nextLabel: 'Back to dashboard',
        nextHref: '/student/dashboard',
    },
    general: {
        title: 'All done!',
        body: 'Your submission has been received. We will be in touch soon.',
        nextLabel: 'Back to home',
        nextHref: '/',
    },
};

function ThankYouContent() {
    const params = useSearchParams();
    const type = (params.get('type') as ThankYouType) || 'general';
    const msg = messages[type] ?? messages.general;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center py-24 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-lg w-full text-center"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-400/15 ring-1 ring-brand-400/30">
                        <CheckCircle size={40} className="text-brand-400" />
                    </div>

                    <h1 className="text-4xl font-bold mb-4">{msg.title}</h1>
                    <p className="text-lg text-gray-400 mb-10 leading-relaxed">{msg.body}</p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href={msg.nextHref}>
                            <Button variant="primary" size="lg">
                                {msg.nextLabel}
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="secondary" size="lg">
                                <Home className="mr-2" size={18} />
                                Home
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-gray-500">
                        Questions?{' '}
                        <a href="mailto:support@codesprintlabs.com" className="text-brand-400 hover:underline inline-flex items-center gap-1">
                            <Mail size={14} /> support@codesprintlabs.com
                        </a>
                    </p>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <ThankYouContent />
        </Suspense>
    );
}

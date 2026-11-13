'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface FaqItem {
    question: string;
    answer: React.ReactNode;
}

const faqs: { category: string; items: FaqItem[] }[] = [
    {
        category: 'Internships',
        items: [
            {
                question: 'How do I enroll in an internship?',
                answer: 'Create a free account, browse the available internship programs, and click "Apply Now" on the one you want. Your request is reviewed by the team and you receive an offer letter once approved.',
            },
            {
                question: 'How many internships can I do at once?',
                answer: 'You can be enrolled in one active internship at a time. Once you complete or withdraw from a program, you can apply for another.',
            },
            {
                question: 'Can I switch to a different internship after enrolling?',
                answer: 'You can submit a withdrawal request and then apply to a different program. Contact support if you need help.',
            },
            {
                question: 'Are the internships remote?',
                answer: 'Yes, all CodeSprint Labs internship programs are fully remote. You complete daily tasks from anywhere with an internet connection.',
            },
            {
                question: 'What happens if I miss a task?',
                answer: 'Missing tasks affects your streak and points. Consistently missed tasks may result in a completion review before your certificate is issued.',
            },
        ],
    },
    {
        category: 'Certificates',
        items: [
            {
                question: 'Are the certificates recognised by employers?',
                answer: 'Each certificate carries a unique verification code that employers can check instantly at codesprintlabs.com/verify-certificate — no account needed. The certificate is verifiable, not just printable.',
            },
            {
                question: 'When do I receive my certificate?',
                answer: 'Your certificate is issued after your completion review is approved by a mentor. Typically within a few days of finishing your final tasks.',
            },
            {
                question: 'How do I verify someone else\'s certificate?',
                answer: (
                    <>
                        Go to <Link href="/verify-certificate" className="text-brand-400 hover:underline">codesprintlabs.com/verify-certificate</Link> and enter the unique code printed on the certificate. No account is required.
                    </>
                ),
            },
        ],
    },
    {
        category: 'Courses',
        items: [
            {
                question: 'Are courses self-paced?',
                answer: 'Yes. All courses on CodeSprint Labs are fully self-paced — you can start, pause and resume at any time.',
            },
            {
                question: 'Do I need to buy a course to do an internship?',
                answer: 'No. Internship enrollment and courses are separate. Courses complement your internship but are not required for enrollment.',
            },
            {
                question: 'What is the refund policy for courses?',
                answer: 'We offer a 7-day money-back guarantee if you are unsatisfied with a course. Contact support within 7 days of purchase with your order details.',
            },
        ],
    },
    {
        category: 'Account & Payments',
        items: [
            {
                question: 'Is it free to create an account?',
                answer: 'Yes. Creating an account and applying to internships is free. Some courses have a one-time fee.',
            },
            {
                question: 'How do I reset my password?',
                answer: (
                    <>
                        Use the &quot;Forgot password?&quot; link on the <Link href="/auth/login" className="text-brand-400 hover:underline">sign-in page</Link>, or contact us at <a href="mailto:support@codesprintlabs.com" className="text-brand-400 hover:underline">support@codesprintlabs.com</a>.
                    </>
                ),
            },
            {
                question: 'How do I delete my account?',
                answer: (
                    <>
                        Email <a href="mailto:support@codesprintlabs.com" className="text-brand-400 hover:underline">support@codesprintlabs.com</a> with the subject &quot;Delete my account&quot;. We will process your request within 7 business days.
                    </>
                ),
            },
        ],
    },
    {
        category: 'Support',
        items: [
            {
                question: 'How quickly do you respond to support requests?',
                answer: 'We aim to respond within 24 hours on business days. For urgent issues, include "Urgent" in your subject line.',
            },
            {
                question: 'Is there a mobile app?',
                answer: 'The platform is fully responsive and works well on mobile browsers. A dedicated mobile app is planned for a future release.',
            },
        ],
    },
];

function FaqAccordion({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-white hover:text-brand-400 transition-colors"
                aria-expanded={open}
            >
                <span>{item.question}</span>
                <ChevronDown
                    size={20}
                    className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-gray-400 leading-relaxed text-[15px]">{item.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FaqPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-12">
                        Can&apos;t find what you need?{' '}
                        <Link href="/contact" className="text-brand-400 hover:underline">Contact us</Link>.
                    </p>

                    <div className="space-y-10">
                        {faqs.map((section) => (
                            <section key={section.category}>
                                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400 mb-2">
                                    {section.category}
                                </h2>
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-6">
                                    {section.items.map((item) => (
                                        <FaqAccordion key={item.question} item={item} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

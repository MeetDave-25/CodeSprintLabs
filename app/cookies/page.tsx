'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LAST_UPDATED = '13 November 2025';
const CONTACT_EMAIL = 'support@codesprintlabs.com';

const cookieTypes = [
    {
        name: 'Strictly Necessary',
        description: 'These cookies are required for the platform to function. They handle authentication (keeping you signed in), security tokens and session management. You cannot opt out of these.',
        examples: ['auth_token', 'session_id', 'csrf_token'],
    },
    {
        name: 'Functional',
        description: 'These cookies remember your preferences such as your selected role (student / admin), theme choice, and UI state. Disabling them may affect your experience.',
        examples: ['user_role', 'ui_prefs'],
    },
    {
        name: 'Analytics',
        description: 'We use Google Analytics (GA4) to understand how visitors use the platform — which pages are visited, how long sessions last, and where users drop off. All data is aggregated and anonymous.',
        examples: ['_ga', '_gid', '_gat'],
    },
];

export default function CookiesPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Cookie Policy</h1>
                    <p className="text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

                    <div className="space-y-8 text-gray-300 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">What Are Cookies?</h2>
                            <p>
                                Cookies are small text files stored on your device by a website. They let us remember
                                information about your visit so we can provide a smoother, more personalised experience.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">How We Use Cookies</h2>
                            <div className="space-y-6 mt-4">
                                {cookieTypes.map((ct) => (
                                    <div key={ct.name} className="rounded-xl border border-white/10 bg-white/5 p-5">
                                        <h3 className="text-lg font-semibold text-white mb-2">{ct.name}</h3>
                                        <p className="text-sm mb-3">{ct.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ct.examples.map((ex) => (
                                                <code key={ex} className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-brand-400">{ex}</code>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">Third-Party Cookies</h2>
                            <p>
                                Google Analytics may set cookies on our behalf. These are governed by{' '}
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                                    Google&apos;s Privacy Policy
                                </a>.
                                We do not share your personal data with any advertising networks.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">Managing Cookies</h2>
                            <p>
                                You can control and delete cookies through your browser settings. Note that disabling strictly
                                necessary cookies will prevent you from signing in. Here are guides for common browsers:
                            </p>
                            <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                                <li>
                                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Google Chrome</a>
                                </li>
                                <li>
                                    <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Mozilla Firefox</a>
                                </li>
                                <li>
                                    <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Apple Safari</a>
                                </li>
                                <li>
                                    <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Microsoft Edge</a>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">Changes to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time. Changes take effect when published on this page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">Questions?</h2>
                            <p>
                                Email us at{' '}
                                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-400 hover:underline">{CONTACT_EMAIL}</a>
                                {' '}or see our{' '}
                                <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

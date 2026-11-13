'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LAST_UPDATED = '13 November 2025';
const CONTACT_EMAIL = 'support@codesprintlabs.com';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
                    <p className="text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

                    <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">1. Who We Are</h2>
                            <p>
                                CodeSprint Labs (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an online ed-tech platform providing
                                structured internship programs, courses, mentor reviews and verifiable certificates.
                                Our website is located at <a href="https://codesprintlabs.com" className="text-brand-400 hover:underline">codesprintlabs.com</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">2. What Data We Collect</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li><strong>Account information:</strong> name, email address and password (stored hashed).</li>
                                <li><strong>Profile data:</strong> phone number, college name, year of study — provided voluntarily.</li>
                                <li><strong>Usage data:</strong> pages visited, tasks submitted, courses accessed, session timestamps.</li>
                                <li><strong>Communication:</strong> messages you send via our contact form.</li>
                                <li><strong>Payment data:</strong> we use third-party payment processors; we do not store card details.</li>
                                <li><strong>Device &amp; log data:</strong> IP address, browser type and OS collected automatically.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>To create and manage your account.</li>
                                <li>To deliver internship programs, tasks, mentor feedback and certificates.</li>
                                <li>To process payments and issue documents (offer letters, completion letters).</li>
                                <li>To send important updates about your enrollment, tasks or platform changes.</li>
                                <li>To improve platform features and fix technical issues.</li>
                                <li>To comply with legal obligations.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">4. Cookies</h2>
                            <p>
                                We use cookies and similar technologies to keep you signed in, remember preferences and
                                collect analytics. You can control cookies from your browser settings.
                                Read our full <Link href="/cookies" className="text-brand-400 hover:underline">Cookie Policy</Link>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">5. Sharing Your Data</h2>
                            <p>We do not sell your personal data. We share it only:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li>With service providers (hosting, email, analytics) under data-processing agreements.</li>
                                <li>When required by law or to protect our legal rights.</li>
                                <li>With your explicit consent in any other case.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">6. Data Retention</h2>
                            <p>
                                We retain your account data for as long as your account is active.
                                If you delete your account, we remove personal data within 30 days unless a legal obligation requires longer retention.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">7. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li>Access the personal data we hold about you.</li>
                                <li>Correct inaccurate data.</li>
                                <li>Request deletion of your data.</li>
                                <li>Object to or restrict certain processing.</li>
                                <li>Export your data in a portable format.</li>
                            </ul>
                            <p className="mt-3">
                                To exercise any of these rights, email us at{' '}
                                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-400 hover:underline">{CONTACT_EMAIL}</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">8. Security</h2>
                            <p>
                                We implement industry-standard security measures including HTTPS encryption, hashed passwords
                                and access controls. No method of transmission over the internet is 100% secure;
                                we encourage you to keep your password confidential.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">9. Children</h2>
                            <p>
                                Our platform is not directed at children under 13. We do not knowingly collect data
                                from anyone under 13. If you believe a child has registered, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
                            <p>
                                We may update this policy. We will notify you of significant changes via email or a
                                prominent notice on the platform. Continued use after changes means you accept the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-3">11. Contact</h2>
                            <p>
                                Questions about this policy? Email us at{' '}
                                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-400 hover:underline">{CONTACT_EMAIL}</a>
                                {' '}or use our{' '}
                                <Link href="/contact" className="text-brand-400 hover:underline">contact form</Link>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

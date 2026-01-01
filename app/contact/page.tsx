'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email',
            value: 'support@codesprintlabs.com',
            link: 'mailto:support@codesprintlabs.com',
        },
        {
            icon: Phone,
            title: 'Phone',
            value: '+91 98765 43210',
            link: 'tel:+919876543210',
        },
        {
            icon: MapPin,
            title: 'Address',
            value: 'Bangalore, Karnataka, India',
            link: null,
        },
    ];

    const faqs = [
        {
            question: 'How do I enroll in an internship?',
            answer: 'Simply create an account, browse available internships, and click "Enroll Now" on your chosen program.',
        },
        {
            question: 'Are the certificates recognized?',
            answer: 'Yes, our certificates are industry-recognized and valued by top companies across India.',
        },
        {
            question: 'What is the refund policy?',
            answer: 'We offer a 7-day money-back guarantee if you\'re not satisfied with the course content.',
        },
        {
            question: 'Do you provide placement assistance?',
            answer: 'Yes, we have partnerships with 50+ companies and provide dedicated placement support.',
        },
        {
            question: 'Can I switch between internships?',
            answer: 'Yes, you can switch to a different internship within the first week of enrollment.',
        },
        {
            question: 'Is there a mobile app available?',
            answer: 'We\'re currently working on mobile apps for iOS and Android, coming soon!',
        },
    ];

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Get in <span className="gradient-text">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="pb-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {contactInfo.map((info, index) => (
                            <motion.div
                                key={info.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d className="text-center h-full">
                                    <CardContent className="p-6">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                                            <info.icon size={28} className="text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                                        {info.link ? (
                                            <a
                                                href={info.link}
                                                className="text-gray-400 hover:text-purple-400 transition-colors"
                                            >
                                                {info.value}
                                            </a>
                                        ) : (
                                            <p className="text-gray-400">{info.value}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card glow>
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <MessageSquare className="text-purple-400" size={28} />
                                        <CardTitle className="text-3xl">Send us a Message</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Fill out the form below and we'll get back to you within 24 hours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {submitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Send className="text-green-400" size={32} />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                            <p className="text-gray-400">We'll get back to you soon.</p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                                    placeholder="john@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                                    Subject
                                                </label>
                                                <input
                                                    type="text"
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                                                    placeholder="How can we help?"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="message" className="block text-sm font-medium mb-2">
                                                    Message
                                                </label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    rows={6}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                                    placeholder="Tell us more about your inquiry..."
                                                />
                                            </div>

                                            <Button type="submit" variant="primary" size="lg" className="w-full">
                                                Send Message
                                                <Send className="ml-2" size={20} />
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white/5">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Frequently Asked <span className="gradient-text">Questions</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Quick answers to common questions
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                                        <CardDescription>{faq.answer}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

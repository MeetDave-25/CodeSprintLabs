'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Code, Users, Award, Zap, BookOpen, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

// Dynamic imports for heavy 3D components - loads only when needed
const FloatingRocket = dynamic(() => import('@/components/3d/FloatingRocket').then(mod => ({ default: mod.FloatingRocket })), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center"><div className="spinner"></div></div>
});

const ParticleField = dynamic(() => import('@/components/3d/ParticleField').then(mod => ({ default: mod.ParticleField })), {
    ssr: false,
    loading: () => null
});

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function HomePage() {
    const stats = [
        { label: 'Active Students', value: '10,000+', icon: Users },
        { label: 'Internships', value: '50+', icon: Code },
        { label: 'Certificates Issued', value: '5,000+', icon: Award },
        { label: 'Success Rate', value: '95%', icon: TrendingUp },
    ];

    const features = [
        {
            icon: Code,
            title: 'Real-World Projects',
            description: 'Work on industry-standard projects that mirror actual development workflows.',
            gradient: 'from-purple-600 to-pink-600',
        },
        {
            icon: BookOpen,
            title: 'Daily Tasks',
            description: 'Receive curated daily coding challenges tailored to your chosen domain.',
            gradient: 'from-cyan-500 to-blue-500',
        },
        {
            icon: Users,
            title: 'Expert Mentorship',
            description: 'Get guidance from industry professionals and experienced developers.',
            gradient: 'from-orange-500 to-red-500',
        },
        {
            icon: Award,
            title: 'Verified Certificates',
            description: 'Earn recognized certificates to showcase your skills to employers.',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            icon: Zap,
            title: 'Fast-Track Learning',
            description: 'Accelerate your career with intensive, hands-on training programs.',
            gradient: 'from-yellow-500 to-orange-500',
        },
        {
            icon: TrendingUp,
            title: 'Career Growth',
            description: 'Build a portfolio and gain experience that employers value.',
            gradient: 'from-pink-500 to-purple-500',
        },
    ];

    const domains = [
        { name: 'Web Development', color: 'from-blue-500 to-cyan-500', count: '15 Internships' },
        { name: 'Python Programming', color: 'from-green-500 to-emerald-500', count: '12 Internships' },
        { name: 'Java Development', color: 'from-orange-500 to-red-500', count: '10 Internships' },
        { name: 'C++ Programming', color: 'from-purple-500 to-pink-500', count: '8 Internships' },
        { name: 'Data Structures', color: 'from-yellow-500 to-orange-500', count: '10 Internships' },
    ];

    return (
        <div className="min-h-screen">
            <ParticleField />
            <Header />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <div className="container mx-auto px-4 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block mb-4"
                            >
                                <span className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-300">
                                    🚀 Industry-Ready Internships
                                </span>
                            </motion.div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Build Your{' '}
                                <span className="gradient-text">Future</span>
                                <br />
                                With Real Code
                            </h1>

                            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl">
                                Join CodeSprint Labs for hands-on internships, daily coding challenges,
                                and industry-recognized certificates. Transform your skills into a career.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button href="/auth/register" variant="primary" size="lg" className="group">
                                    Start Your Journey
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </Button>
                                <Button href="/internships" variant="outline" size="lg">
                                    Explore Internships
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                    >
                                        <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                                        <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Content - 3D Rocket */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="relative h-[500px] hidden lg:block"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
                            <FloatingRocket className="relative z-10" />
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Choose <span className="gradient-text">CodeSprint Labs</span>?
                        </h2>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                            We provide everything you need to launch your tech career with confidence
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, index) => (
                            <motion.div key={feature.title} variants={fadeInUp}>
                                <Card hover3d glow className="h-full">
                                    <CardHeader>
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                                            <feature.icon size={28} className="text-white" />
                                        </div>
                                        <CardTitle>{feature.title}</CardTitle>
                                        <CardDescription>{feature.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Domains Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Choose Your <span className="gradient-text">Domain</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                            Select from multiple programming domains and start your learning journey
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {domains.map((domain, index) => (
                            <motion.div
                                key={domain.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d className="cursor-pointer group">
                                    <CardContent className="p-6">
                                        <div className={`h-2 w-full rounded-full bg-gradient-to-r ${domain.color} mb-4`}></div>
                                        <h3 className="text-2xl font-bold mb-2 group-hover:gradient-text transition-all">
                                            {domain.name}
                                        </h3>
                                        <p className="text-gray-400">{domain.count}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <Button href="/internships" variant="primary" size="lg">
                            View All Internships
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                        <div className="relative z-10 px-8 py-16 md:py-24 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Join thousands of students who are building their careers with real-world experience
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button href="/auth/register" variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                                    Get Started Free
                                </Button>
                                <Button href="/contact" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                                    Contact Us
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

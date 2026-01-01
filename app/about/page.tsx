'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, Users, Award, Zap, ArrowRight, CheckCircle, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function AboutPage() {
    const stats = [
        { label: 'Active Students', value: '10,000+', icon: Users },
        { label: 'Courses Offered', value: '50+', icon: Target },
        { label: 'Certificates Issued', value: '5,000+', icon: Award },
        { label: 'Success Rate', value: '95%', icon: Zap },
    ];

    const team = [
        {
            name: 'Rajesh Kumar',
            role: 'Founder & CEO',
            bio: '15+ years in tech education and software development',
            gradient: 'from-purple-600 to-pink-600',
        },
        {
            name: 'Priya Sharma',
            role: 'Head of Curriculum',
            bio: 'Former Google engineer with passion for teaching',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Amit Patel',
            role: 'Lead Instructor',
            bio: 'Full-stack developer and mentor to 1000+ students',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            name: 'Sneha Reddy',
            role: 'Student Success Manager',
            bio: 'Dedicated to helping students achieve their goals',
            gradient: 'from-orange-500 to-red-500',
        },
    ];

    const values = [
        {
            icon: Target,
            title: 'Mission-Driven',
            description: 'Empowering students with practical skills for real-world success',
        },
        {
            icon: Users,
            title: 'Student-Centric',
            description: 'Every decision we make prioritizes student learning and growth',
        },
        {
            icon: Award,
            title: 'Quality First',
            description: 'Industry-recognized curriculum designed by expert practitioners',
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'Constantly evolving our methods to match industry trends',
        },
    ];

    const achievements = [
        'Partnered with 50+ companies for placement opportunities',
        'Trained over 10,000 students across India',
        'Maintained 95% student satisfaction rate',
        'Awarded "Best EdTech Platform 2024"',
        'Featured in top tech publications',
        '24/7 student support and mentorship',
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
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            About <span className="gradient-text">CodeSprint Labs</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            We're on a mission to bridge the gap between education and employment by providing
                            industry-ready internships and hands-on learning experiences.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="text-center">
                                    <CardContent className="p-6">
                                        <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                                        <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card hover3d glow className="h-full">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                                        <Target size={28} className="text-white" />
                                    </div>
                                    <CardTitle className="text-3xl">Our Mission</CardTitle>
                                    <CardDescription className="text-base mt-4">
                                        To democratize quality tech education and make industry-ready skills accessible
                                        to every aspiring developer in India. We believe in learning by doing, not just
                                        theory.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card hover3d glow className="h-full">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                        <Zap size={28} className="text-white" />
                                    </div>
                                    <CardTitle className="text-3xl">Our Vision</CardTitle>
                                    <CardDescription className="text-base mt-4">
                                        To become India's leading platform for practical tech education, creating a
                                        generation of skilled developers who are ready to tackle real-world challenges
                                        from day one.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Our <span className="gradient-text">Values</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d className="h-full">
                                    <CardHeader>
                                        <value.icon className="w-10 h-10 mb-4 text-purple-400" />
                                        <CardTitle>{value.title}</CardTitle>
                                        <CardDescription>{value.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Meet Our <span className="gradient-text">Team</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Passionate educators and industry experts dedicated to your success
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d className="h-full">
                                    <div className={`h-48 bg-gradient-to-br ${member.gradient} rounded-t-xl flex items-center justify-center`}>
                                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                                            <User size={48} className="text-white" />
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle>{member.name}</CardTitle>
                                        <div className="text-purple-400 font-semibold mb-2">{member.role}</div>
                                        <CardDescription>{member.bio}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Our <span className="gradient-text">Achievements</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Milestones that make us proud
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                                <span className="text-gray-300">{achievement}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
                        <div className="relative z-10 px-8 py-16 md:py-24 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                                Ready to Join Us?
                            </h2>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Start your journey with CodeSprint Labs and transform your career
                            </p>
                            <Link href="/auth/register">
                                <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                                    Get Started Today
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

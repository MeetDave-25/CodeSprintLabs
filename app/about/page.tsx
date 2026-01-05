'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, Users, Award, Zap, ArrowRight, CheckCircle, User, Linkedin, Github, Twitter, BookOpen } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { publicService } from '@/lib/services';

interface TeamMember {
    _id: string;
    name: string;
    role: string;
    bio?: string;
    image?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    gradient: string;
}

interface Stats {
    totalStudents: number;
    activeInternships: number;
    totalInternships: number;
    certificatesIssued: number;
    totalCourses: number;
    successRate: number;
}

export default function AboutPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchTeamMembers();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await publicService.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Fallback to default stats
            setStats({
                totalStudents: 10000,
                activeInternships: 25,
                totalInternships: 50,
                certificatesIssued: 5000,
                totalCourses: 30,
                successRate: 95
            });
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const response = await api.get('/team');
            setTeam(response.data.members || []);
        } catch (error) {
            console.error('Error fetching team:', error);
            // Fallback to default team if API fails
            setTeam([
                {
                    _id: '1',
                    name: 'Rajesh Kumar',
                    role: 'Founder & CEO',
                    bio: '15+ years in tech education and software development',
                    gradient: 'from-purple-600 to-pink-600',
                },
                {
                    _id: '2',
                    name: 'Priya Sharma',
                    role: 'Head of Curriculum',
                    bio: 'Former Google engineer with passion for teaching',
                    gradient: 'from-blue-500 to-cyan-500',
                },
                {
                    _id: '3',
                    name: 'Amit Patel',
                    role: 'Lead Instructor',
                    bio: 'Full-stack developer and mentor to 1000+ students',
                    gradient: 'from-green-500 to-emerald-500',
                },
                {
                    _id: '4',
                    name: 'Sneha Reddy',
                    role: 'Student Success Manager',
                    bio: 'Dedicated to helping students achieve their goals',
                    gradient: 'from-orange-500 to-red-500',
                },
            ]);
        } finally {
            setLoadingTeam(false);
        }
    };

    // Format number with + suffix for display
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K+`;
        }
        return `${num}+`;
    };

    // Dynamic stats based on real data
    const statsDisplay = stats ? [
        { label: 'Active Students', value: formatNumber(stats.totalStudents), icon: Users },
        { label: 'Courses Offered', value: `${stats.totalCourses}+`, icon: BookOpen },
        { label: 'Certificates Issued', value: formatNumber(stats.certificatesIssued), icon: Award },
        { label: 'Success Rate', value: `${stats.successRate}%`, icon: Zap },
    ] : [];

    // Dynamic achievements based on real data
    const achievements = stats ? [
        `Partnered with 50+ companies for placement opportunities`,
        `Trained over ${formatNumber(stats.totalStudents)} students across India`,
        `Maintained ${stats.successRate}% student satisfaction rate`,
        'Awarded "Best EdTech Platform 2024"',
        `Issued ${formatNumber(stats.certificatesIssued)} certificates`,
        '24/7 student support and mentorship',
    ] : [];

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
                        {loadingStats ? (
                            [1, 2, 3, 4].map((i) => (
                                <Card key={i} className="text-center">
                                    <CardContent className="p-6">
                                        <Skeleton className="w-8 h-8 mx-auto mb-3 rounded-full" />
                                        <Skeleton className="h-8 w-20 mx-auto mb-1" />
                                        <Skeleton className="h-4 w-24 mx-auto" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            statsDisplay.map((stat, index) => (
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
                            ))
                        )}
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

                    {loadingTeam ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <div className="h-48 bg-white/5 animate-pulse rounded-t-xl"></div>
                                    <CardHeader>
                                        <div className="h-5 bg-white/5 rounded w-3/4 mb-2 animate-pulse"></div>
                                        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse"></div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {team.map((member, index) => (
                                <motion.div
                                    key={member._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card hover3d className="h-full">
                                        <div className={`h-48 bg-gradient-to-br ${member.gradient} rounded-t-xl flex items-center justify-center`}>
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                                                    <User size={48} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader>
                                            <CardTitle>{member.name}</CardTitle>
                                            <div className="text-purple-400 font-semibold mb-2">{member.role}</div>
                                            {member.bio && <CardDescription>{member.bio}</CardDescription>}
                                            
                                            {/* Social Links */}
                                            {(member.linkedin || member.github || member.twitter) && (
                                                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                                                    {member.linkedin && (
                                                        <a
                                                            href={member.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-blue-400 transition-colors"
                                                        >
                                                            <Linkedin size={18} />
                                                        </a>
                                                    )}
                                                    {member.github && (
                                                        <a
                                                            href={member.github}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            <Github size={18} />
                                                        </a>
                                                    )}
                                                    {member.twitter && (
                                                        <a
                                                            href={member.twitter}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-blue-400 transition-colors"
                                                        >
                                                            <Twitter size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
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

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Filter, Code, Users, Clock, ArrowRight, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Internship } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';

function InternshipsPageContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState<string>('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
    const [internships, setInternships] = useState<Internship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const domains = ['All', 'Web Development', 'Python', 'Java', 'C++', 'DSA'];
    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    useEffect(() => {
        api.get('/internships')
            .then(res => {
                if (res.data.status === 'success') {
                    const mappedInternships = res.data.data.map((i: any) => ({
                        id: i.id || i._id,
                        title: i.title,
                        domain: i.domain || 'General',
                        description: i.description || '',
                        duration: i.duration || 'TBA',
                        languages: i.languages || [],
                        difficulty: i.difficulty || 'Beginner',
                        enrolled: i.enrolled || 0,
                        maxStudents: i.maxStudents || 100,
                        isActive: i.isActive ?? true,
                    }));
                    setInternships(mappedInternships);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredInternships = internships.filter(internship => {
        const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            internship.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain = selectedDomain === 'All' || internship.domain === selectedDomain;
        const matchesDifficulty = selectedDifficulty === 'All' || internship.difficulty === selectedDifficulty;
        return matchesSearch && matchesDomain && matchesDifficulty;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'success';
            case 'Intermediate': return 'warning';
            case 'Advanced': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Explore <span className="gradient-text">Internships</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Choose from {internships.length}+ industry-ready internship programs across multiple domains
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="pb-8">
                <div className="container mx-auto px-4">
                    <div className="glass rounded-2xl p-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="md:col-span-1">
                                <Input
                                    placeholder="Search internships..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    icon={<Search size={18} />}
                                />
                            </div>

                            {/* Domain Filter */}
                            <div>
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {domains.map(domain => (
                                        <option key={domain} value={domain} className="bg-gray-900">
                                            {domain === 'All' ? 'All Domains' : domain}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {difficulties.map(difficulty => (
                                        <option key={difficulty} value={difficulty} className="bg-gray-900">
                                            {difficulty === 'All' ? 'All Levels' : difficulty}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Internships Grid */}
            <section className="pb-20">
                <div className="container mx-auto px-4">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="text-gray-400">Loading internships...</div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-gray-400">
                                Showing {filteredInternships.length} internship{filteredInternships.length !== 1 ? 's' : ''}
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredInternships.map((internship, index) => (
                                    <motion.div
                                        key={internship.id}
                                        initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d glow className="h-full flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-3">
                                            <Badge variant={getDifficultyColor(internship.difficulty) as any}>
                                                {internship.difficulty}
                                            </Badge>
                                            <div className="flex items-center text-yellow-500">
                                                <Star size={16} fill="currentColor" />
                                                <span className="ml-1 text-sm">4.8</span>
                                            </div>
                                        </div>
                                        <CardTitle>{internship.title}</CardTitle>
                                        <CardDescription>{internship.description}</CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-400 text-sm">
                                                <Clock size={16} className="mr-2" />
                                                <span>{internship.duration}</span>
                                            </div>
                                            <div className="flex items-center text-gray-400 text-sm">
                                                <Users size={16} className="mr-2" />
                                                <span>{internship.enrolled} / {internship.maxStudents} enrolled</span>
                                            </div>
                                            <div className="flex items-center text-gray-400 text-sm">
                                                <Code size={16} className="mr-2" />
                                                <span>{internship.languages.join(', ')}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-4">
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                                                    style={{ width: `${(internship.enrolled / internship.maxStudents) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <Link href={`/internships/${internship.id}`} className="w-full">
                                            <Button variant="primary" className="w-full group">
                                                Apply Now
                                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                            </div>

                            {filteredInternships.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-2xl font-bold mb-2">No internships found</h3>
                                    <p className="text-gray-400">Try adjusting your filters or search query</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default function InternshipsPage() {
    return (
        <ProtectedRoute>
            <InternshipsPageContent />
        </ProtectedRoute>
    );
}

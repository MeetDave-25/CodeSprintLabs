'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Clock, Users, Star, Filter, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

import api from '@/lib/api';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    students: number;
    rating: number;
    price: number;
    instructor: string;
    image: string;
}


// Removing mock courses...


const categories = ['All', 'Web Development', 'Python', 'Java', 'DSA', 'C++', 'Mobile'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    React.useEffect(() => {
        api.get('/courses')
            .then(res => {
                if (res.data.status === 'success') {
                    const mappedCourses = res.data.data.map((c: any) => ({
                        id: c.id || c._id,
                        title: c.title,
                        description: c.description,
                        category: c.level || 'General',
                        difficulty: c.level || 'Beginner',
                        duration: c.duration,
                        students: c.enrolled || 0,
                        rating: c.rating || 5.0,
                        price: c.price,
                        instructor: c.instructor,
                        image: 'from-blue-500 to-cyan-500' // Placeholder
                    }));
                    setCourses(mappedCourses);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredCourses = courses.filter((course) => {
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesDifficulty && matchesSearch;
    });

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
                            Explore Our <span className="gradient-text">Courses</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Level up your skills with industry-recognized courses taught by expert instructors
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="pb-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        {/* Category Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Filter size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-400">Category</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-lg transition-all ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Filter size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-400">Difficulty</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {difficulties.map((difficulty) => (
                                    <button
                                        key={difficulty}
                                        onClick={() => setSelectedDifficulty(difficulty)}
                                        className={`px-4 py-2 rounded-lg transition-all ${selectedDifficulty === difficulty
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {difficulty}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="pb-20">
                <div className="container mx-auto px-4">
                    <div className="mb-6 text-gray-400">
                        Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover3d glow className="h-full flex flex-col">
                                    <div className={`h-48 bg-gradient-to-br ${course.image} rounded-t-xl flex items-center justify-center`}>
                                        <BookOpen size={64} className="text-white/80" />
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                                course.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {course.difficulty}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-semibold">{course.rating}</span>
                                            </div>
                                        </div>
                                        <CardTitle>{course.title}</CardTitle>
                                        <CardDescription>{course.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock size={16} />
                                                <span>{course.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users size={16} />
                                                <span>{course.students.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-2xl font-bold gradient-text">₹{course.price}</div>
                                                <div className="text-xs text-gray-400">One-time payment</div>
                                            </div>
                                            <Link href={`/courses/${course.id}`}>
                                                <Button variant="primary">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-400">No courses found matching your criteria</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

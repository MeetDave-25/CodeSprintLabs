'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Users,
    Star,
    CheckCircle,
    PlayCircle,
    FileText,
    Award,
    ArrowLeft,
    CreditCard
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Lesson {
    title: string;
    duration?: string;
    type: 'video' | 'article' | 'quiz';
}

interface Module {
    title: string;
    lessons: Lesson[];
}

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
    modules: Module[];
    whatYouWillLearn: string[];
    requirements: string[];
    enrolled?: number;
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);

    // Check if user is enrolled
    useEffect(() => {
        if (user && courseId) {
            api.get('/student/my-courses')
                .then(res => {
                    if (res.data.status === 'success') {
                        const isEnrolled = res.data.data.some((c: any) => 
                            (c.id || c._id) === courseId
                        );
                        setEnrolled(isEnrolled);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [user, courseId]);

    useEffect(() => {
        if (courseId) {
            api.get(`/courses/${courseId}`)
                .then(res => {
                    if (res.data.status === 'success') {
                        const data = res.data.data;
                        // Map backend data to frontend interface
                        const mappedModules = (data.modules || []).map((m: any) => ({
                            title: m.title,
                            lessons: (m.lessons || []).map((l: any) => ({
                                title: l.title,
                                duration: l.duration || '10 min', // Mock duration if missing
                                type: l.type || 'video'
                            }))
                        }));

                        setCourse({
                            id: data.id || data._id,
                            title: data.title,
                            description: data.description,
                            category: data.level || 'General',
                            difficulty: (data.level as any) || 'Beginner',
                            duration: data.duration,
                            students: data.enrolled || 0,
                            enrolled: data.enrolled || 0,
                            rating: data.rating || 4.5, // Mock rating
                            price: data.price,
                            instructor: data.instructor || 'Unknown',
                            image: 'from-blue-500 to-cyan-500', // Mock gradient
                            modules: mappedModules,
                            whatYouWillLearn: data.whatYouWillLearn || [
                                'Build real-world projects',
                                'Master core concepts',
                                'Best practices and patterns'
                            ], // Mock if missing
                            requirements: data.requirements || [
                                'Basic computer knowledge',
                                'Willingness to learn'
                            ]
                        });
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [courseId]);

    // Load Razorpay script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleEnroll = async () => {
        if (!user) {
            alert("Please login to enroll");
            router.push('/auth/login');
            return;
        }

        setIsEnrolling(true);
        try {
            // Check if course is free
            if (course && course.price === 0) {
                // Direct enrollment for free courses
                const res = await api.post(`/student/courses/${courseId}/enroll`);
                if (res.data.status === 'success') {
                    setEnrolled(true);
                    alert('Successfully enrolled in the course!');
                    router.push('/student/my-courses');
                }
            } else {
                // Payment flow for paid courses
                const loaded = await loadRazorpay();
                if (!loaded) {
                    alert('Failed to load payment gateway. Please try again.');
                    return;
                }

                // Create order
                const orderRes = await api.post('/student/payments/create-order', {
                    courseId: courseId
                });

                if (orderRes.data.status !== 'success') {
                    throw new Error('Failed to create payment order');
                }

                const { orderId, amount, currency, key } = orderRes.data.data;

                // Configure Razorpay
                const options = {
                    key: key,
                    amount: amount,
                    currency: currency,
                    name: 'CodeSprint Labs',
                    description: `Enrollment: ${course?.title}`,
                    order_id: orderId,
                    handler: async function (response: any) {
                        try {
                            // Verify payment
                            const verifyRes = await api.post('/student/payments/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });

                            if (verifyRes.data.status === 'success') {
                                setEnrolled(true);
                                alert('Payment successful! You are now enrolled.');
                                router.push('/student/my-courses');
                            }
                        } catch (error: any) {
                            console.error('Payment verification failed:', error);
                            alert('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                    },
                    theme: {
                        color: '#8B5CF6',
                    },
                    modal: {
                        ondismiss: function() {
                            setIsEnrolling(false);
                        }
                    }
                };

                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            }
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                alert("Please login to enroll");
                router.push('/auth/login');
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
                if (error.response.data.message.includes('already enrolled')) {
                    setEnrolled(true);
                }
            } else {
                alert("Failed to enroll. Please try again.");
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                    <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <section className="pt-32 pb-12 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/courses')}
                        className="mb-6"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Courses
                    </Button>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Badge variant="info" className="mb-4">{course.category}</Badge>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>
                            <p className="text-xl text-gray-400 mb-8">{course.description}</p>

                            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-8">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-purple-400" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-blue-400" />
                                    <span>{course.students.toLocaleString()} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                                    <span>{course.rating} Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award size={18} className="text-green-400" />
                                    <span>Certificate of Completion</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold gradient-text">
                                    {course.price === 0 ? 'Free' : `₹${course.price}`}
                                </div>
                                {!enrolled ? (
                                    <Button size="lg" variant="primary" onClick={handleEnroll} isLoading={isEnrolling}>
                                        {course.price === 0 ? (
                                            <>Enroll Free</>
                                        ) : (
                                            <>
                                                <CreditCard size={18} className="mr-2" />
                                                Enroll Now
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button size="lg" variant="secondary" onClick={() => router.push('/student/my-courses')}>
                                        Go to My Courses
                                    </Button>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className={`aspect-video rounded-2xl bg-gradient-to-br ${course.image} flex items-center justify-center shadow-2xl shadow-purple-500/20`}>
                                <PlayCircle size={64} className="text-white/80" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* What you'll learn */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What You'll Learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {course.whatYouWillLearn.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Validated Modules */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                                <CardDescription>{course.modules.length} modules • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {course.modules.map((module, index) => (
                                    <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
                                        <div className="p-4 bg-white/5 font-semibold flex justify-between items-center">
                                            <span>Module {index + 1}: {module.title}</span>
                                            <span className="text-sm text-gray-400">{module.lessons.length} lessons</span>
                                        </div>
                                        <div className="divide-y divide-white/10">
                                            {module.lessons.map((lesson, lIndex) => (
                                                <div key={lIndex} className="p-4 flex items-center justify-between text-sm hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        {lesson.type === 'video' ? <PlayCircle size={16} className="text-blue-400" /> : <FileText size={16} className="text-green-400" />}
                                                        <span>{lesson.title}</span>
                                                    </div>
                                                    <span className="text-gray-500">{lesson.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {course.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-300">
                                            <span className="text-purple-400">•</span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">This course includes:</h3>
                                <ul className="space-y-4 text-sm text-gray-300">
                                    <li className="flex items-center gap-3">
                                        <PlayCircle size={18} className="text-purple-400" />
                                        <span>{course.duration} on-demand video</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <FileText size={18} className="text-purple-400" />
                                        <span>Assignments & Quizzes</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Award size={18} className="text-purple-400" />
                                        <span>Certificate of completion</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Clock size={18} className="text-purple-400" />
                                        <span>Full lifetime access</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

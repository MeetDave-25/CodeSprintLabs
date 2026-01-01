'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    CheckCircle,
    Lock,
    BookOpen,
    Download,
    Award,
    ArrowLeft,
    FileText,
    Upload,
    Calendar,
    Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    points: number;
    difficulty: string;
    dueDate: string;
    completed: boolean;
}

interface Module {
    id: string;
    title: string;
    tasks: Task[];
}

interface CourseDetail {
    id: string;
    title: string;
    description: string;
    progress: number;
    completed: number;
    total: number;
    certificateEligible: boolean;
    certificateCode: string;
    modules: Module[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/student/my-courses/${courseId}`);
                if (response.data.status === 'success') {
                    const data = response.data.data;
                    
                    // Get tasks for this course
                    const tasksResponse = await api.get('/student/tasks', { params: { source: 'course' } });
                    const allTasks = tasksResponse.data.status === 'success' ? tasksResponse.data.data : [];
                    const courseTasks = allTasks.filter((t: any) => t.courseId === courseId || t.courseId === data._id);
                    
                    // Group tasks into modules or create a default module
                    const modules: Module[] = data.modules && data.modules.length > 0 
                        ? data.modules.map((m: any, idx: number) => ({
                            id: m.id || `m${idx}`,
                            title: m.title || `Module ${idx + 1}`,
                            tasks: (m.tasks || m.lessons || []).map((t: any, tidx: number) => ({
                                id: t.id || t._id || `t${tidx}`,
                                title: t.title,
                                points: t.points || 50,
                                difficulty: t.difficulty || 'Medium',
                                dueDate: t.dueDate || new Date().toISOString(),
                                completed: t.completed || t.status === 'completed' || t.status === 'approved'
                            }))
                        }))
                        : [{
                            id: 'm1',
                            title: 'Course Tasks',
                            tasks: courseTasks.map((t: any) => ({
                                id: t.id || t._id,
                                title: t.title,
                                points: t.points || 50,
                                difficulty: t.difficulty || 'Medium',
                                dueDate: t.dueDate || new Date().toISOString(),
                                completed: t.status === 'completed' || t.status === 'approved'
                            }))
                        }];
                    
                    const totalTasks = modules.reduce((acc, m) => acc + m.tasks.length, 0);
                    const completedTasks = modules.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                    
                    setCourse({
                        id: data.id || data._id,
                        title: data.title,
                        description: data.description || 'No description available',
                        progress: progress,
                        completed: completedTasks,
                        total: totalTasks,
                        certificateEligible: progress >= 100,
                        certificateCode: `CERT-${(data.id || data._id).toString().slice(-6).toUpperCase()}`,
                        modules: modules
                    });
                }
            } catch (error) {
                console.error('Failed to fetch course details', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading course details...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                    <Button onClick={() => router.push('/student/my-courses')}>
                        Back to My Courses
                    </Button>
                </div>
            </div>
        );
    }

    const handleDownloadCertificate = async () => {
        setDownloading(true);
        try {
            const response = await api.get(`/student/certificates/${courseId}/download`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${course.certificateCode}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            // Fallback to text certificate
            const certificateContent = `
                ═══════════════════════════════════════════════════════
                           CERTIFICATE OF COMPLETION
                ═══════════════════════════════════════════════════════
                
                This is to certify that the student
                
                has successfully completed the course
                
                            ${course.title}
                
                Issued on: ${new Date().toLocaleDateString()}
                Certificate Code: ${course.certificateCode}
                
                ═══════════════════════════════════════════════════════
                              CodeSprint Labs
                ═══════════════════════════════════════════════════════
            `;

            const blob = new Blob([certificateContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${course.certificateCode}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/20 text-green-400';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
            case 'Hard': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/student/my-courses')}
                    className="mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to My Courses
                </Button>

                {/* Course Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                    <p className="text-gray-400 text-lg mb-6">{course.description}</p>

                    {/* Progress */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Course Progress</div>
                                    <div className="text-2xl font-bold">{course.progress}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400 mb-1">Tasks Completed</div>
                                    <div className="text-2xl font-bold">{course.completed} / {course.total}</div>
                                </div>
                            </div>
                            <ProgressBar value={course.progress} variant="success" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Curriculum */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Course Tasks</h2>

                        {course.modules.map((module, moduleIndex) => (
                            <Card key={module.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen size={20} className="text-purple-400" />
                                        Module {moduleIndex + 1}: {module.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {module.tasks.map((task, taskIndex) => (
                                            <div
                                                key={task.id}
                                                className={`p-4 rounded-lg transition-all ${task.completed
                                                    ? 'bg-green-500/10 border border-green-500/30'
                                                    : 'bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${task.completed
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-white/10'
                                                            }`}>
                                                            {task.completed ? (
                                                                <CheckCircle size={16} />
                                                            ) : (
                                                                <span className="text-sm">{taskIndex + 1}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold mb-2">{task.title}</div>
                                                            <div className="flex flex-wrap gap-2 text-sm">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                                                                    {task.difficulty}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-gray-400">
                                                                    <Target size={14} />
                                                                    {task.points} points
                                                                </span>
                                                                <span className="flex items-center gap-1 text-gray-400">
                                                                    <Calendar size={14} />
                                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        {task.completed ? (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg text-green-400 text-sm font-semibold">
                                                                <CheckCircle size={14} />
                                                                Completed
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => setSelectedTask(task)}
                                                            >
                                                                <Upload size={14} className="mr-1" />
                                                                Submit
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Certificate Card */}
                        {course.certificateEligible ? (
                            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                        <Award size={32} className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Certificate Available!</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Congratulations! You've completed this course.
                                    </p>
                                    <div className="mb-4 p-3 bg-black/30 rounded-lg">
                                        <div className="text-xs text-gray-400 mb-1">Certificate Code</div>
                                        <div className="font-mono text-sm font-bold">{course.certificateCode}</div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        className="w-full mb-2"
                                        onClick={handleDownloadCertificate}
                                        isLoading={downloading}
                                    >
                                        <Download size={18} className="mr-2" />
                                        Download Certificate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push('/verify-certificate')}
                                    >
                                        <FileText size={18} className="mr-2" />
                                        Verify Certificate
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <Lock size={32} className="mx-auto mb-4 text-gray-500" />
                                    <h3 className="font-bold mb-2">Certificate Locked</h3>
                                    <p className="text-sm text-gray-400">
                                        Complete all tasks to unlock your certificate
                                    </p>
                                    <div className="mt-4 text-sm">
                                        <span className="text-purple-400 font-bold">{course.total - course.completed}</span>
                                        <span className="text-gray-400"> tasks remaining</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Course Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Modules</span>
                                    <span className="font-bold">{course.modules.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Tasks</span>
                                    <span className="font-bold">{course.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Completed</span>
                                    <span className="font-bold text-green-400">{course.completed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Remaining</span>
                                    <span className="font-bold text-yellow-400">{course.total - course.completed}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Task Submission Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Task: {selectedTask.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://github.com/username/repo"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Describe your solution..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="primary" className="flex-1">
                                            Submit Task
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setSelectedTask(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

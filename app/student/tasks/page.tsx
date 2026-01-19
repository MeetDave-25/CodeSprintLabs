'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Clock, AlertCircle, Upload, Calendar, Filter, Briefcase, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue' | 'in_progress' | 'approved' | 'rejected' | 'not_started';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    source: 'internship' | 'course';
    sourceName: string;
    activityId?: string;
    feedback?: string;
}

interface Internship {
    id: string;
    title: string;
    progress: number;
    tasksCompleted: number;
    totalTasks: number;
    deadline: string;
}

export default function TasksPage() {
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
    const [selectedSource, setSelectedSource] = useState<'all' | 'internship' | 'course'>('all');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [internships, setInternships] = useState<Internship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submissionFile, setSubmissionFile] = useState('');
    const [submissionLink, setSubmissionLink] = useState('');

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch tasks
                const tasksRes = await api.get('/student/tasks');
                console.log('Tasks API Response:', tasksRes.data);
                // API returns { tasks: [...] } format
                const tasksData = tasksRes.data.tasks || [];
                console.log('Tasks data parsed:', tasksData.length, 'tasks');
                setTasks(tasksData.map((t: any) => ({
                    id: t.id || t._id,
                    title: t.title,
                    description: t.description || '',
                    dueDate: t.dueDate || new Date().toISOString(),
                    status: t.submissionStatus || t.status || 'not_started',
                    difficulty: t.difficulty || 'Medium',
                    points: t.points || 0,
                    source: t.source || 'internship',
                    sourceName: t.sourceName || t.internshipTitle || t.courseTitle || 'Unknown',
                    activityId: t.activityId,
                    internshipId: t.internshipId,
                    dayNumber: t.dayNumber,
                    feedback: t.feedback || ''
                })));

                // Fetch my internships
                const internshipsRes = await api.get('/student/my-internships');
                console.log('Internships API Response:', internshipsRes.data);
                if (internshipsRes.data.status === 'success') {
                    const internshipsData = internshipsRes.data.data || [];
                    setInternships(internshipsData.map((i: any) => ({
                        id: i.id || i._id || i.internshipId,
                        title: i.title || i.internshipTitle || 'Untitled',
                        progress: i.progress || 0,
                        tasksCompleted: i.tasksCompleted || 0,
                        totalTasks: i.totalTasks || 0,
                        deadline: i.deadline || i.endDate || new Date().toISOString()
                    })));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        console.log('handleSubmit called for task:', selectedTask?.id);
        if (!selectedTask) {
            console.error('No selected task');
            return;
        }

        console.log('Submission Link:', submissionLink);

        // Validate GitHub link is provided
        if (!submissionLink || submissionLink.trim() === '') {
            console.warn('Validation failed: No link provided');
            alert('Please enter a GitHub repository URL or link');
            return;
        }

        // Validate it's a valid URL format
        try {
            new URL(submissionLink);
        } catch (e) {
            console.warn('Validation failed: Invalid URL format', submissionLink);
            alert('Please enter a valid URL (e.g., https://github.com/username/repo)');
            return;
        }

        const payload = {
            githubLink: submissionLink,
            notes: submissionFile // Using notes field for general content for now
        };
        console.log('Preparing to submit payload:', payload);

        try {
            console.log(`Sending POST request to /student/tasks/${selectedTask.id}/submit`);
            const res = await api.post(`/student/tasks/${selectedTask.id}/submit`, payload);
            console.log('Response received:', res);

            if (res.data.status === 'success' || res.data.message) {
                console.log('Submission successful');
                alert(res.data.message || 'Task submitted successfully!');
                // Update local status to pending (under review)
                setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'pending' } : t));
                setSelectedTask(null);
                setSubmissionLink('');
                setSubmissionFile('');
            } else {
                console.warn('Unexpected response format:', res.data);
            }
        } catch (error: any) {
            console.error('Submission error caught:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.githubLink?.[0] || 'Failed to submit task';
            alert(errorMessage);
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Map not_started to pending for filtering purposes
        const taskStatus = task.status === 'not_started' ? 'pending' : task.status;
        const matchesStatus = selectedStatus === 'all' || taskStatus === selectedStatus;
        const matchesSource = selectedSource === 'all' || task.source === selectedSource;
        return matchesStatus && matchesSource;
    });

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending' || t.status === 'not_started').length,
        completed: tasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
        overdue: tasks.filter(t => t.status === 'overdue').length,
        rejected: tasks.filter(t => t.status === 'rejected').length,
        totalPoints: tasks.filter(t => t.status === 'completed' || t.status === 'approved').reduce((sum, t) => sum + t.points, 0),
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return <CheckCircle className="text-green-400" size={20} />;
            case 'rejected':
                return <AlertCircle className="text-red-400" size={20} />;
            case 'overdue':
                return <AlertCircle className="text-red-400" size={20} />;
            case 'pending':
                return <Clock className="text-blue-400" size={20} />;
            default:
                return <Clock className="text-yellow-400" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return 'bg-green-500/20 text-green-400';
            case 'rejected':
                return 'bg-red-500/20 text-red-400';
            case 'overdue':
                return 'bg-red-500/20 text-red-400';
            case 'pending':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved ✓';
            case 'rejected':
                return 'Needs Revision';
            case 'pending':
                return 'Under Review';
            case 'completed':
                return 'Completed';
            case 'overdue':
                return 'Overdue';
            case 'not_started':
                return 'Not Started';
            default:
                return status;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-500/20 text-green-400';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'Hard':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Daily Tasks</h1>
                <p className="text-gray-400">Complete tasks from your enrolled internships and courses</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Total Tasks</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                        <div className="text-sm text-gray-400">Not Started</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.status === 'pending').length}</div>
                        <div className="text-sm text-gray-400">Under Review</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                        <div className="text-sm text-gray-400">Approved</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                        <div className="text-sm text-gray-400">Needs Revision</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1a2e]/90 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.totalPoints}</div>
                        <div className="text-sm text-gray-400">Points Earned</div>
                    </CardContent>
                </Card>
            </div>

            {/* My Internships Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Internships</h2>
                    <Link href="/internships">
                        <Button variant="outline">
                            <Briefcase size={16} className="mr-2" />
                            Browse More Internships
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {internships.map((internship) => (
                        <Link key={internship.id} href={`/student/my-internships/${internship.id}`}>
                            <Card hover3d glow className="cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase size={20} className="text-purple-400" />
                                        <CardTitle className="text-lg">{internship.title}</CardTitle>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="font-semibold">{internship.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                                                style={{ width: `${internship.progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>{internship.tasksCompleted} / {internship.totalTasks} tasks completed</span>
                                            <span>Due: {new Date(internship.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                    {internships.length === 0 && !isLoading && (
                        <div className="col-span-2 text-center py-8 text-gray-400">
                            No internships enrolled yet. <Link href="/internships" className="text-purple-400 hover:underline">Browse internships</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-400">Filter by Status:</span>
                    <div className="flex gap-2">
                        {(['all', 'pending', 'completed', 'overdue'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`px-4 py-2 rounded-lg capitalize transition-all ${selectedStatus === status
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-400">Filter by Source:</span>
                    <div className="flex gap-2">
                        {(['all', 'internship', 'course'] as const).map((source) => (
                            <button
                                key={source}
                                onClick={() => setSelectedSource(source)}
                                className={`px-4 py-2 rounded-lg capitalize transition-all ${selectedSource === source
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {source === 'internship' ? (
                                    <><Briefcase size={14} className="inline mr-1" /> Internship</>
                                ) : source === 'course' ? (
                                    <><BookOpen size={14} className="inline mr-1" /> Course</>
                                ) : (
                                    'All'
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tasks Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-4">All Tasks ({filteredTasks.length} of {tasks.length})</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hover3d glow className="h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Source Badge - More Prominent */}
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${task.source === 'internship'
                                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                }`}>
                                                {task.source === 'internship' ? (
                                                    <>
                                                        <Briefcase size={14} />
                                                        INTERNSHIP
                                                    </>
                                                ) : (
                                                    <>
                                                        <BookOpen size={14} />
                                                        COURSE
                                                    </>
                                                )}
                                            </span>
                                            {getStatusIcon(task.status)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                                            {task.difficulty}
                                        </span>
                                    </div>
                                    <CardTitle>{task.title}</CardTitle>
                                    <CardDescription>{task.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            {task.source === 'internship' ? (
                                                <Briefcase size={16} className="text-purple-400" />
                                            ) : (
                                                <BookOpen size={16} className="text-cyan-400" />
                                            )}
                                            <span className="text-gray-400">{task.sourceName}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar size={16} />
                                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="font-semibold text-purple-400">
                                                {task.points} points
                                            </div>
                                        </div>

                                        {/* Show feedback if rejected */}
                                        {task.status === 'rejected' && task.feedback && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <div className="text-xs text-red-400 font-semibold mb-1">Admin Feedback:</div>
                                                <div className="text-sm text-red-300">{task.feedback}</div>
                                            </div>
                                        )}

                                        {/* Approved status */}
                                        {task.status === 'approved' && (
                                            <div className="flex items-center justify-center gap-2 py-3 bg-green-500/20 rounded-lg text-green-400 border border-green-500/30">
                                                <CheckCircle size={18} />
                                                <span className="text-sm font-bold">Task Approved!</span>
                                            </div>
                                        )}

                                        {/* Under review status */}
                                        {task.status === 'pending' && (
                                            <div className="flex items-center justify-center gap-2 py-3 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/30">
                                                <Clock size={18} />
                                                <span className="text-sm font-semibold">Under Admin Review</span>
                                            </div>
                                        )}

                                        {/* Rejected - allow resubmit */}
                                        {task.status === 'rejected' && (
                                            <Button
                                                variant="primary"
                                                className="w-full bg-orange-600 hover:bg-orange-700"
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                <Upload size={16} className="mr-2" />
                                                Resubmit Task
                                            </Button>
                                        )}

                                        {/* Not started - submit */}
                                        {(task.status === 'not_started' || task.status === 'in_progress') && (
                                            <Button
                                                variant="primary"
                                                className="w-full"
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                <Upload size={16} className="mr-2" />
                                                Submit Task
                                            </Button>
                                        )}
                                        {task.status === 'completed' && (
                                            <div className="flex items-center justify-center gap-2 py-2 bg-green-500/10 rounded-lg text-green-400">
                                                <CheckCircle size={16} />
                                                <span className="text-sm font-semibold">Completed</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400">No tasks found</p>
                </div>
            )}

            {/* Submission Modal */}
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
                                <CardDescription>Upload your solution or provide a link</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            GitHub Repository URL / Link <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={submissionLink}
                                            onChange={(e) => setSubmissionLink(e.target.value)}
                                            placeholder="https://github.com/username/repository"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Additional Notes</label>
                                        <textarea
                                            rows={4}
                                            value={submissionFile}
                                            onChange={(e) => setSubmissionFile(e.target.value)}
                                            placeholder="Any additional information..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
                                            Submit
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

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Trash2,
    Plus,
    CheckCircle,
    Clock,
    Award,
    Users,
    BookOpen,
    Edit,
    X,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    points: number;
    status: string;
    chapterId?: string;
}

interface Chapter {
    id: string;
    title: string;
    description: string;
    tasks: Task[];
}

interface Course {
    id: string;
    title: string;
    instructor: string;
    category: string;
    duration: string;
    price: number;
    enrolled: number;
    status: string;
    description: string;
    chapters: Chapter[];
    isActive?: boolean;
    modules?: any[]; // Backend property
}

export default function AdminCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    // State
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        category: '',
        duration: '',
        price: 0,
        description: '',
    });
    const [chapters, setChapters] = useState<Chapter[]>([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [editingChapter, setEditingChapter] = useState<any>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showChapterModal, setShowChapterModal] = useState(false);

    React.useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Fetch public course which has details
                const response = await api.get(`/courses/${courseId}`);
                if (response.data.status === 'success') {
                    const data = response.data.data;
                    const mappedChapters = (data.modules || []).map((m: any) => ({
                        id: m.id || m._id || `ch_${Math.random()}`,
                        title: m.title,
                        description: m.description,
                        tasks: (m.lessons || []).map((l: any) => ({
                            id: l.id || l._id || `task_${Math.random()}`,
                            title: l.title,
                            description: l.content || '',
                            difficulty: l.difficulty || 'Easy',
                            points: l.points || 0,
                            status: 'active'
                        }))
                    }));

                    const courseObj: Course = {
                        id: data.id || data._id,
                        title: data.title,
                        instructor: data.instructor || 'Unknown',
                        category: data.level || 'General',
                        duration: data.duration,
                        price: data.price,
                        enrolled: data.enrolled || 0,
                        status: data.isActive ? 'published' : 'draft',
                        description: data.description,
                        chapters: mappedChapters,
                        isActive: data.isActive
                    };

                    setCurrentCourse(courseObj);
                    setFormData({
                        title: data.title,
                        instructor: data.instructor || '',
                        category: data.level || '',
                        duration: data.duration,
                        price: data.price,
                        description: data.description
                    });
                    setChapters(mappedChapters);
                }
            } catch (error) {
                console.error('Failed to fetch course', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (courseId) fetchCourse();
    }, [courseId]);

    const handleSave = async () => {
        try {
            // Map chapters back to modules for backend
            const modules = chapters.map(ch => ({
                title: ch.title,
                description: ch.description,
                lessons: ch.tasks.map(t => ({
                    title: t.title,
                    content: t.description,
                    difficulty: t.difficulty,
                    points: t.points
                }))
            }));

            const payload = {
                ...formData,
                price: formData.price,
                // Assign category to level as per backend convention we assumed? Or domain?
                // Backend uses: title, description, instructor, price, duration, level
                level: formData.category,
                modules: modules
            };

            const response = await api.put(`/admin/courses/${courseId}`, payload);
            if (response.data.status === 'success') {
                alert('Course updated successfully!');
                setIsEditing(false);
                // Optionally re-fetch or just update local state logic is already handled by optimistic UI updates below? 
                // No, better to update currentCourse to match.
                if (currentCourse) {
                    setCurrentCourse({ ...currentCourse, ...formData, chapters });
                }
            }
        } catch (error) {
            console.error('Failed to update course', error);
            alert('Failed to update course');
        }
    };

    if (isLoading) return <div className="p-6 text-center text-gray-400">Loading course...</div>;
    if (!currentCourse) return <div className="p-6 text-center text-gray-400">Course not found</div>;

    const handleAddChapter = () => {
        setEditingChapter({
            id: `ch${chapters.length + 1}`,
            title: '',
            description: '',
            tasks: []
        });
        setShowChapterModal(true);
    };

    const handleSaveChapter = () => {
        if (editingChapter) {
            const existingIndex = chapters.findIndex(ch => ch.id === editingChapter.id);
            if (existingIndex >= 0) {
                const updatedChapters = [...chapters];
                updatedChapters[existingIndex] = editingChapter;
                setChapters(updatedChapters);
            } else {
                setChapters([...chapters, editingChapter]);
            }
            setShowChapterModal(false);
            setEditingChapter(null);
            alert('Chapter saved successfully!');
        }
    };

    const handleAddTaskToChapter = (chapterId: string) => {
        const chapter = chapters.find(ch => ch.id === chapterId);
        if (chapter) {
            setEditingTask({
                chapterId: chapterId,
                id: `t${chapter.tasks.length + 1}`,
                title: '',
                difficulty: 'Easy',
                points: 50,
                status: 'active',
                description: ''
            });
            setShowTaskModal(true);
        }
    };

    const handleSaveTask = () => {
        if (editingTask) {
            const updatedChapters = chapters.map(chapter => {
                if (chapter.id === editingTask.chapterId) {
                    const existingTaskIndex = chapter.tasks.findIndex(t => t.id === editingTask.id);
                    if (existingTaskIndex >= 0) {
                        const updatedTasks = [...chapter.tasks];
                        updatedTasks[existingTaskIndex] = editingTask;
                        return { ...chapter, tasks: updatedTasks };
                    } else {
                        return { ...chapter, tasks: [...chapter.tasks, editingTask] };
                    }
                }
                return chapter;
            });
            setChapters(updatedChapters);
            setShowTaskModal(false);
            setEditingTask(null);
            alert('Task saved successfully!');
        }
    };

    const handleDeleteTask = (chapterId: string, taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            const updatedChapters = chapters.map(chapter => {
                if (chapter.id === chapterId) {
                    return {
                        ...chapter,
                        tasks: chapter.tasks.filter(t => t.id !== taskId)
                    };
                }
                return chapter;
            });
            setChapters(updatedChapters);
            alert('Task deleted successfully!');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'Hard': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const totalTasks = chapters.reduce((sum, ch) => sum + ch.tasks.length, 0);
    const totalPoints = chapters.reduce((sum, ch) =>
        sum + ch.tasks.reduce((taskSum, task) => taskSum + task.points, 0), 0
    );

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push('/admin/courses')}>
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                        <div>
                            <div>
                                <h1 className="text-4xl font-bold">{isEditing ? formData.title : currentCourse.title}</h1>
                                <p className="text-gray-400">Manage course chapters and tasks</p>
                            </div>
                            <p className="text-gray-400">Manage course chapters and tasks</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        title: currentCourse.title,
                                        instructor: currentCourse.instructor,
                                        category: currentCourse.category,
                                        duration: currentCourse.duration,
                                        price: currentCourse.price,
                                        description: currentCourse.description,
                                    });
                                    setChapters(currentCourse.chapters);
                                }}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSave}>
                                    <Save size={18} className="mr-2" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit size={18} className="mr-2" />
                                    Edit
                                </Button>
                                <Button variant="ghost" className="text-red-400 hover:text-red-300">
                                    <Trash2 size={18} className="mr-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Users size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{currentCourse.enrolled}</div>
                                    <div className="text-sm text-gray-400">Enrolled</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <BookOpen size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{chapters.length}</div>
                                    <div className="text-sm text-gray-400">Chapters</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <CheckCircle size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalTasks}</div>
                                    <div className="text-sm text-gray-400">Total Tasks</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Award size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{totalPoints}</div>
                                    <div className="text-sm text-gray-400">Total Points</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <Input
                                            label="Title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        <Input
                                            label="Instructor"
                                            value={formData.instructor}
                                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                        />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="Category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            />
                                            <Input
                                                label="Duration"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            />
                                        </div>
                                        <Input
                                            label="Price (₹)"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        />
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-400">Instructor</label>
                                                <div className="font-semibold">{currentCourse.instructor}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-400">Category</label>
                                                <div className="font-semibold">{currentCourse.category}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Description</label>
                                            <div className="text-gray-300">{currentCourse.description}</div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chapters and Tasks */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Course Chapters ({chapters.length})</CardTitle>
                                    <Button variant="primary" size="sm" onClick={handleAddChapter}>
                                        <Plus size={16} className="mr-1" />
                                        Add Chapter
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {chapters.map((chapter, chapterIndex) => (
                                        <div key={chapter.id} className="border border-white/10 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold">
                                                        {chapterIndex + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">{chapter.title}</h4>
                                                        <p className="text-sm text-gray-400">{chapter.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setEditingChapter(chapter);
                                                        setShowChapterModal(true);
                                                    }}>
                                                        <Edit size={14} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Chapter Tasks */}
                                            <div className="ml-11 space-y-2">
                                                {chapter.tasks.map((task, taskIndex) => (
                                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <ChevronRight size={16} className="text-gray-400" />
                                                            <div>
                                                                <div className="font-semibold text-sm">{task.title}</div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                                                                        {task.difficulty}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <Award size={12} />
                                                                        {task.points} points
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => {
                                                                setEditingTask({ ...task, chapterId: chapter.id });
                                                                setShowTaskModal(true);
                                                            }}>
                                                                <Edit size={12} />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDeleteTask(chapter.id, task.id)}>
                                                                <Trash2 size={12} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddTaskToChapter(chapter.id)}>
                                                    <Plus size={14} className="mr-1" />
                                                    Add Task to Chapter {chapterIndex + 1}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {chapters.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            No chapters yet. Click "Add Chapter" to create one.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant={currentCourse.status === 'published' ? 'success' : 'warning'} className="text-sm">
                                    {currentCourse.status}
                                </Badge>
                                <div className="mt-4">
                                    <Button variant="outline" className="w-full">
                                        {currentCourse.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-400">Duration</label>
                                    <div className="font-semibold">{currentCourse.duration}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Price</label>
                                    <div className="font-semibold text-green-400">₹{currentCourse.price}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Chapter Edit Modal */}
            {showChapterModal && editingChapter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{editingChapter.title ? 'Edit Chapter' : 'Add New Chapter'}</CardTitle>
                                    <button onClick={() => setShowChapterModal(false)} className="text-gray-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Chapter Title"
                                    value={editingChapter.title}
                                    onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                                    placeholder="e.g., Chapter 1: React Fundamentals"
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={editingChapter.description || ''}
                                        onChange={(e) => setEditingChapter({ ...editingChapter, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="Chapter description..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="primary" className="flex-1" onClick={handleSaveChapter}>
                                        <Save size={16} className="mr-2" />
                                        Save Chapter
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowChapterModal(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Task Edit Modal */}
            {showTaskModal && editingTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{editingTask.title ? 'Edit Task' : 'Add New Task'}</CardTitle>
                                    <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Task Title"
                                    value={editingTask.title}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    placeholder="e.g., Create Your First Component"
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={editingTask.description || ''}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="Task description..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                                    <select
                                        value={editingTask.difficulty}
                                        onChange={(e) => setEditingTask({ ...editingTask, difficulty: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
                                    >
                                        <option value="Easy" className="bg-gray-900 text-white">Easy</option>
                                        <option value="Medium" className="bg-gray-900 text-white">Medium</option>
                                        <option value="Hard" className="bg-gray-900 text-white">Hard</option>
                                    </select>
                                </div>
                                <Input
                                    label="Points"
                                    type="number"
                                    value={editingTask.points}
                                    onChange={(e) => setEditingTask({ ...editingTask, points: parseInt(e.target.value) || 0 })}
                                />
                                <div className="flex gap-3 pt-4">
                                    <Button variant="primary" className="flex-1" onClick={handleSaveTask}>
                                        <Save size={16} className="mr-2" />
                                        Save Task
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

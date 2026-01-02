'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, CheckCircle, Copy, Send, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    description: string;
    domain?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    dayNumber: number;
    internshipId?: string;
    courseId?: string;
    source: string;
    isActive: boolean;
}

interface Internship {
    id: string;
    title: string;
    domain: string;
}

export default function AdminTaskLibraryPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [internships, setInternships] = useState<Internship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Form data for creating task
    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
        points: 100,
        dayNumber: 1,
        internshipId: '',
        requirements: [] as string[],
    });

    // Assignment data
    const [selectedInternshipId, setSelectedInternshipId] = useState('');

    // Fetch tasks and internships
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, internshipsRes] = await Promise.all([
                    api.get('/admin/tasks'),
                    api.get('/admin/internships'),
                ]);
                
                if (tasksRes.data.status === 'success') {
                    setTasks(tasksRes.data.data);
                }
                if (internshipsRes.data.status === 'success') {
                    setInternships(internshipsRes.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || task.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    const stats = {
        total: tasks.length,
        active: tasks.filter(t => t.isActive).length,
        draft: tasks.filter(t => !t.isActive).length,
        totalPoints: tasks.reduce((sum, t) => sum + (t.points || 0), 0),
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'Hard': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getInternshipTitle = (internshipId?: string) => {
        if (!internshipId) return 'Unassigned';
        const internship = internships.find(i => i.id === internshipId);
        return internship?.title || 'Unknown';
    };

    // Create Task Handler
    const handleCreateTask = async () => {
        if (!newTaskData.title.trim()) {
            alert('Please enter a task title');
            return;
        }
        if (!newTaskData.description.trim()) {
            alert('Please enter a task description');
            return;
        }
        if (!newTaskData.internshipId) {
            alert('Please select an internship to assign this task to');
            return;
        }

        setIsCreating(true);
        try {
            console.log('Creating task with data:', newTaskData);
            const response = await api.post('/admin/tasks', {
                title: newTaskData.title.trim(),
                description: newTaskData.description.trim(),
                difficulty: newTaskData.difficulty,
                points: newTaskData.points,
                dayNumber: newTaskData.dayNumber,
                internshipId: newTaskData.internshipId,
                requirements: newTaskData.requirements,
            });

            console.log('Task creation response:', response.data);
            if (response.data.status === 'success') {
                alert('Task created successfully!');
                // Refresh the entire task list to get the latest data
                const tasksRes = await api.get('/admin/tasks');
                if (tasksRes.data.status === 'success') {
                    setTasks(tasksRes.data.data);
                }
                setShowCreateModal(false);
                setNewTaskData({
                    title: '',
                    description: '',
                    difficulty: 'Medium',
                    points: 100,
                    dayNumber: 1,
                    internshipId: '',
                    requirements: [],
                });
            } else {
                alert('Failed to create task: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Failed to create task', error);
            const message = error.response?.data?.message || 
                           error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : 
                           error.message;
            alert('Failed to create task: ' + message);
        } finally {
            setIsCreating(false);
        }
    };

    // Assign Task to Different Internship
    const handleAssignTask = async () => {
        if (!selectedTask || !selectedInternshipId) {
            alert('Please select an internship');
            return;
        }

        try {
            // Create a copy of the task for the new internship
            const response = await api.post('/admin/tasks', {
                title: selectedTask.title,
                description: selectedTask.description,
                difficulty: selectedTask.difficulty,
                points: selectedTask.points,
                dayNumber: selectedTask.dayNumber,
                internshipId: selectedInternshipId,
                requirements: [],
            });

            if (response.data.status === 'success') {
                alert('Task assigned to internship successfully!');
                setTasks([...tasks, response.data.data]);
                setShowAssignModal(false);
                setSelectedTask(null);
                setSelectedInternshipId('');
            }
        } catch (error: any) {
            console.error('Failed to assign task', error);
            alert('Failed to assign task: ' + (error.response?.data?.message || error.message));
        }
    };

    // Duplicate Task
    const handleDuplicateTask = async (task: Task) => {
        try {
            const response = await api.post('/admin/tasks', {
                title: task.title + ' (Copy)',
                description: task.description,
                difficulty: task.difficulty,
                points: task.points,
                dayNumber: task.dayNumber,
                internshipId: task.internshipId,
                requirements: [],
            });

            if (response.data.status === 'success') {
                alert('Task duplicated successfully!');
                setTasks([...tasks, response.data.data]);
            }
        } catch (error: any) {
            console.error('Failed to duplicate task', error);
            alert('Failed to duplicate task: ' + (error.response?.data?.message || error.message));
        }
    };

    // Delete Task
    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await api.delete(`/admin/tasks/${taskId}`);
            if (response.data.status === 'success') {
                setTasks(tasks.filter(t => t.id !== taskId));
                alert('Task deleted successfully!');
            }
        } catch (error: any) {
            console.error('Failed to delete task', error);
            alert('Failed to delete task: ' + (error.response?.data?.message || error.message));
        }
    };

    // Open assign modal
    const openAssignModal = (task: Task) => {
        setSelectedTask(task);
        setSelectedInternshipId('');
        setShowAssignModal(true);
    };

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading tasks...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Task Library</h1>
                    <p className="text-gray-400">Create reusable tasks and assign them to internships</p>
                </div>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} className="mr-2" />
                    Create Task Template
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                        <div className="text-sm text-gray-400">Task Templates</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                        <div className="text-sm text-gray-400">Active</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-400">{stats.draft}</div>
                        <div className="text-sm text-gray-400">Draft</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-400">{stats.totalPoints}</div>
                        <div className="text-sm text-gray-400">Total Points</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search task templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
                                <button
                                    key={difficulty}
                                    onClick={() => setDifficultyFilter(difficulty)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-all ${difficultyFilter === difficulty
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {difficulty}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="space-y-4">
                {filteredTasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card hover3d glow>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{task.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                                                {task.difficulty}
                                            </span>
                                            <Badge variant={task.isActive ? 'success' : 'warning'}>
                                                {task.isActive ? 'active' : 'draft'}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-400 mb-4">{task.description}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                            <div>
                                                <div className="text-sm text-gray-400">Day</div>
                                                <div className="font-semibold">Day {task.dayNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400">Points</div>
                                                <div className="font-semibold text-purple-400">{task.points}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400">Domain</div>
                                                <div className="font-semibold">{task.domain || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-400">Internship</div>
                                                <div className="font-semibold text-xs">{getInternshipTitle(task.internshipId)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => openAssignModal(task)}
                                            title="Assign to another internship"
                                        >
                                            <Send size={14} className="mr-1" />
                                            Assign
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDuplicateTask(task)}
                                            title="Duplicate task"
                                        >
                                            <Copy size={14} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-400 hover:text-red-300"
                                            onClick={() => handleDeleteTask(task.id)}
                                            title="Delete task"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-20">
                    <CheckCircle size={64} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-2xl font-bold mb-2">No Task Templates Found</h3>
                    <p className="text-gray-400 mb-6">Create your first reusable task template</p>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} className="mr-2" />
                        Create Task Template
                    </Button>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg w-full bg-[#0f0f13] border border-white/10 rounded-xl p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Create Task Template</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Task Title *</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                    value={newTaskData.title}
                                    onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
                                    placeholder="e.g. Build a REST API"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description *</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                    value={newTaskData.description}
                                    onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe what the student needs to do..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Assign to Internship *</label>
                                <select
                                    className="w-full bg-[#1a1a24] border border-white/10 rounded p-2 text-white [&>option]:bg-[#1a1a24] [&>option]:text-white"
                                    value={newTaskData.internshipId}
                                    onChange={e => setNewTaskData({ ...newTaskData, internshipId: e.target.value })}
                                >
                                    <option value="">Select an internship</option>
                                    {internships.map(internship => (
                                        <option key={internship.id} value={internship.id}>
                                            {internship.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                                    <select
                                        className="w-full bg-[#1a1a24] border border-white/10 rounded p-2 text-white [&>option]:bg-[#1a1a24] [&>option]:text-white"
                                        value={newTaskData.difficulty}
                                        onChange={e => setNewTaskData({ ...newTaskData, difficulty: e.target.value as any })}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Points</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        value={newTaskData.points}
                                        onChange={e => setNewTaskData({ ...newTaskData, points: parseInt(e.target.value) || 0 })}
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Day Number</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                                        value={newTaskData.dayNumber}
                                        onChange={e => setNewTaskData({ ...newTaskData, dayNumber: parseInt(e.target.value) || 1 })}
                                        min={1}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button 
                                    variant="primary" 
                                    className="flex-1" 
                                    onClick={handleCreateTask}
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 size={18} className="mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Task'
                                    )}
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Assign Task Modal */}
            {showAssignModal && selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Assign Task to Internship</CardTitle>
                                <CardDescription>"{selectedTask.title}"</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-3">
                                        This will create a copy of this task and assign it to the selected internship.
                                    </p>
                                    <label className="block text-sm text-gray-400 mb-2">Select Internship *</label>
                                    <select
                                        className="w-full bg-[#1a1a24] border border-white/10 rounded p-3 text-white [&>option]:bg-[#1a1a24] [&>option]:text-white"
                                        value={selectedInternshipId}
                                        onChange={e => setSelectedInternshipId(e.target.value)}
                                    >
                                        <option value="">Select an internship</option>
                                        {internships.filter(i => i.id !== selectedTask.internshipId).map(internship => (
                                            <option key={internship.id} value={internship.id}>
                                                {internship.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="primary" className="flex-1" onClick={handleAssignTask}>
                                        Assign Task
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAssignModal(false)}>
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

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
    Calendar,
    DollarSign,
    Edit,
    X,
    FileCheck,
    Download,
    Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

// Mock internship data
import api from '@/lib/api';

interface Task {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    dayNumber: number;
    isActive: boolean;
    description: string;
}

interface SyllabusItem {
    week: number;
    topic: string;
}

interface Internship {
    id: string;
    title: string;
    domain: string;
    duration: string;
    price: number;
    enrolled: number;
    isActive: boolean;
    startDate: string;
    description: string;
    requirements: string[];
    languages: string[];
    difficulty: string;
    whatYouWillLearn: string[];
    syllabus: SyllabusItem[];
    maxStudents: number;
    tasks: Task[];
}

export default function AdminInternshipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const internshipId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [internship, setInternship] = useState<Internship | null>(null);
    const [formData, setFormData] = useState<Partial<Internship>>({});
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    
    // State for array fields
    const [requirements, setRequirements] = useState<string[]>([]);
    const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
    
    // State for enrolled students and completion
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [completionMarks, setCompletionMarks] = useState(35);
    const [completionFeedback, setCompletionFeedback] = useState('');
    const [issueCertificateOnComplete, setIssueCertificateOnComplete] = useState(true);
    const [isCompletingInternship, setIsCompletingInternship] = useState(false);
    
    // Temporary input values for adding new items
    const [newRequirement, setNewRequirement] = useState('');
    const [newLearning, setNewLearning] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [newSyllabusWeek, setNewSyllabusWeek] = useState(1);
    const [newSyllabusTopic, setNewSyllabusTopic] = useState('');

    // Fetch internship data
    React.useEffect(() => {
        const fetchInternship = async () => {
            try {
                const response = await api.get(`/internships/${internshipId}`);
                if (response.data.status === 'success') {
                    const data = response.data.data;
                    setInternship(data);
                    setTasks(data.tasks || []);
                    // Initialize array fields
                    setRequirements(data.requirements || []);
                    setWhatYouWillLearn(data.whatYouWillLearn || []);
                    setLanguages(data.languages || []);
                    setSyllabus(data.syllabus || []);
                    // Initialize form data
                    setFormData({
                        title: data.title,
                        domain: data.domain,
                        duration: data.duration,
                        price: data.price || 0,
                        description: data.description,
                        difficulty: data.difficulty || 'Beginner',
                        maxStudents: data.maxStudents || 100,
                    });
                }
            } catch (error) {
                console.error('Error fetching internship:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (internshipId) {
            fetchInternship();
        }
    }, [internshipId]);

    // Fetch enrolled students
    React.useEffect(() => {
        const fetchEnrolledStudents = async () => {
            try {
                const response = await api.get(`/admin/completion-reviews/internship/${internshipId}/enrolled`);
                if (response.data.status === 'success') {
                    setEnrolledStudents(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching enrolled students:', error);
            }
        };

        if (internshipId) {
            fetchEnrolledStudents();
        }
    }, [internshipId]);

    // Handle opening complete modal
    const handleOpenCompleteModal = (student: any) => {
        setSelectedStudent(student);
        setCompletionMarks(student.marks || 35);
        setCompletionFeedback(student.adminFeedback || '');
        setIssueCertificateOnComplete(true);
        setShowCompleteModal(true);
    };

    // Handle completing internship for a student
    const handleCompleteInternship = async () => {
        if (!selectedStudent) return;
        if (completionMarks < 0 || completionMarks > 50) {
            alert('Marks must be between 0 and 50');
            return;
        }

        setIsCompletingInternship(true);
        try {
            const response = await api.post(`/admin/completion-reviews/enrollment/${selectedStudent.id}/complete`, {
                marks: completionMarks,
                feedback: completionFeedback,
                issueCertificate: issueCertificateOnComplete
            });

            if (response.data.status === 'success') {
                alert(issueCertificateOnComplete 
                    ? 'Internship completed and certificate issued!' 
                    : 'Internship completed successfully!');
                setShowCompleteModal(false);
                setSelectedStudent(null);
                // Refresh enrolled students
                const refreshResponse = await api.get(`/admin/completion-reviews/internship/${internshipId}/enrolled`);
                if (refreshResponse.data.status === 'success') {
                    setEnrolledStudents(refreshResponse.data.data || []);
                }
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to complete internship');
        } finally {
            setIsCompletingInternship(false);
        }
    };

    // Calculate grade from marks
    const calculateGrade = (marks: number): string => {
        const percentage = (marks / 50) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    // Get completion status color and label
    const getCompletionStatusBadge = (status: string) => {
        switch (status) {
            case 'certificate_issued':
                return { color: 'bg-green-500/20 text-green-400', label: 'Certificate Issued' };
            case 'reviewed':
                return { color: 'bg-blue-500/20 text-blue-400', label: 'Reviewed' };
            case 'pending_review':
                return { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pending Review' };
            default:
                return { color: 'bg-gray-500/20 text-gray-400', label: 'In Progress' };
        }
    };

    const handleSave = async () => {
        if (!internship) return;

        try {
            const updatedData = {
                ...formData,
                requirements,
                whatYouWillLearn,
                languages,
                syllabus,
                tasks: tasks
            };

            const response = await api.put(`/admin/internships/${internshipId}`, updatedData);

            if (response.data.status === 'success') {
                setInternship(response.data.data);
                setIsEditing(false);
                alert('Internship updated successfully!');
            }
        } catch (error) {
            console.error('Error updating internship:', error);
            alert('Failed to update internship');
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading...</div>;
    }

    if (!internship) {
        return (
            <div className="p-6">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">Internship not found</h2>
                    <Button onClick={() => router.push('/admin/internships')}>
                        Back to Internships
                    </Button>
                </div>
            </div>
        );
    }

    // handleSave is defined above

    const handleEditTask = (task: any) => {
        setEditingTask({ ...task });
        setShowTaskModal(true);
    };

    const handleSaveTask = async () => {
        if (editingTask) {
            // Validate required fields
            if (!editingTask.title?.trim()) {
                alert('Please enter a task title');
                return;
            }
            if (!editingTask.description?.trim()) {
                alert('Please enter a task description');
                return;
            }

            // Check if this is a new task or editing existing
            const existingTaskIndex = tasks.findIndex(t => t.id === editingTask.id);
            
            // Ensure task has all required fields
            const taskToSave = {
                ...editingTask,
                dayNumber: editingTask.dayNumber || (tasks.length + 1),
                isActive: editingTask.isActive !== undefined ? editingTask.isActive : true,
            };
            
            let updatedTasks;
            if (existingTaskIndex >= 0) {
                // Update existing task
                updatedTasks = tasks.map(t =>
                    t.id === editingTask.id ? taskToSave : t
                );
            } else {
                // Add new task
                updatedTasks = [...tasks, taskToSave];
            }
            
            setTasks(updatedTasks);
            setShowTaskModal(false);
            setEditingTask(null);
            
            // Auto-save to database
            try {
                const updatedData = {
                    ...formData,
                    requirements,
                    whatYouWillLearn,
                    languages,
                    syllabus,
                    tasks: updatedTasks
                };

                console.log('Saving internship with tasks:', updatedData);
                const response = await api.put(`/admin/internships/${internshipId}`, updatedData);

                if (response.data.status === 'success') {
                    setInternship(response.data.data);
                    // Update tasks from response to get proper IDs
                    setTasks(response.data.data.tasks || []);
                    alert(existingTaskIndex >= 0 ? 'Task updated and saved!' : 'Task created and saved!');
                } else {
                    alert('Failed to save task: ' + (response.data.message || 'Unknown error'));
                }
            } catch (error: any) {
                console.error('Error saving task:', error);
                console.error('Error response:', error.response?.data);
                let message = 'Unknown error';
                if (error.response?.data?.message) {
                    message = error.response.data.message;
                } else if (error.response?.data?.errors) {
                    message = JSON.stringify(error.response.data.errors);
                } else if (error.message) {
                    message = error.message;
                }
                alert('Failed to save task: ' + message);
            }
        }
    };

    const handleAddTask = () => {
        setEditingTask({
            id: `t${Date.now()}`, // Use timestamp to avoid collisions
            title: '',
            difficulty: 'Easy',
            points: 50,
            dayNumber: tasks.length + 1, // Auto-set day number
            isActive: true,
            description: ''
        });
        setShowTaskModal(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            setTasks(updatedTasks);
            
            // Auto-save to database
            try {
                const updatedData = {
                    ...formData,
                    requirements,
                    whatYouWillLearn,
                    languages,
                    syllabus,
                    tasks: updatedTasks
                };

                const response = await api.put(`/admin/internships/${internshipId}`, updatedData);

                if (response.data.status === 'success') {
                    setInternship(response.data.data);
                    setTasks(response.data.data.tasks || []);
                    alert('Task deleted and saved!');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Task removed locally but failed to save. Please click Save Changes.');
            }
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

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/admin/internships')}
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold">{isEditing ? formData.title : internship.title}</h1>
                            <p className="text-gray-400">Manage internship details and tasks</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    // Reset to original internship data
                                    setFormData({
                                        title: internship.title,
                                        domain: internship.domain,
                                        duration: internship.duration,
                                        price: internship.price,
                                        description: internship.description,
                                        difficulty: internship.difficulty,
                                        maxStudents: internship.maxStudents,
                                    });
                                    setTasks(internship.tasks || []);
                                    setRequirements(internship.requirements || []);
                                    setWhatYouWillLearn(internship.whatYouWillLearn || []);
                                    setLanguages(internship.languages || []);
                                    setSyllabus(internship.syllabus || []);
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
                                <Button 
                                    variant="ghost" 
                                    className="text-red-400 hover:text-red-300"
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
                                            try {
                                                await api.delete(`/admin/internships/${internshipId}`);
                                                alert('Internship deleted successfully!');
                                                router.push('/admin/internships');
                                            } catch (error) {
                                                console.error('Failed to delete internship:', error);
                                                alert('Failed to delete internship');
                                            }
                                        }
                                    }}
                                >
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
                                    <div className="text-2xl font-bold">{internship.enrolled}</div>
                                    <div className="text-sm text-gray-400">Enrolled</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <DollarSign size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">₹{isEditing ? formData.price : internship.price}</div>
                                    <div className="text-sm text-gray-400">Price</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Clock size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{isEditing ? formData.duration : internship.duration}</div>
                                    <div className="text-sm text-gray-400">Duration</div>
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
                                    <div className="text-2xl font-bold">{tasks.length}</div>
                                    <div className="text-sm text-gray-400">Tasks</div>
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
                                <CardTitle>Basic Information</CardTitle>
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
                                            label="Domain"
                                            value={formData.domain}
                                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                        />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="Duration"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            />
                                            <Input
                                                label="Price (₹)"
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Difficulty</label>
                                                <select
                                                    value={formData.difficulty || 'Beginner'}
                                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </select>
                                            </div>
                                            <Input
                                                label="Max Students"
                                                type="number"
                                                value={formData.maxStudents}
                                                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 100 })}
                                            />
                                        </div>

                                        {/* Languages */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Languages / Technologies</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {languages.map((lang, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2">
                                                        {lang}
                                                        <button onClick={() => setLanguages(languages.filter((_, i) => i !== idx))} className="hover:text-red-400">
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newLanguage}
                                                    onChange={(e) => setNewLanguage(e.target.value)}
                                                    placeholder="Add language (e.g., JavaScript)"
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newLanguage.trim()) {
                                                            e.preventDefault();
                                                            setLanguages([...languages, newLanguage.trim()]);
                                                            setNewLanguage('');
                                                        }
                                                    }}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    if (newLanguage.trim()) {
                                                        setLanguages([...languages, newLanguage.trim()]);
                                                        setNewLanguage('');
                                                    }
                                                }}>
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* What You Will Learn */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">What You'll Learn</label>
                                            <div className="space-y-2 mb-2">
                                                {whatYouWillLearn.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                                        <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                                                        <span className="flex-1 text-sm">{item}</span>
                                                        <button onClick={() => setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-400">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newLearning}
                                                    onChange={(e) => setNewLearning(e.target.value)}
                                                    placeholder="Add learning outcome"
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newLearning.trim()) {
                                                            e.preventDefault();
                                                            setWhatYouWillLearn([...whatYouWillLearn, newLearning.trim()]);
                                                            setNewLearning('');
                                                        }
                                                    }}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    if (newLearning.trim()) {
                                                        setWhatYouWillLearn([...whatYouWillLearn, newLearning.trim()]);
                                                        setNewLearning('');
                                                    }
                                                }}>
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Requirements */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Requirements</label>
                                            <div className="space-y-2 mb-2">
                                                {requirements.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                                        <span className="text-purple-400">•</span>
                                                        <span className="flex-1 text-sm">{item}</span>
                                                        <button onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-400">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newRequirement}
                                                    onChange={(e) => setNewRequirement(e.target.value)}
                                                    placeholder="Add requirement"
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newRequirement.trim()) {
                                                            e.preventDefault();
                                                            setRequirements([...requirements, newRequirement.trim()]);
                                                            setNewRequirement('');
                                                        }
                                                    }}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    if (newRequirement.trim()) {
                                                        setRequirements([...requirements, newRequirement.trim()]);
                                                        setNewRequirement('');
                                                    }
                                                }}>
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Syllabus */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Syllabus (Week-by-Week)</label>
                                            <div className="space-y-2 mb-2">
                                                {syllabus.sort((a, b) => a.week - b.week).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                                                            <span className="font-bold text-sm">W{item.week}</span>
                                                        </div>
                                                        <span className="flex-1 text-sm">{item.topic}</span>
                                                        <button onClick={() => setSyllabus(syllabus.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-400">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={newSyllabusWeek}
                                                    onChange={(e) => setNewSyllabusWeek(parseInt(e.target.value) || 1)}
                                                    placeholder="Week"
                                                    min={1}
                                                    className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={newSyllabusTopic}
                                                    onChange={(e) => setNewSyllabusTopic(e.target.value)}
                                                    placeholder="Week topic"
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newSyllabusTopic.trim()) {
                                                            e.preventDefault();
                                                            setSyllabus([...syllabus, { week: newSyllabusWeek, topic: newSyllabusTopic.trim() }]);
                                                            setNewSyllabusWeek(syllabus.length + 2);
                                                            setNewSyllabusTopic('');
                                                        }
                                                    }}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    if (newSyllabusTopic.trim()) {
                                                        setSyllabus([...syllabus, { week: newSyllabusWeek, topic: newSyllabusTopic.trim() }]);
                                                        setNewSyllabusWeek(syllabus.length + 2);
                                                        setNewSyllabusTopic('');
                                                    }
                                                }}>
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-400">Domain</label>
                                                <div className="font-semibold">{internship.domain}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-400">Difficulty</label>
                                                <div className="font-semibold">{internship.difficulty || 'Not set'}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Description</label>
                                            <div className="text-gray-300">{internship.description}</div>
                                        </div>
                                        
                                        {/* Languages */}
                                        {languages.length > 0 && (
                                            <div>
                                                <label className="text-sm text-gray-400">Languages / Technologies</label>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {languages.map((lang, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* What You'll Learn */}
                                        {whatYouWillLearn.length > 0 && (
                                            <div>
                                                <label className="text-sm text-gray-400">What You'll Learn</label>
                                                <ul className="mt-1 space-y-1">
                                                    {whatYouWillLearn.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-300">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Syllabus */}
                                        {syllabus.length > 0 && (
                                            <div>
                                                <label className="text-sm text-gray-400">Syllabus</label>
                                                <div className="mt-2 space-y-2">
                                                    {syllabus.sort((a, b) => a.week - b.week).map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                                                                <span className="font-bold text-xs">W{item.week}</span>
                                                            </div>
                                                            <span className="text-sm text-gray-300">{item.topic}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tasks */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Internship Tasks ({tasks.length})</CardTitle>
                                    <Button variant="primary" size="sm" onClick={handleAddTask}>
                                        <Plus size={16} className="mr-1" />
                                        Add Task
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {tasks.map((task, index) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{task.title}</div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                                                            {task.difficulty}
                                                        </span>
                                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                                            <Award size={14} />
                                                            {task.points} points
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDeleteTask(task.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {tasks.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            No tasks yet. Click "Add Task" to create one.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Enrolled Students */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users size={20} />
                                        Enrolled Students ({enrolledStudents.length})
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {enrolledStudents.map((student) => {
                                        const statusBadge = getCompletionStatusBadge(student.completionStatus);
                                        const progressPercent = student.totalTasks > 0 
                                            ? Math.round((student.tasksCompleted / student.totalTasks) * 100) 
                                            : 0;
                                        
                                        return (
                                            <div
                                                key={student.id}
                                                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                                                {student.studentName?.charAt(0)?.toUpperCase() || 'S'}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">{student.studentName}</div>
                                                                <div className="text-sm text-gray-400">{student.studentEmail}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge.color}`}>
                                                                {statusBadge.label}
                                                            </span>
                                                            <span className="text-sm text-gray-400">
                                                                Tasks: {student.tasksCompleted}/{student.totalTasks} ({progressPercent}%)
                                                            </span>
                                                            <span className="text-sm text-gray-400">
                                                                Points: {student.totalPoints}
                                                            </span>
                                                            {student.marks !== null && student.marks !== undefined && (
                                                                <span className="text-sm text-green-400">
                                                                    Marks: {student.marks}/50 ({student.grade})
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Progress bar */}
                                                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                                                            <div 
                                                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-4">
                                                        {student.completionStatus === 'certificate_issued' ? (
                                                            <Button variant="outline" size="sm" className="text-green-400">
                                                                <Award size={14} className="mr-1" />
                                                                Completed
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                variant="primary" 
                                                                size="sm"
                                                                onClick={() => handleOpenCompleteModal(student)}
                                                            >
                                                                <FileCheck size={14} className="mr-1" />
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {enrolledStudents.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            No students enrolled yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant={internship.isActive ? 'success' : 'warning'} className="text-sm">
                                    {internship.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <div className="mt-4 space-y-2">
                                    <Button variant="outline" className="w-full">
                                        {internship.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Calendar size={14} />
                                        Start Date
                                    </label>
                                    <div className="font-semibold mt-1">
                                        {/* {new Date(internship.startDate).toLocaleDateString()} Start Date not in DB yet */}
                                        N/A
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Duration</label>
                                    <div className="font-semibold">{internship.duration}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements ({requirements.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {requirements.length > 0 ? (
                                    <ul className="space-y-2">
                                        {requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-300">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">No requirements added yet. Click Edit to add.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

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
                                    placeholder="e.g., Build a REST API"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Difficulty</label>
                                        <select
                                            value={editingTask.difficulty}
                                            onChange={(e) => setEditingTask({ ...editingTask, difficulty: e.target.value })}
                                            className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 [&>option]:bg-[#1a1a2e] [&>option]:text-white"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Day Number</label>
                                        <input
                                            type="number"
                                            value={editingTask.dayNumber || ''}
                                            onChange={(e) => setEditingTask({ ...editingTask, dayNumber: e.target.value ? parseInt(e.target.value) : 1 })}
                                            min={1}
                                            placeholder="1"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
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

            {/* Complete Internship Modal */}
            {showCompleteModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg w-full"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Complete Internship</CardTitle>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Assign marks for {selectedStudent.studentName}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Student Info */}
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                            {selectedStudent.studentName?.charAt(0)?.toUpperCase() || 'S'}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{selectedStudent.studentName}</div>
                                            <div className="text-sm text-gray-400">{selectedStudent.studentEmail}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-4 text-sm">
                                        <span className="text-gray-400">
                                            Tasks: <span className="text-white">{selectedStudent.tasksCompleted}/{selectedStudent.totalTasks}</span>
                                        </span>
                                        <span className="text-gray-400">
                                            Points: <span className="text-white">{selectedStudent.totalPoints}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Marks Slider */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">Marks (out of 50)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={completionMarks}
                                            onChange={(e) => setCompletionMarks(parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="w-20 text-center">
                                            <span className="text-2xl font-bold">{completionMarks}</span>
                                            <span className="text-gray-400">/50</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-gray-400">
                                            Percentage: <span className="text-white">{Math.round((completionMarks / 50) * 100)}%</span>
                                        </span>
                                        <span className={`px-2 py-1 rounded font-semibold ${
                                            calculateGrade(completionMarks) === 'A+' || calculateGrade(completionMarks) === 'A' 
                                                ? 'bg-green-500/20 text-green-400'
                                                : calculateGrade(completionMarks) === 'B+' || calculateGrade(completionMarks) === 'B'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : calculateGrade(completionMarks) === 'C' || calculateGrade(completionMarks) === 'D'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            Grade: {calculateGrade(completionMarks)}
                                        </span>
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Feedback (optional)</label>
                                    <textarea
                                        value={completionFeedback}
                                        onChange={(e) => setCompletionFeedback(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="Add feedback for the student..."
                                    />
                                </div>

                                {/* Issue Certificate Checkbox */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="issueCertificate"
                                        checked={issueCertificateOnComplete}
                                        onChange={(e) => setIssueCertificateOnComplete(e.target.checked)}
                                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="issueCertificate" className="text-sm cursor-pointer">
                                        Issue certificate immediately
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button 
                                        variant="primary" 
                                        className="flex-1" 
                                        onClick={handleCompleteInternship}
                                        disabled={isCompletingInternship}
                                    >
                                        {isCompletingInternship ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin">⏳</span>
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                <FileCheck size={16} className="mr-2" />
                                                Complete Internship
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
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

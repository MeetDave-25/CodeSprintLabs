export interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    enrolledInternship?: string;
    domain?: string;
    language?: string;
    progress: number;
    tasksCompleted: number;
    totalTasks: number;
    joinedDate: string;
    status: 'active' | 'completed' | 'blocked';
}

export interface Internship {
    id: string;
    title: string;
    domain: string;
    description: string;
    duration: string;
    languages: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    enrolled: number;
    maxStudents: number;
    isActive: boolean;
    image?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    domain: string;
    language: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    dayNumber: number;
    points: number;
    dueDate?: string;
    requirements: string[];
}

export interface Submission {
    id: string;
    studentId: string;
    studentName: string;
    taskId: string;
    taskTitle: string;
    fileUrl?: string;
    githubLink?: string;
    screenshotUrl?: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string;
    reviewedBy?: string;
    reviewedAt?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price: number;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    thumbnail?: string;
    enrolled: number;
    rating: number;
    modules: CourseModule[];
}

export interface CourseModule {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'quiz';
    duration?: string;
    url?: string;
    completed: boolean;
}

export interface Certificate {
    id: string;
    studentId: string;
    studentName: string;
    internshipTitle: string;
    issueDate: string;
    certificateUrl: string;
    verificationCode: string;
}

export interface Payment {
    id: string;
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentDate: string;
    transactionId: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'task' | 'submission' | 'course' | 'certificate' | 'announcement';
    read: boolean;
    createdAt: string;
    link?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    targetAudience: 'all' | 'students' | 'admins';
    createdBy: string;
    createdAt: string;
    priority: 'low' | 'medium' | 'high';
}

export interface DashboardStats {
    totalStudents: number;
    activeInternships: number;
    pendingSubmissions: number;
    totalRevenue: number;
    studentsGrowth: number;
    submissionsGrowth: number;
    revenueGrowth: number;
}

// Internship Completion Review Types
export interface CompletionReview {
    id: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    internshipId: string;
    internshipTitle: string;
    status: 'pending' | 'reviewed' | 'certificate_issued';
    tasksCompleted: number;
    totalTasks: number;
    totalPoints: number;
    marks?: number; // Out of 50
    adminFeedback?: string;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    certificateId?: string;
    completionLetterPath?: string;
}

export interface EnrollmentWithCompletion {
    id: string;
    userId: string;
    internshipId: string;
    status: 'pending' | 'approved' | 'rejected';
    studentName: string;
    studentEmail: string;
    internshipTitle: string;
    internshipDomain: string;
    startDate?: string;
    endDate?: string;
    // Completion related fields
    completionRequested: boolean;
    completionRequestedAt?: string;
    completionStatus: 'not_requested' | 'pending_review' | 'reviewed' | 'certificate_issued';
    tasksCompleted: number;
    totalTasks: number;
    totalPoints: number;
    marks?: number;
    adminFeedback?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    certificateId?: string;
    completionLetterPath?: string;
}

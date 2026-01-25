import api from './api';

// ============ AUTH SERVICES ============
export const authService = {
    register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
        api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    logout: () => api.post('/auth/logout'),

    me: () => api.get('/auth/me'),

    verifyOtp: (data: { email: string; code: string }) =>
        api.post('/auth/verify-otp', data),

    resendOtp: (email: string) =>
        api.post('/auth/resend-otp', { email }),
};

// ============ STUDENT SERVICES ============
export const studentService = {
    // Profile
    getProfile: () => api.get('/student/profile'),
    updateProfile: (data: any) => api.put('/student/profile', data),
    uploadAvatar: (formData: FormData) =>
        api.post('/student/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getStats: () => api.get('/student/profile/stats'),

    // Tasks
    getTasks: (source?: 'internship' | 'course') =>
        api.get('/student/tasks', { params: { source } }),
    getTask: (id: string) => api.get(`/student/tasks/${id}`),
    submitTask: (id: string, formData: FormData) =>
        api.post(`/student/tasks/${id}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getSubmissions: () => api.get('/student/submissions'),

    // My Internships
    getMyInternships: () => api.get('/student/my-internships'),
    getMyInternship: (id: string) => api.get(`/student/my-internships/${id}`),
    getCurrentTask: (internshipId: string) =>
        api.get(`/student/my-internships/${internshipId}/current-task`),
    requestInternshipCertificate: (id: string) =>
        api.post(`/student/my-internships/${id}/certificate`),

    // Internship Completion
    requestInternshipCompletion: (enrollmentId: string) =>
        api.post(`/student/internship-completion/${enrollmentId}/request`),
    getCompletionStatus: (enrollmentId: string) =>
        api.get(`/student/internship-completion/${enrollmentId}/status`),
    previewCompletionLetter: (enrollmentId: string) =>
        api.get(`/student/internship-completion/${enrollmentId}/letter/preview`),
    downloadCompletionLetter: (enrollmentId: string) =>
        api.get(`/student/internship-completion/${enrollmentId}/letter/download`, { responseType: 'blob' }),

    // My Courses
    getMyCourses: () => api.get('/student/my-courses'),
    getMyCourse: (id: string) => api.get(`/student/my-courses/${id}`),
    requestCourseCertificate: (id: string) =>
        api.post(`/student/my-courses/${id}/certificate`),

    // Enroll
    enrollInternship: (id: string) => api.post(`/student/internships/${id}/enroll`),

    // Certificates
    getCertificates: () => api.get('/student/certificates'),
    downloadCertificate: (id: string) =>
        api.get(`/student/certificates/${id}/download`, { responseType: 'blob' }),
    previewCertificate: (id: string) =>
        api.get(`/student/certificates/${id}/preview`),

    // Payments
    createPaymentOrder: (courseId: string) =>
        api.post('/student/payments/create-order', { courseId }),
    verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        api.post('/student/payments/verify', data),
};

// ============ PUBLIC SERVICES ============
export const publicService = {
    // Internships
    getInternships: (filters?: { domain?: string; difficulty?: string }) =>
        api.get('/internships', { params: filters }),
    getInternship: (id: string) => api.get(`/internships/${id}`),

    // Courses
    getCourses: (filters?: { level?: string }) =>
        api.get('/courses', { params: filters }),
    getCourse: (id: string) => api.get(`/courses/${id}`),

    // Certificate Verification
    verifyCertificate: (code: string) => api.get(`/certificates/verify/${code}`),

    // Landing Page Data
    getStats: () => api.get('/public/stats'),
    getFeaturedInternships: () => api.get('/public/featured-internships'),
    getFeaturedCourses: () => api.get('/public/featured-courses'),
};

// ============ NOTIFICATION SERVICES ============
export const notificationService = {
    getNotifications: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

// ============ ADMIN SERVICES ============
export const adminService = {
    // Dashboard
    getDashboard: () => api.get('/admin/dashboard'),
    getAnalytics: (months?: number) =>
        api.get('/admin/dashboard/analytics', { params: { months } }),
    getOverview: () => api.get('/admin/dashboard/overview'),
    getRecentSubmissions: (limit?: number) =>
        api.get('/admin/dashboard/recent-submissions', { params: { limit } }),
    getRecentEnrollments: (limit?: number) =>
        api.get('/admin/dashboard/recent-enrollments', { params: { limit } }),
    getDistribution: () => api.get('/admin/dashboard/distribution'),

    // Students
    getStudents: (filters?: { status?: string; internship?: string; search?: string }) =>
        api.get('/admin/students', { params: filters }),
    getStudentStats: () => api.get('/admin/students/stats'),
    getStudent: (id: string) => api.get(`/admin/students/${id}`),
    updateStudentStatus: (id: string, status: string) =>
        api.put(`/admin/students/${id}/status`, { status }),
    deleteStudent: (id: string) => api.delete(`/admin/students/${id}`),

    // Submissions
    getSubmissions: (filters?: { status?: string; studentId?: string }) =>
        api.get('/admin/submissions', { params: filters }),
    getSubmission: (id: string) => api.get(`/admin/submissions/${id}`),
    reviewSubmission: (id: string, data: { status: 'approved' | 'rejected'; feedback?: string; points?: number }) =>
        api.put(`/admin/submissions/${id}/review`, data),

    // Internships
    getInternships: () => api.get('/admin/internships'),
    createInternship: (data: any) => api.post('/admin/internships', data),
    getInternship: (id: string) => api.get(`/admin/internships/${id}`),
    updateInternship: (id: string, data: any) => api.put(`/admin/internships/${id}`, data),
    deleteInternship: (id: string) => api.delete(`/admin/internships/${id}`),

    // Courses
    getCourses: () => api.get('/admin/courses'),
    createCourse: (data: any) => api.post('/admin/courses', data),
    getCourse: (id: string) => api.get(`/admin/courses/${id}`),
    updateCourse: (id: string, data: any) => api.put(`/admin/courses/${id}`, data),
    deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),

    // Tasks
    getTasks: (filters?: { source?: string; internshipId?: string; courseId?: string; difficulty?: string }) =>
        api.get('/admin/tasks', { params: filters }),
    getTaskStats: () => api.get('/admin/tasks/stats'),
    createTask: (data: any) => api.post('/admin/tasks', data),
    getTask: (id: string) => api.get(`/admin/tasks/${id}`),
    updateTask: (id: string, data: any) => api.put(`/admin/tasks/${id}`, data),
    deleteTask: (id: string) => api.delete(`/admin/tasks/${id}`),
    toggleTaskStatus: (id: string) => api.put(`/admin/tasks/${id}/toggle-status`),
    bulkUpdateTasks: (tasks: any[]) => api.post('/admin/tasks/bulk-update', { tasks }),

    // Payments
    getPayments: (filters?: { status?: string; from?: string; to?: string; search?: string }) =>
        api.get('/admin/payments', { params: filters }),
    getPaymentStats: () => api.get('/admin/payments/stats'),
    getPayment: (id: string) => api.get(`/admin/payments/${id}`),
    refundPayment: (id: string, reason: string) =>
        api.post(`/admin/payments/${id}/refund`, { reason }),
    exportPayments: (filters?: { status?: string; from?: string; to?: string }) =>
        api.get('/admin/payments/export', { params: filters, responseType: 'blob' }),

    // Internship Completion Reviews
    getCompletionReviews: (filters?: { status?: string; search?: string }) =>
        api.get('/admin/completion-reviews', { params: filters }),
    getCompletionReviewStats: () => api.get('/admin/completion-reviews/stats'),
    getCompletionReview: (id: string) => api.get(`/admin/completion-reviews/${id}`),
    reviewCompletion: (id: string, data: { marks: number; feedback?: string }) =>
        api.post(`/admin/completion-reviews/${id}/review`, data),
    issueCertificateForCompletion: (id: string) =>
        api.post(`/admin/completion-reviews/${id}/issue-certificate`),
    previewCompletionLetter: (id: string) =>
        api.get(`/admin/completion-reviews/${id}/letter/preview`),
    downloadCompletionLetter: (id: string) =>
        api.get(`/admin/completion-reviews/${id}/letter/download`, { responseType: 'blob' }),
    previewCertificateForCompletion: (id: string) =>
        api.get(`/admin/completion-reviews/${id}/certificate/preview`),

    // Admin-initiated completion (for any enrolled student)
    getEnrolledStudentsForInternship: (internshipId: string) =>
        api.get(`/admin/completion-reviews/internship/${internshipId}/enrolled`),
    initiateCompletionForStudent: (enrollmentId: string) =>
        api.post(`/admin/completion-reviews/enrollment/${enrollmentId}/initiate`),
    completeInternshipForStudent: (enrollmentId: string, data: { marks: number; feedback?: string; issueCertificate?: boolean }) =>
        api.post(`/admin/completion-reviews/enrollment/${enrollmentId}/complete`, data),

    // Certificates
    getCertificates: (filters?: { studentId?: string; type?: string; search?: string }) =>
        api.get('/admin/certificates', { params: filters }),
    getCertificateStats: () => api.get('/admin/certificates/stats'),
    issueCertificate: (data: { studentId: string; type: 'internship' | 'course'; internshipId?: string; courseId?: string; marks?: number }) =>
        api.post('/admin/certificates', data),
    getCertificate: (id: string) => api.get(`/admin/certificates/${id}`),
    revokeCertificate: (id: string) => api.delete(`/admin/certificates/${id}`),
    bulkIssueCertificates: (data: { type: 'internship' | 'course'; programId: string; studentIds: string[] }) =>
        api.post('/admin/certificates/bulk-issue', data),
    regenerateCertificatePdf: (id: string) =>
        api.get(`/admin/certificates/${id}/regenerate-pdf`, { responseType: 'blob' }),

    // Announcements
    getAnnouncements: (filters?: { status?: string; audience?: string; priority?: string }) =>
        api.get('/admin/announcements', { params: filters }),
    getAnnouncementStats: () => api.get('/admin/announcements/stats'),
    createAnnouncement: (data: { title: string; content: string; targetAudience: string; priority: string; isActive?: boolean }) =>
        api.post('/admin/announcements', data),
    getAnnouncement: (id: string) => api.get(`/admin/announcements/${id}`),
    updateAnnouncement: (id: string, data: any) => api.put(`/admin/announcements/${id}`, data),
    deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
    publishAnnouncement: (id: string) => api.post(`/admin/announcements/${id}/publish`),
    unpublishAnnouncement: (id: string) => api.post(`/admin/announcements/${id}/unpublish`),

    // Settings
    getProfile: () => api.get('/admin/settings/profile'),
    updateProfile: (data: { name?: string; phone?: string }) =>
        api.put('/admin/settings/profile', data),
    updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
        api.put('/admin/settings/password', data),
    uploadAvatar: (formData: FormData) =>
        api.post('/admin/settings/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getPlatformSettings: () => api.get('/admin/settings/platform'),
    updatePlatformSettings: (data: any) => api.put('/admin/settings/platform', data),
    getAdmins: () => api.get('/admin/settings/admins'),
    createAdmin: (data: { name: string; email: string; password: string }) =>
        api.post('/admin/settings/admins', data),
    deleteAdmin: (id: string) => api.delete(`/admin/settings/admins/${id}`),
    getActivityLogs: () => api.get('/admin/settings/activity-logs'),
};

// ============ ANNOUNCEMENT SERVICES (for users) ============
export const announcementService = {
    getAnnouncements: () => api.get('/announcements'),
};

export default {
    auth: authService,
    student: studentService,
    public: publicService,
    notification: notificationService,
    admin: adminService,
    announcement: announcementService,
};

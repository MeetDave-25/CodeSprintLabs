<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Student\ProfileController;
use App\Http\Controllers\Student\TaskController as StudentTaskController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Student\InternshipController as StudentInternshipController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SubmissionController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\CertificateController as AdminCertificateController;
use App\Http\Controllers\Admin\EnrollmentRequestController as AdminEnrollmentRequestController;
use App\Http\Controllers\Student\EnrollmentRequestController as StudentEnrollmentRequestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'CodeSprint Labs API is running']);
});

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login'])->name('login');
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:api');
    Route::get('/me', [LoginController::class, 'me'])->middleware('auth:api');
    
    // Verification
    Route::post('/verify-otp', [App\Http\Controllers\Auth\VerificationController::class, 'verifyOtp']);
    Route::post('/resend-otp', [App\Http\Controllers\Auth\VerificationController::class, 'resendOtp']);
});

// Public Certificate Verification
Route::get('/certificates/verify/{code}', [App\Http\Controllers\CertificateController::class, 'verify']);

// Public Internships and Courses (browsing)
Route::get('/internships', [App\Http\Controllers\InternshipController::class, 'index']);
Route::get('/internships/{id}', [App\Http\Controllers\InternshipController::class, 'show']);
Route::get('/courses', [App\Http\Controllers\CourseController::class, 'index']);
Route::get('/courses/{id}', [App\Http\Controllers\CourseController::class, 'show']);

// Public Team Members (for About page)
Route::get('/team', [App\Http\Controllers\TeamController::class, 'index']);

// Protected routes for all authenticated users
Route::middleware('auth:api')->group(function () {
    
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount']);
        Route::put('/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [App\Http\Controllers\NotificationController::class, 'markAllRead']);
    });

    // Announcements for users
    Route::get('/announcements', [AnnouncementController::class, 'forUser']);
});

// Student Routes
Route::prefix('student')->middleware('auth:api')->group(function () {
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);
    
    // Resume
    Route::post('/profile/resume', [ProfileController::class, 'uploadResume']);
    Route::post('/profile/resume-url', [ProfileController::class, 'saveResumeUrl']);
    Route::delete('/profile/resume', [ProfileController::class, 'deleteResume']);
    Route::get('/profile/resume/download', [ProfileController::class, 'downloadResume']);

    // Tasks
    Route::get('/tasks', [StudentTaskController::class, 'index']);
    Route::get('/tasks/{id}', [StudentTaskController::class, 'show']);
    Route::post('/tasks/{id}/submit', [StudentTaskController::class, 'submit']);
    Route::get('/submissions', [StudentTaskController::class, 'submissions']);

    // My Internships (enrolled)
    Route::get('/my-internships', [StudentInternshipController::class, 'index']);
    Route::get('/my-internships/{id}', [StudentInternshipController::class, 'show']);
    Route::get('/my-internships/{id}/current-task', [StudentInternshipController::class, 'currentTask']);
    Route::post('/my-internships/{id}/certificate', [StudentInternshipController::class, 'requestCertificate']);

    // My Courses (enrolled)
    Route::get('/my-courses', [StudentCourseController::class, 'index']);
    Route::get('/my-courses/{id}', [StudentCourseController::class, 'show']);
    Route::post('/my-courses/{id}/certificate', [StudentCourseController::class, 'requestCertificate']);

    // Course Enrollment
    Route::post('/courses/{id}/enroll', [StudentCourseController::class, 'enroll']);

    // Enrollment Requests (approval-based system - replaces direct enrollment)
    Route::prefix('enrollment-requests')->group(function () {
        Route::get('/', [StudentEnrollmentRequestController::class, 'index']); // List my requests
        Route::post('/{internshipId}', [StudentEnrollmentRequestController::class, 'store']); // Request enrollment
        Route::get('/{id}', [StudentEnrollmentRequestController::class, 'show']); // Get single request
        Route::post('/{enrollmentId}/withdraw', [StudentEnrollmentRequestController::class, 'requestWithdrawal']); // Request withdrawal
        Route::get('/{enrollmentId}/withdrawal-status', [StudentEnrollmentRequestController::class, 'getWithdrawalStatus']); // Get withdrawal status
    });

    // Documents (MOU, Offer Letter, Partial Completion, Relieving Letter)
    Route::prefix('documents')->group(function () {
        Route::get('/', [StudentEnrollmentRequestController::class, 'getDocuments']); // List available documents
        Route::get('/{enrollmentId}/mou', [App\Http\Controllers\DocumentController::class, 'downloadMOU']);
        Route::get('/{enrollmentId}/offer-letter', [App\Http\Controllers\DocumentController::class, 'downloadOfferLetter']);
        Route::get('/{enrollmentId}/mou/view', [App\Http\Controllers\DocumentController::class, 'viewMOU']);
        Route::get('/{enrollmentId}/offer-letter/view', [App\Http\Controllers\DocumentController::class, 'viewOfferLetter']);
        
        // Withdrawal Documents (for withdrawn enrollments only)
        Route::get('/{enrollmentId}/partial-completion', [App\Http\Controllers\DocumentController::class, 'downloadPartialCompletionLetter']);
        Route::get('/{enrollmentId}/partial-completion/view', [App\Http\Controllers\DocumentController::class, 'viewPartialCompletionLetter']);
        Route::get('/{enrollmentId}/relieving-letter', [App\Http\Controllers\DocumentController::class, 'downloadRelievingLetter']);
        Route::get('/{enrollmentId}/relieving-letter/view', [App\Http\Controllers\DocumentController::class, 'viewRelievingLetter']);
    });

    // Internship Completion (Student requests completion review)
    Route::prefix('internship-completion')->group(function () {
        Route::post('/{enrollmentId}/request', [App\Http\Controllers\Student\CompletionController::class, 'requestCompletion']);
        Route::get('/{enrollmentId}/status', [App\Http\Controllers\Student\CompletionController::class, 'getStatus']);
        Route::get('/{enrollmentId}/letter/preview', [App\Http\Controllers\Student\CompletionController::class, 'previewLetter']);
        Route::get('/{enrollmentId}/letter/download', [App\Http\Controllers\Student\CompletionController::class, 'downloadLetter']);
    });

    // Certificates
    Route::get('/certificates', [App\Http\Controllers\CertificateController::class, 'index']);
    Route::post('/certificates/generate', [App\Http\Controllers\CertificateController::class, 'generate']);
    Route::get('/certificates/{id}/download', [App\Http\Controllers\CertificateController::class, 'download']);
    Route::get('/certificates/{id}/preview', [App\Http\Controllers\CertificateController::class, 'preview']);

    // Payments (for course purchase)
    Route::post('/payments/create-order', [PaymentController::class, 'createOrder']);
    Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']);
});

// Admin Routes
Route::prefix('admin')->middleware(['auth:api', 'admin'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('/dashboard/recent-submissions', [DashboardController::class, 'recentSubmissions']);
    Route::get('/dashboard/recent-enrollments', [DashboardController::class, 'recentEnrollments']);
    Route::get('/dashboard/distribution', [DashboardController::class, 'distribution']);

    // Students
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/stats', [StudentController::class, 'stats']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::put('/students/{id}/status', [StudentController::class, 'updateStatus']);

    // Submissions
    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/{id}', [SubmissionController::class, 'show']);
    Route::put('/submissions/{id}/review', [SubmissionController::class, 'review']);

    // Internships (CRUD)
    Route::apiResource('internships', App\Http\Controllers\InternshipController::class);

    // Courses (CRUD)
    Route::apiResource('courses', App\Http\Controllers\CourseController::class);

    // Tasks
    Route::get('/tasks', [AdminTaskController::class, 'index']);
    Route::get('/tasks/stats', [AdminTaskController::class, 'stats']);
    Route::post('/tasks', [AdminTaskController::class, 'store']);
    Route::get('/tasks/{id}', [AdminTaskController::class, 'show']);
    Route::put('/tasks/{id}', [AdminTaskController::class, 'update']);
    Route::delete('/tasks/{id}', [AdminTaskController::class, 'destroy']);
    Route::put('/tasks/{id}/toggle-status', [AdminTaskController::class, 'toggleStatus']);
    Route::post('/tasks/bulk-update', [AdminTaskController::class, 'bulkUpdate']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/stats', [PaymentController::class, 'stats']);
    Route::get('/payments/export', [PaymentController::class, 'export']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);

    // Completion Reviews (Admin reviews completed internships)
    Route::prefix('completion-reviews')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\CompletionReviewController::class, 'index']);
        Route::get('/stats', [App\Http\Controllers\Admin\CompletionReviewController::class, 'stats']);
        Route::get('/internship/{internshipId}/enrolled', [App\Http\Controllers\Admin\CompletionReviewController::class, 'getEnrolledStudents']);
        Route::post('/enrollment/{enrollmentId}/initiate', [App\Http\Controllers\Admin\CompletionReviewController::class, 'initiateCompletion']);
        Route::post('/enrollment/{enrollmentId}/complete', [App\Http\Controllers\Admin\CompletionReviewController::class, 'completeInternship']);
        Route::get('/{id}', [App\Http\Controllers\Admin\CompletionReviewController::class, 'show']);
        Route::post('/{id}/review', [App\Http\Controllers\Admin\CompletionReviewController::class, 'review']);
        Route::post('/{id}/issue-certificate', [App\Http\Controllers\Admin\CompletionReviewController::class, 'issueCertificate']);
        Route::get('/{id}/letter/preview', [App\Http\Controllers\Admin\CompletionReviewController::class, 'previewLetter']);
        Route::get('/{id}/letter/download', [App\Http\Controllers\Admin\CompletionReviewController::class, 'downloadLetter']);
        Route::get('/{id}/certificate/preview', [App\Http\Controllers\Admin\CompletionReviewController::class, 'previewCertificate']);
    });

    // Certificates
    Route::get('/certificates', [AdminCertificateController::class, 'index']);
    Route::get('/certificates/stats', [AdminCertificateController::class, 'stats']);
    Route::post('/certificates', [AdminCertificateController::class, 'store']);
    Route::get('/certificates/{id}', [AdminCertificateController::class, 'show']);
    Route::delete('/certificates/{id}', [AdminCertificateController::class, 'destroy']);
    Route::post('/certificates/bulk-issue', [AdminCertificateController::class, 'bulkIssue']);
    Route::get('/certificates/{id}/regenerate-pdf', [AdminCertificateController::class, 'regeneratePdf']);

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/stats', [AnnouncementController::class, 'stats']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    Route::post('/announcements/{id}/publish', [AnnouncementController::class, 'publish']);
    Route::post('/announcements/{id}/unpublish', [AnnouncementController::class, 'unpublish']);

    // Enrollment Requests Management
    Route::prefix('enrollment-requests')->group(function () {
        Route::get('/', [AdminEnrollmentRequestController::class, 'index']); // List all requests
        Route::get('/stats', [AdminEnrollmentRequestController::class, 'stats']); // Get statistics
        Route::get('/{id}', [AdminEnrollmentRequestController::class, 'show']); // Get single request
        Route::post('/{id}/approve', [AdminEnrollmentRequestController::class, 'approve']); // Approve request
        Route::post('/{id}/reject', [AdminEnrollmentRequestController::class, 'reject']); // Reject request
        Route::get('/{id}/resume', [AdminEnrollmentRequestController::class, 'downloadResume']); // Download resume
        Route::get('/{id}/resume/view', [AdminEnrollmentRequestController::class, 'viewResume']); // View resume
        Route::delete('/{id}/resume', [AdminEnrollmentRequestController::class, 'clearResume']); // Clear invalid resume
        
        // Admin Document Access
        Route::get('/{enrollmentId}/mou', [App\Http\Controllers\DocumentController::class, 'downloadMOU']);
        Route::get('/{enrollmentId}/offer-letter', [App\Http\Controllers\DocumentController::class, 'downloadOfferLetter']);
    });

    // Withdrawal Requests Management
    Route::prefix('withdrawal-requests')->group(function () {
        Route::get('/', [AdminEnrollmentRequestController::class, 'withdrawalRequests']); // List all withdrawal requests
        Route::get('/stats', [AdminEnrollmentRequestController::class, 'withdrawalStats']); // Get statistics
        Route::post('/{id}/approve', [AdminEnrollmentRequestController::class, 'approveWithdrawal']); // Approve withdrawal
        Route::post('/{id}/reject', [AdminEnrollmentRequestController::class, 'rejectWithdrawal']); // Reject withdrawal
        
        // Withdrawal Documents (for approved withdrawals)
        Route::get('/{enrollmentId}/partial-completion', [App\Http\Controllers\DocumentController::class, 'downloadPartialCompletionLetter']);
        Route::get('/{enrollmentId}/partial-completion/view', [App\Http\Controllers\DocumentController::class, 'viewPartialCompletionLetter']);
        Route::get('/{enrollmentId}/relieving-letter', [App\Http\Controllers\DocumentController::class, 'downloadRelievingLetter']);
        Route::get('/{enrollmentId}/relieving-letter/view', [App\Http\Controllers\DocumentController::class, 'viewRelievingLetter']);
    });

    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/profile', [App\Http\Controllers\Admin\SettingsController::class, 'profile']);
        Route::put('/profile', [App\Http\Controllers\Admin\SettingsController::class, 'updateProfile']);
        Route::put('/password', [App\Http\Controllers\Admin\SettingsController::class, 'updatePassword']);
        Route::post('/avatar', [App\Http\Controllers\Admin\SettingsController::class, 'uploadAvatar']);
        Route::get('/platform', [App\Http\Controllers\Admin\SettingsController::class, 'platformSettings']);
        Route::put('/platform', [App\Http\Controllers\Admin\SettingsController::class, 'updatePlatformSettings']);
        Route::get('/admins', [App\Http\Controllers\Admin\SettingsController::class, 'admins']);
        Route::post('/admins', [App\Http\Controllers\Admin\SettingsController::class, 'createAdmin']);
        Route::delete('/admins/{id}', [App\Http\Controllers\Admin\SettingsController::class, 'deleteAdmin']);
        Route::get('/activity-logs', [App\Http\Controllers\Admin\SettingsController::class, 'activityLogs']);
    });

    // Team Management
    Route::prefix('team')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\TeamController::class, 'index']);
        Route::get('/stats', [App\Http\Controllers\Admin\TeamController::class, 'stats']);
        Route::post('/', [App\Http\Controllers\Admin\TeamController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\TeamController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\TeamController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\TeamController::class, 'destroy']);
        Route::post('/{id}/image', [App\Http\Controllers\Admin\TeamController::class, 'uploadImage']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\TeamController::class, 'toggleStatus']);
        Route::post('/reorder', [App\Http\Controllers\Admin\TeamController::class, 'reorder']);
    });
});

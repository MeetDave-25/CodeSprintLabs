<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use App\Models\Certificate;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class CompletionReviewController extends Controller
{
    /**
     * List all completion review requests
     */
    public function index(Request $request)
    {
        $query = EnrollmentRequest::where('completionRequested', true);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('completionStatus', $request->status);
        }

        // Search by student name or internship
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('studentName', 'like', "%{$search}%")
                  ->orWhere('studentEmail', 'like', "%{$search}%")
                  ->orWhere('internshipTitle', 'like', "%{$search}%");
            });
        }

        $reviews = $query->orderBy('completionRequestedAt', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $reviews
        ]);
    }

    /**
     * Get statistics for completion reviews
     */
    public function stats()
    {
        $total = EnrollmentRequest::where('completionRequested', true)->count();
        $pending = EnrollmentRequest::where('completionStatus', 'pending_review')->count();
        $reviewed = EnrollmentRequest::where('completionStatus', 'reviewed')->count();
        $certificateIssued = EnrollmentRequest::where('completionStatus', 'certificate_issued')->count();

        // Average marks
        $avgMarks = EnrollmentRequest::where('completionStatus', '!=', 'pending_review')
            ->where('completionStatus', '!=', 'not_requested')
            ->whereNotNull('marks')
            ->avg('marks');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'reviewed' => $reviewed,
                'certificateIssued' => $certificateIssued,
                'avgMarks' => round($avgMarks ?? 0, 1),
            ]
        ]);
    }

    /**
     * Get single completion review
     */
    public function show(string $id)
    {
        $enrollment = EnrollmentRequest::with(['user', 'internship'])->find($id);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $enrollment
        ]);
    }

    /**
     * Review completion and assign marks
     */
    public function review(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'marks' => 'required|integer|min:0|max:50',
            'feedback' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $enrollment = EnrollmentRequest::find($id);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review not found'
            ], 404);
        }

        if (!$enrollment->completionRequested) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion has not been requested'
            ], 400);
        }

        // Update enrollment with review
        $enrollment->update([
            'marks' => $request->marks,
            'adminFeedback' => $request->feedback,
            'completionStatus' => 'reviewed',
            'reviewedAt' => now(),
            'reviewedBy' => $request->user()->id,
            'completionLetterGenerated' => true,
        ]);

        // Notify student about the review
        Notification::create([
            'userId' => $enrollment->userId,
            'title' => 'Internship Reviewed!',
            'message' => "Your internship '{$enrollment->internshipTitle}' has been reviewed. You scored {$request->marks}/50 marks.",
            'type' => 'certificate',
            'read' => false,
            'link' => '/student/my-internships/' . $enrollment->internshipId,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Completion reviewed successfully',
            'data' => $enrollment
        ]);
    }

    /**
     * Issue certificate for reviewed completion
     */
    public function issueCertificate(Request $request, string $id)
    {
        $enrollment = EnrollmentRequest::find($id);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review not found'
            ], 404);
        }

        if ($enrollment->completionStatus !== 'reviewed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion must be reviewed before issuing certificate'
            ], 400);
        }

        // Check if certificate already exists
        $existingCert = Certificate::where('studentId', $enrollment->userId)
            ->where('internshipId', $enrollment->internshipId)
            ->first();

        if ($existingCert) {
            return response()->json([
                'status' => 'error',
                'message' => 'Certificate already issued for this internship',
                'data' => $existingCert
            ], 400);
        }

        // Create certificate with marks
        $certificate = Certificate::create([
            'studentId' => $enrollment->userId,
            'studentName' => $enrollment->studentName,
            'internshipId' => $enrollment->internshipId,
            'internshipTitle' => $enrollment->internshipTitle,
            'issueDate' => now(),
            'issuedBy' => $request->user()->id,
            'marks' => $enrollment->marks,
            'grade' => $this->calculateGrade($enrollment->marks),
        ]);

        // Update enrollment
        $enrollment->update([
            'completionStatus' => 'certificate_issued',
            'certificateId' => $certificate->id,
        ]);

        // Notify student
        Notification::create([
            'userId' => $enrollment->userId,
            'title' => 'Certificate Issued!',
            'message' => "Congratulations! Your certificate for '{$enrollment->internshipTitle}' has been issued.",
            'type' => 'certificate',
            'read' => false,
            'link' => '/student/certificates',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate issued successfully',
            'data' => [
                'certificate' => $certificate,
                'enrollment' => $enrollment
            ]
        ]);
    }

    /**
     * Preview completion letter
     */
    public function previewLetter(Request $request, string $id)
    {
        $enrollment = EnrollmentRequest::find($id);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review not found'
            ], 404);
        }

        $data = $this->getLetterData($enrollment);

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Download completion letter as PDF
     */
    public function downloadLetter(Request $request, string $id)
    {
        $enrollment = EnrollmentRequest::find($id);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review not found'
            ], 404);
        }

        if (!$enrollment->isCompletionReviewed()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion has not been reviewed yet'
            ], 400);
        }

        $data = $this->getLetterData($enrollment);

        $pdf = Pdf::loadView('pdf.completion-letter', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download("completion-letter-{$enrollment->studentName}.pdf");
    }

    /**
     * Preview certificate
     */
    public function previewCertificate(Request $request, string $id)
    {
        $enrollment = EnrollmentRequest::find($id);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review not found'
            ], 404);
        }

        $certificate = Certificate::where('studentId', $enrollment->userId)
            ->where('internshipId', $enrollment->internshipId)
            ->first();

        $data = [
            'studentName' => $enrollment->studentName,
            'internshipTitle' => $enrollment->internshipTitle,
            'internshipDomain' => $enrollment->internshipDomain,
            'internshipDuration' => $enrollment->internshipDuration,
            'startDate' => $enrollment->startDate ? $enrollment->startDate->format('d M Y') : 'N/A',
            'endDate' => $enrollment->endDate ? $enrollment->endDate->format('d M Y') : now()->format('d M Y'),
            'marks' => $enrollment->marks ?? 0,
            'maxMarks' => 50,
            'grade' => $this->calculateGrade($enrollment->marks ?? 0),
            'verificationCode' => $certificate ? $certificate->verificationCode : 'PREVIEW',
            'issueDate' => $certificate ? $certificate->issueDate->format('d M Y') : now()->format('d M Y'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get data for completion letter
     */
    private function getLetterData(EnrollmentRequest $enrollment): array
    {
        $grade = $this->calculateGrade($enrollment->marks ?? 0);
        
        return [
            'studentName' => $enrollment->studentName,
            'studentEmail' => $enrollment->studentEmail,
            'studentCollegeName' => $enrollment->studentCollegeName ?? 'N/A',
            'studentCourse' => $enrollment->studentCourse ?? 'N/A',
            'internshipTitle' => $enrollment->internshipTitle,
            'internshipDomain' => $enrollment->internshipDomain,
            'internshipDuration' => $enrollment->internshipDuration,
            'startDate' => $enrollment->startDate ? $enrollment->startDate->format('d M Y') : 'N/A',
            'endDate' => $enrollment->endDate ? $enrollment->endDate->format('d M Y') : now()->format('d M Y'),
            'tasksCompleted' => $enrollment->tasksCompleted ?? 0,
            'totalTasks' => $enrollment->totalTasks ?? 0,
            'totalPoints' => $enrollment->totalPoints ?? 0,
            'marks' => $enrollment->marks ?? 0,
            'maxMarks' => 50,
            'percentage' => $enrollment->marks ? round(($enrollment->marks / 50) * 100, 1) : 0,
            'grade' => $grade,
            'adminFeedback' => $enrollment->adminFeedback ?? '',
            'reviewedAt' => $enrollment->reviewedAt ? $enrollment->reviewedAt->format('d M Y') : now()->format('d M Y'),
            'issueDate' => now()->format('d M Y'),
        ];
    }

    /**
     * Calculate grade based on marks out of 50
     */
    private function calculateGrade(int $marks): string
    {
        $percentage = ($marks / 50) * 100;
        
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 40) return 'D';
        return 'F';
    }

    /**
     * Get all enrolled students for an internship
     */
    public function getEnrolledStudents(Request $request, string $internshipId)
    {
        $enrollments = EnrollmentRequest::where('internshipId', $internshipId)
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch task completion data for each enrollment
        $enrollmentsWithProgress = $enrollments->map(function ($enrollment) {
            // Get task completion stats from submissions
            $completedTasks = \App\Models\Submission::where('userId', $enrollment->userId)
                ->where('internshipId', $enrollment->internshipId)
                ->where('status', 'approved')
                ->count();

            $totalTasks = \App\Models\Internship::find($enrollment->internshipId)?->tasks?->count() ?? 0;

            $totalPoints = \App\Models\Submission::where('userId', $enrollment->userId)
                ->where('internshipId', $enrollment->internshipId)
                ->where('status', 'approved')
                ->sum('points');

            return [
                'id' => $enrollment->_id ?? $enrollment->id,
                'userId' => $enrollment->userId,
                'studentName' => $enrollment->studentName,
                'studentEmail' => $enrollment->studentEmail,
                'studentCollegeName' => $enrollment->studentCollegeName,
                'internshipId' => $enrollment->internshipId,
                'internshipTitle' => $enrollment->internshipTitle,
                'enrolledAt' => $enrollment->created_at,
                'startDate' => $enrollment->startDate,
                'endDate' => $enrollment->endDate,
                'tasksCompleted' => $completedTasks,
                'totalTasks' => $totalTasks,
                'totalPoints' => $totalPoints,
                'completionRequested' => $enrollment->completionRequested ?? false,
                'completionStatus' => $enrollment->completionStatus ?? 'not_requested',
                'marks' => $enrollment->marks,
                'grade' => $enrollment->marks ? $this->calculateGrade($enrollment->marks) : null,
                'certificateId' => $enrollment->certificateId,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $enrollmentsWithProgress
        ]);
    }

    /**
     * Admin initiates completion for a student (without student request)
     */
    public function initiateCompletion(Request $request, string $enrollmentId)
    {
        $enrollment = EnrollmentRequest::find($enrollmentId);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found'
            ], 404);
        }

        if ($enrollment->completionStatus === 'certificate_issued') {
            return response()->json([
                'status' => 'error',
                'message' => 'Certificate already issued for this enrollment'
            ], 400);
        }

        // Calculate task completion stats
        $completedTasks = \App\Models\Submission::where('userId', $enrollment->userId)
            ->where('internshipId', $enrollment->internshipId)
            ->where('status', 'approved')
            ->count();

        $totalTasks = \App\Models\Internship::find($enrollment->internshipId)?->tasks?->count() ?? 0;

        $totalPoints = \App\Models\Submission::where('userId', $enrollment->userId)
            ->where('internshipId', $enrollment->internshipId)
            ->where('status', 'approved')
            ->sum('points');

        // Update enrollment to mark as completion initiated by admin
        $enrollment->update([
            'completionRequested' => true,
            'completionRequestedAt' => now(),
            'completionStatus' => 'pending_review',
            'tasksCompleted' => $completedTasks,
            'totalTasks' => $totalTasks,
            'totalPoints' => $totalPoints,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Completion initiated successfully',
            'data' => $enrollment
        ]);
    }

    /**
     * Admin directly completes internship with marks (one-step completion)
     */
    public function completeInternship(Request $request, string $enrollmentId)
    {
        $validator = Validator::make($request->all(), [
            'marks' => 'required|integer|min:0|max:50',
            'feedback' => 'nullable|string|max:1000',
            'issueCertificate' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $enrollment = EnrollmentRequest::find($enrollmentId);

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found'
            ], 404);
        }

        if ($enrollment->completionStatus === 'certificate_issued') {
            return response()->json([
                'status' => 'error',
                'message' => 'Certificate already issued for this enrollment'
            ], 400);
        }

        // Calculate task completion stats
        $completedTasks = \App\Models\Submission::where('userId', $enrollment->userId)
            ->where('internshipId', $enrollment->internshipId)
            ->where('status', 'approved')
            ->count();

        $totalTasks = \App\Models\Internship::find($enrollment->internshipId)?->tasks?->count() ?? 0;

        $totalPoints = \App\Models\Submission::where('userId', $enrollment->userId)
            ->where('internshipId', $enrollment->internshipId)
            ->where('status', 'approved')
            ->sum('points');

        // Update enrollment with completion and review data
        $enrollment->update([
            'completionRequested' => true,
            'completionRequestedAt' => now(),
            'completionStatus' => 'reviewed',
            'tasksCompleted' => $completedTasks,
            'totalTasks' => $totalTasks,
            'totalPoints' => $totalPoints,
            'marks' => $request->marks,
            'adminFeedback' => $request->feedback,
            'reviewedAt' => now(),
            'reviewedBy' => $request->user()->id,
            'completionLetterGenerated' => true,
        ]);

        $certificate = null;

        // Issue certificate if requested
        if ($request->issueCertificate) {
            // Check if certificate already exists
            $existingCert = Certificate::where('studentId', $enrollment->userId)
                ->where('internshipId', $enrollment->internshipId)
                ->first();

            if (!$existingCert) {
                $certificate = Certificate::create([
                    'studentId' => $enrollment->userId,
                    'studentName' => $enrollment->studentName,
                    'internshipId' => $enrollment->internshipId,
                    'internshipTitle' => $enrollment->internshipTitle,
                    'issueDate' => now(),
                    'issuedBy' => $request->user()->id,
                    'marks' => $request->marks,
                    'grade' => $this->calculateGrade($request->marks),
                ]);

                $enrollment->update([
                    'completionStatus' => 'certificate_issued',
                    'certificateId' => $certificate->id,
                ]);

                // Notify student about certificate
                Notification::create([
                    'userId' => $enrollment->userId,
                    'title' => 'Internship Completed & Certificate Issued!',
                    'message' => "Congratulations! Your internship '{$enrollment->internshipTitle}' has been completed. You scored {$request->marks}/50 marks. Your certificate is ready!",
                    'type' => 'certificate',
                    'read' => false,
                    'link' => '/student/certificates',
                ]);
            }
        } else {
            // Just notify about completion
            Notification::create([
                'userId' => $enrollment->userId,
                'title' => 'Internship Reviewed!',
                'message' => "Your internship '{$enrollment->internshipTitle}' has been reviewed. You scored {$request->marks}/50 marks.",
                'type' => 'certificate',
                'read' => false,
                'link' => '/student/my-internships/' . $enrollment->internshipId,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => $certificate ? 'Internship completed and certificate issued!' : 'Internship completed successfully',
            'data' => [
                'enrollment' => $enrollment,
                'certificate' => $certificate
            ]
        ]);
    }
}

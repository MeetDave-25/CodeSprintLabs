<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use App\Models\Submission;
use App\Models\Task;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class CompletionController extends Controller
{
    /**
     * Request completion review for an internship
     */
    public function requestCompletion(Request $request, string $enrollmentId)
    {
        $user = $request->user();
        
        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found or not approved'
            ], 404);
        }

        // Check if already requested
        if ($enrollment->completionRequested) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion review already requested'
            ], 400);
        }

        // Get task statistics for this internship
        $tasks = Task::where('internshipId', $enrollment->internshipId)
            ->where('isActive', true)
            ->get();
        
        $totalTasks = $tasks->count();
        
        // Get completed submissions
        $completedSubmissions = Submission::where('studentId', $user->id)
            ->whereIn('taskId', $tasks->pluck('_id')->map(fn($id) => (string)$id))
            ->whereIn('status', ['approved', 'completed'])
            ->get();
        
        $tasksCompleted = $completedSubmissions->count();
        $totalPoints = $completedSubmissions->sum('points') ?: 0;

        // Update enrollment with completion request
        $enrollment->update([
            'completionRequested' => true,
            'completionRequestedAt' => now(),
            'completionStatus' => 'pending_review',
            'tasksCompleted' => $tasksCompleted,
            'totalTasks' => $totalTasks,
            'totalPoints' => $totalPoints,
        ]);

        // Notify all admins about the completion request
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'userId' => $admin->id,
                'title' => 'Internship Completion Request',
                'message' => "{$enrollment->studentName} has requested completion review for {$enrollment->internshipTitle}",
                'type' => 'submission',
                'read' => false,
                'link' => '/admin/completion-reviews',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Completion review requested successfully',
            'data' => [
                'completionStatus' => 'pending_review',
                'tasksCompleted' => $tasksCompleted,
                'totalTasks' => $totalTasks,
                'totalPoints' => $totalPoints,
                'requestedAt' => now()->toISOString(),
            ]
        ]);
    }

    /**
     * Get completion status for an enrollment
     */
    public function getStatus(Request $request, string $enrollmentId)
    {
        $user = $request->user();
        
        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'completionRequested' => $enrollment->completionRequested ?? false,
                'completionStatus' => $enrollment->completionStatus ?? 'not_requested',
                'tasksCompleted' => $enrollment->tasksCompleted ?? 0,
                'totalTasks' => $enrollment->totalTasks ?? 0,
                'totalPoints' => $enrollment->totalPoints ?? 0,
                'marks' => $enrollment->marks,
                'adminFeedback' => $enrollment->adminFeedback,
                'reviewedAt' => $enrollment->reviewedAt,
                'certificateId' => $enrollment->certificateId,
                'completionLetterGenerated' => $enrollment->completionLetterGenerated ?? false,
            ]
        ]);
    }

    /**
     * Preview completion letter
     */
    public function previewLetter(Request $request, string $enrollmentId)
    {
        $user = $request->user();
        
        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found'
            ], 404);
        }

        // Must be reviewed to preview letter
        if (!$enrollment->isCompletionReviewed()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Completion has not been reviewed yet'
            ], 400);
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
    public function downloadLetter(Request $request, string $enrollmentId)
    {
        $user = $request->user();
        
        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found'
            ], 404);
        }

        // Must be reviewed to download letter
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
}

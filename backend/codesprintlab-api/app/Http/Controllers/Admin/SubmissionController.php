<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;


class SubmissionController extends Controller
{
    /**
     * List all submissions
     */
    public function index(Request $request)
    {
        $query = Submission::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student
        if ($request->has('studentId')) {
            $query->where('studentId', $request->studentId);
        }

        $submissions = $query->orderBy('submittedAt', 'desc')->get();

        return response()->json(['submissions' => $submissions]);
    }

    /**
     * Get submission details
     */
    public function show(string $id)
    {
        $submission = Submission::findOrFail($id);

        return response()->json(['submission' => $submission]);
    }

    /**
     * Review submission (approve/reject)
     */
    public function review(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'feedback' => 'nullable|string|max:1000',
            'points' => 'nullable|integer|min:0',
        ]);

        $submission = Submission::findOrFail($id);
        $admin = $request->user();
        $status = $validated['status'];
        $feedback = $validated['feedback'] ?? null;
        $points = $validated['points'] ?? null;

        // Store original status to check if it was already approved
        $isAlreadyApproved = $submission->status === 'approved';

        // Update submission status and feedback
        $submission->status = $status;
        $submission->feedback = $feedback;
        $submission->reviewedBy = $admin->id;
        $submission->reviewedAt = now();

        // If approved, set points
        if ($status === 'approved') {
            $submission->points = $points ?? $submission->task->points ?? 0;
        } else {
            $submission->points = 0; // Reset points if rejected
        }
        $submission->save();

        // Update student points if approved and not already approved
        if ($status === 'approved' && $submission->task && !$isAlreadyApproved) {
            $student = $submission->student;
            if ($student) {
                // Determine points from task (default to 0 if not found)
                $awardedPoints = $submission->points;
                $student->increment('totalPoints', $awardedPoints);
                $student->increment('tasksCompleted');
            }
        }

        // Send Notification
        Notification::create([
            'userId' => $submission->studentId,
            'title' => 'Submission ' . ucfirst($status),
            'message' => $status === 'approved'
                ? "Great job! Your submission has been approved."
                : "Your submission requires changes: " . ($feedback ?? 'Check details'),
            'type' => 'submission',
            'read' => false,
            'link' => '/student/tasks', // Redirect to tasks page
            'createdAt' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Submission reviewed successfully',
            'data' => $submission
        ]);
    }
}

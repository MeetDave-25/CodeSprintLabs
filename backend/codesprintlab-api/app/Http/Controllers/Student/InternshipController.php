<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\User;
use App\Models\Submission;
use App\Models\Task;
use App\Models\Certificate;
use App\Models\Notification;
use Illuminate\Http\Request;

class InternshipController extends Controller
{
    /**
     * Get student's enrolled internships
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $enrolledInternshipIds = $user->enrolledInternships ?? [];

        if (empty($enrolledInternshipIds)) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }

        $internships = Internship::whereIn('_id', $enrolledInternshipIds)->get();

        // Get all enrollment records for this user
        $enrollments = \App\Models\EnrollmentRequest::where('userId', $user->id)
            ->whereIn('status', ['approved', 'withdrawn'])
            ->get()
            ->keyBy('internshipId');

        // Calculate progress for each internship
        $internshipsWithProgress = $internships->map(function ($internship) use ($user, $enrollments) {
            $tasks = Task::where('internshipId', $internship->id)->get();
            $totalTasks = $tasks->count();

            $completedTasks = 0;
            if ($totalTasks > 0) {
                $completedTasks = Submission::where('studentId', $user->id)
                    ->whereIn('taskId', $tasks->pluck('_id'))
                    ->where('status', 'approved')
                    ->count();
            }

            $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

            // Check if eligible for certificate
            $certificate = Certificate::where('studentId', $user->id)
                ->where('internshipId', $internship->id)
                ->first();

            // Get enrollment record
            $enrollment = $enrollments->get($internship->id);

            return [
                'id' => $internship->id,
                'title' => $internship->title,
                'domain' => $internship->domain,
                'description' => $internship->description,
                'duration' => $internship->duration,
                'difficulty' => $internship->difficulty,
                'languages' => $internship->languages,
                'image' => $internship->image,
                'progress' => $progress,
                'tasksCompleted' => $completedTasks,
                'totalTasks' => $totalTasks,
                'completed' => $completedTasks,
                'total' => $totalTasks,
                'certificateEligible' => $progress >= 100,
                'certificateCode' => $certificate?->verificationCode,
                'certificateId' => $certificate?->id,
                'enrollmentId' => $enrollment?->id,
                'status' => $enrollment?->status ?? 'approved',
                'startDate' => $enrollment?->startDate,
                'endDate' => $enrollment?->endDate,
                'withdrawalStatus' => $enrollment?->withdrawalStatus,
                'withdrawalRequestedAt' => $enrollment?->withdrawalRequestedAt,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $internshipsWithProgress
        ]);
    }

    /**
     * Get internship details with tasks and progress
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $internship = Internship::find($id);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        // Check if enrolled
        $enrolledInternshipIds = $user->enrolledInternships ?? [];
        if (!in_array($id, $enrolledInternshipIds)) {
            return response()->json(['message' => 'Not enrolled in this internship'], 403);
        }

        // Get tasks ordered by day number - try both string ID and internship->id
        $tasks = Task::where(function($query) use ($id, $internship) {
            $query->where('internshipId', $id)
                  ->orWhere('internshipId', $internship->id);
        })->orderBy('dayNumber')->get();
        
        \Log::info('Student fetching tasks for internship', [
            'internshipId' => $id,
            'internshipModelId' => $internship->id,
            'tasksFound' => $tasks->count(),
            'taskIds' => $tasks->pluck('_id')->toArray()
        ]);

        // Get student's submissions for this internship
        $submissionMap = Submission::where('studentId', $user->id)
            ->whereIn('taskId', $tasks->pluck('_id'))
            ->get()
            ->keyBy('taskId');

        // Build tasks with completion status
        $tasksWithStatus = $tasks->map(function ($task) use ($submissionMap) {
            $submission = $submissionMap->get($task->id);
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'dayNumber' => $task->dayNumber,
                'points' => $task->points,
                'difficulty' => $task->difficulty,
                'dueDate' => $task->dueDate,
                'requirements' => $task->requirements,
                'completed' => $submission && $submission->status === 'approved',
                'submitted' => $submission !== null,
                'submissionStatus' => $submission?->status,
                'submissionId' => $submission?->id,
                'feedback' => $submission?->feedback,
            ];
        });

        // Calculate overall progress
        $totalTasks = $tasks->count();
        $completedTasks = $submissionMap->filter(fn($s) => $s->status === 'approved')->count();
        $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Check certificate
        $certificate = Certificate::where('studentId', $user->id)
            ->where('internshipId', $id)
            ->first();

        // Get enrollment record for this internship
        $enrollment = \App\Models\EnrollmentRequest::where('userId', $user->id)
            ->where('internshipId', $id)
            ->whereIn('status', ['approved', 'withdrawn'])
            ->first();
        
        \Log::info('Internship show - enrollment lookup', [
            'internshipId' => $id,
            'userId' => $user->id,
            'enrollmentFound' => $enrollment ? true : false,
            'enrollmentId' => $enrollment?->id,
            'enrollmentId_raw' => $enrollment ? ($enrollment->_id ?? $enrollment->attributes['_id'] ?? 'no_id') : null,
        ]);

        // Calculate current day (based on first task due date or internship start)
        $currentDay = min($completedTasks + 1, max($totalTasks, 1));

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $internship->id,
                'title' => $internship->title,
                'domain' => $internship->domain,
                'description' => $internship->description,
                'duration' => $internship->duration,
                'difficulty' => $internship->difficulty,
                'languages' => $internship->languages,
                'image' => $internship->image,
                'requirements' => $internship->requirements,
                'learningOutcomes' => $internship->learningOutcomes,
                'tasks' => $tasksWithStatus,
                'progress' => $progress,
                'completed' => $completedTasks,
                'total' => $totalTasks,
                'currentDay' => $currentDay,
                'certificateEligible' => $progress >= 100,
                'certificateCode' => $certificate?->verificationCode,
                'certificateId' => $certificate?->id,
                'enrollmentId' => $enrollment?->id,
                'startDate' => $enrollment?->startDate,
                'endDate' => $enrollment?->endDate,
            ]
        ]);
    }

    /**
     * Request certificate for completed internship
     */
    public function requestCertificate(Request $request, string $id)
    {
        $user = $request->user();
        $internship = Internship::find($id);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        // Check if enrolled
        if (!in_array($id, $user->enrolledInternships ?? [])) {
            return response()->json(['message' => 'Not enrolled in this internship'], 403);
        }

        // Check if already has certificate
        $existingCert = Certificate::where('studentId', $user->id)
            ->where('internshipId', $id)
            ->first();

        if ($existingCert) {
            return response()->json([
                'status' => 'success',
                'message' => 'Certificate already issued',
                'data' => $existingCert
            ]);
        }

        // Check completion
        $tasks = Task::where('internshipId', $id)->get();
        $totalTasks = $tasks->count();

        $completedTasks = Submission::where('studentId', $user->id)
            ->whereIn('taskId', $tasks->pluck('_id'))
            ->where('status', 'approved')
            ->count();

        if ($totalTasks > 0 && $completedTasks < $totalTasks) {
            return response()->json([
                'message' => 'Internship not completed. Complete all tasks first.',
                'progress' => [
                    'completed' => $completedTasks,
                    'total' => $totalTasks,
                ]
            ], 400);
        }

        // Issue certificate
        $certificate = Certificate::create([
            'studentId' => $user->id,
            'studentName' => $user->name,
            'internshipId' => $internship->id,
            'internshipTitle' => $internship->title,
            'issueDate' => now(),
            'issuedBy' => 'CodeSprint Labs',
        ]);

        // Send notification
        Notification::create([
            'userId' => $user->id,
            'title' => 'Certificate Earned!',
            'message' => "Congratulations! Your certificate for {$internship->title} internship is ready.",
            'type' => 'certificate',
            'read' => false,
            'link' => "/student/certificates",
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate issued successfully',
            'data' => $certificate
        ], 201);
    }

    /**
     * Get current day task for the internship
     */
    public function currentTask(Request $request, string $id)
    {
        $user = $request->user();
        $internship = Internship::find($id);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        // Check if enrolled
        if (!in_array($id, $user->enrolledInternships ?? [])) {
            return response()->json(['message' => 'Not enrolled in this internship'], 403);
        }

        // Get all tasks
        $tasks = Task::where('internshipId', $id)->orderBy('dayNumber')->get();

        // Get completed task IDs
        $completedTaskIds = Submission::where('studentId', $user->id)
            ->whereIn('taskId', $tasks->pluck('_id'))
            ->where('status', 'approved')
            ->pluck('taskId')
            ->toArray();

        // Find first incomplete task
        $currentTask = $tasks->first(function ($task) use ($completedTaskIds) {
            return !in_array($task->id, $completedTaskIds);
        });

        if (!$currentTask) {
            return response()->json([
                'status' => 'success',
                'message' => 'All tasks completed!',
                'data' => null,
                'completed' => true,
            ]);
        }

        // Check if task is already submitted but pending
        $submission = Submission::where('studentId', $user->id)
            ->where('taskId', $currentTask->id)
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $currentTask->id,
                'title' => $currentTask->title,
                'description' => $currentTask->description,
                'dayNumber' => $currentTask->dayNumber,
                'points' => $currentTask->points,
                'difficulty' => $currentTask->difficulty,
                'dueDate' => $currentTask->dueDate,
                'requirements' => $currentTask->requirements,
                'submitted' => $submission !== null,
                'submissionStatus' => $submission?->status,
            ],
            'completed' => false,
        ]);
    }
}

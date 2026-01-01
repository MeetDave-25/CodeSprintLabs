<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\Submission;
use App\Models\Task;
use App\Models\Certificate;
use App\Models\Notification;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Get student's enrolled courses
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $enrolledCourseIds = $user->enrolledCourses ?? [];

        if (empty($enrolledCourseIds)) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }

        $courses = Course::whereIn('_id', $enrolledCourseIds)->get();

        // Calculate progress for each course
        $coursesWithProgress = $courses->map(function ($course) use ($user) {
            $tasks = Task::where('courseId', $course->id)->get();
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
                ->where('courseId', $course->id)
                ->first();

            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'instructor' => $course->instructor,
                'duration' => $course->duration,
                'level' => $course->level,
                'thumbnail' => $course->thumbnail,
                'modules' => $course->modules,
                'progress' => $progress,
                'completed' => $completedTasks,
                'total' => $totalTasks,
                'certificateEligible' => $progress >= 100,
                'certificateCode' => $certificate?->verificationCode,
                'certificateId' => $certificate?->id,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $coursesWithProgress
        ]);
    }

    /**
     * Get course details with tasks and progress
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Check if enrolled
        $enrolledCourseIds = $user->enrolledCourses ?? [];
        if (!in_array($id, $enrolledCourseIds)) {
            return response()->json(['message' => 'Not enrolled in this course'], 403);
        }

        // Get tasks grouped by module
        $tasks = Task::where('courseId', $id)->orderBy('dayNumber')->get();

        // Get student's submissions for this course
        $submissionMap = Submission::where('studentId', $user->id)
            ->whereIn('taskId', $tasks->pluck('_id'))
            ->get()
            ->keyBy('taskId');

        // Build modules with tasks and completion status
        $modules = collect($course->modules ?? [])->map(function ($module) use ($tasks, $submissionMap) {
            $moduleTasks = $tasks->filter(fn($task) => $task->moduleId === $module['id']);
            
            $tasksWithStatus = $moduleTasks->map(function ($task) use ($submissionMap) {
                $submission = $submissionMap->get($task->id);
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'points' => $task->points,
                    'difficulty' => $task->difficulty,
                    'dueDate' => $task->dueDate,
                    'completed' => $submission && $submission->status === 'approved',
                    'submitted' => $submission !== null,
                    'submissionStatus' => $submission?->status,
                ];
            })->values();

            return [
                'id' => $module['id'],
                'title' => $module['title'],
                'tasks' => $tasksWithStatus,
            ];
        });

        // Calculate overall progress
        $totalTasks = $tasks->count();
        $completedTasks = $submissionMap->filter(fn($s) => $s->status === 'approved')->count();
        $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Check certificate
        $certificate = Certificate::where('studentId', $user->id)
            ->where('courseId', $id)
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'instructor' => $course->instructor,
                'duration' => $course->duration,
                'level' => $course->level,
                'thumbnail' => $course->thumbnail,
                'modules' => $modules,
                'progress' => $progress,
                'completed' => $completedTasks,
                'total' => $totalTasks,
                'certificateEligible' => $progress >= 100,
                'certificateCode' => $certificate?->verificationCode,
                'certificateId' => $certificate?->id,
            ]
        ]);
    }

    /**
     * Request certificate for completed course
     */
    public function requestCertificate(Request $request, string $id)
    {
        $user = $request->user();
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Check if enrolled
        if (!in_array($id, $user->enrolledCourses ?? [])) {
            return response()->json(['message' => 'Not enrolled in this course'], 403);
        }

        // Check if already has certificate
        $existingCert = Certificate::where('studentId', $user->id)
            ->where('courseId', $id)
            ->first();

        if ($existingCert) {
            return response()->json([
                'status' => 'success',
                'message' => 'Certificate already issued',
                'data' => $existingCert
            ]);
        }

        // Check completion
        $tasks = Task::where('courseId', $id)->get();
        $totalTasks = $tasks->count();

        $completedTasks = Submission::where('studentId', $user->id)
            ->whereIn('taskId', $tasks->pluck('_id'))
            ->where('status', 'approved')
            ->count();

        if ($totalTasks > 0 && $completedTasks < $totalTasks) {
            return response()->json([
                'message' => 'Course not completed. Complete all tasks first.',
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
            'courseId' => $course->id,
            'courseTitle' => $course->title,
            'issueDate' => now(),
            'issuedBy' => 'CodeSprint Labs',
        ]);

        // Update user's coursesCompleted count
        $user->increment('coursesCompleted');

        // Send notification
        Notification::create([
            'userId' => $user->id,
            'title' => 'Certificate Earned!',
            'message' => "Congratulations! Your certificate for {$course->title} is ready.",
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
     * Enroll in a course (for free courses only)
     */
    public function enroll(Request $request, string $id)
    {
        $user = $request->user();
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Check if already enrolled
        $enrolledCourses = $user->enrolledCourses ?? [];
        if (in_array($id, $enrolledCourses)) {
            return response()->json([
                'message' => 'You are already enrolled in this course'
            ], 400);
        }

        // Only allow direct enrollment for free courses
        $coursePrice = $course->price ?? 0;
        if ($coursePrice > 0) {
            return response()->json([
                'message' => 'This is a paid course. Please use the payment option to enroll.',
                'price' => $coursePrice
            ], 400);
        }

        // Check if course is full
        $maxStudents = $course->maxStudents ?? 1000; // Default to 1000 if not set
        $currentEnrolled = $course->enrolled ?? 0;
        if ($currentEnrolled >= $maxStudents) {
            return response()->json(['message' => 'This course is full'], 400);
        }

        // Add course to user's enrolled courses
        $enrolledCourses[] = $id;
        $user->enrolledCourses = $enrolledCourses;
        $user->save();

        // Increment enrolled count on course
        $course->increment('enrolled');

        // Send notification
        Notification::create([
            'userId' => $user->id,
            'title' => 'Course Enrollment Successful!',
            'message' => "You have successfully enrolled in {$course->title}.",
            'type' => 'enrollment',
            'read' => false,
            'link' => "/student/my-courses/{$id}",
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Enrolled successfully',
            'data' => [
                'courseId' => $id,
                'courseTitle' => $course->title,
            ]
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Submission;
use App\Models\Internship;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    /**
     * Get daily tasks for student
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $source = $request->query('source'); // 'internship', 'course', or null for all

        Log::info('Student TaskController index called', [
            'userId' => $user->id,
            'enrolledInternships' => $user->enrolledInternships ?? [],
            'enrolledCourses' => $user->enrolledCourses ?? [],
            'source' => $source
        ]);

        // Start with base query - include tasks where isActive is true or not set
        $query = Task::where(function ($q) {
            $q->where('isActive', true)
              ->orWhereNull('isActive');
        });

        // Filter by source
        if ($source === 'internship') {
            $query->whereIn('internshipId', $user->enrolledInternships ?? []);
        } elseif ($source === 'course') {
            $query->whereIn('courseId', $user->enrolledCourses ?? []);
        } else {
            // Get tasks from both internships and courses
            $query->where(function ($q) use ($user) {
                $q->whereIn('internshipId', $user->enrolledInternships ?? [])
                  ->orWhereIn('courseId', $user->enrolledCourses ?? []);
            });
        }

        $tasks = $query->orderBy('dueDate', 'asc')->get();
        
        Log::info('Tasks query result', [
            'tasksFound' => $tasks->count(),
            'taskIds' => $tasks->pluck('_id')->toArray()
        ]);

        // Get internship and course titles for mapping
        $internshipIds = $tasks->pluck('internshipId')->filter()->unique()->toArray();
        $courseIds = $tasks->pluck('courseId')->filter()->unique()->toArray();
        
        $internshipTitles = [];
        $courseTitles = [];
        
        if (!empty($internshipIds)) {
            $internships = Internship::whereIn('_id', $internshipIds)->get(['_id', 'title']);
            foreach ($internships as $internship) {
                $internshipTitles[$internship->id] = $internship->title;
            }
        }
        
        if (!empty($courseIds)) {
            $courses = Course::whereIn('_id', $courseIds)->get(['_id', 'title']);
            foreach ($courses as $course) {
                $courseTitles[$course->id] = $course->title;
            }
        }

        // Check if user has submitted each task
        $tasks = $tasks->map(function ($task) use ($user, $internshipTitles, $courseTitles) {
            $submission = Submission::where('studentId', $user->id)
                ->where('taskId', $task->id)
                ->first();

            // Get the source name (internship or course title)
            $sourceName = 'Unknown';
            if ($task->source === 'internship' && $task->internshipId) {
                $sourceName = $internshipTitles[$task->internshipId] ?? 'Unknown Internship';
            } elseif ($task->source === 'course' && $task->courseId) {
                $sourceName = $courseTitles[$task->courseId] ?? 'Unknown Course';
            }

            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'difficulty' => $task->difficulty,
                'points' => $task->points,
                'dueDate' => $task->dueDate,
                'dayNumber' => $task->dayNumber,
                'source' => $task->source,
                'sourceName' => $sourceName,
                'internshipId' => $task->internshipId,
                'courseId' => $task->courseId,
                'requirements' => $task->requirements,
                'submitted' => $submission ? true : false,
                'submissionStatus' => $submission?->status,
            ];
        });

        return response()->json(['tasks' => $tasks]);
    }

    /**
     * Get task details
     */
    public function show(string $id)
    {
        $task = Task::findOrFail($id);

        return response()->json(['task' => $task]);
    }

    /**
     * Submit task
     */
    public function submit(Request $request, string $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'githubLink' => 'required|url',
            'notes' => 'nullable|string|max:1000',
            'screenshot' => 'nullable|image|max:5120', // 5MB
        ]);

        // Check if already submitted
        $existing = Submission::where('studentId', $user->id)
            ->where('taskId', $id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already submitted this task',
            ], 400);
        }

        // Handle screenshot upload
        $screenshotPath = null;
        if ($request->hasFile('screenshot')) {
            $screenshotPath = $request->file('screenshot')->store('submissions/screenshots', 'public');
        }

        // Create submission
        $submission = Submission::create([
            'studentId' => $user->id,
            'studentName' => $user->name,
            'taskId' => $id,
            'taskTitle' => $task->title,
            'githubLink' => $validated['githubLink'],
            'notes' => $validated['notes'] ?? null,
            'screenshotUrl' => $screenshotPath,
            'submittedAt' => now(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Task submitted successfully',
            'submission' => $submission,
        ], 201);
    }

    /**
     * Get submission history
     */
    public function submissions(Request $request)
    {
        $user = $request->user();

        $submissions = Submission::where('studentId', $user->id)
            ->orderBy('submittedAt', 'desc')
            ->get();

        return response()->json(['submissions' => $submissions]);
    }
}

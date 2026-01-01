<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Internship;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * List all tasks with filters
     */
    public function index(Request $request)
    {
        $query = Task::query();

        // Filter by source type
        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        // Filter by internship
        if ($request->has('internshipId')) {
            $query->where('internshipId', $request->internshipId);
        }

        // Filter by course
        if ($request->has('courseId')) {
            $query->where('courseId', $request->courseId);
        }

        // Filter by difficulty
        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        // Filter by active status
        if ($request->has('isActive')) {
            $query->where('isActive', $request->boolean('isActive'));
        }

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $tasks = $query->orderBy('dayNumber', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $tasks
        ]);
    }

    /**
     * Get task details
     */
    public function show(string $id)
    {
        $task = Task::with(['internship', 'course', 'submissions'])->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        // Add submission stats
        $submissionStats = [
            'total' => $task->submissions->count(),
            'pending' => $task->submissions->where('status', 'pending')->count(),
            'approved' => $task->submissions->where('status', 'approved')->count(),
            'rejected' => $task->submissions->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'task' => $task,
                'submissionStats' => $submissionStats,
            ]
        ]);
    }

    /**
     * Create a new task
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'difficulty' => 'required|in:Easy,Medium,Hard',
            'points' => 'required|integer|min:0',
            'dayNumber' => 'required|integer|min:1',
            'dueDate' => 'nullable|date',
            'requirements' => 'array',
            'requirements.*' => 'string',
            'internshipId' => 'required_without:courseId|string',
            'courseId' => 'required_without:internshipId|string',
            'moduleId' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Determine source and validate parent exists
        if ($request->has('internshipId')) {
            $internship = Internship::find($request->internshipId);
            if (!$internship) {
                return response()->json(['message' => 'Internship not found'], 404);
            }
            $source = 'internship';
            $domain = $internship->domain;
            $language = $internship->languages[0] ?? null;
        } else {
            $course = Course::find($request->courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 404);
            }
            $source = 'course';
            $domain = null;
            $language = null;
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'domain' => $domain,
            'language' => $language,
            'difficulty' => $request->difficulty,
            'dayNumber' => $request->dayNumber,
            'points' => $request->points,
            'dueDate' => $request->dueDate,
            'requirements' => $request->requirements ?? [],
            'internshipId' => $request->internshipId,
            'courseId' => $request->courseId,
            'moduleId' => $request->moduleId,
            'source' => $source,
            'isActive' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Task created successfully',
            'data' => $task
        ], 201);
    }

    /**
     * Update a task
     */
    public function update(Request $request, string $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'difficulty' => 'sometimes|in:Easy,Medium,Hard',
            'points' => 'sometimes|integer|min:0',
            'dayNumber' => 'sometimes|integer|min:1',
            'dueDate' => 'nullable|date',
            'requirements' => 'sometimes|array',
            'requirements.*' => 'string',
            'isActive' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Task updated successfully',
            'data' => $task
        ]);
    }

    /**
     * Delete a task
     */
    public function destroy(string $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        // Check if task has submissions
        if ($task->submissions()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete task with submissions. Deactivate it instead.'
            ], 400);
        }

        $task->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Toggle task active status
     */
    public function toggleStatus(string $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->update(['isActive' => !$task->isActive]);

        return response()->json([
            'status' => 'success',
            'message' => 'Task status updated',
            'data' => $task
        ]);
    }

    /**
     * Bulk update tasks (reorder, etc.)
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|string',
            'tasks.*.dayNumber' => 'sometimes|integer',
            'tasks.*.isActive' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->tasks as $taskData) {
            $task = Task::find($taskData['id']);
            if ($task) {
                $updateData = [];
                if (isset($taskData['dayNumber'])) {
                    $updateData['dayNumber'] = $taskData['dayNumber'];
                }
                if (isset($taskData['isActive'])) {
                    $updateData['isActive'] = $taskData['isActive'];
                }
                $task->update($updateData);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tasks updated successfully'
        ]);
    }

    /**
     * Get task statistics
     */
    public function stats()
    {
        $total = Task::count();
        $active = Task::where('isActive', true)->count();
        $byDifficulty = Task::selectRaw('difficulty, COUNT(*) as count')
            ->groupBy('difficulty')
            ->get()
            ->pluck('count', 'difficulty');
        $bySource = Task::selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->get()
            ->pluck('count', 'source');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $total - $active,
                'byDifficulty' => $byDifficulty,
                'bySource' => $bySource,
            ]
        ]);
    }
}

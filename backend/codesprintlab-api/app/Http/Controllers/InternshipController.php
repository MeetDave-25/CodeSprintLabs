<?php

namespace App\Http\Controllers;

use App\Models\Internship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class InternshipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Internship::query();

        // If not admin, only show active internships
        if (!$request->user('api') || !$request->user('api')->isAdmin()) {
            $query->where('isActive', true);
        }

        // Filter by domain
        if ($request->has('domain')) {
            $query->where('domain', $request->domain);
        }

        // Filter by difficulty
        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        $internships = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $internships
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'companyName' => 'required|string|max:255',
            'location' => 'required|string',
            'type' => 'required|string', // e.g. Remote, On-site
            'stipend' => 'required|string',
            'applicationDeadline' => 'nullable|date',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date',
            'domain' => 'required|string',
            'description' => 'nullable|string',
            'duration' => 'required|string',
            'difficulty' => 'nullable|in:Beginner,Intermediate,Advanced',
            'maxStudents' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'languages' => 'nullable|array',
            'skills' => 'nullable|array',
            'responsibilities' => 'nullable|array',
            'requirements' => 'nullable|array',
            'whatYouWillLearn' => 'nullable|array',
            'syllabus' => 'nullable|array',
            'companyLogo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $internshipData = $request->except('tasks');
        
        // Set defaults
        $internshipData['description'] = $internshipData['description'] ?? 'No description provided';
        $internshipData['difficulty'] = $internshipData['difficulty'] ?? 'Beginner';
        $internshipData['maxStudents'] = $internshipData['maxStudents'] ?? 100;
        
        try {
            // Get creator ID safely
            $creatorId = null;
            if ($request->user()) {
                $creatorId = $request->user()->id;
            }
            
            $internshipData['createdBy'] = $creatorId;
            $internshipData['enrolled'] = 0;
            $internshipData['isActive'] = $request->input('isActive', true);
            $internshipData['isFeatured'] = $request->input('isFeatured', false);
            
            $internship = Internship::create($internshipData);

            // Handle Tasks
            if ($request->has('tasks')) {
                $tasks = $request->input('tasks');
                foreach ($tasks as $taskData) {
                    // Ensure task belongs to this internship
                    $taskData['internshipId'] = $internship->id;
                    $taskData['source'] = 'internship';
                    \App\Models\Task::create($taskData);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Internship created successfully',
                'data' => $internship->load('tasks')
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create internship: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create internship: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $internship = Internship::with('tasks')->find($id);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $internship
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $internship = Internship::find($id);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        $internshipData = $request->except('tasks');
        $internship->update($internshipData);

        // Handle Tasks Sync
        if ($request->has('tasks')) {
            $tasks = $request->input('tasks');
            
            Log::info('Tasks received for internship update', [
                'internshipId' => $internship->id,
                'tasksCount' => count($tasks),
                'tasks' => $tasks
            ]);
            
            // Get IDs of tasks to keep
            $keepTaskIds = array_filter(array_column($tasks, 'id'), fn($id) => !str_starts_with($id, 't')); // Filter out temp IDs like "t1"

            // Delete tasks not in the list
            $internship->tasks()->whereNotIn('_id', $keepTaskIds)->delete();

            foreach ($tasks as $taskData) {
                $taskData['internshipId'] = $internship->id;
                $taskData['source'] = 'internship';

                if (isset($taskData['id']) && !str_starts_with($taskData['id'], 't')) {
                    // Update existing task - remove id to avoid MongoDB _id conflict
                    $taskId = $taskData['id'];
                    unset($taskData['id']);
                    unset($taskData['_id']); // Also remove _id if present
                    unset($taskData['status']); // Remove legacy status field
                    \App\Models\Task::where('_id', $taskId)->update($taskData);
                    Log::info('Updated existing task', ['taskId' => $taskId]);
                } else {
                    // Create new task (remove temp ID)
                    unset($taskData['id']);
                    unset($taskData['status']); // Remove legacy status field
                    $newTask = \App\Models\Task::create($taskData);
                    Log::info('Created new task', ['newTaskId' => $newTask->id, 'title' => $newTask->title]);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Internship updated successfully',
            'data' => $internship->load('tasks')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $internship = Internship::find($id);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        $internship->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Internship deleted successfully'
        ]);
    }

    /**
     * Enroll student in internship
     */
    public function enroll(Request $request, $id)
    {
        $internship = Internship::find($id);
        $user = $request->user();

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        if ($internship->isFull()) {
            return response()->json(['message' => 'Internship is full'], 400);
        }

        // Check if already enrolled in ANY internship (if rule exists) or THIS internship
        // Assuming user['enrolledInternships'] stores IDs
        $enrolledInternships = $user->enrolledInternships ?? [];
        
        if (in_array($id, $enrolledInternships)) {
            return response()->json(['message' => 'Already enrolled in this internship'], 400);
        }

        // Add to user's enrolled internships
        $user->push('enrolledInternships', $id, true); // true for unique
        
        // Increment internship enrollment count
        $internship->incrementEnrolled();

        return response()->json([
            'status' => 'success',
            'message' => 'Enrolled successfully',
            'data' => $internship
        ]);
    }
}

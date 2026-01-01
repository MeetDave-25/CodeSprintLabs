<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::query();

        // If not admin, only show active courses
        if (!$request->user('api') || !$request->user('api')->isAdmin()) {
            $query->where('isActive', true);
        }

        // Filter by level
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        $courses = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $courses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructor' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'duration' => 'nullable|string',
            'level' => 'nullable|in:Beginner,Intermediate,Advanced',
            'modules' => 'nullable|array',
            'category' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $courseData = $request->all();
        
        // Set defaults
        $courseData['description'] = $courseData['description'] ?? 'No description provided';
        $courseData['instructor'] = $courseData['instructor'] ?? 'TBA';
        $courseData['price'] = $courseData['price'] ?? 0;
        $courseData['duration'] = $courseData['duration'] ?? 'TBA';
        $courseData['level'] = $courseData['level'] ?? 'Beginner';

        try {
            $course = Course::create(array_merge(
                $courseData,
                ['createdBy' => $request->user()->id]
            ));

            return response()->json([
                'status' => 'success',
                'message' => 'Course created successfully',
                'data' => $course
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create course: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $course = Course::with('tasks')->find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $course
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $course->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Course updated successfully',
            'data' => $course
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $course->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Course deleted successfully'
        ]);
    }

    /**
     * Enroll student in course
     */
    public function enroll(Request $request, $id)
    {
        $course = Course::find($id);
        $user = $request->user();

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Check if already enrolled
        $enrolledCourses = $user->enrolledCourses ?? [];
        
        if (in_array($id, $enrolledCourses)) {
            return response()->json(['message' => 'Already enrolled in this course'], 400);
        }

        // Add to user's enrolled courses
        $user->push('enrolledCourses', $id, true);
        
        // Increment course enrollment count
        $course->incrementEnrolled();

        return response()->json([
            'status' => 'success',
            'message' => 'Enrolled successfully',
            'data' => $course
        ]);
    }
}

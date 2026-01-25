<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

use App\Models\Internship;

class StudentController extends Controller
{
    /**
     * List all students
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'student');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by internship
        if ($request->has('internship')) {
            $val = $request->internship;
            // First check if it's a title
            $internship = Internship::where('title', $val)->first();
            if ($internship) {
                $query->where('enrolledInternships', 'elemMatch', ['$eq' => $internship->id]);
            } else {
                // Fallback to ID
                $query->where('enrolledInternships', 'elemMatch', ['$eq' => $val]);
            }
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->orderBy('created_at', 'desc')->get();

        // Transform Internship IDs to Titles
        $allInternshipIds = $students->pluck('enrolledInternships')->flatten()->unique()->filter();
        if ($allInternshipIds->isNotEmpty()) {
            $internshipMap = Internship::whereIn('_id', $allInternshipIds)->pluck('title', '_id')->toArray();
            
            // Also try to fetch by id string if _id lookup misses (MongoDB/Laravel quirk handling)
             if (count($internshipMap) < $allInternshipIds->count()) {
                 $moreInternships = Internship::whereIn('id', $allInternshipIds)->pluck('title', 'id')->toArray();
                 $internshipMap = array_merge($internshipMap, $moreInternships);
             }

            $students->transform(function ($student) use ($internshipMap) {
                if (!empty($student->enrolledInternships)) {
                    $student->enrolledInternships = collect($student->enrolledInternships)->map(function ($id) use ($internshipMap) {
                        return $internshipMap[$id] ?? $id;
                    })->toArray();
                }
                return $student;
            });
        }

        return response()->json(['students' => $students]);
    }

    /**
     * Get student details
     */
    public function show(string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        // Transform Internship IDs to Titles
        if (!empty($student->enrolledInternships)) {
             $internshipMap = Internship::whereIn('_id', $student->enrolledInternships)->pluck('title', '_id')->toArray();
             // Fallback for string ids
             $moreInternships = Internship::whereIn('id', $student->enrolledInternships)->pluck('title', 'id')->toArray();
             $internshipMap = array_merge($internshipMap, $moreInternships);

             $student->enrolledInternships = collect($student->enrolledInternships)->map(function ($id) use ($internshipMap) {
                 return $internshipMap[$id] ?? $id;
             })->toArray();
        }

        // Get additional stats
        $stats = [
            'submissions' => $student->submissions()->count(),
            'pendingSubmissions' => $student->submissions()->where('status', 'pending')->count(),
            'approvedSubmissions' => $student->submissions()->where('status', 'approved')->count(),
            'certificates' => $student->certificates()->count(),
        ];

        return response()->json([
            'student' => $student,
            'stats' => $stats,
        ]);
    }

    /**
     * Update student status
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,blocked',
        ]);

        $student = User::where('role', 'student')->findOrFail($id);
        $student->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Student status updated successfully',
            'student' => $student,
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        $totalStudents = User::where('role', 'student')->count();
        $activeStudents = User::where('role', 'student')->where('status', 'active')->count();
        $inactiveStudents = User::where('role', 'student')->where('status', 'inactive')->count();
        $avgPoints = User::where('role', 'student')->avg('totalPoints');

        return response()->json([
            'stats' => [
                'total' => $totalStudents,
                'active' => $activeStudents,
                'inactive' => $inactiveStudents,
                'avgPoints' => round($avgPoints ?? 0),
            ],
        ]);
    }
    /**
     * Delete student
     */
    public function destroy(string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }
}

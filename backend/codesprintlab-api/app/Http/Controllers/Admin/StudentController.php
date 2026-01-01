<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

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
            $query->where('enrolledInternships', 'elemMatch', ['$eq' => $request->internship]);
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

        return response()->json(['students' => $students]);
    }

    /**
     * Get student details
     */
    public function show(string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

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
}

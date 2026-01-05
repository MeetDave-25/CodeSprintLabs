<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Internship;
use App\Models\Certificate;
use App\Models\Course;
use Illuminate\Http\Request;

class PublicStatsController extends Controller
{
    /**
     * Get public statistics for the landing page
     */
    public function index()
    {
        // Count total students (users with role 'student')
        $totalStudents = User::where('role', 'student')->count();
        
        // Count active internships
        $activeInternships = Internship::where('isActive', true)->count();
        
        // Count total internships
        $totalInternships = Internship::count();
        
        // Count issued certificates
        $certificatesIssued = Certificate::count();
        
        // Count total courses
        $totalCourses = Course::count();
        
        // Count students who have completed at least one internship
        $completedStudents = User::where('role', 'student')
            ->where('tasksCompleted', '>', 0)
            ->count();
        
        // Calculate success rate (students with completed tasks / total students)
        $successRate = $totalStudents > 0 
            ? round(($completedStudents / $totalStudents) * 100) 
            : 95;
        
        // Get domain distribution for internships
        $domains = Internship::where('isActive', true)
            ->get()
            ->groupBy('domain')
            ->map(function ($items, $domain) {
                return [
                    'name' => $domain,
                    'count' => $items->count()
                ];
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalStudents' => $totalStudents,
                'activeInternships' => $activeInternships,
                'totalInternships' => $totalInternships,
                'certificatesIssued' => $certificatesIssued,
                'totalCourses' => $totalCourses,
                'successRate' => $successRate,
                'domains' => $domains
            ]
        ]);
    }
    
    /**
     * Get featured internships for the landing page
     */
    public function featuredInternships()
    {
        $internships = Internship::where('isActive', true)
            ->orderBy('enrolled', 'desc')
            ->limit(6)
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $internships
        ]);
    }
    
    /**
     * Get featured courses for the landing page
     */
    public function featuredCourses()
    {
        $courses = Course::where('isPublished', true)
            ->orderBy('enrolled', 'desc')
            ->limit(4)
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $courses
        ]);
    }
}

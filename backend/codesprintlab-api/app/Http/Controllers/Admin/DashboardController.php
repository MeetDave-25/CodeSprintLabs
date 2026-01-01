<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Internship;
use App\Models\Course;
use App\Models\Submission;
use App\Models\Payment;
use App\Models\Certificate;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        // Main stats
        $totalStudents = User::where('role', 'student')->count();
        $activeInternships = Internship::where('isActive', true)->count();
        $pendingSubmissions = Submission::where('status', 'pending')->count();
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');

        // Growth calculations (compare to last month)
        $thisMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $studentsThisMonth = User::where('role', 'student')
            ->where('created_at', '>=', $thisMonthStart)
            ->count();
        $studentsLastMonth = User::where('role', 'student')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();
        $studentsGrowth = $studentsLastMonth > 0 
            ? round((($studentsThisMonth - $studentsLastMonth) / $studentsLastMonth) * 100, 1)
            : ($studentsThisMonth > 0 ? 100 : 0);

        $submissionsThisMonth = Submission::where('created_at', '>=', $thisMonthStart)->count();
        $submissionsLastMonth = Submission::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $submissionsGrowth = $submissionsLastMonth > 0 
            ? round((($submissionsThisMonth - $submissionsLastMonth) / $submissionsLastMonth) * 100, 1)
            : ($submissionsThisMonth > 0 ? 100 : 0);

        $revenueThisMonth = Payment::where('status', 'completed')
            ->where('paymentDate', '>=', $thisMonthStart)
            ->sum('amount');
        $revenueLastMonth = Payment::where('status', 'completed')
            ->whereBetween('paymentDate', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');
        $revenueGrowth = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : ($revenueThisMonth > 0 ? 100 : 0);

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalStudents' => $totalStudents,
                'activeInternships' => $activeInternships,
                'pendingSubmissions' => $pendingSubmissions,
                'totalRevenue' => $totalRevenue,
                'studentsGrowth' => $studentsGrowth,
                'submissionsGrowth' => $submissionsGrowth,
                'revenueGrowth' => $revenueGrowth,
            ]
        ]);
    }

    /**
     * Get monthly analytics data for charts
     */
    public function analytics(Request $request)
    {
        $months = $request->get('months', 6);
        $monthlyData = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $startDate = Carbon::now()->subMonths($i)->startOfMonth();
            $endDate = Carbon::now()->subMonths($i)->endOfMonth();
            $monthName = $startDate->format('M');

            $students = User::where('role', 'student')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            $revenue = Payment::where('status', 'completed')
                ->whereBetween('paymentDate', [$startDate, $endDate])
                ->sum('amount');

            $submissions = Submission::whereBetween('created_at', [$startDate, $endDate])->count();

            $monthlyData[] = [
                'month' => $monthName,
                'students' => $students,
                'revenue' => $revenue,
                'submissions' => $submissions,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $monthlyData
        ]);
    }

    /**
     * Get recent submissions for dashboard
     */
    public function recentSubmissions(Request $request)
    {
        $limit = $request->get('limit', 5);

        $submissions = Submission::where('status', 'pending')
            ->orderBy('submittedAt', 'desc')
            ->limit($limit)
            ->get(['_id', 'studentName', 'taskTitle', 'status', 'submittedAt']);

        return response()->json([
            'status' => 'success',
            'data' => $submissions
        ]);
    }

    /**
     * Get recent enrollments for dashboard
     */
    public function recentEnrollments(Request $request)
    {
        $limit = $request->get('limit', 5);

        // Get recently enrolled students with their internships
        $students = User::where('role', 'student')
            ->whereNotNull('enrolledInternships')
            ->where('enrolledInternships', '!=', [])
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get(['_id', 'name', 'enrolledInternships', 'updated_at']);

        $enrollments = [];
        foreach ($students as $student) {
            $internshipIds = $student->enrolledInternships ?? [];
            if (!empty($internshipIds)) {
                $latestInternshipId = end($internshipIds);
                $internship = Internship::find($latestInternshipId);
                
                $enrollments[] = [
                    'student' => $student->name,
                    'internship' => $internship ? $internship->title : 'Unknown',
                    'date' => $student->updated_at->diffForHumans(),
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $enrollments
        ]);
    }

    /**
     * Get overview stats (extended)
     */
    public function overview()
    {
        $stats = [
            'students' => [
                'total' => User::where('role', 'student')->count(),
                'active' => User::where('role', 'student')->where('status', 'active')->count(),
                'blocked' => User::where('role', 'student')->where('status', 'blocked')->count(),
            ],
            'internships' => [
                'total' => Internship::count(),
                'active' => Internship::where('isActive', true)->count(),
                'totalEnrolled' => Internship::sum('enrolled'),
            ],
            'courses' => [
                'total' => Course::count(),
                'active' => Course::where('isActive', true)->count(),
                'totalEnrolled' => Course::sum('enrolled'),
            ],
            'submissions' => [
                'total' => Submission::count(),
                'pending' => Submission::where('status', 'pending')->count(),
                'approved' => Submission::where('status', 'approved')->count(),
                'rejected' => Submission::where('status', 'rejected')->count(),
            ],
            'payments' => [
                'totalRevenue' => Payment::where('status', 'completed')->sum('amount'),
                'totalTransactions' => Payment::where('status', 'completed')->count(),
                'pendingAmount' => Payment::where('status', 'pending')->sum('amount'),
            ],
            'certificates' => [
                'total' => Certificate::count(),
            ],
            'tasks' => [
                'total' => Task::count(),
                'active' => Task::where('isActive', true)->count(),
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Get domain/language distribution
     */
    public function distribution()
    {
        // Internships by domain
        $domainDistribution = Internship::selectRaw('domain, COUNT(*) as count, SUM(enrolled) as enrolled')
            ->groupBy('domain')
            ->get();

        // Courses by level
        $levelDistribution = Course::selectRaw('level, COUNT(*) as count, SUM(enrolled) as enrolled')
            ->groupBy('level')
            ->get();

        // Tasks by difficulty
        $difficultyDistribution = Task::selectRaw('difficulty, COUNT(*) as count')
            ->groupBy('difficulty')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'domains' => $domainDistribution,
                'levels' => $levelDistribution,
                'difficulties' => $difficultyDistribution,
            ]
        ]);
    }
}

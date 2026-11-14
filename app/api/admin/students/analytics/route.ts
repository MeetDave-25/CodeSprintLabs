import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [
            overallStats,
            topCourses,
            topInternships,
            registrationTrend,
            topStudents,
            domainBreakdown,
            submissionStats,
            retentionStats,
        ] = await Promise.all([
            // Overall student stats
            sql`
                SELECT
                    COUNT(*) as "totalStudents",
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as "activeStudents",
                    COALESCE(AVG("totalPoints"), 0) as "avgPoints",
                    COALESCE(AVG("tasksCompleted"), 0) as "avgTasksCompleted",
                    COALESCE(SUM("tasksCompleted"), 0) as "totalTasksCompleted"
                FROM users WHERE role = 'student'
            `.catch(() => [{ totalStudents: 0, activeStudents: 0, avgPoints: 0, avgTasksCompleted: 0, totalTasksCompleted: 0 }]),

            // Most enrolled courses
            sql`
                SELECT c.title, c.domain, COUNT(e.id) as "enrollments"
                FROM courses c
                LEFT JOIN course_enrollments e ON e."courseId"::text = c.id::text
                GROUP BY c.id, c.title, c.domain
                ORDER BY "enrollments" DESC
                LIMIT 8
            `.catch(() => []),

            // Most enrolled internships
            sql`
                SELECT i.title, i.domain, COUNT(e.id) as "enrollments"
                FROM internships i
                LEFT JOIN enrollment_requests e ON e."internshipId"::text = i.id::text
                    AND e.status IN ('approved', 'active', 'completed')
                GROUP BY i.id, i.title, i.domain
                ORDER BY "enrollments" DESC
                LIMIT 8
            `.catch(() => []),

            // Student registrations per month (last 6 months)
            sql`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
                    COUNT(*) as "newStudents"
                FROM users
                WHERE role = 'student'
                  AND created_at >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at)
            `.catch(() => []),

            // Top performing students by points
            sql`
                SELECT id, name, email, avatar, "totalPoints", "tasksCompleted", "coursesCompleted"
                FROM users
                WHERE role = 'student'
                ORDER BY "totalPoints" DESC NULLS LAST
                LIMIT 10
            `.catch(() => []),

            // Enrollment breakdown by domain/internship domain
            sql`
                SELECT i.domain, COUNT(e.id) as "count"
                FROM enrollment_requests e
                JOIN internships i ON i.id::text = e."internshipId"::text
                WHERE e.status IN ('approved', 'active', 'completed')
                GROUP BY i.domain
                ORDER BY "count" DESC
            `.catch(() => []),

            // Submission pass/fail ratio
            sql`
                SELECT
                    COUNT(*) as "total",
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as "approved",
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as "rejected",
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as "pending"
                FROM submissions
            `.catch(() => [{ total: 0, approved: 0, rejected: 0, pending: 0 }]),

            // Students who completed at least one internship
            sql`
                SELECT
                    COUNT(DISTINCT e."userId") as "completedStudents",
                    COUNT(DISTINCT e.id) as "completedEnrollments"
                FROM enrollment_requests e
                WHERE e.status = 'completed'
            `.catch(() => [{ completedStudents: 0, completedEnrollments: 0 }]),
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                overall: overallStats[0] || {},
                topCourses: topCourses || [],
                topInternships: topInternships || [],
                registrationTrend: registrationTrend || [],
                topStudents: topStudents || [],
                domainBreakdown: domainBreakdown || [],
                submissions: submissionStats[0] || {},
                retention: retentionStats[0] || {},
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/students/analytics error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

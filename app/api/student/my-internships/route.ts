import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { DOC_STATUSES, ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

// GET student's enrolled internships
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const uid = String(authUser.id);

        const rows = await sql`
            SELECT
                e.id as "enrollmentId", e.status as "enrollmentStatus",
                e."startDate", e."endDate", e."approvedAt",
                e."withdrawalStatus", e."withdrawalRequestedAt",
                i.id, i.title, i.description, i."companyName", i.type, i.location,
                i.stipend, i.duration, i.domain,
                (SELECT COUNT(*) FROM tasks t
                    WHERE t."internshipId"::text = e."internshipId"::text AND t."isActive" = true)::int as "totalTasks",
                (SELECT COUNT(DISTINCT s."taskId") FROM submissions s
                    JOIN tasks t2 ON t2.id::text = s."taskId"::text
                    WHERE t2."internshipId"::text = e."internshipId"::text AND t2."isActive" = true
                      AND s."studentId"::text = ${uid}
                      AND s.status = 'approved'
                )::int as "tasksCompleted"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId"::text = ${uid}
              AND e.status = ANY(${DOC_STATUSES})
            ORDER BY e."approvedAt" DESC NULLS LAST, e.created_at DESC
        `;

        const data = rows.map((r: any) => {
            const progress = r.totalTasks > 0 ? Math.round((r.tasksCompleted / r.totalTasks) * 100) : 0;
            return {
                ...r,
                progress,
                status: r.enrollmentStatus === 'withdrawn' ? 'withdrawn' : progress >= 100 ? 'completed' : 'active',
            };
        });

        return NextResponse.json({ status: 'success', data });
    } catch (error: any) {
        console.error('GET /api/student/my-internships error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

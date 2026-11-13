import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET student's enrolled internships
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT
                e.id as "enrollmentId", e.status as "enrollmentStatus",
                e."startDate", e."endDate", e."approvedAt",
                i.id, i.title, i.description, i."companyName", i.type, i.location,
                i.stipend, i.duration, i.tags,
                (SELECT COUNT(*) FROM tasks t WHERE t."internshipId"::text = i.id::text AND t."isActive" = true) as "totalTasks",
                (SELECT COUNT(*) FROM submissions s
                    JOIN tasks t2 ON t2.id::text = s."taskId"::text
                    WHERE t2."internshipId"::text = i.id::text
                      AND s."studentId"::text = ${String(authUser.id)}
                      AND s.status = 'approved'
                ) as "completedTasks"
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId"::text = ${String(authUser.id)} AND e.status = 'approved'
            ORDER BY e."approvedAt" DESC
        `;

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        console.error('GET /api/student/my-internships error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


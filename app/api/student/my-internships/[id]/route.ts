import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { DOC_STATUSES, ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const uid = String(authUser.id);
        const iid = String(params.id);

        const rows = await sql`
            SELECT
                e.id as "enrollmentId", e.status as "enrollmentStatus",
                e."startDate", e."endDate", e."approvedAt",
                i.id, i.title, i.description, i."companyName", i.type,
                i.location, i.stipend, i.duration, i.domain
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId"::text = ${uid}
              AND e.status = ANY(${DOC_STATUSES})
              AND i.id::text = ${iid}
            ORDER BY e.created_at DESC
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Internship not found or not enrolled' }, { status: 404 });
        }

        const tasks = await sql`
            SELECT t.*, s.id as "submissionId", s.status as "submissionStatus", s."submittedAt"
            FROM tasks t
            LEFT JOIN LATERAL (
                SELECT id, status, "submittedAt" FROM submissions
                WHERE "taskId"::text = t.id::text AND "studentId"::text = ${uid}
                ORDER BY "submittedAt" DESC NULLS LAST
                LIMIT 1
            ) s ON true
            WHERE t."internshipId"::text = ${iid} AND t."isActive" = true
            ORDER BY t."dayNumber" ASC NULLS LAST, t.id ASC
        `;

        const mapped = tasks.map((t: any) => ({
            ...t,
            submitted: !!t.submissionId,
            completed: t.submissionStatus === 'approved',
        }));

        return NextResponse.json({
            status: 'success',
            data: { ...rows[0], tasks: mapped },
        });
    } catch (error: any) {
        console.error('GET /api/student/my-internships/[id] error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

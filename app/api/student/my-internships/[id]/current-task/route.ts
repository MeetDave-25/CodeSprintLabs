import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const uid = String(authUser.id);
        const enrollment = await sql`
            SELECT * FROM enrollment_requests
            WHERE id::text = ${String(params.id)} AND "userId"::text = ${uid} LIMIT 1
        `;
        if (!enrollment || enrollment.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        const internshipId = String(enrollment[0].internshipId);

        // Next active task not yet approved for this student
        const tasks = await sql`
            SELECT t.* FROM tasks t
            WHERE t."internshipId"::text = ${internshipId}
              AND t."isActive" = true
              AND t.id::text NOT IN (
                  SELECT s."taskId"::text FROM submissions s
                  WHERE s."studentId"::text = ${uid} AND s.status = 'approved'
              )
            ORDER BY t."dayNumber" ASC NULLS LAST, t.id ASC
            LIMIT 1
        `;

        return NextResponse.json({
            status: 'success',
            data: tasks.length > 0 ? tasks[0] : null,
        });
    } catch (error: any) {
        console.error('GET /api/student/my-internships/[id]/current-task error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

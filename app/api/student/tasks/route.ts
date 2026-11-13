import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source'); // 'internship' | 'course'

        // Get student's enrolled internship IDs
        const enrollments = await sql`
            SELECT "internshipId" FROM enrollment_requests
            WHERE "userId" = ${authUser.id} AND status = 'approved'
        `;
        const internshipIds = enrollments.map((e: any) => e.internshipId);

        let tasks: any[] = [];

        if ((!source || source === 'internship') && internshipIds.length > 0) {
            const internshipTasks = await sql`
                SELECT t.*, i.title as "internshipTitle"
                FROM tasks t
                LEFT JOIN internships i ON i.id::text = t."internshipId"
                WHERE t."internshipId" = ANY(${internshipIds}::text[])
                AND t."isActive" = true
                ORDER BY t."order" ASC
            `;
            tasks = [...tasks, ...internshipTasks.map((t: any) => ({ ...t, source: 'internship' }))];
        }

        return NextResponse.json({ tasks });
    } catch (error: any) {
        console.error('GET /api/student/tasks error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}

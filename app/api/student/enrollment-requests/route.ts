import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET student's enrollment requests
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT e.*, i.title as "internshipTitle", i.description as "internshipDescription",
                i."companyName", i.type, i.location, i.stipend, i.duration
            FROM enrollment_requests e
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."userId" = ${authUser.id}
            ORDER BY e."createdAt" DESC
        `;

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        console.error('GET /api/student/enrollment-requests error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

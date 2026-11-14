import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { ensureLifecycleSchema, ensureUserColumns } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

// GET /api/admin/withdrawal-requests
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        await ensureUserColumns();

        const { searchParams } = new URL(request.url);
        const raw = searchParams.get('withdrawalStatus');
        const withdrawalStatus = raw && raw !== 'all' ? raw : null;

        const rows = await sql`
            SELECT e.*,
                u.name as "studentName", u.email as "studentEmail", u.phone as "studentPhone",
                u."collegeName" as "studentCollegeName",
                i.title as "internshipTitle", i.domain as "internshipDomain"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."withdrawalRequested" = true
              AND (${withdrawalStatus}::text IS NULL OR e."withdrawalStatus" = ${withdrawalStatus}::text)
            ORDER BY e."withdrawalRequestedAt" DESC NULLS LAST
        `;

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        console.error('GET /api/admin/withdrawal-requests error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

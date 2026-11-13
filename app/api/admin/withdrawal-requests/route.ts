import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/withdrawal-requests
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const withdrawalStatus = searchParams.get('withdrawalStatus');

        const rows = await sql`
            SELECT e.*,
                u.name as "studentName", u.email as "studentEmail",
                i.title as "internshipTitle"
            FROM enrollment_requests e
            LEFT JOIN users u ON u.id::text = e."userId"::text
            LEFT JOIN internships i ON i.id::text = e."internshipId"::text
            WHERE e."withdrawalRequested" = true
            ${withdrawalStatus && withdrawalStatus !== 'all' ? sql`AND e."withdrawalStatus" = ${withdrawalStatus}` : sql``}
            ORDER BY e."withdrawalRequestedAt" DESC NULLS LAST
        `;

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


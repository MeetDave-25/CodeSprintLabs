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

        try {
            const rows = await sql`
                SELECT
                    COUNT(CASE WHEN status = 'completion_requested' THEN 1 END) as "pendingReviews",
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as "completedReviews",
                    COUNT(CASE WHEN status IN ('completion_requested', 'completed') THEN 1 END) as "totalReviews"
                FROM enrollment_requests
            `;
            return NextResponse.json({ status: 'success', data: rows[0] || { pendingReviews: 0, completedReviews: 0, totalReviews: 0 } });
        } catch {
            return NextResponse.json({ status: 'success', data: { pendingReviews: 0, completedReviews: 0, totalReviews: 0 } });
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

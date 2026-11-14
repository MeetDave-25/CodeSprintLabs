import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { loadReviews } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await loadReviews({ statuses: ['completion_requested', 'completed'] });
        const graded = rows.filter((r) => r.marks !== null);
        const avgMarks = graded.length
            ? Math.round((graded.reduce((sum, r) => sum + (r.marks as number), 0) / graded.length) * 10) / 10
            : 0;

        return NextResponse.json({
            status: 'success',
            data: {
                total: rows.length,
                pending: rows.filter((r) => r.completionStatus === 'pending_review').length,
                reviewed: rows.filter((r) => r.completionStatus === 'reviewed').length,
                certificateIssued: rows.filter((r) => r.completionStatus === 'certificate_issued').length,
                avgMarks,
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/completion-reviews/stats error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = (searchParams.get('search') || '').trim().toLowerCase();

        let rows = await loadReviews({ statuses: ['completion_requested', 'completed'] });
        if (status && status !== 'all') rows = rows.filter((r) => r.completionStatus === status);
        if (search) {
            rows = rows.filter((r) =>
                [r.studentName, r.studentEmail, r.internshipTitle].some((v) => v.toLowerCase().includes(search))
            );
        }

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        console.error('GET /api/admin/completion-reviews error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

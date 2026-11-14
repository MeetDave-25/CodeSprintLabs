import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { reviewEnrollment } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const result = await reviewEnrollment(params.id, body.marks, body.feedback ?? null, ['completion_requested', 'completed']);
        if ('error' in result) {
            return NextResponse.json({ message: result.error }, { status: result.status });
        }

        return NextResponse.json({ status: 'success', message: 'Review submitted successfully' });
    } catch (error: any) {
        console.error('POST /api/admin/completion-reviews/[id]/review error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

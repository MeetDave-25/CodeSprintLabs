import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { issueCertificate, reviewEnrollment } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const reviewed = await reviewEnrollment(
            params.enrollmentId,
            body.marks,
            body.feedback ?? null,
            ['approved', 'completion_requested', 'completed']
        );
        if ('error' in reviewed) {
            return NextResponse.json({ message: reviewed.error }, { status: reviewed.status });
        }

        if (body.issueCertificate) {
            const issued = await issueCertificate(params.enrollmentId);
            if ('error' in issued) {
                return NextResponse.json({ message: issued.error }, { status: issued.status });
            }
        }

        return NextResponse.json({ status: 'success', message: 'Internship marked as completed' });
    } catch (error: any) {
        console.error('POST /api/admin/completion-reviews/enrollment/[id]/complete error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

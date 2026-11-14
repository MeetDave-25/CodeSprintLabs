import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment } from '@/lib/enrollment-documents';
import { completionState, ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const e = await fetchEnrollment(params.enrollmentId, { userId: String(authUser.id), progress: true });
        if (!e) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }
        if (e.status !== 'approved') {
            return NextResponse.json({ message: 'Completion can only be requested for an active internship' }, { status: 422 });
        }
        if (e.progress.totalTasks > 0 && e.progress.tasksCompleted < e.progress.totalTasks) {
            return NextResponse.json({ message: 'Complete all tasks before requesting a completion review' }, { status: 422 });
        }

        const updated = await sql`
            UPDATE enrollment_requests
            SET status = 'completion_requested', "completionRequestedAt" = NOW(), updated_at = NOW()
            WHERE id::text = ${String(params.enrollmentId)}
            RETURNING *
        `;

        return NextResponse.json({ status: 'success', data: completionState(updated[0], e.progress) });
    } catch (error: any) {
        console.error('POST /api/student/internship-completion/[enrollmentId]/request error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const updated = await sql`
            UPDATE enrollment_requests
            SET status = 'completion_requested', "completionRequestedAt" = NOW(), updated_at = NOW()
            WHERE id::text = ${String(params.enrollmentId)} AND status = 'approved'
            RETURNING id
        `;
        if (!updated || updated.length === 0) {
            return NextResponse.json({ message: 'Only an active internship can be moved to completion review' }, { status: 422 });
        }

        return NextResponse.json({ status: 'success', message: 'Completion review initiated' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

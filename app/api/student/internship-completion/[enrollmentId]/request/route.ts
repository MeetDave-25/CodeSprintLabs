import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const updated = await sql`
            UPDATE enrollment_requests
            SET status = 'completion_requested', "completionRequestedAt" = NOW(), "updatedAt" = NOW()
            WHERE id = ${params.enrollmentId} AND "userId" = ${authUser.id}
            RETURNING *
        `;

        if (!updated || updated.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: updated[0] });
    } catch (error: any) {
        console.error('POST /api/student/internship-completion/[enrollmentId]/request error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

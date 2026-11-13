import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`
            UPDATE enrollment_requests
            SET status = 'completion_requested', "updatedAt" = NOW()
            WHERE id = ${params.enrollmentId}
        `;

        return NextResponse.json({ status: 'success', message: 'Completion review initiated' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

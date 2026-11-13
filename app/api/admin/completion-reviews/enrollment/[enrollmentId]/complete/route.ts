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

        const body = await request.json().catch(() => ({}));
        const { marks, feedback } = body;

        try {
            await sql`
                UPDATE enrollment_requests
                SET status = 'completed',
                    marks = ${marks ?? null},
                    feedback = ${feedback ?? null},
                    "updatedAt" = NOW()
                WHERE id = ${params.enrollmentId}
            `;
        } catch {
            await sql`
                UPDATE enrollment_requests
                SET status = 'completed', "updatedAt" = NOW()
                WHERE id = ${params.enrollmentId}
            `;
        }

        return NextResponse.json({ status: 'success', message: 'Internship marked as completed' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

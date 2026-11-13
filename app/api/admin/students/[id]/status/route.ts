import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { status } = body;

        if (!status || !['active', 'blocked', 'inactive'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status value' }, { status: 422 });
        }

        const updated = await sql`
            UPDATE users SET status = ${status}, "updatedAt" = NOW()
            WHERE id = ${params.id} AND role = 'student'
            RETURNING id, name, email, role, status
        `;

        if (!updated || updated.length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', message: 'Student status updated', data: updated[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


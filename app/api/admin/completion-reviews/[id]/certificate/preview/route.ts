import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const rows = await sql`
            SELECT c.*
            FROM certificates c
            JOIN enrollment_requests e ON e."certificateId" = c.id::text
            WHERE e.id::text = ${String(params.id)}
            LIMIT 1
        `;

        return NextResponse.json({ status: 'success', data: rows && rows.length > 0 ? rows[0] : null });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

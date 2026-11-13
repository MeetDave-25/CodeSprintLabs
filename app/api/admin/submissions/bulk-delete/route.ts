import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { ids, deleteAll } = body;

        if (deleteAll) {
            await sql`DELETE FROM submissions`;
            return NextResponse.json({ status: 'success', message: 'All submissions deleted' });
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: 'No submission IDs provided' }, { status: 400 });
        }

        await sql`DELETE FROM submissions WHERE id = ANY(${ids}::uuid[])`;

        return NextResponse.json({ status: 'success', message: `${ids.length} submission(s) deleted` });
    } catch (error: any) {
        console.error('DELETE /api/admin/submissions/bulk-delete error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

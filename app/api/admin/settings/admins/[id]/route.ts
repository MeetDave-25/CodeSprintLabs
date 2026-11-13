import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Can't delete yourself
        if (String(params.id) === String(authUser.id)) {
            return NextResponse.json({ message: 'You cannot delete your own admin account' }, { status: 400 });
        }

        await sql`DELETE FROM users WHERE id = ${params.id} AND role = 'admin'`;

        return NextResponse.json({ status: 'success', message: 'Admin deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


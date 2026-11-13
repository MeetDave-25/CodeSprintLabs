import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [total, active] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`,
            sql`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'`,
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                total: Number(total[0]?.count) || 0,
                active: Number(active[0]?.count) || 0,
                blocked: (Number(total[0]?.count) || 0) - (Number(active[0]?.count) || 0),
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

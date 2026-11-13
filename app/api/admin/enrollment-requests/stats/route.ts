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

        const [pending, approved, rejected, total] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM enrollment_requests WHERE status = 'pending'`,
            sql`SELECT COUNT(*) as count FROM enrollment_requests WHERE status = 'approved'`,
            sql`SELECT COUNT(*) as count FROM enrollment_requests WHERE status = 'rejected'`,
            sql`SELECT COUNT(*) as count FROM enrollment_requests`,
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                pending: Number(pending[0]?.count) || 0,
                approved: Number(approved[0]?.count) || 0,
                rejected: Number(rejected[0]?.count) || 0,
                total: Number(total[0]?.count) || 0,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

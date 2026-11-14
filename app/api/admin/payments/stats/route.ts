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

        try {
            const rows = await sql`
                SELECT
                    COUNT(*) as total,
                    COALESCE(SUM(CASE WHEN status IN ('paid', 'completed') THEN amount ELSE 0 END), 0) as "totalRevenue",
                    COUNT(CASE WHEN status IN ('paid', 'completed') THEN 1 END) as "paidCount",
                    COUNT(CASE WHEN status = 'refunded' THEN 1 END) as "refundedCount"
                FROM payments
            `;
            return NextResponse.json({ status: 'success', data: rows[0] });
        } catch {
            return NextResponse.json({ status: 'success', data: { total: 0, totalRevenue: 0, paidCount: 0, refundedCount: 0 } });
        }
    } catch (error: any) {
        console.error('GET /api/admin/payments/stats error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

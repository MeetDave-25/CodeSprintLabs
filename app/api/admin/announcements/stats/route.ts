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

        const [total, published, drafts, highPriority] = await Promise.all([
            sql`SELECT COUNT(*) as count FROM announcements`,
            sql`SELECT COUNT(*) as count FROM announcements WHERE "isActive" = true`,
            sql`SELECT COUNT(*) as count FROM announcements WHERE "isActive" = false`,
            sql`SELECT COUNT(*) as count FROM announcements WHERE priority = 'high' AND "isActive" = true`,
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                total: Number(total[0]?.count) || 0,
                published: Number(published[0]?.count) || 0,
                drafts: Number(drafts[0]?.count) || 0,
                highPriority: Number(highPriority[0]?.count) || 0,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

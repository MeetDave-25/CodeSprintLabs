import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));

        try {
            await sql`
                UPDATE payments SET status = 'refunded', "refundReason" = ${body.reason || ''}, updated_at = NOW()
                WHERE id = ${params.id}
            `;
        } catch {
            // column may not exist — just update status
            await sql`UPDATE payments SET status = 'refunded' WHERE id = ${params.id}`;
        }

        return NextResponse.json({ status: 'success', message: 'Payment marked as refunded' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { loadReviews } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { internshipId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await loadReviews({
            internshipId: params.internshipId,
            statuses: ['approved', 'completion_requested', 'completed'],
        });

        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

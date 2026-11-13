import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ status: 'success', data: [], message: 'Export feature coming soon' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

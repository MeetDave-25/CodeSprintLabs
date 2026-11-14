import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { issueCertificate } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const result = await issueCertificate(params.id);
        if ('error' in result) {
            return NextResponse.json({ message: result.error }, { status: result.status });
        }

        return NextResponse.json({ status: 'success', data: result.cert, message: 'Certificate issued successfully' });
    } catch (error: any) {
        console.error('POST /api/admin/completion-reviews/[id]/issue-certificate error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

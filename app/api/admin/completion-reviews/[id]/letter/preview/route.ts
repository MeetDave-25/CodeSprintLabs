import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment, completionLetterData } from '@/lib/enrollment-documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const e = await fetchEnrollment(params.id, { statuses: ['completed'], progress: true });
        if (!e) {
            return NextResponse.json({ message: 'Review the internship first to generate the completion letter' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: completionLetterData(e) });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

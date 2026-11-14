import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment, completionLetterData } from '@/lib/enrollment-documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const e = await fetchEnrollment(params.enrollmentId, { userId: String(authUser.id), progress: true });
        if (!e) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }
        if (e.status !== 'completed') {
            return NextResponse.json({ message: 'Your completion letter will be available once the review is done' }, { status: 422 });
        }

        return NextResponse.json({ status: 'success', data: completionLetterData(e) });
    } catch (error: any) {
        console.error('GET letter preview error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

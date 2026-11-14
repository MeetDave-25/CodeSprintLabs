import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment, buildCompletionLetterPdf, pdfResponseHeaders } from '@/lib/enrollment-documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const e = await fetchEnrollment(params.enrollmentId, {
            userId: String(authUser.id),
            statuses: ['completed'],
            progress: true,
        });
        if (!e) {
            return NextResponse.json({ message: 'Completion letter not available yet' }, { status: 404 });
        }

        return new NextResponse(new Uint8Array(buildCompletionLetterPdf(e)), {
            headers: pdfResponseHeaders('Completion_Letter', e.studentName),
        });
    } catch (error: any) {
        console.error('GET letter download error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

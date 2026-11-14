import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment, buildPartialCompletionPdf, pdfResponseHeaders } from '@/lib/enrollment-documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const e = await fetchEnrollment(params.id, { statuses: ['withdrawn'], progress: true });
        if (!e || e.withdrawalStatus !== 'approved') {
            return NextResponse.json({ message: 'No approved withdrawal for this enrollment' }, { status: 404 });
        }

        return new NextResponse(new Uint8Array(buildPartialCompletionPdf(e)), {
            headers: pdfResponseHeaders('Partial_Completion_Letter', e.studentName),
        });
    } catch (error: any) {
        console.error('GET /api/admin/withdrawal-requests/[id]/partial-completion error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

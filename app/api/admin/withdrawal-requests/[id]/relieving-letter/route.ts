import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment, buildRelievingLetterPdf, pdfResponseHeaders } from '@/lib/enrollment-documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const e = await fetchEnrollment(params.id, { statuses: ['withdrawn'] });
        if (!e || e.withdrawalStatus !== 'approved') {
            return NextResponse.json({ message: 'No approved withdrawal for this enrollment' }, { status: 404 });
        }

        return new NextResponse(new Uint8Array(buildRelievingLetterPdf(e)), {
            headers: pdfResponseHeaders('Relieving_Letter', e.studentName),
        });
    } catch (error: any) {
        console.error('GET /api/admin/withdrawal-requests/[id]/relieving-letter error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

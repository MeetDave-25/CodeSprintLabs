import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { fetchApprovedEnrollment, buildMouPdf } from '@/lib/enrollment-documents';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const e = await fetchApprovedEnrollment(params.id);
        if (!e) {
            return NextResponse.json({ message: 'Enrollment not found or not approved' }, { status: 404 });
        }

        const pdf = buildMouPdf(e);
        return new NextResponse(new Uint8Array(pdf), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="MOU_${(e.studentName || 'student').replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/enrollment-requests/[id]/mou error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

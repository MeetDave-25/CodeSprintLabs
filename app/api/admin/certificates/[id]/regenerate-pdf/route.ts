import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { fetchEnrollment, buildCertificatePdf, pdfResponseHeaders } from '@/lib/enrollment-documents';
import { ensureLifecycleSchema } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await ensureLifecycleSchema();
        const rows = await sql`SELECT * FROM certificates WHERE id::text = ${String(params.id)} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
        }
        const cert = rows[0];

        const enrollmentRows = await sql`
            SELECT id FROM enrollment_requests WHERE "certificateId" = ${String(cert.id)} LIMIT 1
        `;
        const e = enrollmentRows[0] ? await fetchEnrollment(String(enrollmentRows[0].id)) : null;

        return new NextResponse(new Uint8Array(buildCertificatePdf(cert, e)), {
            headers: pdfResponseHeaders('Certificate', cert.studentName || e?.studentName),
        });
    } catch (error: any) {
        console.error('GET /api/admin/certificates/[id]/regenerate-pdf error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

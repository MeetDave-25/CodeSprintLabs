import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatCertificate } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT * FROM certificates
            WHERE id = ${params.id} AND "studentId" = ${String(authUser.id)}
            LIMIT 1
        `;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            data: {
                certificate: formatCertificate(rows[0]),
                downloadUrl: null,
                message: 'Certificate PDF will be available here. Contact support for a download link.',
            },
        });
    } catch (error: any) {
        console.error('GET /api/student/certificates/[id]/download error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

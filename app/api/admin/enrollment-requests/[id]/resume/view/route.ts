import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET — return URL to view the resume (opens in browser tab)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`
            SELECT "resumeGoogleDriveUrl", "resumeCloudinaryUrl", "resumePath", "resumeOriginalName"
            FROM enrollment_requests WHERE id = ${params.id} LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Enrollment request not found' }, { status: 404 });
        }

        const r = rows[0];
        const url = r.resumeGoogleDriveUrl || r.resumeCloudinaryUrl;

        if (url) {
            return NextResponse.json({ status: 'redirect', url });
        }

        return NextResponse.json({ message: 'No resume attached to this request' }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

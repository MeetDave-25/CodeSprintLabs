import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET — return redirect URL for the resume (Cloudinary or Google Drive)
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

// DELETE — clear all resume fields
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`
            UPDATE enrollment_requests SET
                "resumePath" = NULL,
                "resumeOriginalName" = NULL,
                "resumeCloudinaryUrl" = NULL,
                "resumeGoogleDriveUrl" = NULL,
                "updatedAt" = NOW()
            WHERE id = ${params.id}
        `;

        return NextResponse.json({ status: 'success', message: 'Resume cleared successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { issueCertificate } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { enrollmentIds } = body;

        if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
            return NextResponse.json({ message: 'No enrollment IDs provided' }, { status: 400 });
        }

        const issued: string[] = [];
        const failed: string[] = [];

        for (const enrollmentId of enrollmentIds) {
            try {
                const result = await issueCertificate(String(enrollmentId));
                if ('error' in result) failed.push(String(enrollmentId));
                else issued.push(String(enrollmentId));
            } catch {
                failed.push(String(enrollmentId));
            }
        }

        return NextResponse.json({
            status: 'success',
            message: `Issued ${issued.length} certificate(s), ${failed.length} failed`,
            data: { issued, failed },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

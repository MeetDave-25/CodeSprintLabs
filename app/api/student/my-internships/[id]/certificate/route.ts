import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { issueCertificate } from '@/lib/enrollment-lifecycle';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const owned = await sql`
            SELECT id FROM enrollment_requests
            WHERE id::text = ${String(params.id)} AND "userId"::text = ${String(authUser.id)}
            LIMIT 1
        `;
        if (!owned || owned.length === 0) {
            return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
        }

        const result = await issueCertificate(String(params.id));
        if ('error' in result) {
            return NextResponse.json({ message: result.error }, { status: result.status });
        }
        return NextResponse.json({ status: 'success', data: result.cert });
    } catch (error: any) {
        console.error('POST /api/student/my-internships/[id]/certificate error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

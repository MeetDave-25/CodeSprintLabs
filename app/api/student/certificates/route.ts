import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatCertificate } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
        }

        const rows = await sql`
            SELECT * FROM certificates
            WHERE "studentId" = ${String(user.id)}
            ORDER BY "issueDate" DESC, created_at DESC
        `;

        const data = (rows || []).map(formatCertificate);

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /student/certificates GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch student certificates: ' + error?.message },
            { status: 500 }
        );
    }
}


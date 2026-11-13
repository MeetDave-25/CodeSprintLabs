import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { formatSubmission } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });
        }

        const rows = await sql`
            SELECT * FROM submissions
            WHERE "studentId" = ${String(user.id)}
            ORDER BY "submittedAt" DESC, created_at DESC
        `;

        const submissions = (rows || []).map(formatSubmission);

        return NextResponse.json({
            status: 'success',
            submissions,
            data: submissions,
        });
    } catch (error: any) {
        console.error('API /student/submissions GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch student submissions: ' + error?.message },
            { status: 500 }
        );
    }
}


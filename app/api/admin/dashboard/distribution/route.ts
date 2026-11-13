import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [internshipDist, submissionDist] = await Promise.all([
            sql`SELECT type, COUNT(*) as count FROM internships WHERE "isActive" = true GROUP BY type`,
            sql`SELECT status, COUNT(*) as count FROM submissions GROUP BY status`,
        ]);

        return NextResponse.json({
            status: 'success',
            data: {
                internshipsByType: internshipDist,
                submissionsByStatus: submissionDist,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


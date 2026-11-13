import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatSubmission } from '@/lib/data-formatters';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const rows = await sql`SELECT * FROM submissions WHERE id = ${id} LIMIT 1`;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({
            submission: formatSubmission(rows[0]),
            data: formatSubmission(rows[0]),
        });
    } catch (error: any) {
        console.error('API /admin/submissions/[id] GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch submission: ' + error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await sql`DELETE FROM submissions WHERE id = ${params.id}`;

        return NextResponse.json({ status: 'success', message: 'Submission deleted successfully' });
    } catch (error: any) {
        console.error('API /admin/submissions/[id] DELETE error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to delete submission: ' + error?.message },
            { status: 500 }
        );
    }
}


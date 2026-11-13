import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatInternship } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return NextResponse.json({ message: 'Internship ID is required' }, { status: 400 });
        }

        const rows = await sql`
            SELECT * FROM internships
            WHERE id = ${id}
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Internship not found' }, { status: 404 });
        }

        const internship = rows[0];

        // Fetch associated tasks
        const tasks = await sql`
            SELECT * FROM tasks
            WHERE "internshipId" = ${String(id)}
              AND "isActive" = true
            ORDER BY "dayNumber" ASC, created_at ASC
        `;

        const data = formatInternship(internship, tasks || []);

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /internships/[id] error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch internship: ' + error?.message },
            { status: 500 }
        );
    }
}

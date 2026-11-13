import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatInternship } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');

        // Fetch active internships
        let rows;
        if (domain && difficulty) {
            rows = await sql`
                SELECT * FROM internships
                WHERE "isActive" = true
                  AND domain = ${domain}
                  AND difficulty = ${difficulty}
                ORDER BY created_at DESC
            `;
        } else if (domain) {
            rows = await sql`
                SELECT * FROM internships
                WHERE "isActive" = true
                  AND domain = ${domain}
                ORDER BY created_at DESC
            `;
        } else if (difficulty) {
            rows = await sql`
                SELECT * FROM internships
                WHERE "isActive" = true
                  AND difficulty = ${difficulty}
                ORDER BY created_at DESC
            `;
        } else {
            rows = await sql`
                SELECT * FROM internships
                WHERE "isActive" = true
                ORDER BY created_at DESC
            `;
        }

        let filtered = rows || [];
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(
                (item: any) =>
                    item.title?.toLowerCase().includes(s) ||
                    item.companyName?.toLowerCase().includes(s) ||
                    item.domain?.toLowerCase().includes(s)
            );
        }

        const data = filtered.map((row: any) => formatInternship(row));

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /internships error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch internships: ' + error?.message },
            { status: 500 }
        );
    }
}


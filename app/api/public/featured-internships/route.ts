import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const internships = await sql`
            SELECT
                id, title, description, "companyName", location, type,
                stipend, duration, "applicationDeadline", "startDate", "endDate",
                "isActive", "isFeatured", "maxStudents", tags, "createdAt"
            FROM internships
            WHERE "isFeatured" = true AND "isActive" = true
            ORDER BY "createdAt" DESC
            LIMIT 6
        `;

        return NextResponse.json({ internships });
    } catch (error: any) {
        console.error('GET /api/public/featured-internships error:', error);
        return NextResponse.json({ internships: [] }, { status: 200 });
    }
}

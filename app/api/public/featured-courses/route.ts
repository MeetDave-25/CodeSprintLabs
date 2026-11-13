import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const courses = await sql`
            SELECT
                id, title, description, instructor, duration, level,
                thumbnail, price, "isActive", "isFeatured", "enrolledCount", "createdAt"
            FROM courses
            WHERE "isActive" = true
            ORDER BY "enrolledCount" DESC, "createdAt" DESC
            LIMIT 6
        `;

        return NextResponse.json({ courses });
    } catch (error: any) {
        console.error('GET /api/public/featured-courses error:', error);
        return NextResponse.json({ courses: [] }, { status: 200 });
    }
}


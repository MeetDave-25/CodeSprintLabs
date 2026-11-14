import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const courses = await sql`
            SELECT
                id, title, description, instructor, duration, level,
                thumbnail, price, "isActive", enrolled as "enrolledCount", rating, created_at as "createdAt"
            FROM courses
            WHERE "isActive" = true
            ORDER BY enrolled DESC, created_at DESC
            LIMIT 6
        `;

        return NextResponse.json({ courses });
    } catch (error: any) {
        console.error('GET /api/public/featured-courses error:', error);
        return NextResponse.json({ courses: [] }, { status: 200 });
    }
}


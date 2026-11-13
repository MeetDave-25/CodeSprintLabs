import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /announcements - for authenticated users (student or admin)
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const audience = authUser.role === 'admin' ? 'admins' : 'students';

        const announcements = await sql`
            SELECT id, title, content, "targetAudience", priority, "isActive", "createdAt"
            FROM announcements
            WHERE "isActive" = true
            AND "targetAudience" IN (${audience}, 'all')
            ORDER BY
                CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END ASC,
                "createdAt" DESC
            LIMIT 10
        `;

        return NextResponse.json({ status: 'success', data: announcements });
    } catch (error: any) {
        console.error('GET /api/announcements error:', error);
        return NextResponse.json({ status: 'success', data: [] });
    }
}


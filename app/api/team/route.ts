import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const members = await sql`
            SELECT
                id,
                name,
                role,
                bio,
                image,
                linkedin,
                github,
                twitter,
                "order",
                "isActive",
                gradient
            FROM team_members
            WHERE "isActive" = true
            ORDER BY "order" ASC
        `;

        return NextResponse.json({
            members: members.map((m: any) => ({
                _id: String(m.id),
                name: m.name,
                role: m.role,
                bio: m.bio || '',
                image: m.image || null,
                linkedin: m.linkedin || null,
                github: m.github || null,
                twitter: m.twitter || null,
                gradient: m.gradient || 'from-brand-400 to-brand-300',
            })),
        });
    } catch (error: any) {
        console.error('GET /api/team error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error?.message },
            { status: 500 }
        );
    }
}


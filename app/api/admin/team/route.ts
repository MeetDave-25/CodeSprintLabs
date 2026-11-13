import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/team
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const members = await sql`
            SELECT * FROM team_members ORDER BY "order" ASC
        `;

        return NextResponse.json({ status: 'success', data: members });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

// POST /api/admin/team
export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { name, role, bio, image, linkedin, github, twitter, gradient, order, isActive } = body;

        if (!name || !role) {
            return NextResponse.json({ message: 'name and role are required' }, { status: 422 });
        }

        const result = await sql`
            INSERT INTO team_members (name, role, bio, image, linkedin, github, twitter, gradient, "order", "isActive", "createdAt", "updatedAt")
            VALUES (
                ${name}, ${role}, ${bio || null}, ${image || null},
                ${linkedin || null}, ${github || null}, ${twitter || null},
                ${gradient || 'from-brand-400 to-brand-300'},
                ${order || 0}, ${isActive !== false}, NOW(), NOW()
            )
            RETURNING *
        `;

        return NextResponse.json(
            { status: 'success', message: 'Team member created', data: result[0] },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


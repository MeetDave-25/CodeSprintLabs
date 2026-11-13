import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const rows = await sql`SELECT * FROM team_members WHERE id = ${params.id} LIMIT 1`;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Team member not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', data: rows[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { name, role, bio, image, linkedin, github, twitter, gradient, order, isActive } = body;

        const updated = await sql`
            UPDATE team_members SET
                name = COALESCE(${name ?? null}, name),
                role = COALESCE(${role ?? null}, role),
                bio = COALESCE(${bio ?? null}, bio),
                image = COALESCE(${image ?? null}, image),
                linkedin = COALESCE(${linkedin ?? null}, linkedin),
                github = COALESCE(${github ?? null}, github),
                twitter = COALESCE(${twitter ?? null}, twitter),
                gradient = COALESCE(${gradient ?? null}, gradient),
                "order" = COALESCE(${order ?? null}, "order"),
                "isActive" = COALESCE(${isActive ?? null}, "isActive"),
                "updatedAt" = NOW()
            WHERE id = ${params.id}
            RETURNING *
        `;

        if (!updated || updated.length === 0) {
            return NextResponse.json({ message: 'Team member not found' }, { status: 404 });
        }

        return NextResponse.json({ status: 'success', message: 'Team member updated', data: updated[0] });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
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

        await sql`DELETE FROM team_members WHERE id = ${params.id}`;

        return NextResponse.json({ status: 'success', message: 'Team member deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


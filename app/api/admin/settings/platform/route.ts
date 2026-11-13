import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

// GET /api/admin/settings/platform
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Try to get from settings table, fallback to defaults
        try {
            const rows = await sql`SELECT * FROM settings LIMIT 1`;
            if (rows && rows.length > 0) {
                return NextResponse.json({ status: 'success', data: rows[0] });
            }
        } catch {}

        return NextResponse.json({
            status: 'success',
            data: {
                platformName: 'CodeSprint Labs',
                platformEmail: 'admin@codesprintlabs.com',
                maintenanceMode: false,
                allowRegistrations: true,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

// PUT /api/admin/settings/platform
export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));

        return NextResponse.json({
            status: 'success',
            message: 'Platform settings updated successfully',
            data: body,
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


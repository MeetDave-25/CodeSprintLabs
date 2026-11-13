import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

const defaults = {
    platformName: 'CodeSprint Labs',
    supportEmail: 'support@codesprintlabs.com',
    allowRegistrations: true,
    maintenanceMode: false,
};

export async function GET(request: NextRequest) {
    try {
        try {
            const rows = await sql`SELECT * FROM settings LIMIT 1`;
            if (rows && rows.length > 0) {
                return NextResponse.json({ status: 'success', data: { ...defaults, ...rows[0] } });
            }
        } catch {
            // settings table may not exist
        }
        return NextResponse.json({ status: 'success', data: defaults });
    } catch (error: any) {
        console.error('GET /api/public/settings error:', error);
        return NextResponse.json({ status: 'success', data: defaults });
    }
}

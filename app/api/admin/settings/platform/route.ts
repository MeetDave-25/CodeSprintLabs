import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

const DEFAULTS = {
    siteName: 'CodeSprint Labs',
    siteEmail: 'codesprintlabs@gmail.com',
    supportEmail: 'codesprintlabs@gmail.com',
    phone: '+91 81609 01481',
    address: 'Ahmedabad, Gujarat, India',
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
    allowRegistration: true,
};

type Settings = typeof DEFAULTS;

const KEYS: Record<keyof Settings, string> = {
    siteName: 'site_name',
    siteEmail: 'site_email',
    supportEmail: 'support_email',
    phone: 'phone',
    address: 'address',
    enableNotifications: 'enable_notifications',
    enableEmailAlerts: 'enable_email_alerts',
    maintenanceMode: 'maintenance_mode',
    allowRegistration: 'allow_registration',
};

async function readSettings(): Promise<Settings> {
    const rows = await sql`SELECT key, value FROM settings`;
    const stored = new Map<string, string>(rows.map((r: any) => [r.key, r.value]));
    const out: any = { ...DEFAULTS };
    for (const name of Object.keys(KEYS) as (keyof Settings)[]) {
        const raw = stored.get(KEYS[name]);
        if (raw === undefined || raw === null) continue;
        out[name] = typeof DEFAULTS[name] === 'boolean' ? raw === 'true' : raw;
    }
    return out;
}

// GET /api/admin/settings/platform
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser || authUser.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({ status: 'success', data: await readSettings() });
    } catch (error: any) {
        console.error('GET /api/admin/settings/platform error:', error);
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
        // Some callers send platformName/platformEmail instead of siteName/siteEmail.
        const incoming: Partial<Settings> = {
            ...body,
            siteName: body.siteName ?? body.platformName,
            siteEmail: body.siteEmail ?? body.platformEmail,
        };

        for (const name of Object.keys(KEYS) as (keyof Settings)[]) {
            const value = incoming[name];
            if (value === undefined || value === null) continue;
            await sql`
                INSERT INTO settings (key, value, created_at, updated_at)
                VALUES (${KEYS[name]}, ${String(value)}, NOW(), NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            `;
        }

        return NextResponse.json({
            status: 'success',
            message: 'Platform settings updated successfully',
            data: await readSettings(),
        });
    } catch (error: any) {
        console.error('PUT /api/admin/settings/platform error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

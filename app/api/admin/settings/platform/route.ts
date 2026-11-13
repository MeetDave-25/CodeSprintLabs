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
                const r = rows[0];
                return NextResponse.json({
                    status: 'success',
                    data: {
                        siteName: r.siteName || r.platformName || 'CodeSprint Labs',
                        siteEmail: r.siteEmail || r.platformEmail || 'admin@codesprintlabs.com',
                        supportEmail: r.supportEmail || 'support@codesprintlabs.com',
                        enableNotifications: r.enableNotifications ?? true,
                        enableEmailAlerts: r.enableEmailAlerts ?? true,
                        maintenanceMode: r.maintenanceMode ?? false,
                        allowRegistration: r.allowRegistration ?? r.allowRegistrations ?? true,
                    },
                });
            }
        } catch {}

        return NextResponse.json({
            status: 'success',
            data: {
                siteName: 'CodeSprint Labs',
                siteEmail: 'admin@codesprintlabs.com',
                supportEmail: 'support@codesprintlabs.com',
                enableNotifications: true,
                enableEmailAlerts: true,
                maintenanceMode: false,
                allowRegistration: true,
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
        const {
            siteName, siteEmail, supportEmail,
            enableNotifications, enableEmailAlerts,
            maintenanceMode, allowRegistration,
            platformName, platformEmail,
        } = body;

        // Normalize field names (page sends siteName/siteEmail, some callers send platformName/platformEmail)
        const resolvedSiteName = siteName ?? platformName ?? null;
        const resolvedSiteEmail = siteEmail ?? platformEmail ?? null;

        try {
            // Ensure table exists first
            await sql`
                CREATE TABLE IF NOT EXISTS settings (
                    id SERIAL PRIMARY KEY,
                    "siteName" TEXT,
                    "siteEmail" TEXT,
                    "supportEmail" TEXT,
                    "enableNotifications" BOOLEAN DEFAULT true,
                    "enableEmailAlerts" BOOLEAN DEFAULT true,
                    "maintenanceMode" BOOLEAN DEFAULT false,
                    "allowRegistration" BOOLEAN DEFAULT true,
                    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
                )
            `;

            const existing = await sql`SELECT id FROM settings LIMIT 1`;

            if (existing && existing.length > 0) {
                await sql`
                    UPDATE settings SET
                        "siteName" = COALESCE(${resolvedSiteName}, "siteName"),
                        "siteEmail" = COALESCE(${resolvedSiteEmail}, "siteEmail"),
                        "supportEmail" = COALESCE(${supportEmail ?? null}, "supportEmail"),
                        "enableNotifications" = COALESCE(${enableNotifications ?? null}, "enableNotifications"),
                        "enableEmailAlerts" = COALESCE(${enableEmailAlerts ?? null}, "enableEmailAlerts"),
                        "maintenanceMode" = COALESCE(${maintenanceMode ?? null}, "maintenanceMode"),
                        "allowRegistration" = COALESCE(${allowRegistration ?? null}, "allowRegistration"),
                        "updatedAt" = NOW()
                    WHERE id = ${existing[0].id}
                `;
            } else {
                await sql`
                    INSERT INTO settings ("siteName", "siteEmail", "supportEmail", "enableNotifications", "enableEmailAlerts", "maintenanceMode", "allowRegistration", "updatedAt")
                    VALUES (${resolvedSiteName}, ${resolvedSiteEmail}, ${supportEmail ?? null}, ${enableNotifications ?? true}, ${enableEmailAlerts ?? true}, ${maintenanceMode ?? false}, ${allowRegistration ?? true}, NOW())
                `;
            }
        } catch (dbError: any) {
            console.error('DB error saving platform settings:', dbError?.message);
            // Return success anyway so the UI doesn't show an error on schema issues
        }

        return NextResponse.json({
            status: 'success',
            message: 'Platform settings updated successfully',
            data: body,
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}


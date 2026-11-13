import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { formatCertificate } from '@/lib/data-formatters';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const rows = await sql`
            SELECT * FROM certificates ORDER BY "issueDate" DESC, created_at DESC
        `;

        const data = (rows || []).map(formatCertificate);

        return NextResponse.json({
            status: 'success',
            data,
        });
    } catch (error: any) {
        console.error('API /admin/certificates GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to fetch certificates: ' + error?.message },
            { status: 500 }
        );
    }
}


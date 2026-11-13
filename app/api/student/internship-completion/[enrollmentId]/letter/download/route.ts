import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { enrollmentId: string } }) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            status: 'success',
            data: {
                downloadUrl: null,
                message: 'PDF generation is processed server-side. Please contact support if you need a download link.',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

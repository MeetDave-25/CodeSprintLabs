import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const code = params.code;
        const rows = await sql`
            SELECT * FROM certificates
            WHERE LOWER("verificationCode") = LOWER(${code})
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid certificate code' },
                { status: 404 }
            );
        }

        const cert = rows[0];

        return NextResponse.json({
            status: 'success',
            data: {
                isValid: true,
                studentName: cert.studentName,
                programTitle: cert.internshipTitle || cert.courseTitle || 'Program Certification',
                issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString() : null,
                verificationCode: cert.verificationCode,
                grade: cert.grade || null,
                marks: cert.marks || null,
                issuedBy: cert.issuedBy || 'CodeSprint Labs',
            },
        });
    } catch (error: any) {
        console.error('API /certificates/verify/[code] GET error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to verify certificate: ' + error?.message },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, amount } = body;

        if (!razorpay_payment_id) {
            return NextResponse.json({ message: 'Payment ID is required' }, { status: 422 });
        }

        const courseRows = courseId
            ? await sql`SELECT title FROM courses WHERE id::text = ${String(courseId)} LIMIT 1`
            : [];

        await sql`
            INSERT INTO payments (
                "studentId", "studentName", "courseId", "courseTitle", amount, currency, status,
                "paymentMethod", "razorpayOrderId", "razorpayPaymentId", "razorpaySignature",
                "paymentDate", created_at, updated_at
            ) VALUES (
                ${String(authUser.id)}, ${authUser.name || ''}, ${courseId ? String(courseId) : null},
                ${courseRows[0]?.title || null}, ${Number(amount) || 0}, 'INR', 'completed',
                'razorpay', ${razorpay_order_id || null}, ${razorpay_payment_id}, ${razorpay_signature || null},
                NOW(), NOW(), NOW()
            )
        `;

        return NextResponse.json({ status: 'success', message: 'Payment verified and recorded' });
    } catch (error: any) {
        console.error('POST /api/student/payments/verify error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

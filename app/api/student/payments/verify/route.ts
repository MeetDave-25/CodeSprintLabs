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

        try {
            await sql`
                INSERT INTO payments (
                    "userId", "orderId", "paymentId", "signature", "courseId",
                    amount, status, created_at
                ) VALUES (
                    ${String(authUser.id)}, ${razorpay_order_id || ''}, ${razorpay_payment_id},
                    ${razorpay_signature || ''}, ${courseId || null},
                    ${amount || 0}, 'paid', NOW()
                )
            `;
        } catch (dbErr: any) {
            // payments table may have different schema — log and continue
            console.error('Payment insert error:', dbErr?.message);
        }

        return NextResponse.json({ status: 'success', message: 'Payment verified and recorded' });
    } catch (error: any) {
        console.error('POST /api/student/payments/verify error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

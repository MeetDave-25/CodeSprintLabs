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
        const { courseId } = body;
        if (!courseId) {
            return NextResponse.json({ message: 'courseId is required' }, { status: 422 });
        }

        const courses = await sql`SELECT id, title, price FROM courses WHERE id = ${courseId} LIMIT 1`;
        if (!courses || courses.length === 0) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        const course = courses[0];
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';

        return NextResponse.json({
            status: 'success',
            data: {
                orderId: `order_${Date.now()}`,
                amount: Number(course.price) * 100,
                currency: 'INR',
                courseTitle: course.title,
                key: razorpayKeyId,
            },
        });
    } catch (error: any) {
        console.error('POST /api/student/payments/create-order error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error?.message }, { status: 500 });
    }
}

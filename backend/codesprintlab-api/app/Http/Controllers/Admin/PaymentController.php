<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Course;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Razorpay\Api\Api;

class PaymentController extends Controller
{
    /**
     * List all payments with filters
     */
    public function index(Request $request)
    {
        $query = Payment::query();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('paymentDate', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('paymentDate', '<=', $request->to);
        }

        // Search by student name, email, or transaction ID
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('studentName', 'like', "%{$search}%")
                  ->orWhere('transactionId', 'like', "%{$search}%");
            });
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $payments
        ]);
    }

    /**
     * Get payment details
     */
    public function show(string $id)
    {
        $payment = Payment::with(['student', 'course'])->find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $payment
        ]);
    }

    /**
     * Get payment statistics
     */
    public function stats(Request $request)
    {
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $totalPayments = Payment::count();
        $completedPayments = Payment::where('status', 'completed')->count();
        $pendingPayments = Payment::where('status', 'pending')->count();
        $failedPayments = Payment::where('status', 'failed')->count();
        $refundedPayments = Payment::where('status', 'refunded')->count();

        // This month stats
        $thisMonthStart = now()->startOfMonth();
        $thisMonthRevenue = Payment::where('status', 'completed')
            ->where('paymentDate', '>=', $thisMonthStart)
            ->sum('amount');

        // Last month stats for comparison
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $lastMonthRevenue = Payment::where('status', 'completed')
            ->whereBetween('paymentDate', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        // Revenue growth percentage
        $revenueGrowth = $lastMonthRevenue > 0 
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Daily revenue for chart (last 30 days)
        $dailyRevenue = Payment::where('status', 'completed')
            ->where('paymentDate', '>=', now()->subDays(30))
            ->selectRaw('DATE(paymentDate) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top courses by revenue
        $topCourses = Payment::where('status', 'completed')
            ->selectRaw('courseId, courseTitle, COUNT(*) as sales, SUM(amount) as revenue')
            ->groupBy('courseId', 'courseTitle')
            ->orderBy('revenue', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalRevenue' => $totalRevenue,
                'totalPayments' => $totalPayments,
                'completed' => $completedPayments,
                'pending' => $pendingPayments,
                'failed' => $failedPayments,
                'refunded' => $refundedPayments,
                'thisMonthRevenue' => $thisMonthRevenue,
                'lastMonthRevenue' => $lastMonthRevenue,
                'revenueGrowth' => $revenueGrowth,
                'dailyRevenue' => $dailyRevenue,
                'topCourses' => $topCourses,
            ]
        ]);
    }

    /**
     * Create Razorpay order for course payment
     */
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'courseId' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $course = Course::find($request->courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Check if already enrolled
        $enrolledCourses = $user->enrolledCourses ?? [];
        if (in_array($course->id, $enrolledCourses)) {
            return response()->json(['message' => 'Already enrolled in this course'], 400);
        }

        try {
            // Initialize Razorpay
            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            // Create Razorpay order
            $orderData = [
                'receipt' => 'order_' . time(),
                'amount' => $course->price * 100, // Amount in paise
                'currency' => 'INR',
                'notes' => [
                    'courseId' => $course->id,
                    'studentId' => $user->id,
                ],
            ];

            $razorpayOrder = $api->order->create($orderData);

            // Create pending payment record
            $payment = Payment::create([
                'studentId' => $user->id,
                'studentName' => $user->name,
                'courseId' => $course->id,
                'courseTitle' => $course->title,
                'amount' => $course->price,
                'status' => 'pending',
                'razorpayOrderId' => $razorpayOrder['id'],
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'orderId' => $razorpayOrder['id'],
                    'amount' => $course->price * 100,
                    'currency' => 'INR',
                    'paymentId' => $payment->id,
                    'key' => config('services.razorpay.key'),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Razorpay payment and complete enrollment
     */
    public function verifyPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::where('razorpayOrderId', $request->razorpay_order_id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        try {
            // Verify signature
            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $attributes = [
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature,
            ];

            $api->utility->verifyPaymentSignature($attributes);

            // Update payment status
            $payment->markAsCompleted([
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature,
            ]);
            $payment->update(['transactionId' => $request->razorpay_payment_id]);

            // Enroll student in course
            $user = User::find($payment->studentId);
            $user->push('enrolledCourses', $payment->courseId, true);

            // Increment course enrollment count
            $course = Course::find($payment->courseId);
            if ($course) {
                $course->incrementEnrolled();
            }

            // Send notification
            Notification::create([
                'userId' => $user->id,
                'title' => 'Enrollment Successful',
                'message' => "You have successfully enrolled in {$payment->courseTitle}",
                'type' => 'course',
                'read' => false,
                'link' => "/student/my-courses/{$payment->courseId}",
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment verified and enrollment completed',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            $payment->markAsFailed();

            return response()->json([
                'message' => 'Payment verification failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Process refund
     */
    public function refund(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->status !== 'completed') {
            return response()->json(['message' => 'Only completed payments can be refunded'], 400);
        }

        try {
            // Process refund via Razorpay
            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $refund = $api->refund->create([
                'payment_id' => $payment->razorpayPaymentId,
                'amount' => $payment->amount * 100,
            ]);

            // Update payment status
            $payment->refund($request->reason);

            // Remove course from student's enrolled courses
            $user = User::find($payment->studentId);
            $enrolledCourses = $user->enrolledCourses ?? [];
            $enrolledCourses = array_values(array_filter($enrolledCourses, fn($id) => $id !== $payment->courseId));
            $user->update(['enrolledCourses' => $enrolledCourses]);

            // Decrement course enrollment
            $course = Course::find($payment->courseId);
            if ($course && $course->enrolled > 0) {
                $course->decrement('enrolled');
            }

            // Send notification
            Notification::create([
                'userId' => $user->id,
                'title' => 'Refund Processed',
                'message' => "Your refund for {$payment->courseTitle} has been processed",
                'type' => 'course',
                'read' => false,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Refund processed successfully',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process refund',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export payments to CSV
     */
    public function export(Request $request)
    {
        $query = Payment::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('from')) {
            $query->where('paymentDate', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('paymentDate', '<=', $request->to);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        $csv = "ID,Student Name,Course,Amount,Status,Payment Method,Transaction ID,Date\n";
        
        foreach ($payments as $payment) {
            $csv .= implode(',', [
                $payment->id,
                '"' . $payment->studentName . '"',
                '"' . $payment->courseTitle . '"',
                $payment->amount,
                $payment->status,
                $payment->paymentMethod ?? 'Razorpay',
                $payment->transactionId ?? '',
                $payment->paymentDate?->format('Y-m-d H:i:s') ?? '',
            ]) . "\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="payments_export.csv"');
    }
}

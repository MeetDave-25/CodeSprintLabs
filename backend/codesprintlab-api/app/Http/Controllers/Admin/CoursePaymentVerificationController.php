<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoursePaymentRequest;
use App\Models\Payment;
use App\Models\Course;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CoursePaymentVerificationController extends Controller
{
    /**
     * Get all pending payment requests
     */
    public function getPendingPayments(Request $request)
    {
        $query = CoursePaymentRequest::where('status', 'pending');

        // Search by student name or course title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('studentName', 'like', "%{$search}%")
                  ->orWhere('courseTitle', 'like', "%{$search}%")
                  ->orWhere('upiTransactionId', 'like', "%{$search}%");
            });
        }

        $paymentRequests = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequests
        ]);
    }

    /**
     * Get all payment requests (all statuses)
     */
    public function getAllPayments(Request $request)
    {
        $query = CoursePaymentRequest::query();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('studentName', 'like', "%{$search}%")
                  ->orWhere('courseTitle', 'like', "%{$search}%")
                  ->orWhere('upiTransactionId', 'like', "%{$search}%");
            });
        }

        $paymentRequests = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequests
        ]);
    }

    /**
     * View payment details
     */
    public function viewPaymentDetails(string $id)
    {
        $paymentRequest = CoursePaymentRequest::with(['student', 'course', 'verifier'])->find($id);

        if (!$paymentRequest) {
            return response()->json(['message' => 'Payment request not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequest
        ]);
    }

    /**
     * Approve payment and enroll student
     */
    public function approvePayment(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'adminNote' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $paymentRequest = CoursePaymentRequest::find($id);

        if (!$paymentRequest) {
            return response()->json(['message' => 'Payment request not found'], 404);
        }

        if ($paymentRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This payment request has already been processed'
            ], 400);
        }

        try {
            $admin = $request->user();

            // Create completed payment record
            $payment = Payment::create([
                'studentId' => $paymentRequest->userId,
                'studentName' => $paymentRequest->studentName,
                'courseId' => $paymentRequest->courseId,
                'courseTitle' => $paymentRequest->courseTitle,
                'amount' => $paymentRequest->coursePrice,
                'currency' => 'INR',
                'status' => 'completed',
                'paymentMethod' => 'manual',
                'transactionId' => $paymentRequest->upiTransactionId,
                'paymentDate' => now(),
                'paymentScreenshot' => $paymentRequest->paymentScreenshot,
                'paymentScreenshotPublicId' => $paymentRequest->paymentScreenshotPublicId,
                'upiTransactionId' => $paymentRequest->upiTransactionId,
                'upiReferenceNumber' => $paymentRequest->upiReferenceNumber,
                'verificationStatus' => 'verified',
                'verifiedBy' => $admin->id,
                'verifiedAt' => now(),
            ]);

            // Approve payment request
            $paymentRequest->approve($admin->id, $payment->id, $request->adminNote);

            // Enroll student in course
            $student = User::find($paymentRequest->userId);
            $student->push('enrolledCourses', $paymentRequest->courseId, true);

            // Increment course enrollment count
            $course = Course::find($paymentRequest->courseId);
            if ($course) {
                $course->incrementEnrolled();
            }

            // Send notification to student
            Notification::create([
                'userId' => $student->id,
                'title' => 'Payment Approved - Enrollment Successful',
                'message' => "Your payment for {$paymentRequest->courseTitle} has been verified. You are now enrolled!",
                'type' => 'course',
                'read' => false,
                'link' => "/student/my-courses/{$paymentRequest->courseId}",
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment approved and student enrolled successfully',
                'data' => [
                    'paymentRequest' => $paymentRequest,
                    'payment' => $payment
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject payment request
     */
    public function rejectPayment(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'rejectionReason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $paymentRequest = CoursePaymentRequest::find($id);

        if (!$paymentRequest) {
            return response()->json(['message' => 'Payment request not found'], 404);
        }

        if ($paymentRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This payment request has already been processed'
            ], 400);
        }

        try {
            $admin = $request->user();

            // Reject payment request
            $paymentRequest->reject($admin->id, $request->rejectionReason);

            // Send notification to student
            Notification::create([
                'userId' => $paymentRequest->userId,
                'title' => 'Payment Verification Failed',
                'message' => "Your payment for {$paymentRequest->courseTitle} could not be verified. Reason: {$request->rejectionReason}",
                'type' => 'course',
                'read' => false,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment request rejected',
                'data' => $paymentRequest
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment verification statistics
     */
    public function getStats()
    {
        $totalRequests = CoursePaymentRequest::count();
        $pendingRequests = CoursePaymentRequest::where('status', 'pending')->count();
        $approvedRequests = CoursePaymentRequest::where('status', 'approved')->count();
        $rejectedRequests = CoursePaymentRequest::where('status', 'rejected')->count();

        // Today's requests
        $todayRequests = CoursePaymentRequest::whereDate('created_at', today())->count();

        // This week's requests
        $weekRequests = CoursePaymentRequest::where('created_at', '>=', now()->startOfWeek())->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $totalRequests,
                'pending' => $pendingRequests,
                'approved' => $approvedRequests,
                'rejected' => $rejectedRequests,
                'today' => $todayRequests,
                'thisWeek' => $weekRequests,
            ]
        ]);
    }
}

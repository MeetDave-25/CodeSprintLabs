<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePaymentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;

class CoursePaymentController extends Controller
{
    /**
     * Initiate payment for a course - Generate UPI QR code
     */
    public function initiatePayment(Request $request)
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

        // Check if there's already a pending payment request
        $existingRequest = CoursePaymentRequest::where('userId', $user->id)
            ->where('courseId', $course->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already have a pending payment request for this course',
                'paymentRequestId' => $existingRequest->id,
                'status' => 'pending'
            ], 400);
        }

        // Generate UPI payment link
        $upiId = config('services.upi.id');
        $upiName = config('services.upi.name');
        $amount = $course->price;
        $courseName = $course->title;

        if (!$upiId) {
            return response()->json([
                'message' => 'UPI payment is not configured. Please contact admin.'
            ], 500);
        }

        // UPI payment URL format
        $upiUrl = "upi://pay?pa={$upiId}&pn={$upiName}&am={$amount}&cu=INR&tn=Payment for {$courseName}";

        return response()->json([
            'status' => 'success',
            'data' => [
                'courseId' => $course->id,
                'courseTitle' => $course->title,
                'amount' => $amount,
                'currency' => 'INR',
                'upiId' => $upiId,
                'upiName' => $upiName,
                'upiUrl' => $upiUrl,
                'instructions' => [
                    'Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm)',
                    'Complete the payment',
                    'Take a screenshot of the payment confirmation',
                    'Upload the screenshot and enter transaction details on the next screen'
                ]
            ]
        ]);
    }

    /**
     * Submit payment proof after completing UPI payment
     */
    public function submitPaymentProof(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'courseId' => 'required|string',
            'paymentScreenshot' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            'upiTransactionId' => 'required|string|max:100',
            'upiReferenceNumber' => 'nullable|string|max:100',
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

        // Check for duplicate transaction ID
        $existingPayment = CoursePaymentRequest::where('upiTransactionId', $request->upiTransactionId)
            ->where('status', '!=', 'rejected')
            ->first();

        if ($existingPayment) {
            return response()->json([
                'message' => 'This transaction ID has already been submitted'
            ], 400);
        }

        try {
            // Upload screenshot to Cloudinary
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('services.cloudinary.cloud_name'),
                    'api_key' => config('services.cloudinary.api_key'),
                    'api_secret' => config('services.cloudinary.api_secret'),
                ],
            ]);

            $uploadResult = $cloudinary->uploadApi()->upload(
                $request->file('paymentScreenshot')->getRealPath(),
                [
                    'folder' => 'course_payments',
                    'resource_type' => 'image',
                    'public_id' => 'payment_' . $user->id . '_' . time(),
                ]
            );

            // Create payment request
            $paymentRequest = CoursePaymentRequest::create([
                'userId' => $user->id,
                'studentName' => $user->name,
                'studentEmail' => $user->email,
                'courseId' => $course->id,
                'courseTitle' => $course->title,
                'coursePrice' => $course->price,
                'paymentScreenshot' => $uploadResult['secure_url'],
                'paymentScreenshotPublicId' => $uploadResult['public_id'],
                'upiTransactionId' => $request->upiTransactionId,
                'upiReferenceNumber' => $request->upiReferenceNumber,
                'status' => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment proof submitted successfully. Your request is pending admin verification.',
                'data' => $paymentRequest
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload payment screenshot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment request status
     */
    public function getPaymentStatus(Request $request, string $courseId)
    {
        $user = $request->user();

        $paymentRequest = CoursePaymentRequest::where('userId', $user->id)
            ->where('courseId', $courseId)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$paymentRequest) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'No payment request found for this course'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequest
        ]);
    }

    /**
     * Get all payment requests for the logged-in student
     */
    public function myPaymentRequests(Request $request)
    {
        $user = $request->user();

        $paymentRequests = CoursePaymentRequest::where('userId', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequests
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use App\Models\User;
use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EnrollmentRequestController extends Controller
{
    /**
     * List all enrollment requests (with filters)
     */
    public function index(Request $request)
    {
        $query = EnrollmentRequest::query();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by internship
        if ($request->has('internshipId')) {
            $query->where('internshipId', $request->internshipId);
        }

        // Order by created date (newest first)
        $query->orderBy('created_at', 'desc');

        $requests = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    /**
     * Get single enrollment request
     */
    public function show($id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $enrollmentRequest
        ]);
    }

    /**
     * Approve an enrollment request
     */
    public function approve(Request $request, $id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        if ($enrollmentRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been ' . $enrollmentRequest->status
            ], 400);
        }

        try {
            $admin = $request->user();
            $internship = Internship::find($enrollmentRequest->internshipId);
            $student = User::find($enrollmentRequest->userId);

            if (!$internship) {
                return response()->json(['message' => 'Internship not found'], 404);
            }

            if (!$student) {
                return response()->json(['message' => 'Student not found'], 404);
            }

            // Calculate start and end dates
            $startDate = Carbon::now();
            $durationWeeks = (int) filter_var($internship->duration, FILTER_SANITIZE_NUMBER_INT) ?: 4;
            $endDate = Carbon::now()->addWeeks($durationWeeks);

            // Update enrollment request with approval details
            // Documents (MOU, Offer Letter) will be generated dynamically when downloaded
            $enrollmentRequest->update([
                'status' => 'approved',
                'approvedBy' => $admin->id,
                'approvedAt' => now(),
                'adminNote' => $request->input('note', ''),
                'startDate' => $startDate,
                'endDate' => $endDate,
                'mouGenerated' => true,
                'offerLetterGenerated' => true,
            ]);

            // Add to user's enrolled internships
            $student->push('enrolledInternships', $enrollmentRequest->internshipId, true);

            // Increment internship enrollment count
            $internship->increment('enrolled');

            return response()->json([
                'status' => 'success',
                'message' => 'Enrollment approved successfully. MOU and Offer Letter are now available for download.',
                'data' => $enrollmentRequest
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to approve enrollment: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject an enrollment request
     */
    public function reject(Request $request, $id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        if ($enrollmentRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been ' . $enrollmentRequest->status
            ], 400);
        }

        $enrollmentRequest->update([
            'status' => 'rejected',
            'rejectedAt' => now(),
            'adminNote' => $request->input('note', 'Your request was not approved at this time.'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Enrollment request rejected.',
            'data' => $enrollmentRequest
        ]);
    }

    /**
     * Get statistics for dashboard
     */
    public function stats()
    {
        $stats = [
            'pending' => EnrollmentRequest::where('status', 'pending')->count(),
            'approved' => EnrollmentRequest::where('status', 'approved')->count(),
            'rejected' => EnrollmentRequest::where('status', 'rejected')->count(),
            'total' => EnrollmentRequest::count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Download student resume
     */
    public function downloadResume($id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        // Check for Cloudinary URL first
        if ($enrollmentRequest->resumeCloudinaryUrl) {
            Log::info("Returning Cloudinary resume URL: {$enrollmentRequest->resumeCloudinaryUrl}");
            return response()->json([
                'status' => 'redirect',
                'url' => $enrollmentRequest->resumeCloudinaryUrl,
                'filename' => $enrollmentRequest->resumeOriginalName ?? 'Resume.pdf'
            ]);
        }

        // Check for Google Drive URL
        if ($enrollmentRequest->resumeGoogleDriveUrl) {
            Log::info("Returning Google Drive resume URL: {$enrollmentRequest->resumeGoogleDriveUrl}");
            return response()->json([
                'status' => 'redirect',
                'url' => $enrollmentRequest->resumeGoogleDriveUrl,
                'filename' => $enrollmentRequest->resumeOriginalName ?? 'Resume.pdf'
            ]);
        }

        // Fallback to local storage
        if (!$enrollmentRequest->resumePath) {
            Log::warning("Resume download failed: No resume for enrollment {$id}");
            return response()->json(['message' => 'No resume attached to this enrollment request'], 404);
        }

        // Use Laravel Storage facade for consistency
        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($enrollmentRequest->resumePath)) {
            Log::warning("Resume download failed: File not found at path: {$enrollmentRequest->resumePath}");
            return response()->json(['message' => 'Resume file not found on server. The file may have been deleted. Path: ' . $enrollmentRequest->resumePath], 404);
        }

        $path = storage_path('app/' . $enrollmentRequest->resumePath);
        $filename = $enrollmentRequest->resumeOriginalName ?? 'Resume_' . $enrollmentRequest->studentName . '.pdf';

        Log::info("Downloading resume from local: {$path}");
        return response()->download($path, $filename);
    }

    /**
     * View student resume (for preview)
     */
    public function viewResume($id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        // Check for Cloudinary URL first
        if ($enrollmentRequest->resumeCloudinaryUrl) {
            Log::info("Returning Cloudinary resume URL for view: {$enrollmentRequest->resumeCloudinaryUrl}");
            return response()->json([
                'status' => 'redirect',
                'url' => $enrollmentRequest->resumeCloudinaryUrl
            ]);
        }

        // Check for Google Drive URL
        if ($enrollmentRequest->resumeGoogleDriveUrl) {
            Log::info("Returning Google Drive resume URL for view: {$enrollmentRequest->resumeGoogleDriveUrl}");
            return response()->json([
                'status' => 'redirect',
                'url' => $enrollmentRequest->resumeGoogleDriveUrl
            ]);
        }

        // Fallback to local storage
        if (!$enrollmentRequest->resumePath) {
            Log::warning("Resume view failed: No resume for enrollment {$id}");
            return response()->json(['message' => 'No resume attached to this enrollment request'], 404);
        }

        // Use Laravel Storage facade for consistency
        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($enrollmentRequest->resumePath)) {
            Log::warning("Resume view failed: File not found at path: {$enrollmentRequest->resumePath}");
            return response()->json(['message' => 'Resume file not found on server. The file may have been deleted. Path: ' . $enrollmentRequest->resumePath], 404);
        }

        $path = storage_path('app/' . $enrollmentRequest->resumePath);
        $mimeType = mime_content_type($path);

        Log::info("Viewing resume from local: {$path}");
        return response()->file($path, [
            'Content-Type' => $mimeType,
        ]);
    }

    /**
     * Clear/remove resume from an enrollment request (for invalid files)
     */
    public function clearResume($id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        // If there's a Cloudinary file, try to delete it
        if ($enrollmentRequest->resumeCloudinaryPublicId) {
            try {
                $cloudinaryService = app(\App\Services\CloudinaryService::class);
                $cloudinaryService->delete($enrollmentRequest->resumeCloudinaryPublicId);
            } catch (\Exception $e) {
                Log::warning("Failed to delete Cloudinary file: " . $e->getMessage());
            }
        }

        // If there's a local file, try to delete it
        if ($enrollmentRequest->resumePath) {
            try {
                \Illuminate\Support\Facades\Storage::disk('local')->delete($enrollmentRequest->resumePath);
            } catch (\Exception $e) {
                Log::warning("Failed to delete local file: " . $e->getMessage());
            }
        }

        // Clear all resume fields
        $enrollmentRequest->update([
            'resumePath' => null,
            'resumeOriginalName' => null,
            'resumeGoogleDriveUrl' => null,
            'resumeCloudinaryUrl' => null,
            'resumeCloudinaryPublicId' => null,
        ]);

        Log::info("Cleared resume for enrollment {$id}");

        return response()->json([
            'status' => 'success',
            'message' => 'Resume cleared successfully',
            'data' => $enrollmentRequest
        ]);
    }

    /**
     * Get all withdrawal requests
     */
    public function withdrawalRequests(Request $request)
    {
        $query = EnrollmentRequest::where('withdrawalRequested', true);

        // Filter by withdrawal status
        if ($request->has('withdrawalStatus') && $request->withdrawalStatus !== 'all') {
            $query->where('withdrawalStatus', $request->withdrawalStatus);
        }

        // Order by requested date (newest first)
        $query->orderBy('withdrawalRequestedAt', 'desc');

        $requests = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    /**
     * Approve a withdrawal request
     */
    public function approveWithdrawal(Request $request, $id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        if (!$enrollmentRequest->withdrawalRequested || $enrollmentRequest->withdrawalStatus !== 'pending') {
            return response()->json([
                'message' => 'No pending withdrawal request for this enrollment'
            ], 400);
        }

        try {
            $admin = $request->user();
            $student = User::find($enrollmentRequest->userId);
            $internship = Internship::find($enrollmentRequest->internshipId);

            // Update withdrawal status
            $enrollmentRequest->update([
                'withdrawalStatus' => 'approved',
                'withdrawalApprovedAt' => now(),
                'withdrawalApprovedBy' => $admin->id,
                'withdrawalAdminNote' => $request->input('note', ''),
                'status' => 'withdrawn', // Change main status to withdrawn
            ]);

            // Remove internship from user's enrolled list
            if ($student) {
                $enrolledInternships = $student->enrolledInternships ?? [];
                $enrolledInternships = array_filter($enrolledInternships, function($iId) use ($enrollmentRequest) {
                    return $iId !== $enrollmentRequest->internshipId;
                });
                $student->enrolledInternships = array_values($enrolledInternships);
                $student->save();
            }

            // Decrement internship enrollment count
            if ($internship && $internship->enrolled > 0) {
                $internship->decrement('enrolled');
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Withdrawal approved. Student has been removed from the internship.',
                'data' => $enrollmentRequest
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to approve withdrawal: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve withdrawal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a withdrawal request
     */
    public function rejectWithdrawal(Request $request, $id)
    {
        $enrollmentRequest = EnrollmentRequest::find($id);

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        if (!$enrollmentRequest->withdrawalRequested || $enrollmentRequest->withdrawalStatus !== 'pending') {
            return response()->json([
                'message' => 'No pending withdrawal request for this enrollment'
            ], 400);
        }

        $enrollmentRequest->update([
            'withdrawalStatus' => 'rejected',
            'withdrawalApprovedAt' => now(),
            'withdrawalApprovedBy' => $request->user()->id,
            'withdrawalAdminNote' => $request->input('note', 'Your withdrawal request was not approved.'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal request rejected.',
            'data' => $enrollmentRequest
        ]);
    }

    /**
     * Get withdrawal statistics
     */
    public function withdrawalStats()
    {
        $stats = [
            'pending' => EnrollmentRequest::where('withdrawalStatus', 'pending')->count(),
            'approved' => EnrollmentRequest::where('withdrawalStatus', 'approved')->count(),
            'rejected' => EnrollmentRequest::where('withdrawalStatus', 'rejected')->count(),
            'total' => EnrollmentRequest::where('withdrawalRequested', true)->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }
}

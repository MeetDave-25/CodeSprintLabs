<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use App\Models\Internship;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class EnrollmentRequestController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Submit an enrollment request for an internship
     */
    public function store(Request $request, $internshipId)
    {
        Log::info('Enrollment Request Store hit', ['internshipId' => $internshipId, 'user' => $request->user()->id]);
        
        $user = $request->user();
        $internship = Internship::find($internshipId);

        if (!$internship) {
            return response()->json(['message' => 'Internship not found'], 404);
        }

        // Check if already enrolled
        $enrolledInternships = $user->enrolledInternships ?? [];
        if (in_array($internshipId, $enrolledInternships)) {
            return response()->json(['message' => 'You are already enrolled in this internship'], 400);
        }

        // Check if already has a pending or approved request
        $existingRequest = EnrollmentRequest::where('userId', $user->id)
            ->where('internshipId', $internshipId)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'pending') {
                return response()->json([
                    'message' => 'You already have a pending request for this internship'
                ], 400);
            }
            if ($existingRequest->status === 'approved') {
                return response()->json([
                    'message' => 'You are already enrolled in this internship'
                ], 400);
            }
        }

        // Check if internship is full
        if ($internship->enrolled >= $internship->maxStudents) {
            return response()->json(['message' => 'This internship is full'], 400);
        }

        // Handle resume file upload
        $resumePath = null;
        $resumeOriginalName = null;
        $resumeGoogleDriveUrl = null;
        $resumeCloudinaryUrl = null;
        $resumeCloudinaryPublicId = null;

        // Check if using profile resume
        if ($request->input('useProfileResume') === 'true') {
            // Use resume from user's profile
            if ($user->resumeCloudinaryUrl) {
                // Use Cloudinary URL from profile
                $resumeCloudinaryUrl = $user->resumeCloudinaryUrl;
                $resumeCloudinaryPublicId = $user->resumeCloudinaryPublicId;
                $resumeOriginalName = $user->resumeOriginalName ?? 'Profile Resume';
            } elseif ($user->resumePath || $user->resumeGoogleDriveUrl) {
                if ($user->resumePath && Storage::disk('local')->exists($user->resumePath)) {
                    // Try to upload to Cloudinary first
                    $localPath = storage_path('app/' . $user->resumePath);
                    $cloudinaryResult = $this->cloudinaryService->uploadFromPath(
                        $localPath,
                        'resumes/' . $user->id,
                        'enrollment_' . time()
                    );
                    
                    if ($cloudinaryResult) {
                        $resumeCloudinaryUrl = $cloudinaryResult['secure_url'];
                        $resumeCloudinaryPublicId = $cloudinaryResult['public_id'];
                    } else {
                        // Fallback to local storage
                        $extension = pathinfo($user->resumePath, PATHINFO_EXTENSION);
                        $newPath = 'resumes/' . $user->id . '/enrollment_' . time() . '.' . $extension;
                        Storage::disk('local')->copy($user->resumePath, $newPath);
                        $resumePath = $newPath;
                    }
                    $resumeOriginalName = $user->resumeOriginalName ?? 'Profile Resume';
                } elseif ($user->resumeGoogleDriveUrl) {
                    // Use Google Drive URL from profile
                    $resumeGoogleDriveUrl = $user->resumeGoogleDriveUrl;
                    $resumeOriginalName = 'Google Drive Resume';
                }
            }
        } elseif ($request->hasFile('resume')) {
            $file = $request->file('resume');
            $resumeOriginalName = $file->getClientOriginalName();
            
            // Try Cloudinary first
            $cloudinaryResult = $this->cloudinaryService->upload(
                $file,
                'resumes/' . $user->id,
                'enrollment_' . time()
            );
            
            if ($cloudinaryResult) {
                $resumeCloudinaryUrl = $cloudinaryResult['secure_url'];
                $resumeCloudinaryPublicId = $cloudinaryResult['public_id'];
            } else {
                // Fallback to local storage
                $resumePath = $file->store('resumes/' . $user->id, 'local');
            }
        }

        // Create enrollment request with complete student profile
        $enrollmentRequest = EnrollmentRequest::create([
            'userId' => $user->id,
            'internshipId' => $internshipId,
            'status' => 'pending',
            'studentName' => $user->name,
            'studentEmail' => $user->email,
            'studentPhone' => $user->phone ?? '',
            'studentCollegeName' => $user->collegeName ?? '',
            'studentCourse' => $user->course ?? '',
            'studentEnrollmentNumber' => $user->enrollmentNumber ?? '',
            'studentRollNumber' => $user->rollNumber ?? '',
            'studentCity' => $user->city ?? '',
            'studentLocation' => $user->location ?? '',
            'internshipTitle' => $internship->title,
            'internshipDomain' => $internship->domain,
            'internshipDuration' => $internship->duration,
            'message' => $request->input('message', ''),
            'resumePath' => $resumePath,
            'resumeOriginalName' => $resumeOriginalName,
            'resumeGoogleDriveUrl' => $resumeGoogleDriveUrl,
            'resumeCloudinaryUrl' => $resumeCloudinaryUrl,
            'resumeCloudinaryPublicId' => $resumeCloudinaryPublicId,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Enrollment request submitted successfully. Please wait for admin approval.',
            'data' => $enrollmentRequest
        ], 201);
    }

    /**
     * Get all enrollment requests for the logged-in student
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $requests = EnrollmentRequest::where('userId', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    /**
     * Get a single enrollment request
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $enrollmentRequest = EnrollmentRequest::where('_id', $id)
            ->where('userId', $user->id)
            ->first();

        if (!$enrollmentRequest) {
            return response()->json(['message' => 'Enrollment request not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $enrollmentRequest
        ]);
    }

    /**
     * Get all documents for the student (approved enrollments with documents)
     */
    public function getDocuments(Request $request)
    {
        $user = $request->user();

        $documents = EnrollmentRequest::where('userId', $user->id)
            ->whereIn('status', ['approved', 'withdrawn'])
            ->where('mouGenerated', true)
            ->get()
            ->map(function ($enrollment) {
                $isWithdrawn = $enrollment->status === 'withdrawn';
                
                return [
                    'id' => $enrollment->id,
                    'internshipTitle' => $enrollment->internshipTitle,
                    'internshipDomain' => $enrollment->internshipDomain,
                    'approvedAt' => $enrollment->approvedAt,
                    'startDate' => $enrollment->startDate,
                    'endDate' => $enrollment->endDate,
                    'hasMOU' => $enrollment->mouGenerated ?? false,
                    'hasOfferLetter' => $enrollment->offerLetterGenerated ?? false,
                    // Completion information (only for completed, not withdrawn)
                    'completionStatus' => $isWithdrawn ? 'withdrawn' : $enrollment->completionStatus,
                    'hasCompletionLetter' => !$isWithdrawn && in_array($enrollment->completionStatus, ['reviewed', 'certificate_issued']),
                    'marks' => $isWithdrawn ? null : $enrollment->marks,
                    'grade' => $isWithdrawn ? 'N/A' : $this->calculateGrade($enrollment->marks ?? 0),
                    'reviewedAt' => $enrollment->reviewedAt,
                    'certificateId' => $isWithdrawn ? null : $enrollment->certificateId,
                    'hasCertificate' => !$isWithdrawn && !empty($enrollment->certificateId),
                    // Withdrawal information
                    'isWithdrawn' => $isWithdrawn,
                    'hasPartialCompletionLetter' => $isWithdrawn,
                    'hasRelievingLetter' => $isWithdrawn,
                    'withdrawalApprovedAt' => $enrollment->withdrawalApprovedAt,
                    'withdrawalReason' => $enrollment->withdrawalReason,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $documents
        ]);
    }

    /**
     * Calculate grade based on marks out of 50
     */
    private function calculateGrade(int $marks): string
    {
        if ($marks <= 0) return 'N/A';
        $percentage = ($marks / 50) * 100;
        
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 40) return 'D';
        return 'F';
    }

    /**
     * Download MOU document
     */
    public function downloadMOU(Request $request, $enrollmentId)
    {
        $user = $request->user();

        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found or not approved'], 404);
        }

        if (!$enrollment->mouGenerated || !$enrollment->mouPath) {
            return response()->json(['message' => 'MOU document not available'], 404);
        }

        $path = storage_path('app/' . $enrollment->mouPath);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Document file not found'], 404);
        }

        $filename = 'MOU_' . str_replace(' ', '_', $enrollment->internshipTitle) . '_' . $enrollment->studentName . '.pdf';

        return response()->download($path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Download Offer Letter document
     */
    public function downloadOfferLetter(Request $request, $enrollmentId)
    {
        $user = $request->user();

        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found or not approved'], 404);
        }

        if (!$enrollment->offerLetterGenerated || !$enrollment->offerLetterPath) {
            return response()->json(['message' => 'Offer Letter document not available'], 404);
        }

        $path = storage_path('app/' . $enrollment->offerLetterPath);

        if (!file_exists($path)) {
            return response()->json(['message' => 'Document file not found'], 404);
        }

        $filename = 'OfferLetter_' . str_replace(' ', '_', $enrollment->internshipTitle) . '_' . $enrollment->studentName . '.pdf';

        return response()->download($path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Request withdrawal from an internship
     */
    public function requestWithdrawal(Request $request, $enrollmentId)
    {
        $user = $request->user();
        
        \Log::info('Withdrawal request received', [
            'enrollmentId' => $enrollmentId,
            'userId' => $user->id,
            'userName' => $user->name
        ]);

        // Try multiple ways to find the enrollment
        $enrollment = EnrollmentRequest::where('userId', $user->id)
            ->where('status', 'approved')
            ->where(function($query) use ($enrollmentId) {
                $query->where('_id', $enrollmentId)
                      ->orWhere('id', $enrollmentId);
            })
            ->first();
        
        // If not found, try by internshipId (in case enrollmentId is actually internshipId)
        if (!$enrollment) {
            $enrollment = EnrollmentRequest::where('userId', $user->id)
                ->where('status', 'approved')
                ->where('internshipId', $enrollmentId)
                ->first();
                
            \Log::info('Tried finding by internshipId', [
                'found' => $enrollment ? true : false
            ]);
        }

        if (!$enrollment) {
            \Log::warning('Enrollment not found for withdrawal', [
                'enrollmentId' => $enrollmentId,
                'userId' => $user->id
            ]);
            return response()->json(['message' => 'Enrollment not found or not approved'], 404);
        }

        // Check if already requested withdrawal
        if ($enrollment->withdrawalRequested && $enrollment->withdrawalStatus === 'pending') {
            return response()->json(['message' => 'Withdrawal request already pending'], 400);
        }

        // Check if already withdrawn
        if ($enrollment->withdrawalStatus === 'approved') {
            return response()->json(['message' => 'Already withdrawn from this internship'], 400);
        }

        // Update enrollment with withdrawal request
        $enrollment->update([
            'withdrawalRequested' => true,
            'withdrawalRequestedAt' => now(),
            'withdrawalReason' => $request->input('reason', ''),
            'withdrawalStatus' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal request submitted successfully. Please wait for admin approval.',
            'data' => $enrollment
        ]);
    }

    /**
     * Get withdrawal request status
     */
    public function getWithdrawalStatus(Request $request, $enrollmentId)
    {
        $user = $request->user();

        $enrollment = EnrollmentRequest::where('_id', $enrollmentId)
            ->where('userId', $user->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'withdrawalRequested' => $enrollment->withdrawalRequested ?? false,
                'withdrawalStatus' => $enrollment->withdrawalStatus ?? 'not_requested',
                'withdrawalRequestedAt' => $enrollment->withdrawalRequestedAt,
                'withdrawalReason' => $enrollment->withdrawalReason,
                'withdrawalAdminNote' => $enrollment->withdrawalAdminNote,
            ]
        ]);
    }
}

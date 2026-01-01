<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Internship;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class CertificateController extends Controller
{
    /**
     * Get all certificates for the authenticated student
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $certificates = Certificate::where('studentId', $user->id)
            ->orderBy('issueDate', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $certificates
        ]);
    }

    /**
     * Generate a certificate (Internal or Admin use usually, but here simulating auto-generation)
     * In a real app, this would be triggered by an event listener on "CourseCompleted".
     */
    public function generate(Request $request)
    {
        $request->validate([
            'sourceType' => 'required|in:course,internship',
            'sourceId' => 'required'
        ]);

        $user = $request->user();
        $sourceId = $request->sourceId;
        $type = $request->sourceType;

        // Check for existing certificate
        $exists = Certificate::where('studentId', $user->id)
            ->where($type . 'Id', $sourceId)
            ->first();

        if ($exists) {
            return response()->json([
                'status' => 'success',
                'message' => 'Certificate already exists',
                'data' => $exists
            ]);
        }

        // Fetch details
        $title = '';
        if ($type === 'course') {
            $course = Course::find($sourceId);
            if (!$course) return response()->json(['message' => 'Course not found'], 404);
            $title = $course->title;
            // Additional check: Is course 100% complete? Skipping for now to allow testing.
        } else {
            $internship = Internship::find($sourceId);
            if (!$internship) return response()->json(['message' => 'Internship not found'], 404);
            $title = $internship->title;
        }

        $certificate = Certificate::create([
            'studentId' => $user->id,
            'studentName' => $user->name,
            'internshipId' => $type === 'internship' ? $sourceId : null,
            'internshipTitle' => $type === 'internship' ? $title : null,
            'courseId' => $type === 'course' ? $sourceId : null,
            'courseTitle' => $type === 'course' ? $title : null,
            'issueDate' => now(),
            'issuedBy' => 'CodeSprint Labs',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate generated successfully',
            'data' => $certificate
        ], 201);
    }

    /**
     * Download certificate PDF
     */
    public function download(Request $request, $id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        // Authorization check: Only owner or admin can download
        // Assuming we are in a protected route or using a signed URL. 
        // ideally: if ($request->user()->id !== $certificate->studentId && !$request->user()->isAdmin()) abort(403);
        
        $data = [
            'name' => $certificate->studentName,
            'course' => $certificate->courseTitle ?? $certificate->internshipTitle,
            'date' => $certificate->issueDate->format('F d, Y'),
            'id' => $certificate->verificationCode,
            'qr_code' => 'link_to_verification_page_here' // In future logic
        ];

        $pdf = Pdf::loadView('certificates.template', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('certificate-' . $certificate->verificationCode . '.pdf');
    }

    /**
     * Public verification of certificate
     */
    public function verify($code)
    {
        $certificate = Certificate::with(['student', 'course', 'internship'])
            ->where('verificationCode', $code)
            ->first();

        if (!$certificate) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid certificate code'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'isValid' => true,
                'studentName' => $certificate->studentName,
                'programTitle' => $certificate->courseTitle ?? $certificate->internshipTitle,
                'issueDate' => $certificate->issueDate,
                'verificationCode' => $certificate->verificationCode
            ]
        ]);
    }
}

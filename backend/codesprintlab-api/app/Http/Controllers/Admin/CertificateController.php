<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\User;
use App\Models\Course;
use App\Models\Internship;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateController extends Controller
{
    /**
     * List all certificates with filters
     */
    public function index(Request $request)
    {
        $query = Certificate::query();

        // Filter by student
        if ($request->has('studentId')) {
            $query->where('studentId', $request->studentId);
        }

        // Filter by type (internship or course)
        if ($request->has('type')) {
            if ($request->type === 'internship') {
                $query->whereNotNull('internshipId');
            } elseif ($request->type === 'course') {
                $query->whereNotNull('courseId');
            }
        }

        // Search by student name or verification code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('studentName', 'like', "%{$search}%")
                  ->orWhere('verificationCode', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('issueDate', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('issueDate', '<=', $request->to);
        }

        $certificates = $query->orderBy('issueDate', 'desc')->paginate($request->get('per_page', 20));

        // Attach enrollment ID for internship certificates to allow letter download
        $certificates->getCollection()->transform(function ($cert) {
            if ($cert->internshipId) {
                // Find corresponding enrollment
                $enrollment = \App\Models\EnrollmentRequest::where('userId', $cert->studentId)
                    ->where('internshipId', $cert->internshipId)
                    ->where('completionStatus', 'certificate_issued') // Ensure it's the completed one
                    ->first();
                
                if ($enrollment) {
                    $cert->enrollmentId = $enrollment->_id ?? $enrollment->id;
                }
            }
            return $cert;
        });

        return response()->json([
            'status' => 'success',
            'data' => $certificates
        ]);
    }

    /**
     * Get certificate details
     */
    public function show(string $id)
    {
        $certificate = Certificate::with(['student', 'course', 'internship'])->find($id);

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $certificate
        ]);
    }

    /**
     * Issue a new certificate manually
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'studentId' => 'required|string',
            'type' => 'required|in:internship,course',
            'internshipId' => 'required_if:type,internship|string',
            'courseId' => 'required_if:type,course|string',
            'marks' => 'nullable|integer|min:0|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student = User::find($request->studentId);
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $type = $request->type;
        $sourceId = $type === 'internship' ? $request->internshipId : $request->courseId;

        // Check for existing certificate
        $exists = Certificate::where('studentId', $request->studentId)
            ->where($type . 'Id', $sourceId)
            ->first();

        if ($exists) {
            return response()->json([
                'message' => 'Certificate already exists for this student and program',
                'data' => $exists
            ], 400);
        }

        // Get program details
        if ($type === 'internship') {
            $program = Internship::find($sourceId);
            if (!$program) {
                return response()->json(['message' => 'Internship not found'], 404);
            }
            $title = $program->title;
        } else {
            $program = Course::find($sourceId);
            if (!$program) {
                return response()->json(['message' => 'Course not found'], 404);
            }
            $title = $program->title;
        }

        // Calculate grade if marks provided
        $grade = null;
        if ($request->marks !== null) {
            $grade = $this->calculateGrade($request->marks);
        }

        $certificate = Certificate::create([
            'studentId' => $student->id,
            'studentName' => $student->name,
            'internshipId' => $type === 'internship' ? $sourceId : null,
            'internshipTitle' => $type === 'internship' ? $title : null,
            'courseId' => $type === 'course' ? $sourceId : null,
            'courseTitle' => $type === 'course' ? $title : null,
            'issueDate' => now(),
            'issuedBy' => $request->user()->id,
            'marks' => $request->marks,
            'grade' => $grade,
        ]);

        // Send notification to student
        Notification::create([
            'userId' => $student->id,
            'title' => 'Certificate Issued!',
            'message' => "Congratulations! Your certificate for {$title} has been issued.",
            'type' => 'certificate',
            'read' => false,
            'link' => "/student/certificates",
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate issued successfully',
            'data' => $certificate
        ], 201);
    }

    /**
     * Revoke/Delete a certificate
     */
    public function destroy(string $id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        // Send notification to student about revocation
        Notification::create([
            'userId' => $certificate->studentId,
            'title' => 'Certificate Revoked',
            'message' => "Your certificate for " . ($certificate->courseTitle ?? $certificate->internshipTitle) . " has been revoked.",
            'type' => 'certificate',
            'read' => false,
        ]);

        $certificate->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate revoked successfully'
        ]);
    }

    /**
     * Get certificate statistics
     */
    public function stats()
    {
        $total = Certificate::count();
        $thisMonth = Certificate::where('issueDate', '>=', now()->startOfMonth())->count();
        $internshipCerts = Certificate::whereNotNull('internshipId')->count();
        $courseCerts = Certificate::whereNotNull('courseId')->count();

        // Top programs by certificates
        $topInternships = Certificate::whereNotNull('internshipId')
            ->selectRaw('internshipTitle as title, COUNT(*) as count')
            ->groupBy('internshipTitle')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        $topCourses = Certificate::whereNotNull('courseId')
            ->selectRaw('courseTitle as title, COUNT(*) as count')
            ->groupBy('courseTitle')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'thisMonth' => $thisMonth,
                'internshipCerts' => $internshipCerts,
                'courseCerts' => $courseCerts,
                'topInternships' => $topInternships,
                'topCourses' => $topCourses,
            ]
        ]);
    }

    /**
     * Bulk issue certificates
     */
    public function bulkIssue(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:internship,course',
            'programId' => 'required|string',
            'studentIds' => 'required|array',
            'studentIds.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $type = $request->type;
        $programId = $request->programId;

        // Get program details
        if ($type === 'internship') {
            $program = Internship::find($programId);
            if (!$program) {
                return response()->json(['message' => 'Internship not found'], 404);
            }
            $title = $program->title;
        } else {
            $program = Course::find($programId);
            if (!$program) {
                return response()->json(['message' => 'Course not found'], 404);
            }
            $title = $program->title;
        }

        $issued = 0;
        $skipped = 0;
        $errors = [];

        foreach ($request->studentIds as $studentId) {
            $student = User::find($studentId);
            if (!$student) {
                $errors[] = "Student {$studentId} not found";
                continue;
            }

            // Check for existing certificate
            $exists = Certificate::where('studentId', $studentId)
                ->where($type . 'Id', $programId)
                ->first();

            if ($exists) {
                $skipped++;
                continue;
            }

            Certificate::create([
                'studentId' => $student->id,
                'studentName' => $student->name,
                'internshipId' => $type === 'internship' ? $programId : null,
                'internshipTitle' => $type === 'internship' ? $title : null,
                'courseId' => $type === 'course' ? $programId : null,
                'courseTitle' => $type === 'course' ? $title : null,
                'issueDate' => now(),
                'issuedBy' => $request->user()->id,
            ]);

            // Send notification
            Notification::create([
                'userId' => $student->id,
                'title' => 'Certificate Issued!',
                'message' => "Congratulations! Your certificate for {$title} has been issued.",
                'type' => 'certificate',
                'read' => false,
                'link' => "/student/certificates",
            ]);

            $issued++;
        }

        return response()->json([
            'status' => 'success',
            'message' => "Issued {$issued} certificates, skipped {$skipped} (already issued)",
            'data' => [
                'issued' => $issued,
                'skipped' => $skipped,
                'errors' => $errors,
            ]
        ]);
    }

    /**
     * Regenerate PDF for a certificate
     */
    public function regeneratePdf(Request $request, string $id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        // Use the new template for internship certificates with marks
        if ($certificate->internshipId && $certificate->marks !== null) {
            $data = [
                'studentName' => $certificate->studentName,
                'internshipTitle' => $certificate->internshipTitle,
                'internshipDomain' => 'Technology', // Default domain
                'internshipDuration' => '4-8 Weeks',
                'marks' => $certificate->marks,
                'grade' => $certificate->grade ?? $this->calculateGrade($certificate->marks),
                'issueDate' => $certificate->issueDate->format('F d, Y'),
                'verificationCode' => $certificate->verificationCode,
            ];

            $pdf = Pdf::loadView('certificates.internship-certificate', $data);
            $pdf->setPaper('a4', 'landscape');
        } else {
            // Use original template for other certificates
            $data = [
                'name' => $certificate->studentName,
                'course' => $certificate->courseTitle ?? $certificate->internshipTitle,
                'date' => $certificate->issueDate->format('F d, Y'),
                'id' => $certificate->verificationCode,
                'verifyUrl' => config('app.frontend_url') . '/verify-certificate/' . $certificate->verificationCode,
            ];

            $pdf = Pdf::loadView('certificates.template', $data);
            $pdf->setPaper('a4', 'landscape');
        }

        return $pdf->download('certificate-' . $certificate->verificationCode . '.pdf');
    }

    /**
     * Calculate grade based on marks out of 50
     */
    private function calculateGrade(int $marks): string
    {
        $percentage = ($marks / 50) * 100;
        
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 40) return 'D';
        return 'F';
    }
}

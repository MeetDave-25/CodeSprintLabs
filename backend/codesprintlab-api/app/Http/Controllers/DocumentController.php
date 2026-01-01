<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DocumentController extends Controller
{
    /**
     * Get enriched enrollment data with latest user profile
     */
    private function getEnrichedEnrollment(EnrollmentRequest $enrollment, $user)
    {
        // Update enrollment with latest user profile data if missing
        $updateData = [];
        
        if (empty($enrollment->studentEmail) && $user->email) {
            $updateData['studentEmail'] = $user->email;
        }
        if (empty($enrollment->studentPhone) && $user->phone) {
            $updateData['studentPhone'] = $user->phone;
        }
        if (empty($enrollment->studentCollegeName) && $user->collegeName) {
            $updateData['studentCollegeName'] = $user->collegeName;
        }
        if (empty($enrollment->studentCourse) && $user->course) {
            $updateData['studentCourse'] = $user->course;
        }
        if (empty($enrollment->studentEnrollmentNumber) && $user->enrollmentNumber) {
            $updateData['studentEnrollmentNumber'] = $user->enrollmentNumber;
        }
        if (empty($enrollment->studentRollNumber) && $user->rollNumber) {
            $updateData['studentRollNumber'] = $user->rollNumber;
        }
        if (empty($enrollment->studentCity) && $user->city) {
            $updateData['studentCity'] = $user->city;
        }
        if (empty($enrollment->studentLocation) && $user->location) {
            $updateData['studentLocation'] = $user->location;
        }
        if (empty($enrollment->studentName) && $user->name) {
            $updateData['studentName'] = $user->name;
        }
        
        // Update the enrollment with fresh data
        if (!empty($updateData)) {
            $enrollment->update($updateData);
            $enrollment->refresh();
        }
        
        return $enrollment;
    }

    public function downloadMOU(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Ensure approved
        if (!$enrollment->isApproved()) {
            return response()->json(['message' => 'Application not approved yet'], 403);
        }

        // Enrich enrollment with latest user profile data
        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.mou', ['enrollment' => $enrollment]);
        return $pdf->download('MOU_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    public function downloadOfferLetter(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$enrollment->isApproved()) {
            return response()->json(['message' => 'Application not approved yet'], 403);
        }

        // Enrich enrollment with latest user profile data
        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.offer_letter', ['enrollment' => $enrollment]);
        return $pdf->download('Offer_Letter_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    public function viewMOU(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$enrollment->isApproved()) {
            return response()->json(['message' => 'Application not approved yet'], 403);
        }

        // Enrich enrollment with latest user profile data
        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.mou', ['enrollment' => $enrollment]);
        return $pdf->stream('MOU_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    public function viewOfferLetter(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$enrollment->isApproved()) {
            return response()->json(['message' => 'Application not approved yet'], 403);
        }

        // Enrich enrollment with latest user profile data
        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.offer_letter', ['enrollment' => $enrollment]);
        return $pdf->stream('Offer_Letter_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    /**
     * Download Partial Completion Letter (for mid-exit/withdrawn students)
     */
    public function downloadPartialCompletionLetter(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only for withdrawn enrollments
        if ($enrollment->status !== 'withdrawn') {
            return response()->json(['message' => 'This document is only available for withdrawn enrollments'], 403);
        }

        // Enrich enrollment with latest user profile data
        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.partial_completion_letter', ['enrollment' => $enrollment]);
        return $pdf->download('Partial_Completion_Letter_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    /**
     * Download Relieving Letter (for mid-exit/withdrawn students)
     */
    public function downloadRelievingLetter(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only for withdrawn enrollments
        if ($enrollment->status !== 'withdrawn') {
            return response()->json(['message' => 'This document is only available for withdrawn enrollments'], 403);
        }

        // Enrich enrollment with latest user profile data
        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.relieving_letter', ['enrollment' => $enrollment]);
        return $pdf->download('Relieving_Letter_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    /**
     * View Partial Completion Letter (for mid-exit/withdrawn students)
     */
    public function viewPartialCompletionLetter(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($enrollment->status !== 'withdrawn') {
            return response()->json(['message' => 'This document is only available for withdrawn enrollments'], 403);
        }

        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.partial_completion_letter', ['enrollment' => $enrollment]);
        return $pdf->stream('Partial_Completion_Letter_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }

    /**
     * View Relieving Letter (for mid-exit/withdrawn students)
     */
    public function viewRelievingLetter(Request $request, $id)
    {
        $user = $request->user();
        $enrollment = EnrollmentRequest::find($id);
        
        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Allow access if user is admin OR owns this enrollment
        $isAdmin = $user->role === 'admin';
        if (!$isAdmin && $enrollment->userId !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($enrollment->status !== 'withdrawn') {
            return response()->json(['message' => 'This document is only available for withdrawn enrollments'], 403);
        }

        $studentUser = User::find($enrollment->userId);
        if ($studentUser) {
            $enrollment = $this->getEnrichedEnrollment($enrollment, $studentUser);
        }

        $pdf = Pdf::loadView('documents.relieving_letter', ['enrollment' => $enrollment]);
        return $pdf->stream('Relieving_Letter_' . str_replace(' ', '_', $enrollment->studentName) . '.pdf');
    }
}

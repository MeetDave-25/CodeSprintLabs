<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get student profile
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'location' => $user->location,
                'city' => $user->city,
                'bio' => $user->bio,
                'skills' => $user->skills,
                'avatar' => $user->avatar,
                'collegeName' => $user->collegeName,
                'course' => $user->course,
                'enrollmentNumber' => $user->enrollmentNumber,
                'rollNumber' => $user->rollNumber,
                'joinedDate' => $user->joinedDate,
                'totalPoints' => $user->totalPoints,
                'tasksCompleted' => $user->tasksCompleted,
                'coursesCompleted' => $user->coursesCompleted,
                'enrolledInternships' => $user->enrolledInternships,
                'enrolledCourses' => $user->enrolledCourses,
                'resumePath' => $user->resumePath,
                'resumeOriginalName' => $user->resumeOriginalName,
                'resumeGoogleDriveUrl' => $user->resumeGoogleDriveUrl,
                'resumeUpdatedAt' => $user->resumeUpdatedAt,
                'hasResume' => !empty($user->resumePath) || !empty($user->resumeGoogleDriveUrl),
            ],
        ]);
    }

    /**
     * Update student profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'location' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'skills' => 'sometimes|array',
            'skills.*' => 'string|max:50',
            'collegeName' => 'sometimes|string|max:255',
            'course' => 'sometimes|string|max:255',
            'enrollmentNumber' => 'sometimes|string|max:50',
            'rollNumber' => 'sometimes|string|max:50',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'location' => $user->location,
                'city' => $user->city,
                'bio' => $user->bio,
                'skills' => $user->skills,
                'avatar' => $user->avatar,
                'collegeName' => $user->collegeName,
                'course' => $user->course,
                'enrollmentNumber' => $user->enrollmentNumber,
                'rollNumber' => $user->rollNumber,
                'joinedDate' => $user->joinedDate,
                'totalPoints' => $user->totalPoints,
                'tasksCompleted' => $user->tasksCompleted,
                'coursesCompleted' => $user->coursesCompleted,
            ],
        ]);
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB max
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar' => Storage::url($path),
        ]);
    }

    /**
     * Get student stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'totalPoints' => $user->totalPoints,
            'tasksCompleted' => $user->tasksCompleted,
            'coursesCompleted' => $user->coursesCompleted,
            'coursesEnrolled' => count($user->enrolledCourses ?? []),
            'internshipsEnrolled' => count($user->enrolledInternships ?? []),
            'certificatesEarned' => $user->certificates()->count(),
        ];

        return response()->json(['stats' => $stats]);
    }

    /**
     * Upload resume file
     */
    public function uploadResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
        ]);

        $user = $request->user();

        // Delete old resume if exists
        if ($user->resumePath) {
            Storage::delete($user->resumePath);
        }

        // Store new resume
        $file = $request->file('resume');
        $originalName = $file->getClientOriginalName();
        $path = $file->store('resumes/' . $user->id, 'local');

        $user->update([
            'resumePath' => $path,
            'resumeOriginalName' => $originalName,
            'resumeUpdatedAt' => now(),
        ]);

        return response()->json([
            'message' => 'Resume uploaded successfully',
            'resumePath' => $path,
            'resumeOriginalName' => $originalName,
        ]);
    }

    /**
     * Save Google Drive resume URL
     */
    public function saveResumeUrl(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $user = $request->user();

        // Delete old uploaded resume if switching to Google Drive
        if ($user->resumePath) {
            Storage::delete($user->resumePath);
            $user->resumePath = null;
            $user->resumeOriginalName = null;
        }

        $user->update([
            'resumeGoogleDriveUrl' => $request->url,
            'resumeUpdatedAt' => now(),
        ]);

        return response()->json([
            'message' => 'Resume URL saved successfully',
            'resumeGoogleDriveUrl' => $request->url,
        ]);
    }

    /**
     * Delete resume
     */
    public function deleteResume(Request $request)
    {
        $user = $request->user();

        // Delete file if exists
        if ($user->resumePath) {
            Storage::delete($user->resumePath);
        }

        $user->update([
            'resumePath' => null,
            'resumeOriginalName' => null,
            'resumeGoogleDriveUrl' => null,
            'resumeUpdatedAt' => null,
        ]);

        return response()->json([
            'message' => 'Resume deleted successfully',
        ]);
    }

    /**
     * Download resume
     */
    public function downloadResume(Request $request)
    {
        $user = $request->user();

        if (!$user->resumePath) {
            return response()->json(['message' => 'No resume uploaded'], 404);
        }

        if (!Storage::exists($user->resumePath)) {
            return response()->json(['message' => 'Resume file not found'], 404);
        }

        return Storage::download($user->resumePath, $user->resumeOriginalName);
    }
}

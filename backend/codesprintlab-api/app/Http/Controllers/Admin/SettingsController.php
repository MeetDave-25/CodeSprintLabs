<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    /**
     * Get admin profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'createdAt' => $user->created_at,
            ]
        ]);
    }

    /**
     * Update admin profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Update admin password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Upload admin avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'status' => 'success',
            'message' => 'Avatar uploaded successfully',
            'avatar' => Storage::url($path)
        ]);
    }

    /**
     * Get platform settings
     */
    public function platformSettings()
    {
        $settings = \App\Models\Setting::where('key', 'platform_settings')->first();
        $data = $settings ? $settings->value : [];

        // Defaults from config if not set in DB
        $defaults = [
            'siteName' => config('app.name', 'CodeSprint Labs'),
            'siteUrl' => config('app.url'),
            'frontendUrl' => config('app.frontend_url', 'http://localhost:3000'),
            'supportEmail' => config('mail.from.address', 'support@codesprintlabs.com'),
            'maxFileUploadSize' => '10MB',
            'allowedFileTypes' => ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg'],
            'internshipSettings' => [
                'maxTasksPerDay' => 1,
                'defaultDuration' => '30 days',
                'certificateAutoIssue' => true,
            ],
            'courseSettings' => [
                'defaultCurrency' => 'INR',
                'taxPercentage' => 18,
            ],
            'notificationSettings' => [
                'emailNotifications' => true,
                'submissionAlerts' => true,
                'enrollmentAlerts' => true,
            ],
        ];

        // Merge defaults with DB data
        // Note: vector merge needed for nested arrays if partial updates allowed, 
        // but for now simple array_replace_recursive is better
        $finalSettings = array_replace_recursive($defaults, $data);

        return response()->json([
            'status' => 'success',
            'data' => $finalSettings
        ]);
    }

    /**
     * Update platform settings
     */
    public function updatePlatformSettings(Request $request)
    {
        $validated = $request->validate([
            'siteName' => 'sometimes|string|max:255',
            'supportEmail' => 'sometimes|email',
            'internshipSettings.maxTasksPerDay' => 'sometimes|integer|min:1',
            'internshipSettings.certificateAutoIssue' => 'sometimes|boolean',
            'courseSettings.defaultCurrency' => 'sometimes|string|max:3',
            'courseSettings.taxPercentage' => 'sometimes|numeric|min:0|max:100',
            'notificationSettings.emailNotifications' => 'sometimes|boolean',
            'notificationSettings.submissionAlerts' => 'sometimes|boolean',
            'notificationSettings.enrollmentAlerts' => 'sometimes|boolean',
        ]);

        // Fetch existing settings
        $settings = \App\Models\Setting::where('key', 'platform_settings')->first();
        
        if (!$settings) {
            $settings = new \App\Models\Setting(['key' => 'platform_settings', 'value' => []]);
        }

        // Update value (merge with existing)
        $currentValue = $settings->value ?? [];
        // We use array_merge here but careful with nested structures, 
        // the validated data comes flat or structured depending on frontend.
        // Assuming frontend sends structured JSON matching the shape.
        
        // However, Laravel validation dot notation 'internshipSettings.maxTasksPerDay'
        // implies the request input is nested.
        
        // We need to merge validated data into current value
        $newValue = array_replace_recursive($currentValue, $validated);

        $settings->value = $newValue;
        $settings->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'data' => $newValue
        ]);
    }

    /**
     * Get all admin users
     */
    public function admins()
    {
        $admins = User::where('role', 'admin')
            ->select(['_id', 'name', 'email', 'avatar', 'created_at', 'status'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $admins
        ]);
    }

    /**
     * Create new admin user
     */
    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'email_verified_at' => now(),
            'status' => 'active',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin user created successfully',
            'data' => $admin
        ], 201);
    }

    /**
     * Delete admin user
     */
    public function deleteAdmin(Request $request, string $id)
    {
        $currentUser = $request->user();

        if ($currentUser->id === $id) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 400);
        }

        $admin = User::where('role', 'admin')->find($id);

        if (!$admin) {
            return response()->json(['message' => 'Admin not found'], 404);
        }

        $admin->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin deleted successfully'
        ]);
    }

    /**
     * Get activity logs (simplified version)
     */
    public function activityLogs(Request $request)
    {
        // In a real app, you would have an activity_logs table
        // For now, return recent submissions and enrollments as activities

        $activities = collect();

        // Recent submissions
        $submissions = \App\Models\Submission::orderBy('submittedAt', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($s) {
                return [
                    'type' => 'submission',
                    'message' => "{$s->studentName} submitted {$s->taskTitle}",
                    'timestamp' => $s->submittedAt,
                ];
            });

        // Recent payments
        $payments = \App\Models\Payment::where('status', 'completed')
            ->orderBy('paymentDate', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'type' => 'payment',
                    'message' => "{$p->studentName} purchased {$p->courseTitle}",
                    'timestamp' => $p->paymentDate,
                ];
            });

        // Recent certificates
        $certificates = \App\Models\Certificate::orderBy('issueDate', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($c) {
                return [
                    'type' => 'certificate',
                    'message' => "Certificate issued to {$c->studentName}",
                    'timestamp' => $c->issueDate,
                ];
            });

        $activities = $submissions->concat($payments)->concat($certificates)
            ->sortByDesc('timestamp')
            ->take(20)
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => $activities
        ]);
    }
}

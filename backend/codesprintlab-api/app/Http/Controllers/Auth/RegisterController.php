<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationEmail;


class RegisterController extends Controller
{
    /**
     * Handle student registration
     */
    public function register(Request $request)
    {
        // Avoid database-dependent validation rules (like unique:users) because we
        // use MongoDB and Laravel's database presence verifier may target SQL drivers
        // in tests. Validate basic format first and then check uniqueness manually.
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => 'nullable|string|max:20',
        ]);

        // Manual uniqueness check to support MongoDB-backed users
        if (User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'The email has already been taken.'], 422);
        }

        $code = rand(100000, 999999);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'student',
            'status' => 'active',
            'joinedDate' => now()->toDateString(),
            'verification_code' => (string)$code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        // Send Email
        try {
            Mail::to($user->email)->send(new VerificationEmail($code));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send OTP email: " . $e->getMessage());
        }
        
        // Log for testing (keep this for dev convenience)
        \Illuminate\Support\Facades\Log::info("OTP for {$user->email}: {$code}");

        return response()->json([
            'message' => 'Registration successful. Please check your email for verification code.',
            'email' => $user->email
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationEmail;


class VerificationController extends Controller
{
    /**
     * Verify OTP code and activate account
     */
    public function verifyOtp(Request $request)
    {
        // Validate basic format and then check existence manually to avoid issues
        // with the database presence verifier (works better with MongoDB tests).
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'The selected email is invalid.'], 422);
        }

        // Check if already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 200);
        }

        // Check code validity
        if ($user->verification_code !== $request->code) {
             return response()->json(['message' => 'Invalid verification code'], 400);
        }

        // Check expiration
        if ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast()) {
             return response()->json(['message' => 'Verification code expired'], 400);
        }

        // Verify user
        $user->email_verified_at = now();
        $user->verification_code = null;
        $user->verification_code_expires_at = null;
        $user->save();

        // Generate Token
        $token = JWTAuth::fromUser($user);

        return response()->json([
             'message' => 'Email verified successfully',
             'token' => $token,
             'user' => $user
        ]);
    }

    /**
     * Resend OTP code
     */
    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        
        $user = User::where('email', $request->email)->first();
        
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        $code = rand(100000, 999999);
        $user->verification_code = (string)$code;
        $user->verification_code_expires_at = now()->addMinutes(15);
        $user->save();

        // Send Email
        try {
            Mail::to($user->email)->send(new VerificationEmail($code));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to resend OTP email: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send email, please check logs'], 500);
        }

        // Keep logging for dev
        \Illuminate\Support\Facades\Log::info("Resent OTP for {$user->email}: {$code}");

        return response()->json(['message' => 'Verification code resent']);
    }
}

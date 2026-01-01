<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class LoginController extends Controller
{
    /**
     * Handle user login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is blocked
        if ($user->status === 'blocked') {
            return response()->json([
                'message' => 'Your account has been blocked. Please contact support.',
            ], 403);
        }

        // Check if verified (DISABLED FOR DEVELOPMENT - No SMTP needed)
        // if (!$user->email_verified_at && !$user->provider_id) {
        //      return response()->json([
        //          'message' => 'Email not verified. Please verify your email.',
        //          'action' => 'verify_email',
        //          'email' => $user->email
        //      ], 403);
        // }

        // Create JWT token
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'totalPoints' => $user->totalPoints,
            ],
            'token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => auth()->user(),
        ]);
    }

    /**
     * Refresh JWT token
     */
    public function refresh()
    {
        return response()->json([
            'token' => auth()->refresh(),
            'token_type' => 'bearer',
        ]);
    }
}

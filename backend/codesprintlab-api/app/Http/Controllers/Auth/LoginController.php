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
        if ($request->isMethod('get')) {
            return response()->json([
                'message' => 'Please submit credentials via POST to log in.',
                'status' => 'ready'
            ]);
        }

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'The provided credentials are incorrect.',
                    'errors' => [
                        'email' => ['The provided credentials are incorrect.']
                    ]
                ], 422);
            }

            // Check if user is blocked
            if ($user->status === 'blocked') {
                return response()->json([
                    'message' => 'Your account has been blocked. Please contact support.',
                ], 403);
            }

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
        } catch (\Throwable $e) {
            \Log::error('Login error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'message' => 'Login failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'file' => basename($e->getFile()) . ':' . $e->getLine()
            ], 500);
        }
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

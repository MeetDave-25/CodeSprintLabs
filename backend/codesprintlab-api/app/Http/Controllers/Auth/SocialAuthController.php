<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
use Exception;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     *
     * @param  string $provider
     * @return \Illuminate\Http\Response
     */
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * Obtain the user information from the provider.
     *
     * @param  string $provider
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleProviderCallback(Request $request, $provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Exception $e) {
            return response()->json(['error' => 'Unauthorized or cancelled'], 401);
        }

        // Check if user exists with this email
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Update provider info if logging in via a new provider matching email
            if (!$user->provider_id) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                    // Mark as verified since Social accounts are trusted
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'email' => $socialUser->getEmail(),
                'password' => bcrypt(Str::random(16)), // Random password
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_token' => $socialUser->token,
                'role' => 'student',
                'status' => 'active',
                'joinedDate' => now()->toDateString(),
                'email_verified_at' => now(), // Auto-verify social users
                'avatar' => $socialUser->getAvatar(),
            ]);
        }

        if ($user->status === 'blocked') {
            return response()->json(['message' => 'Account blocked'], 403);
        }

        $token = JWTAuth::fromUser($user);

        // We need to return to frontend. Since this is an API call often initiated by frontend redirect,
        // we might return a redirect URL or HTML that posts a message back to window.opener.
        // For simplicity in SPAs, we usually redirect back to a frontend route with the token in URL.
        
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect()->to("{$frontendUrl}/auth/callback?token={$token}&role={$user->role}&name={$user->name}");
    }
}

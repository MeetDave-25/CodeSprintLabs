<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthTest extends TestCase
{
    /** @test */
    public function register_endpoint_creates_user_and_sends_otp()
    {
        Mail::fake();

        $payload = [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Ensure no pre-existing test user (demo seeder might have created one)
        \App\Models\User::where('email', $payload['email'])->delete();

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['email' => 'testuser@example.com']);

        // Since users are stored in MongoDB, check via the model directly
        $user = User::where('email', 'testuser@example.com')->first();
        $this->assertNotNull($user, 'User should exist after registration');
        $this->assertNotNull($user->verification_code);
        $this->assertNotNull($user->verification_code_expires_at);
    }

    /** @test */
    public function verify_otp_returns_token_and_verifies_email()
    {
        // Ensure there's no pre-existing user (demo seeder may have created one)
        User::where('email', 'verify@example.com')->delete();

        // Create a user with a verification code
        $code = '123456';
        $user = User::create([
            'name' => 'Verify User',
            'email' => 'verify@example.com',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'status' => 'active',
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => 'verify@example.com',
            'code' => $code,
        ]);

        // Dump response to help debugging
        fwrite(STDERR, "Verify response raw: " . $response->getContent() . PHP_EOL);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'token', 'user']);

        $user->refresh();
        if (is_null($user->email_verified_at)) {
            fwrite(STDERR, "Verify response: " . $response->getContent() . PHP_EOL);
        }
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->verification_code);
    }

    /** @test */
    public function login_returns_token_and_user()
    {
        $password = 'secret123';
        $user = User::create([
            'name' => 'Login User',
            'email' => 'login@example.com',
            'password' => Hash::make($password),
            'role' => 'student',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => $password,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'user', 'token']);
    }
}

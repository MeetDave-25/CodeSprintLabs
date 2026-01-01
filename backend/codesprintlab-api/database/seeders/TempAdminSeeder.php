<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TempAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create or Update Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@codesprintlab.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );

        // Ensure critical fields are set even if user existed but was different
        $admin->update([
            'role' => 'admin',
            'email_verified_at' => now(),
            'password' => Hash::make('password'), 
        ]);

        // Create or Update Student User
        $student = User::firstOrCreate(
            ['email' => 'student@codesprintlab.com'],
            [
                'name' => 'Student User',
                'password' => Hash::make('password'),
                'role' => 'student',
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );

        $student->update([
            'role' => 'student',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        $this->command->info('User accounts seeded successfully!');
        $this->command->info('Admin: admin@codesprintlab.com / password');
        $this->command->info('Student: student@codesprintlab.com / password');
    }
}

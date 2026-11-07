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
            ['email' => 'admin@codesprintlabs.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );

        $admin->update([
            'role' => 'admin',
            'email_verified_at' => now(),
            'password' => Hash::make('Admin@123'), 
        ]);

        // Also ensure admin@codesprintlab.com exists
        $admin2 = User::firstOrCreate(
            ['email' => 'admin@codesprintlab.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );

        $admin2->update([
            'role' => 'admin',
            'email_verified_at' => now(),
            'password' => Hash::make('Admin@123'),
        ]);

        // Create or Update Student User
        $student = User::firstOrCreate(
            ['email' => 'student@codesprintlab.com'],
            [
                'name' => 'Student User',
                'password' => Hash::make('Student@123'),
                'role' => 'student',
                'email_verified_at' => now(),
                'status' => 'active',
            ]
        );

        $student->update([
            'role' => 'student',
            'email_verified_at' => now(),
            'password' => Hash::make('Student@123'),
        ]);

        $this->command->info('User accounts seeded successfully!');
        $this->command->info('Admin: admin@codesprintlabs.com / Admin@123');
        $this->command->info('Admin: admin@codesprintlab.com / Admin@123');
        $this->command->info('Student: student@codesprintlab.com / Student@123');
    }
}

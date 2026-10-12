<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class FixPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:fix-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix double-hashed passwords for known seeded accounts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing passwords for known accounts...');

        $accounts = [
            'admin@codesprintlab.com' => 'password',
            'admin@codesprintlabs.com' => 'admin123',
            'student@codesprintlab.com' => 'password',
            'rahul@example.com' => 'student123',
            'priya@example.com' => 'student123',
            'amit@example.com' => 'student123',
            'sneha@example.com' => 'student123',
            'vikash@example.com' => 'student123',
            'ananya@example.com' => 'student123',
            'rohan@example.com' => 'student123',
            'kavya@example.com' => 'student123',
        ];

        foreach ($accounts as $email => $password) {
            $user = User::where('email', $email)->first();
            if ($user) {
                // By assigning the plain text password, the model's 'hashed' cast
                // will correctly hash it once.
                $user->password = $password;
                $user->save();
                $this->line("Fixed password for: {$email}");
            }
        }

        $this->info('Done!');
    }
}

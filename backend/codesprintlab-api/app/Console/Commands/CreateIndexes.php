<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateIndexes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-indexes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create necessary database performance indexes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $connection = config('database.default');
        $this->info("Creating performance indexes for connection: {$connection}...");

        try {
            if ($connection === 'pgsql') {
                $this->info('Creating PostgreSQL performance indexes on Neon...');

                $indexes = [
                    'CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)',
                    'CREATE INDEX IF NOT EXISTS idx_users_status ON users (status)',
                    'CREATE INDEX IF NOT EXISTS idx_internships_active ON internships ("isActive")',
                    'CREATE INDEX IF NOT EXISTS idx_internships_domain ON internships (domain)',
                    'CREATE INDEX IF NOT EXISTS idx_courses_active ON courses ("isActive")',
                    'CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks ("isActive")',
                    'CREATE INDEX IF NOT EXISTS idx_tasks_internship ON tasks ("internshipId")',
                    'CREATE INDEX IF NOT EXISTS idx_tasks_course ON tasks ("courseId")',
                    'CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status)',
                    'CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions ("studentId")',
                    'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status)',
                    'CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON enrollment_requests (status)',
                    'CREATE INDEX IF NOT EXISTS idx_enrollment_requests_user ON enrollment_requests ("userId")',
                ];

                foreach ($indexes as $sql) {
                    DB::statement($sql);
                    $this->info("  - Executed: {$sql}");
                }
            } elseif ($connection === 'mongodb') {
                $this->info('Creating MongoDB indexes...');
                Schema::connection('mongodb')->table('users', function ($collection) {
                    $collection->index('email', null, null, ['unique' => true, 'background' => true]);
                    $collection->index('role', null, null, ['background' => true]);
                    $collection->index('status', null, null, ['background' => true]);
                });
                Schema::connection('mongodb')->table('internships', function ($collection) {
                    $collection->index('status', null, null, ['background' => true]);
                });
                Schema::connection('mongodb')->table('courses', function ($collection) {
                    $collection->index('status', null, null, ['background' => true]);
                });
            }

            $this->info('All database indexes created successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to create indexes: ' . $e->getMessage());
            return 1;
        }
    }
}

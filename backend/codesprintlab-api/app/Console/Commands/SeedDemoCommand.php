<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SeedDemoCommand extends Command
{
    protected $signature = 'seed:demo {--refresh : Refresh the database before seeding}';

    protected $description = 'Seed demo data for local development (users, courses, tasks, etc.)';

    public function handle()
    {
        if ($this->option('refresh')) {
            $this->info('Refreshing database (migrations will be run)...');
            Artisan::call('migrate:refresh', ['--force' => true]);
            $this->line(trim(Artisan::output()));
        }

        $this->info('Seeding demo data...');
        Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\DatabaseSeeder', '--force' => true]);
        $this->line(trim(Artisan::output()));
        $this->info('Demo seeding completed.');

        return 0;
    }
}

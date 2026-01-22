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
    protected $description = 'Create necessary indexes for MongoDB collections';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating indexes for MongoDB collections...');

        try {
            // Users Collection
            $this->info('Indexing users collection...');
            
            Schema::connection('mongodb')->table('users', function ($collection) {
                // Unique email index
                $collection->index('email', null, null, ['unique' => true, 'background' => true]);
                $this->info('  - Created unique index on email');
                
                // Role index for filtering
                $collection->index('role', null, null, ['background' => true]);
                $this->info('  - Created index on role');
                
                // Status index
                $collection->index('status', null, null, ['background' => true]);
                $this->info('  - Created index on status');

                // Combined index for common queries might be useful later, but sticking to basics for now
            });
            
            // Internships Collection (Good to have)
            $this->info('Indexing internships collection...');
            Schema::connection('mongodb')->table('internships', function ($collection) {
                $collection->index('status', null, null, ['background' => true]);
                $this->info('  - Created index on status');
            });

             // Courses Collection 
             $this->info('Indexing courses collection...');
             Schema::connection('mongodb')->table('courses', function ($collection) {
                 $collection->index('status', null, null, ['background' => true]);
                 $this->info('  - Created index on status');
             });

            $this->info('Indexes created successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Failed to create indexes: ' . $e->getMessage());
            return 1;
        }
    }
}

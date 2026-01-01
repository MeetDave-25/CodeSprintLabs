<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Internship;

echo "=== Testing Internship Create ===\n\n";

try {
    $data = [
        'title' => 'Test Internship ' . time(),
        'domain' => 'Web Development',
        'description' => 'Test description',
        'duration' => '30 days',
        'difficulty' => 'Beginner',
        'maxStudents' => 50,
        'createdBy' => '69357b9aaf718f3cce041222',
        'isActive' => true,
    ];
    
    echo "Creating internship with data:\n";
    print_r($data);
    
    $internship = Internship::create($data);
    
    echo "\nCreated successfully!\n";
    echo "ID: " . $internship->id . "\n";
    echo "Title: " . $internship->title . "\n";
    
    // Clean up
    $internship->delete();
    echo "\nTest internship deleted.\n";
    
} catch (\Exception $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check the specific internship "Software Development Intern"
$internshipId = '6953fdc0a1163d679b040e94';
$internship = \App\Models\Internship::find($internshipId);

echo "=== Internship Details ===\n";
echo "ID: " . $internship->id . "\n";
echo "Title: " . $internship->title . "\n";

// Check tasks using the SAME query as Student InternshipController
echo "\n=== Tasks Query (like InternshipController) ===\n";
$tasks = \App\Models\Task::where(function($query) use ($internshipId, $internship) {
    $query->where('internshipId', $internshipId)
          ->orWhere('internshipId', $internship->id);
})->orderBy('dayNumber')->get();

echo "Tasks found: " . $tasks->count() . "\n";
foreach ($tasks as $t) {
    echo "  - " . $t->title . " (isActive: " . var_export($t->isActive, true) . ")\n";
}

// Check tasks using the SAME query as Student TaskController
echo "\n=== Tasks Query (like TaskController) ===\n";
$rahul = \App\Models\User::find('6951e84326b74e1bbc0f50a2');
$enrolledInternships = $rahul->enrolledInternships ?? [];

$query = \App\Models\Task::where(function ($q) {
    $q->where('isActive', true)
      ->orWhereNull('isActive');
})->where(function ($q) use ($enrolledInternships) {
    $q->whereIn('internshipId', $enrolledInternships);
});

$allTasks = $query->orderBy('dueDate', 'asc')->get();
echo "Total tasks for student: " . $allTasks->count() . "\n";

// Check specifically for the "Software Development Intern" task
$sdTasks = $allTasks->filter(function($t) use ($internshipId) {
    return $t->internshipId === $internshipId;
});
echo "Tasks from 'Software Development Intern': " . $sdTasks->count() . "\n";
foreach ($sdTasks as $t) {
    echo "  - " . $t->title . "\n";
}

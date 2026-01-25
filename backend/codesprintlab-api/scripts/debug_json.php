<?php

use App\Models\TeamMember;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$member = TeamMember::first();

if (!$member) {
    echo "No members found. Creating one...\n";
    $member = TeamMember::create([
        'name' => 'Debug User',
        'role' => 'Debugger',
        'isActive' => true
    ]);
}

$json = json_encode($member);
$array = json_decode($json, true);

echo "Keys in JSON:\n";
print_r(array_keys($array));

echo "\nValues for ID fields:\n";
echo "_id: " . ($array['_id'] ?? 'MISSING') . "\n";
echo "id: " . ($array['id'] ?? 'MISSING') . "\n";

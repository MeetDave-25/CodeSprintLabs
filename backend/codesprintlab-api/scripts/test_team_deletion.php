<?php

use App\Models\TeamMember;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Team Member Deletion...\n";

// 1. Create a dummy member
echo "Creating dummy member...\n";
$member = TeamMember::create([
    'name' => 'Delete Test User',
    'role' => 'Tester',
    'isActive' => true
]);

// Get the ID - MongoDB returns ObjectId, need to convert to string
$idObject = $member->_id;
if (is_object($idObject)) {
    $id = (string) $idObject;
} else {
    $id = $idObject;
}

echo "Created member with ID: " . $id . "\n";
echo "ID type: " . gettype($id) . "\n";
echo "ID Object type: " . (is_object($idObject) ? get_class($idObject) : 'not an object') . "\n";
echo "Primary Key Name: " . $member->getKeyName() . "\n";
echo "Get Key: " . $member->getKey() . "\n";
echo "Attributes: " . print_r($member->getAttributes(), true) . "\n";

// 2. Try to find it
$found = TeamMember::find($id);
if (!$found) {
    echo "ERROR: Could not find member immediately after creation!\n";
    echo "Tried to find with ID: " . $id . "\n";
    
    // Try alternative lookup
    $found2 = TeamMember::where('_id', $id)->first();
    if ($found2) {
        echo "BUT: Found using where('_id', ...)\n";
        $found = $found2;
    } else {
        exit(1);
    }
}
echo "Member found via find(id).\n";

// 3. Delete it
echo "Attempting deletion...\n";
try {
    $found->delete();
    echo "Delete method called without error.\n";
} catch (\Exception $e) {
    echo "ERROR during delete(): " . $e->getMessage() . "\n";
    exit(1);
}

// 4. Verify deletion
$check = TeamMember::find($id);
if ($check) {
    echo "ERROR: Member still exists after delete()!\n";
} else {
    echo "SUCCESS: Member verified as deleted.\n";
}

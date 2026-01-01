<?php
require __DIR__ . '/../vendor/autoload.php';

// Load environment variables from .env if available
$envPath = __DIR__ . '/..';
if (file_exists($envPath . '/.env')) {
    Dotenv\Dotenv::createImmutable($envPath)->safeLoad();
}

$dsn = getenv('DB_DSN') ?: ($_ENV['DB_DSN'] ?? 'mongodb://127.0.0.1:27017');
$dbName = getenv('DB_DATABASE') ?: ($_ENV['DB_DATABASE'] ?? 'codesprintlab');

try {
    $manager = new MongoDB\Client($dsn);
    $collection = $manager->selectCollection($dbName, 'users');

    $filter = ['email' => 'test@example.com'];
    $update = ['$set' => ['password' => password_hash('password123', PASSWORD_BCRYPT)]];

    $result = $collection->updateOne($filter, $update);
    if ($result->getModifiedCount() > 0 || $result->getMatchedCount() > 0) {
        echo "Password updated for test@example.com\n";
    } else {
        echo "No matching user found or no change made.\n";
    }
} catch (Exception $e) {
    echo "Error updating password: " . $e->getMessage() . "\n";
    exit(1);
}

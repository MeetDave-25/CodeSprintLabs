<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'submissions';

    // Ensure id is included in JSON
    protected $appends = ['id'];

    protected $fillable = [
        'studentId',
        'studentName',
        'taskId',
        'taskTitle',
        'githubLink',
        'fileUrl',
        'screenshotUrl',
        'notes',
        'submittedAt',
        'status', // 'pending', 'approved', 'rejected'
        'feedback',
        'reviewedBy',
        'reviewedAt',
        'pointsAwarded',
    ];

    protected $casts = [
        'submittedAt' => 'datetime',
        'reviewedAt' => 'datetime',
        'pointsAwarded' => 'integer',
    ];

    protected $attributes = [
        'status' => 'pending',
        'pointsAwarded' => 0,
    ];

    /**
     * Get the id attribute as string
     */
    public function getIdAttribute($value = null)
    {
        // If value is passed and is an ObjectId, convert it
        if ($value instanceof \MongoDB\BSON\ObjectId) {
            return (string) $value;
        }
        // MongoDB Laravel stores _id as 'id' in attributes
        $id = $this->attributes['id'] ?? $this->attributes['_id'] ?? null;
        if ($id instanceof \MongoDB\BSON\ObjectId) {
            return (string) $id;
        }
        return $id ? (string) $id : null;
    }

    /**
     * Get the student who made this submission
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'studentId');
    }

    /**
     * Get the task this submission is for
     */
    public function task()
    {
        return $this->belongsTo(Task::class, 'taskId');
    }

    /**
     * Get the reviewer
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewedBy');
    }

    /**
     * Check if submission is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Approve submission
     */
    public function approve(string $reviewerId, string $feedback = null, int $points = 0)
    {
        $this->update([
            'status' => 'approved',
            'reviewedBy' => $reviewerId,
            'reviewedAt' => now(),
            'feedback' => $feedback,
            'pointsAwarded' => $points,
        ]);
    }

    /**
     * Reject submission
     */
    public function reject(string $reviewerId, string $feedback)
    {
        $this->update([
            'status' => 'rejected',
            'reviewedBy' => $reviewerId,
            'reviewedAt' => now(),
            'feedback' => $feedback,
        ]);
    }
}

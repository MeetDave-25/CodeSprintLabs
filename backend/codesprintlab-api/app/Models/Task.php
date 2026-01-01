<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Task extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'tasks';

    // Ensure id is included in JSON
    protected $appends = ['id'];

    protected $fillable = [
        'title',
        'description',
        'domain',
        'language',
        'difficulty', // 'Easy', 'Medium', 'Hard'
        'dayNumber',
        'points',
        'dueDate',
        'requirements',
        'internshipId',
        'courseId',
        'moduleId',
        'source', // 'internship' or 'course'
        'isActive',
    ];

    protected $casts = [
        'dayNumber' => 'integer',
        'points' => 'integer',
        'dueDate' => 'datetime',
        'isActive' => 'boolean',
    ];

    protected $attributes = [
        'requirements' => [],
        'isActive' => true,
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
     * Get the internship this task belongs to
     */
    public function internship()
    {
        return $this->belongsTo(Internship::class, 'internshipId');
    }

    /**
     * Get the course this task belongs to
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    /**
     * Get submissions for this task
     */
    public function submissions()
    {
        return $this->hasMany(Submission::class, 'taskId');
    }

    /**
     * Check if task is overdue
     */
    public function isOverdue(): bool
    {
        return $this->dueDate && $this->dueDate->isPast();
    }
}

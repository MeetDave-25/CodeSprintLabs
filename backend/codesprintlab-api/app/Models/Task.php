<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends BaseModel
{
    use HasFactory;

    protected $table = 'tasks';

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
        'requirements' => 'array',
    ];

    protected $attributes = [
        'requirements' => '[]',
        'isActive' => true,
    ];

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

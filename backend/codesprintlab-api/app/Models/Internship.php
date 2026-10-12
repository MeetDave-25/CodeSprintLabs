<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Internship extends BaseModel
{
    use HasFactory;

    protected $table = 'internships';

    protected $fillable = [
        'title',
        'companyName',
        'location',
        'type', // 'Remote', 'On-site', 'Hybrid'
        'stipend',
        'applicationDeadline',
        'endDate',
        'companyLogo',
        'responsibilities', // Array
        'skills', // Array
        'isFeatured',
        'domain',
        'description',
        'duration',
        'languages',
        'difficulty', // 'Beginner', 'Intermediate', 'Advanced'
        'enrolled',
        'maxStudents',
        'isActive',
        'image',
        'requirements',
        'learningOutcomes',
        'whatYouWillLearn', // Alias for learningOutcomes
        'syllabus', // Week-by-week syllabus array
        'createdBy',
        'price',
        'startDate',
    ];

    protected $casts = [
        'enrolled' => 'integer',
        'maxStudents' => 'integer',
        'isActive' => 'boolean',
        'isFeatured' => 'boolean',
        'startDate' => 'datetime',
        'endDate' => 'datetime',
        'applicationDeadline' => 'datetime',
        'price' => 'decimal:2',
        'languages' => 'array',
        'requirements' => 'array',
        'learningOutcomes' => 'array',
        'whatYouWillLearn' => 'array',
        'syllabus' => 'array',
        'responsibilities' => 'array',
        'skills' => 'array',
    ];

    protected $attributes = [
        'enrolled' => 0,
        'isActive' => true,
        'isFeatured' => false,
        'languages' => '[]',
        'requirements' => '[]',
        'learningOutcomes' => '[]',
        'whatYouWillLearn' => '[]',
        'syllabus' => '[]',
        'responsibilities' => '[]',
        'skills' => '[]',
    ];

    /**
     * Get tasks for this internship
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'internshipId');
    }

    /**
     * Check if internship is full
     */
    public function isFull(): bool
    {
        return $this->enrolled >= $this->maxStudents;
    }

    /**
     * Increment enrolled count
     */
    public function incrementEnrolled()
    {
        $this->increment('enrolled');
    }

    /**
     * Decrement enrolled count
     */
    public function decrementEnrolled()
    {
        $this->decrement('enrolled');
    }
}

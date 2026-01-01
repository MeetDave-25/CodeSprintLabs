<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Internship extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'internships';

    // Ensure id is included in JSON
    protected $appends = ['id'];

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
    ];

    protected $attributes = [
        'enrolled' => 0,
        'isActive' => true,
        'isFeatured' => false,
        'languages' => [],
        'requirements' => [],
        'learningOutcomes' => [],
        'whatYouWillLearn' => [],
        'syllabus' => [],
        'responsibilities' => [],
        'skills' => [],
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends BaseModel
{
    use HasFactory;

    protected $table = 'courses';

    protected $fillable = [
        'title',
        'description',
        'instructor',
        'price',
        'duration',
        'level', // 'Beginner', 'Intermediate', 'Advanced'
        'category',
        'thumbnail',
        'enrolled',
        'rating',
        'modules',
        'isActive',
        'createdBy',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'enrolled' => 'integer',
        'rating' => 'decimal:1',
        'isActive' => 'boolean',
        'modules' => 'array',
    ];

    protected $attributes = [
        'enrolled' => 0,
        'rating' => 0.0,
        'isActive' => true,
        'modules' => '[]',
    ];

    /**
     * Get tasks for this course
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'courseId');
    }

    /**
     * Increment enrolled count
     */
    public function incrementEnrolled()
    {
        $this->increment('enrolled');
    }
}

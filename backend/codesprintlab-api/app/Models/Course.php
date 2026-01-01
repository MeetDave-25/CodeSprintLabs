<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Course extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'courses';

    // Ensure id is included in JSON
    protected $appends = ['id'];

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
    ];

    protected $attributes = [
        'enrolled' => 0,
        'rating' => 0.0,
        'isActive' => true,
        'modules' => [],
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

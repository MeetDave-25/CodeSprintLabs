<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'announcements';

    protected $fillable = [
        'title',
        'content',
        'targetAudience', // 'all', 'students', 'admins'
        'createdBy',
        'priority', // 'low', 'medium', 'high'
        'isActive',
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    protected $attributes = [
        'targetAudience' => 'all',
        'priority' => 'medium',
        'isActive' => true,
    ];

    /**
     * Get the admin who created this announcement
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    /**
     * Get active announcements for a specific audience
     */
    public static function forAudience(string $audience = 'all')
    {
        return static::where('isActive', true)
            ->whereIn('targetAudience', [$audience, 'all'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}

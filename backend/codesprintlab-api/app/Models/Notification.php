<?php

namespace App\Models;

class Notification extends BaseModel
{
    protected $table = 'notifications';

    protected $fillable = [
        'userId',
        'title',
        'message',
        'type', // 'task', 'submission', 'course', 'certificate', 'announcement'
        'read',
        'link',
        'createdAt',
    ];

    protected $casts = [
        'read' => 'boolean',
        'createdAt' => 'datetime',
    ];

    protected $attributes = [
        'read' => false,
    ];

    /**
     * Get the user this notification belongs to
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        $this->update(['read' => true]);
    }

    /**
     * Get unread notifications for a user
     */
    public static function unreadForUser(string $userId)
    {
        return static::where('userId', $userId)
            ->where('read', false)
            ->orderBy('createdAt', 'desc')
            ->get();
    }
}

<?php

namespace App\Models;

class TeamMember extends BaseModel
{
    protected $table = 'team_members';

    protected $fillable = [
        'name',
        'role',
        'bio',
        'email',
        'phone',
        'image',
        'linkedin',
        'github',
        'twitter',
        'gradient',
        'order',
        'isActive',
    ];

    protected $casts = [
        'order' => 'integer',
        'isActive' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'isActive' => true,
        'order' => 0,
        'gradient' => 'from-purple-600 to-pink-600',
    ];

    /**
     * Scope for active team members
     */
    public function scopeActive($query)
    {
        return $query->where('isActive', true);
    }

    /**
     * Scope for ordered team members
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}

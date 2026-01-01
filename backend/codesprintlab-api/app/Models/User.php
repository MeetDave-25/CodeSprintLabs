<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'location',
        'city',
        'bio',
        'skills',
        'avatar',
        'collegeName',
        'course',
        'enrollmentNumber',
        'rollNumber',
        'enrolledInternships',
        'enrolledCourses',
        'joinedDate',
        'status',
        'totalPoints',
        'tasksCompleted',
        'coursesCompleted',
        'provider',
        'provider_id',
        'provider_token',
        'verification_code',
        'verification_code_expires_at',
        'email_verified_at',
        'resumePath',
        'resumeOriginalName',
        'resumeGoogleDriveUrl',
        'resumeUpdatedAt',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'totalPoints' => 'integer',
        'tasksCompleted' => 'integer',
        'coursesCompleted' => 'integer',
        'verification_code_expires_at' => 'datetime',
    ];

    protected $attributes = [
        'role' => 'student',
        'status' => 'active',
        'totalPoints' => 0,
        'tasksCompleted' => 0,
        'coursesCompleted' => 0,
        'skills' => [],
        'enrolledInternships' => [],
        'enrolledCourses' => [],
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Determine if the user has verified their email address.
     */
    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'studentId');
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class, 'studentId');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'userId');
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'email' => $this->email,
        ];
    }
}

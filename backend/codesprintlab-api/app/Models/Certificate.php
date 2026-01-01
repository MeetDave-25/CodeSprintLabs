<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'certificates';

    protected $fillable = [
        'studentId',
        'studentName',
        'internshipId',
        'internshipTitle',
        'courseId',
        'courseTitle',
        'issueDate',
        'certificateUrl',
        'verificationCode',
        'issuedBy',
        'marks',
        'grade',
    ];

    protected $casts = [
        'issueDate' => 'datetime',
        'marks' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certificate) {
            if (empty($certificate->verificationCode)) {
                $certificate->verificationCode = static::generateVerificationCode();
            }
        });
    }

    /**
     * Generate unique verification code
     */
    public static function generateVerificationCode(): string
    {
        do {
            $code = 'CERT-' . date('Y') . '-' . strtoupper(Str::random(8));
        } while (static::where('verificationCode', $code)->exists());

        return $code;
    }

    /**
     * Get the student who owns this certificate
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'studentId');
    }

    /**
     * Get the internship for this certificate
     */
    public function internship()
    {
        return $this->belongsTo(Internship::class, 'internshipId');
    }

    /**
     * Get the course for this certificate
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    /**
     * Verify a certificate by code
     */
    public static function verify(string $code)
    {
        return static::where('verificationCode', $code)->first();
    }
}

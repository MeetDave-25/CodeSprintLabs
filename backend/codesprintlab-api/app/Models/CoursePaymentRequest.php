<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class CoursePaymentRequest extends Model
{
    use HasFactory;
    
    protected $connection = 'mongodb';
    protected $collection = 'course_payment_requests';

    protected $appends = ['id'];

    protected $fillable = [
        'userId',
        'studentName',
        'studentEmail',
        'courseId',
        'courseTitle',
        'coursePrice',
        'paymentScreenshot',
        'paymentScreenshotPublicId', // For Cloudinary
        'upiTransactionId',
        'upiReferenceNumber',
        'status', // 'pending', 'approved', 'rejected'
        'verifiedBy',
        'verifiedAt',
        'rejectedAt',
        'rejectionReason',
        'adminNote',
        'paymentId', // Reference to Payment model after approval
    ];

    protected $casts = [
        'coursePrice' => 'decimal:2',
        'verifiedAt' => 'datetime',
        'rejectedAt' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    /**
     * Get the id attribute as string
     */
    public function getIdAttribute($value = null)
    {
        $id = $this->attributes['id'] ?? $this->attributes['_id'] ?? null;
        if ($id instanceof \MongoDB\BSON\ObjectId) {
            return (string) $id;
        }
        return $id;
    }

    /**
     * Get the student who made this payment request
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    /**
     * Get the course this payment is for
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    /**
     * Get the admin who verified this payment
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verifiedBy');
    }

    /**
     * Get the payment record
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class, 'paymentId');
    }

    /**
     * Check if request is pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is rejected
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Approve payment request
     */
    public function approve($adminId, $paymentId, $adminNote = null)
    {
        $this->update([
            'status' => 'approved',
            'verifiedBy' => $adminId,
            'verifiedAt' => now(),
            'paymentId' => $paymentId,
            'adminNote' => $adminNote,
        ]);
    }

    /**
     * Reject payment request
     */
    public function reject($adminId, $reason)
    {
        $this->update([
            'status' => 'rejected',
            'verifiedBy' => $adminId,
            'rejectedAt' => now(),
            'rejectionReason' => $reason,
        ]);
    }
}

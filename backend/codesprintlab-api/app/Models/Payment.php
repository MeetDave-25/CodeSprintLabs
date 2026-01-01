<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    protected $connection = 'mongodb';
    protected $collection = 'payments';

    protected $fillable = [
        'studentId',
        'studentName',
        'courseId',
        'courseTitle',
        'amount',
        'currency',
        'status', // 'pending', 'completed', 'failed', 'refunded'
        'paymentMethod', // 'razorpay', 'card', 'upi', etc.
        'transactionId',
        'razorpayOrderId',
        'razorpayPaymentId',
        'razorpaySignature',
        'paymentDate',
        'refundedAt',
        'refundReason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paymentDate' => 'datetime',
        'refundedAt' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
        'currency' => 'INR',
    ];

    /**
     * Get the student who made this payment
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'studentId');
    }

    /**
     * Get the course this payment is for
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'courseId');
    }

    /**
     * Mark payment as completed
     */
    public function markAsCompleted(array $paymentDetails)
    {
        $this->update([
            'status' => 'completed',
            'paymentDate' => now(),
            'razorpayPaymentId' => $paymentDetails['razorpay_payment_id'] ?? null,
            'razorpaySignature' => $paymentDetails['razorpay_signature'] ?? null,
        ]);
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed()
    {
        $this->update(['status' => 'failed']);
    }

    /**
     * Refund payment
     */
    public function refund(string $reason)
    {
        $this->update([
            'status' => 'refunded',
            'refundedAt' => now(),
            'refundReason' => $reason,
        ]);
    }
}

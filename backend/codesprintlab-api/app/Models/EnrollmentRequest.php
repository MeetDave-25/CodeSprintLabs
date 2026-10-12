<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class EnrollmentRequest extends BaseModel
{
    use HasFactory;
    
    protected $table = 'enrollment_requests';

    protected $fillable = [
        'userId',
        'internshipId',
        'status', // 'pending', 'approved', 'rejected'
        'studentName',
        'studentEmail',
        'studentPhone',
        'studentCollegeName',
        'studentCourse',
        'studentEnrollmentNumber',
        'studentRollNumber',
        'studentCity',
        'studentLocation',
        'internshipTitle',
        'internshipDomain',
        'internshipDuration',
        'message', // Optional message from student
        'adminNote', // Note from admin on approval/rejection
        'approvedBy',
        'approvedAt',
        'rejectedAt',
        'mouGenerated',
        'offerLetterGenerated',
        'mouPath',
        'offerLetterPath',
        'startDate',
        'endDate',
        // Completion related fields
        'completionRequested',
        'completionRequestedAt',
        'completionStatus', // 'not_requested', 'pending_review', 'reviewed', 'certificate_issued'
        'tasksCompleted',
        'totalTasks',
        'totalPoints',
        'marks', // Out of 50
        'adminFeedback',
        'reviewedAt',
        'reviewedBy',
        'certificateId',
        'completionLetterPath',
        'completionLetterGenerated',
        // Resume field
        'resumePath',
        'resumeOriginalName',
        'resumeGoogleDriveUrl',
        'resumeCloudinaryUrl',
        'resumeCloudinaryPublicId',
        // Withdrawal fields
        'withdrawalRequested',
        'withdrawalRequestedAt',
        'withdrawalReason',
        'withdrawalStatus', // 'not_requested', 'pending', 'approved', 'rejected'
        'withdrawalApprovedAt',
        'withdrawalApprovedBy',
        'withdrawalAdminNote',
    ];

    protected $casts = [
        'approvedAt' => 'datetime',
        'rejectedAt' => 'datetime',
        'startDate' => 'datetime',
        'endDate' => 'datetime',
        'mouGenerated' => 'boolean',
        'offerLetterGenerated' => 'boolean',
        'completionRequested' => 'boolean',
        'completionRequestedAt' => 'datetime',
        'reviewedAt' => 'datetime',
        'completionLetterGenerated' => 'boolean',
        'tasksCompleted' => 'integer',
        'totalTasks' => 'integer',
        'totalPoints' => 'integer',
        'marks' => 'integer',
        'withdrawalRequested' => 'boolean',
        'withdrawalRequestedAt' => 'datetime',
        'withdrawalApprovedAt' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
        'mouGenerated' => false,
        'offerLetterGenerated' => false,
        'completionRequested' => false,
        'completionStatus' => 'not_requested',
        'completionLetterGenerated' => false,
        'tasksCompleted' => 0,
        'totalTasks' => 0,
        'totalPoints' => 0,
        'withdrawalRequested' => false,
        'withdrawalStatus' => 'not_requested',
    ];

    /**
     * Get the user who requested enrollment
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    /**
     * Get the internship
     */
    public function internship()
    {
        return $this->belongsTo(Internship::class, 'internshipId');
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
     * Check if completion is requested
     */
    public function isCompletionRequested()
    {
        return $this->completionRequested === true;
    }

    /**
     * Check if completion is reviewed
     */
    public function isCompletionReviewed()
    {
        return $this->completionStatus === 'reviewed' || $this->completionStatus === 'certificate_issued';
    }

    /**
     * Check if certificate is issued
     */
    public function isCertificateIssued()
    {
        return $this->completionStatus === 'certificate_issued';
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('instructor')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->string('duration')->nullable();
            $table->string('level')->nullable();
            $table->string('category')->nullable();
            $table->string('thumbnail')->nullable();
            $table->integer('enrolled')->default(0);
            $table->decimal('rating', 3, 1)->default(0.0);
            $table->json('modules')->nullable();
            $table->boolean('isActive')->default(true);
            $table->string('createdBy')->nullable();
            $table->timestamps();
        });

        // Internships
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('companyName')->nullable();
            $table->string('location')->nullable();
            $table->string('type')->nullable();
            $table->string('stipend')->nullable();
            $table->timestamp('applicationDeadline')->nullable();
            $table->timestamp('endDate')->nullable();
            $table->string('companyLogo')->nullable();
            $table->json('responsibilities')->nullable();
            $table->json('skills')->nullable();
            $table->boolean('isFeatured')->default(false);
            $table->string('domain')->nullable();
            $table->text('description')->nullable();
            $table->string('duration')->nullable();
            $table->json('languages')->nullable();
            $table->string('difficulty')->nullable();
            $table->integer('enrolled')->default(0);
            $table->integer('maxStudents')->default(100);
            $table->boolean('isActive')->default(true);
            $table->string('image')->nullable();
            $table->json('requirements')->nullable();
            $table->json('learningOutcomes')->nullable();
            $table->json('whatYouWillLearn')->nullable();
            $table->json('syllabus')->nullable();
            $table->string('createdBy')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->timestamp('startDate')->nullable();
            $table->timestamps();
        });

        // Tasks
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('domain')->nullable();
            $table->string('language')->nullable();
            $table->string('difficulty')->nullable();
            $table->integer('dayNumber')->nullable();
            $table->integer('points')->default(0);
            $table->timestamp('dueDate')->nullable();
            $table->json('requirements')->nullable();
            $table->string('internshipId')->nullable()->index();
            $table->string('courseId')->nullable()->index();
            $table->string('moduleId')->nullable();
            $table->string('source')->nullable();
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });

        // Submissions
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('studentId')->nullable()->index();
            $table->string('studentName')->nullable();
            $table->string('taskId')->nullable()->index();
            $table->string('taskTitle')->nullable();
            $table->string('githubLink')->nullable();
            $table->string('fileUrl')->nullable();
            $table->string('screenshotUrl')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('submittedAt')->nullable();
            $table->string('status')->default('pending');
            $table->text('feedback')->nullable();
            $table->string('reviewedBy')->nullable();
            $table->timestamp('reviewedAt')->nullable();
            $table->integer('pointsAwarded')->default(0);
            $table->timestamps();
        });

        // Certificates
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('studentId')->nullable()->index();
            $table->string('studentName')->nullable();
            $table->string('internshipId')->nullable()->index();
            $table->string('internshipTitle')->nullable();
            $table->string('courseId')->nullable()->index();
            $table->string('courseTitle')->nullable();
            $table->timestamp('issueDate')->nullable();
            $table->string('certificateUrl')->nullable();
            $table->string('verificationCode')->unique();
            $table->string('issuedBy')->nullable();
            $table->integer('marks')->nullable();
            $table->string('grade')->nullable();
            $table->timestamps();
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('userId')->nullable()->index();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('announcement');
            $table->boolean('read')->default(false);
            $table->string('link')->nullable();
            $table->timestamp('createdAt')->nullable();
            $table->timestamps();
        });

        // Announcements
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('targetAudience')->default('all');
            $table->string('createdBy')->nullable();
            $table->string('priority')->default('medium');
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });

        // Settings
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('studentId')->nullable()->index();
            $table->string('studentName')->nullable();
            $table->string('courseId')->nullable()->index();
            $table->string('courseTitle')->nullable();
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->string('currency')->default('INR');
            $table->string('status')->default('pending');
            $table->string('paymentMethod')->nullable();
            $table->string('transactionId')->nullable();
            $table->string('razorpayOrderId')->nullable();
            $table->string('razorpayPaymentId')->nullable();
            $table->string('razorpaySignature')->nullable();
            $table->timestamp('paymentDate')->nullable();
            $table->timestamp('refundedAt')->nullable();
            $table->text('refundReason')->nullable();
            $table->string('paymentScreenshot')->nullable();
            $table->string('paymentScreenshotPublicId')->nullable();
            $table->string('upiTransactionId')->nullable();
            $table->string('upiReferenceNumber')->nullable();
            $table->string('verificationStatus')->default('pending');
            $table->string('verifiedBy')->nullable();
            $table->timestamp('verifiedAt')->nullable();
            $table->text('rejectionReason')->nullable();
            $table->timestamps();
        });

        // Team Members
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable();
            $table->text('bio')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('image')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->string('twitter')->nullable();
            $table->string('gradient')->default('from-purple-600 to-pink-600');
            $table->integer('order')->default(0);
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });

        // Enrollment Requests
        Schema::create('enrollment_requests', function (Blueprint $table) {
            $table->id();
            $table->string('userId')->nullable()->index();
            $table->string('internshipId')->nullable()->index();
            $table->string('status')->default('pending');
            $table->string('studentName')->nullable();
            $table->string('studentEmail')->nullable();
            $table->string('studentPhone')->nullable();
            $table->string('studentCollegeName')->nullable();
            $table->string('studentCourse')->nullable();
            $table->string('studentEnrollmentNumber')->nullable();
            $table->string('studentRollNumber')->nullable();
            $table->string('studentCity')->nullable();
            $table->string('studentLocation')->nullable();
            $table->string('internshipTitle')->nullable();
            $table->string('internshipDomain')->nullable();
            $table->string('internshipDuration')->nullable();
            $table->text('message')->nullable();
            $table->text('adminNote')->nullable();
            $table->string('approvedBy')->nullable();
            $table->timestamp('approvedAt')->nullable();
            $table->timestamp('rejectedAt')->nullable();
            $table->boolean('mouGenerated')->default(false);
            $table->boolean('offerLetterGenerated')->default(false);
            $table->string('mouPath')->nullable();
            $table->string('offerLetterPath')->nullable();
            $table->timestamp('startDate')->nullable();
            $table->timestamp('endDate')->nullable();
            $table->boolean('completionRequested')->default(false);
            $table->timestamp('completionRequestedAt')->nullable();
            $table->string('completionStatus')->default('not_requested');
            $table->integer('tasksCompleted')->default(0);
            $table->integer('totalTasks')->default(0);
            $table->integer('totalPoints')->default(0);
            $table->integer('marks')->nullable();
            $table->text('adminFeedback')->nullable();
            $table->timestamp('reviewedAt')->nullable();
            $table->string('reviewedBy')->nullable();
            $table->string('certificateId')->nullable();
            $table->string('completionLetterPath')->nullable();
            $table->boolean('completionLetterGenerated')->default(false);
            $table->string('resumePath')->nullable();
            $table->string('resumeOriginalName')->nullable();
            $table->string('resumeGoogleDriveUrl')->nullable();
            $table->string('resumeCloudinaryUrl')->nullable();
            $table->string('resumeCloudinaryPublicId')->nullable();
            $table->boolean('withdrawalRequested')->default(false);
            $table->timestamp('withdrawalRequestedAt')->nullable();
            $table->text('withdrawalReason')->nullable();
            $table->string('withdrawalStatus')->default('not_requested');
            $table->timestamp('withdrawalApprovedAt')->nullable();
            $table->string('withdrawalApprovedBy')->nullable();
            $table->text('withdrawalAdminNote')->nullable();
            $table->timestamps();
        });

        // Course Payment Requests
        Schema::create('course_payment_requests', function (Blueprint $table) {
            $table->id();
            $table->string('userId')->nullable()->index();
            $table->string('studentName')->nullable();
            $table->string('studentEmail')->nullable();
            $table->string('courseId')->nullable()->index();
            $table->string('courseTitle')->nullable();
            $table->decimal('coursePrice', 10, 2)->default(0.00);
            $table->string('paymentScreenshot')->nullable();
            $table->string('paymentScreenshotPublicId')->nullable();
            $table->string('upiTransactionId')->nullable();
            $table->string('upiReferenceNumber')->nullable();
            $table->string('status')->default('pending');
            $table->string('verifiedBy')->nullable();
            $table->timestamp('verifiedAt')->nullable();
            $table->timestamp('rejectedAt')->nullable();
            $table->text('rejectionReason')->nullable();
            $table->text('adminNote')->nullable();
            $table->string('paymentId')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_payment_requests');
        Schema::dropIfExists('enrollment_requests');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('internships');
        Schema::dropIfExists('courses');
    }
};

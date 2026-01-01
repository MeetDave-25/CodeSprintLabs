<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin and student users
        $this->call(TempAdminSeeder::class);

        // Create additional demo users
        User::factory(12)->create();

        // Create demo courses and attach some tasks
        $courses = \App\Models\Course::factory(8)->create()->each(function ($course) {
            // create 3 tasks per course
            \App\Models\Task::factory(3)->create(['courseId' => $course->_id ?? $course->getKey()]);
        });

        // Create demo internships
        $internships = \App\Models\Internship::factory(6)->create();

        // Create announcements
        \App\Models\Announcement::factory(5)->create();

        // Create payments for some students and courses
        $students = \App\Models\User::where('role','student')->get();
        $courses = \App\Models\Course::all();

        foreach ($students->take(6) as $student) {
            $course = $courses->random();
            \App\Models\Payment::factory()->create([
                'studentId' => $student->_id ?? $student->getKey(),
                'studentName' => $student->name,
                'courseId' => $course->_id ?? $course->getKey(),
                'courseTitle' => $course->title,
                'status' => 'completed',
                'paymentDate' => now(),
            ]);
        }

        // Create certificates for completed courses/internships
        foreach ($students->take(4) as $student) {
            $course = $courses->random();
            \App\Models\Certificate::factory()->create([
                'studentId' => $student->_id ?? $student->getKey(),
                'studentName' => $student->name,
                'courseId' => $course->_id ?? $course->getKey(),
                'courseTitle' => $course->title,
                'issueDate' => now(),
            ]);
        }

        // Create submissions for some tasks
        $tasks = \App\Models\Task::all();
        foreach ($students->take(8) as $student) {
            $task = $tasks->random();
            \App\Models\Submission::factory()->create([
                'studentId' => $student->_id ?? $student->getKey(),
                'studentName' => $student->name,
                'taskId' => $task->_id ?? $task->getKey(),
                'taskTitle' => $task->title,
                'status' => 'pending',
                'submittedAt' => now(),
            ]);
        }

        $this->command->info('Demo data seeded: users, courses, internships, tasks, payments, certificates, submissions, announcements.');
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Internship;
use App\Models\Task;
use App\Models\Submission;
use App\Models\Certificate;
use App\Models\Payment;
use App\Models\Announcement;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating demo data...');

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@codesprintlabs.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Create Demo Students
        $students = [];
        $studentData = [
            ['name' => 'Rahul Sharma', 'email' => 'rahul@example.com'],
            ['name' => 'Priya Patel', 'email' => 'priya@example.com'],
            ['name' => 'Amit Kumar', 'email' => 'amit@example.com'],
            ['name' => 'Sneha Reddy', 'email' => 'sneha@example.com'],
            ['name' => 'Vikash Singh', 'email' => 'vikash@example.com'],
            ['name' => 'Ananya Gupta', 'email' => 'ananya@example.com'],
            ['name' => 'Rohan Mehta', 'email' => 'rohan@example.com'],
            ['name' => 'Kavya Nair', 'email' => 'kavya@example.com'],
        ];

        foreach ($studentData as $data) {
            $students[] = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('student123'),
                    'role' => 'student',
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'totalPoints' => rand(100, 500),
                    'tasksCompleted' => rand(5, 20),
                ]
            );
        }

        // Create Internships
        $internshipData = [
            [
                'title' => 'Full Stack Web Development',
                'domain' => 'Web Development',
                'description' => 'Master modern web development with React, Node.js, and MongoDB. Build real-world projects and gain industry-ready skills.',
                'duration' => '30 days',
                'languages' => ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
                'difficulty' => 'Intermediate',
                'maxStudents' => 100,
            ],
            [
                'title' => 'Python for Data Science',
                'domain' => 'Data Science',
                'description' => 'Learn Python programming and data analysis with pandas, numpy, and visualization libraries.',
                'duration' => '45 days',
                'languages' => ['Python'],
                'difficulty' => 'Beginner',
                'maxStudents' => 150,
            ],
            [
                'title' => 'Java Backend Development',
                'domain' => 'Backend Development',
                'description' => 'Build robust backend systems with Java, Spring Boot, and microservices architecture.',
                'duration' => '30 days',
                'languages' => ['Java'],
                'difficulty' => 'Intermediate',
                'maxStudents' => 80,
            ],
            [
                'title' => 'Mobile App Development with React Native',
                'domain' => 'Mobile Development',
                'description' => 'Create cross-platform mobile applications using React Native and Expo.',
                'duration' => '30 days',
                'languages' => ['JavaScript', 'TypeScript'],
                'difficulty' => 'Intermediate',
                'maxStudents' => 60,
            ],
            [
                'title' => 'Machine Learning Fundamentals',
                'domain' => 'Machine Learning',
                'description' => 'Introduction to machine learning algorithms, neural networks, and deep learning basics.',
                'duration' => '60 days',
                'languages' => ['Python'],
                'difficulty' => 'Advanced',
                'maxStudents' => 50,
            ],
        ];

        $internships = [];
        foreach ($internshipData as $data) {
            $internship = Internship::firstOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'isActive' => true,
                    'enrolled' => rand(10, 50),
                    'createdBy' => $admin->id,
                ])
            );
            $internships[] = $internship;

            // Create tasks for each internship
            for ($day = 1; $day <= 5; $day++) {
                Task::firstOrCreate(
                    ['internshipId' => $internship->id, 'dayNumber' => $day],
                    [
                        'title' => "Day {$day}: " . $this->getTaskTitle($data['domain'], $day),
                        'description' => $this->getTaskDescription($data['domain'], $day),
                        'domain' => $data['domain'],
                        'language' => $data['languages'][0] ?? 'JavaScript',
                        'difficulty' => ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'][$day - 1],
                        'points' => $day * 20,
                        'requirements' => $this->getTaskRequirements($day),
                        'source' => 'internship',
                        'isActive' => true,
                    ]
                );
            }
        }

        // Create Courses
        $courseData = [
            [
                'title' => 'Complete React Developer Course',
                'description' => 'Learn React from scratch, including hooks, context, Redux, and Next.js.',
                'instructor' => 'John Smith',
                'price' => 2999,
                'duration' => '25 hours',
                'level' => 'Beginner',
            ],
            [
                'title' => 'Advanced Node.js & Express',
                'description' => 'Master Node.js, build REST APIs, implement authentication, and deploy applications.',
                'instructor' => 'Sarah Johnson',
                'price' => 3499,
                'duration' => '30 hours',
                'level' => 'Intermediate',
            ],
            [
                'title' => 'Python Machine Learning Mastery',
                'description' => 'Deep dive into machine learning with scikit-learn, TensorFlow, and real-world projects.',
                'instructor' => 'Dr. Michael Chen',
                'price' => 4999,
                'duration' => '40 hours',
                'level' => 'Advanced',
            ],
            [
                'title' => 'MongoDB & Database Design',
                'description' => 'Learn MongoDB, database modeling, aggregation pipelines, and performance optimization.',
                'instructor' => 'Emily Davis',
                'price' => 1999,
                'duration' => '15 hours',
                'level' => 'Intermediate',
            ],
        ];

        $courses = [];
        foreach ($courseData as $data) {
            $course = Course::firstOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'isActive' => true,
                    'enrolled' => rand(50, 200),
                    'rating' => round(rand(40, 50) / 10, 1),
                    'modules' => $this->getCourseModules(),
                    'createdBy' => $admin->id,
                ])
            );
            $courses[] = $course;
        }

        // Enroll students in internships and courses
        foreach ($students as $index => $student) {
            // Enroll in internship
            if (isset($internships[$index % count($internships)])) {
                $internship = $internships[$index % count($internships)];
                $enrolledInternships = $student->enrolledInternships ?? [];
                if (!in_array($internship->id, $enrolledInternships)) {
                    $student->push('enrolledInternships', $internship->id);
                }

                // Create some submissions for tasks
                $tasks = Task::where('internshipId', $internship->id)->limit(3)->get();
                foreach ($tasks as $taskIndex => $task) {
                    if ($taskIndex < 2) { // Submit 2 tasks
                        Submission::firstOrCreate(
                            ['studentId' => $student->id, 'taskId' => $task->id],
                            [
                                'studentName' => $student->name,
                                'taskTitle' => $task->title,
                                'githubLink' => 'https://github.com/student/project',
                                'submittedAt' => now()->subDays(rand(1, 10)),
                                'status' => ['pending', 'approved', 'approved'][$taskIndex],
                                'pointsAwarded' => $taskIndex === 0 ? 0 : $task->points,
                            ]
                        );
                    }
                }
            }

            // Enroll in course (with payment)
            if ($index < 4 && isset($courses[$index])) {
                $course = $courses[$index];
                $enrolledCourses = $student->enrolledCourses ?? [];
                if (!in_array($course->id, $enrolledCourses)) {
                    $student->push('enrolledCourses', $course->id);

                    // Create payment record
                    Payment::firstOrCreate(
                        ['studentId' => $student->id, 'courseId' => $course->id],
                        [
                            'studentName' => $student->name,
                            'courseTitle' => $course->title,
                            'amount' => $course->price,
                            'status' => 'completed',
                            'paymentMethod' => 'Razorpay',
                            'transactionId' => 'pay_' . strtoupper(substr(md5(rand()), 0, 14)),
                            'paymentDate' => now()->subDays(rand(1, 30)),
                        ]
                    );
                }
            }
        }

        // Create Certificates for some completed students
        foreach ($students as $index => $student) {
            if ($index < 2) {
                $internship = $internships[$index % count($internships)];
                Certificate::firstOrCreate(
                    ['studentId' => $student->id, 'internshipId' => $internship->id],
                    [
                        'studentName' => $student->name,
                        'internshipTitle' => $internship->title,
                        'issueDate' => now()->subDays(rand(1, 15)),
                        'issuedBy' => 'CodeSprint Labs',
                    ]
                );
            }
        }

        // Create Announcements
        $announcementData = [
            [
                'title' => 'New Course Launch: React Advanced Patterns',
                'content' => 'We are excited to announce the launch of our new advanced React course covering hooks, context, and performance optimization. Enroll now and get 20% off!',
                'priority' => 'high',
            ],
            [
                'title' => 'Platform Maintenance Scheduled',
                'content' => 'Our platform will undergo scheduled maintenance on Sunday from 2 AM to 4 AM IST. Services may be temporarily unavailable.',
                'priority' => 'medium',
            ],
            [
                'title' => 'Upcoming Webinar: Career in Tech',
                'content' => 'Join us for an exclusive webinar on building a successful career in technology. Register now to secure your spot!',
                'priority' => 'low',
            ],
        ];

        foreach ($announcementData as $data) {
            Announcement::firstOrCreate(
                ['title' => $data['title']],
                array_merge($data, [
                    'targetAudience' => 'all',
                    'isActive' => true,
                    'createdBy' => $admin->id,
                ])
            );
        }

        // Create Notifications
        foreach ($students as $student) {
            Notification::create([
                'userId' => $student->id,
                'title' => 'Welcome to CodeSprint Labs!',
                'message' => 'Start your learning journey today. Explore our internships and courses.',
                'type' => 'announcement',
                'read' => false,
            ]);
        }

        $this->command->info('Demo data created successfully!');
        $this->command->info('Admin login: admin@codesprintlabs.com / admin123');
        $this->command->info('Student login: rahul@example.com / student123');
    }

    private function getTaskTitle(string $domain, int $day): string
    {
        $titles = [
            'Web Development' => [
                'Build a Responsive Landing Page',
                'Create React Components',
                'Implement REST API Integration',
                'Add Authentication System',
                'Deploy Full Stack Application',
            ],
            'Data Science' => [
                'Data Cleaning and Preprocessing',
                'Exploratory Data Analysis',
                'Statistical Analysis',
                'Data Visualization',
                'Build ML Model',
            ],
            'Backend Development' => [
                'Setup Spring Boot Project',
                'Create REST Endpoints',
                'Implement Database Layer',
                'Add Security Configuration',
                'Deploy to Cloud',
            ],
            'Mobile Development' => [
                'Setup React Native Environment',
                'Create Navigation System',
                'Build UI Components',
                'Integrate APIs',
                'Publish App',
            ],
            'Machine Learning' => [
                'Python & NumPy Basics',
                'Data Preprocessing',
                'Regression Models',
                'Classification Algorithms',
                'Neural Networks',
            ],
        ];

        return $titles[$domain][$day - 1] ?? "Task for Day {$day}";
    }

    private function getTaskDescription(string $domain, int $day): string
    {
        return "Complete the day {$day} assignment for {$domain}. Follow the requirements carefully and submit your work via GitHub link.";
    }

    private function getTaskRequirements(int $day): array
    {
        $requirements = [
            ['Complete all setup steps', 'Submit GitHub repository link', 'Include README file'],
            ['Follow coding standards', 'Write clean code', 'Add comments'],
            ['Implement all features', 'Test your code', 'Handle edge cases'],
            ['Follow best practices', 'Add error handling', 'Write documentation'],
            ['Complete deployment', 'Add screenshots', 'Submit live demo link'],
        ];

        return $requirements[$day - 1] ?? ['Complete the task', 'Submit on time'];
    }

    private function getCourseModules(): array
    {
        return [
            [
                'id' => 'm1',
                'title' => 'Introduction',
                'lessons' => [
                    ['id' => 'l1', 'title' => 'Getting Started', 'type' => 'video', 'duration' => '10 min'],
                    ['id' => 'l2', 'title' => 'Course Overview', 'type' => 'video', 'duration' => '15 min'],
                ],
            ],
            [
                'id' => 'm2',
                'title' => 'Core Concepts',
                'lessons' => [
                    ['id' => 'l3', 'title' => 'Fundamentals', 'type' => 'video', 'duration' => '25 min'],
                    ['id' => 'l4', 'title' => 'Advanced Topics', 'type' => 'video', 'duration' => '30 min'],
                    ['id' => 'l5', 'title' => 'Quiz', 'type' => 'quiz', 'duration' => '10 min'],
                ],
            ],
            [
                'id' => 'm3',
                'title' => 'Project',
                'lessons' => [
                    ['id' => 'l6', 'title' => 'Project Setup', 'type' => 'video', 'duration' => '20 min'],
                    ['id' => 'l7', 'title' => 'Implementation', 'type' => 'video', 'duration' => '45 min'],
                    ['id' => 'l8', 'title' => 'Deployment', 'type' => 'video', 'duration' => '15 min'],
                ],
            ],
        ];
    }
}

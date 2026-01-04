<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        $announcements = [
            [
                'title' => 'Welcome to CodeSprint Labs!',
                'content' => 'Start your learning journey today. Explore our internships and courses to build real-world skills.',
            ],
            [
                'title' => 'New Internship Programs Available',
                'content' => 'Check out our latest internship programs in Web Development, Data Science, and more. Enroll now to gain hands-on experience!',
            ],
            [
                'title' => 'Platform Update: New Features',
                'content' => 'We have added new features including task submissions, progress tracking, and certificate generation. Explore them now!',
            ],
            [
                'title' => 'Upcoming Workshop Announcement',
                'content' => 'Join our upcoming workshop on career development and industry best practices. Register to secure your spot!',
            ],
            [
                'title' => 'Certificate Verification Now Available',
                'content' => 'You can now verify your certificates online. Share your achievements with employers and on social media!',
            ],
        ];

        $selected = $this->faker->randomElement($announcements);

        return [
            'title' => $selected['title'],
            'content' => $selected['content'],
            'targetAudience' => $this->faker->randomElement(['all','students','admins']),
            'createdBy' => null,
            'priority' => $this->faker->randomElement(['low','medium','high']),
            'isActive' => true,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        return [
            'studentId' => null,
            'studentName' => $this->faker->name(),
            'taskId' => null,
            'taskTitle' => $this->faker->sentence(6),
            'githubLink' => 'https://github.com/' . $this->faker->userName() . '/' . $this->faker->slug(),
            'fileUrl' => null,
            'screenshotUrl' => null,
            'notes' => $this->faker->sentence(),
            'submittedAt' => now(),
            'status' => 'pending',
            'feedback' => null,
            'reviewedBy' => null,
            'reviewedAt' => null,
            'pointsAwarded' => 0,
        ];
    }
}

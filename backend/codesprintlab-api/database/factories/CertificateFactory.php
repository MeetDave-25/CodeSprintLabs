<?php

namespace Database\Factories;

use App\Models\Certificate;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    public function definition(): array
    {
        return [
            'studentId' => null,
            'studentName' => $this->faker->name(),
            'internshipId' => null,
            'internshipTitle' => null,
            'courseId' => null,
            'courseTitle' => null,
            'issueDate' => now(),
            'certificateUrl' => null,
            'issuedBy' => 'CodeSprint Labs',
        ];
    }
}

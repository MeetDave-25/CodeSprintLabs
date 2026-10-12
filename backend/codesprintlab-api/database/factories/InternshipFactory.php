<?php

namespace Database\Factories;

use App\Models\Internship;
use Illuminate\Database\Eloquent\Factories\Factory;

class InternshipFactory extends Factory
{
    protected $model = Internship::class;

    public function definition(): array
    {
        $comp = $this->faker->company();
        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(3),
            'companyName' => $comp,
            'location' => $this->faker->city() . ', ' . $this->faker->country(),
            'duration' => $this->faker->numberBetween(1, 12) . ' months',
            'stipend' => (string) $this->faker->randomFloat(2, 0, 2000),
            'isActive' => true,
            'createdBy' => null,
        ];
    }
}

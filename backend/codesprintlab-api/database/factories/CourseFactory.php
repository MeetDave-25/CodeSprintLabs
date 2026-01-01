<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        $levels = ['Beginner', 'Intermediate', 'Advanced'];
        $modules = [];
        $numModules = $this->faker->numberBetween(3, 8);
        for ($i = 1; $i <= $numModules; $i++) {
            $modules[] = [
                'title' => "Module $i: " . $this->faker->sentence(3),
                'duration' => $this->faker->numberBetween(5, 60),
            ];
        }

        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(3),
            'instructor' => $this->faker->name(),
            'price' => $this->faker->randomFloat(2, 0, 200),
            'duration' => $this->faker->numberBetween(1, 24) . ' weeks',
            'level' => $this->faker->randomElement($levels),
            'thumbnail' => null,
            'enrolled' => 0,
            'rating' => $this->faker->randomFloat(1, 0, 5),
            'modules' => $modules,
            'isActive' => true,
            'createdBy' => null,
        ];
    }
}

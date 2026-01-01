<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(),
            'courseId' => null,
            'points' => $this->faker->numberBetween(5, 100),
            'dueDate' => $this->faker->dateTimeBetween('now', '+30 days'),
            'isPublished' => true,
        ];
    }
}

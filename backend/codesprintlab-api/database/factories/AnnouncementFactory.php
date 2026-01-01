<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(6),
            'content' => $this->faker->paragraph(2),
            'targetAudience' => $this->faker->randomElement(['all','students','admins']),
            'createdBy' => null,
            'priority' => $this->faker->randomElement(['low','medium','high']),
            'isActive' => true,
        ];
    }
}

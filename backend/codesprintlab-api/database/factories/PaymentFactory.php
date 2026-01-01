<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'studentId' => null,
            'studentName' => $this->faker->name(),
            'courseId' => null,
            'courseTitle' => null,
            'amount' => $this->faker->randomFloat(2, 50, 5000),
            'currency' => 'INR',
            'status' => $this->faker->randomElement(['pending','completed','failed']),
            'paymentMethod' => $this->faker->randomElement(['razorpay','card','upi']),
            'transactionId' => strtoupper($this->faker->bothify('TXN########')),
            'razorpayOrderId' => null,
            'razorpayPaymentId' => null,
            'razorpaySignature' => null,
            'paymentDate' => now(),
        ];
    }
}

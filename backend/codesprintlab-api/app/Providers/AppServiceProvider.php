<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register console commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Console\Commands\SeedDemoCommand::class,
            ]);
        }
        
        // Register Document Generator Service
        $this->app->singleton(\App\Services\DocumentGeneratorService::class, function ($app) {
            return new \App\Services\DocumentGeneratorService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

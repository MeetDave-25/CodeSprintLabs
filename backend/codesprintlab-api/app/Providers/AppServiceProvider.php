<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Connection;
use App\Database\NeonPostgresConnector;

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

        // Register custom Neon PostgreSQL connector (handles SNI/libpq endpoint issue)
        $this->app->resolving('db', function ($db) {
            $db->extend('pgsql', function ($config, $name) {
                $config['name'] = $name;
                $connector = new NeonPostgresConnector();
                $connection = $connector->connect($config);
                return new \Illuminate\Database\PostgresConnection(
                    $connection,
                    $config['database'] ?? '',
                    $config['prefix'] ?? '',
                    $config
                );
            });
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

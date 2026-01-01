# Setup Instructions - CodeSprint Labs Backend

## Step-by-Step Setup Guide

Follow these steps in order to get your backend running:

### Step 1: MongoDB Atlas Setup (15 minutes)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)
   - Verify your email

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose **M0 FREE** tier
   - Select region close to you (Mumbai or Singapore for India)
   - Name your cluster: `CodeSprintLabs`
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Username: `codesprintadmin`
   - Password: Create a strong password (SAVE THIS!)
   - Role: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: PHP, Version: 1.13+
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add database name before `?`: `/codesprintlab?`

   Final format:
   ```
   mongodb+srv://codesprintadmin:YOUR_PASSWORD@codesprintlabs.xxxxx.mongodb.net/codesprintlab?retryWrites=true&w=majority
   ```

### Step 2: Install Laravel Dependencies (5 minutes)

```bash
cd d:\codesprintlab\backend\codesprintlab-api

# Install PHP dependencies
composer install

# Install MongoDB package
composer require mongodb/laravel-mongodb

# Install Sanctum for API authentication
php artisan install:api
```

### Step 3: Configure Environment (2 minutes)

```bash
# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate
```

Now edit `.env` file and update:

```env
# Replace with your MongoDB Atlas connection string
DB_DSN=mongodb+srv://codesprintadmin:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/codesprintlab?retryWrites=true&w=majority

# Your Next.js frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 4: Register Middleware (2 minutes)

Edit `bootstrap/app.php` and add:

```php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

### Step 5: Configure CORS (2 minutes)

Edit `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Step 6: Create Storage Link (1 minute)

```bash
php artisan storage:link
```

### Step 7: Test MongoDB Connection (2 minutes)

```bash
php artisan tinker
```

In tinker, run:
```php
DB::connection()->getMongoDB()->listCollections();
exit
```

If you see output without errors, MongoDB is connected! ✅

### Step 8: Create Admin User (2 minutes)

```bash
php artisan tinker
```

```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@codesprintlabs.com';
$admin->password = Hash::make('admin123');
$admin->role = 'admin';
$admin->save();
exit
```

### Step 9: Start the Server (1 minute)

```bash
php artisan serve
```

Your API is now running at: **http://localhost:8000** 🎉

### Step 10: Test the API (3 minutes)

Open a new terminal and test:

```bash
# Test health check
curl http://localhost:8000/api/health

# Test registration
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test Student\",\"email\":\"student@test.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}"

# Test login
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"password123\"}"
```

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string copied
- [ ] Laravel dependencies installed
- [ ] MongoDB package installed
- [ ] .env file configured
- [ ] Application key generated
- [ ] Middleware registered
- [ ] CORS configured
- [ ] Storage link created
- [ ] MongoDB connection tested
- [ ] Admin user created
- [ ] Server started successfully
- [ ] API endpoints tested

## 🎯 Next Steps

1. **Connect Frontend**: Update your Next.js app to use `http://localhost:8000/api`
2. **Add Sample Data**: Create internships, courses, and tasks
3. **Test Full Flow**: Register → Login → View Tasks → Submit
4. **Deploy**: When ready, deploy to production

## 🚨 Common Issues

### "Connection refused" error
- Make sure MongoDB Atlas IP whitelist includes your IP
- Verify connection string is correct in `.env`

### "Class 'MongoDB\Laravel\Eloquent\Model' not found"
- Run: `composer require mongodb/laravel-mongodb`

### CORS errors from frontend
- Verify `FRONTEND_URL` in `.env`
- Run: `php artisan config:clear`

### "Admin middleware not found"
- Make sure you registered it in `bootstrap/app.php`
- Run: `php artisan config:clear`

## 📞 Need Help?

- Check `README.md` for detailed API documentation
- See `MONGODB_ATLAS_SETUP.md` for MongoDB Atlas guide
- Review Laravel logs: `storage/logs/laravel.log`

---

**Estimated Total Time: ~35 minutes**

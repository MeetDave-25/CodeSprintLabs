# CodeSprint Labs - Laravel Backend API

Complete REST API backend for CodeSprint Labs built with Laravel 10+ and MongoDB.

## 🚀 Features

- ✅ MongoDB Atlas integration
- ✅ JWT Authentication with Laravel Sanctum
- ✅ Student & Admin role-based access
- ✅ Internship & Course management
- ✅ Task assignment & submission system
- ✅ Certificate generation with verification
- ✅ Payment integration (Razorpay ready)
- ✅ Notifications & Announcements
- ✅ File upload support (avatars, submissions)
- ✅ CORS configured for Next.js frontend

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- MongoDB Atlas account (free tier works)

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd d:\codesprintlab\backend\codesprintlab-api
composer install
```

### 2. Install MongoDB Laravel Package

```bash
composer require mongodb/laravel-mongodb
```

### 3. Install Laravel Sanctum

```bash
php artisan install:api
```

### 4. Set Up MongoDB Atlas

Follow the guide in `../MONGODB_ATLAS_SETUP.md` to:
- Create a free MongoDB Atlas cluster
- Set up database user
- Configure network access
- Get your connection string

### 5. Configure Environment

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Update `.env` with your MongoDB Atlas credentials:

```env
APP_NAME="CodeSprint Labs API"
APP_URL=http://localhost:8000

# MongoDB Atlas Connection
DB_CONNECTION=mongodb
DB_DSN=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/codesprintlab?retryWrites=true&w=majority
DB_DATABASE=codesprintlab

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
SESSION_DRIVER=cookie
```

### 6. Generate Application Key

```bash
php artisan key:generate
```

### 7. Create Storage Link

```bash
php artisan storage:link
```

### 8. Start the Server

```bash
php artisan serve
```

API will be available at: `http://localhost:8000`

## 📁 Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── LoginController.php
│   │   │   └── RegisterController.php
│   │   ├── Student/
│   │   │   ├── ProfileController.php
│   │   │   └── TaskController.php
│   │   └── Admin/
│   │       ├── StudentController.php
│   │       └── SubmissionController.php
│   └── Middleware/
│       └── AdminMiddleware.php
├── Models/
│   ├── User.php
│   ├── Internship.php
│   ├── Course.php
│   ├── Task.php
│   ├── Submission.php
│   ├── Certificate.php
│   ├── Payment.php
│   ├── Notification.php
│   └── Announcement.php
routes/
└── api.php
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register      - Register new student
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout (requires auth)
GET    /api/auth/me            - Get current user (requires auth)
```

### Student Routes (Protected)

```
GET    /api/student/profile              - Get profile
PUT    /api/student/profile              - Update profile
POST   /api/student/profile/avatar       - Upload avatar
GET    /api/student/profile/stats        - Get stats
GET    /api/student/tasks                - Get daily tasks
GET    /api/student/tasks/{id}           - Get task details
POST   /api/student/tasks/{id}/submit    - Submit task
GET    /api/student/submissions          - Get submission history
```

### Admin Routes (Protected, Admin Only)

```
GET    /api/admin/students               - List all students
GET    /api/admin/students/stats         - Get student statistics
GET    /api/admin/students/{id}          - Get student details
PUT    /api/admin/students/{id}/status   - Update student status
GET    /api/admin/submissions            - List all submissions
GET    /api/admin/submissions/{id}       - Get submission details
PUT    /api/admin/submissions/{id}/review - Review submission
```

## 🧪 Testing the API

### 1. Test MongoDB Connection

```bash
php artisan tinker
```

Then run:
```php
DB::connection()->getMongoDB()->listCollections();
```

### 2. Create Admin User

```bash
php artisan tinker
```

```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@codesprintlabs.com';
$admin->password = Hash::make('password123');
$admin->role = 'admin';
$admin->save();
```

### 3. Test API with cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Get Profile (use token from login):**
```bash
curl -X GET http://localhost:8000/api/student/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔐 Authentication

This API uses Laravel Sanctum for token-based authentication.

**How it works:**
1. User registers or logs in
2. API returns an access token
3. Include token in subsequent requests:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

## 📤 File Uploads

### Avatar Upload
```bash
curl -X POST http://localhost:8000/api/student/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Task Submission with Screenshot
```bash
curl -X POST http://localhost:8000/api/student/tasks/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "githubLink=https://github.com/user/repo" \
  -F "notes=My solution" \
  -F "screenshot=@/path/to/screenshot.png"
```

## 🗄️ MongoDB Collections

The API automatically creates these collections:

- `users` - Students and admins
- `internships` - Internship programs
- `courses` - Course content
- `tasks` - Daily coding tasks
- `submissions` - Student submissions
- `certificates` - Issued certificates
- `payments` - Payment records
- `notifications` - User notifications
- `announcements` - System announcements

## 🔧 Configuration Files

### Register AdminMiddleware

Add to `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

### CORS Configuration

Update `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'supports_credentials' => true,
```

## 🚨 Troubleshooting

### MongoDB Connection Error
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

### Authentication Issues
- Clear config cache: `php artisan config:clear`
- Verify Sanctum is installed: `php artisan sanctum:install`
- Check token is sent in Authorization header

### CORS Errors
- Verify `FRONTEND_URL` in `.env`
- Clear config cache: `php artisan config:clear`
- Check browser console for specific CORS error

## 📚 Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Configure `.env` file
3. ✅ Test API endpoints
4. ⬜ Connect Next.js frontend
5. ⬜ Add more controllers (Internships, Courses, Certificates)
6. ⬜ Implement Razorpay payment integration
7. ⬜ Add email notifications
8. ⬜ Deploy to production

## 🤝 Frontend Integration

Update your Next.js app to use this API:

```typescript
// lib/api.ts
const API_URL = 'http://localhost:8000/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function getProfile(token: string) {
  const response = await fetch(`${API_URL}/student/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}
```

## 📝 License

This project is part of CodeSprint Labs.

---

**Need Help?** Check the MongoDB Atlas setup guide in `../MONGODB_ATLAS_SETUP.md`

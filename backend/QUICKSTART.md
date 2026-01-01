# Quick Start Guide - CodeSprint Labs Backend

## Prerequisites
- PHP 8.2 or higher
- Composer installed
- MongoDB Atlas account (see MONGODB_ATLAS_SETUP.md)

## Installation Steps

### 1. Navigate to Backend Directory
```bash
cd d:\codesprintlab\backend\codesprintlab-api
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update:

```env
APP_NAME="CodeSprint Labs API"
APP_URL=http://localhost:8000

# MongoDB Atlas Connection
DB_CONNECTION=mongodb
DB_DSN=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/codesprintlab?retryWrites=true&w=majority
DB_DATABASE=codesprintlab

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Razorpay (optional - for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Generate Application Key & JWT Secret
```bash
php artisan key:generate
php artisan jwt:secret
```

### 5. Seed Demo Data (Optional)
```bash
php artisan db:seed --class=DemoDataSeeder
```

This creates:
- Admin: `admin@codesprintlabs.com` / `admin123`
- Student: `rahul@example.com` / `student123`

### 6. Run the Server
```bash
php artisan serve
```

API will be available at: `http://localhost:8000`

## Testing the API

### Test API Health
```bash
curl http://localhost:8000/api/health
```

### Login and Get Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codesprintlabs.com","password":"admin123"}'
```

## API Documentation

Base URL: `http://localhost:8000/api`

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new student |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout (protected) |
| GET | `/auth/me` | Get current user (protected) |
| POST | `/auth/verify-otp` | Verify email OTP |
| POST | `/auth/resend-otp` | Resend OTP |

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internships` | List all internships |
| GET | `/internships/{id}` | Get internship details |
| GET | `/courses` | List all courses |
| GET | `/courses/{id}` | Get course details |
| GET | `/certificates/verify/{code}` | Verify certificate |

### Student Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/profile` | Get profile |
| PUT | `/student/profile` | Update profile |
| GET | `/student/tasks` | Get tasks |
| POST | `/student/tasks/{id}/submit` | Submit task |
| GET | `/student/my-internships` | Get enrolled internships |
| GET | `/student/my-courses` | Get enrolled courses |
| GET | `/student/certificates` | Get certificates |
| POST | `/student/payments/create-order` | Create payment order |
| POST | `/student/payments/verify` | Verify payment |

### Admin Endpoints (Protected + Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/dashboard/analytics` | Analytics data |
| GET | `/admin/students` | List students |
| GET | `/admin/submissions` | List submissions |
| PUT | `/admin/submissions/{id}/review` | Review submission |
| CRUD | `/admin/internships` | Manage internships |
| CRUD | `/admin/courses` | Manage courses |
| CRUD | `/admin/tasks` | Manage tasks |
| GET | `/admin/payments` | List payments |
| CRUD | `/admin/certificates` | Manage certificates |
| CRUD | `/admin/announcements` | Manage announcements |
| GET | `/admin/settings/*` | Admin settings |

## File Structure
```
codesprintlab-api/
├── app/
│   ├── Http/Controllers/
│   │   ├── Auth/
│   │   ├── Student/
│   │   └── Admin/
│   ├── Models/
│   └── Services/
├── routes/
│   └── api.php
├── config/
│   └── database.php
└── storage/
    └── app/
        └── submissions/  (student file uploads)
```

## Next Steps
1. Set up MongoDB locally or Atlas (see MONGODB_ATLAS_SETUP.md if you want Atlas)
2. Configure `.env` with your database credentials
3. Test the API endpoints
4. Connect your Next.js frontend

---

## Running locally with a local MongoDB (no Docker)
If you prefer to run the backend with a local MongoDB instance (no Docker / no Atlas), follow these steps:

1. Install MongoDB Community Server for your OS and make sure `mongod` is running (default port 27017).
2. In the backend project folder run:

```bash
cd backend/codesprintlab-api
composer install
cp .env.example .env
# Set DB_CONNECTION=mongodb and DB_DSN=mongodb://127.0.0.1:27017 in .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder
php artisan serve --host=127.0.0.1 --port=8000
```

3. Visit the health endpoint to verify: `http://127.0.0.1:8000/api/health`

Notes:
- A test user is created by the seeder (`test@example.com` / `password`) or you can create users using Tinker.
- Ensure the PHP `mongodb` extension is installed (check `php -m`).
- If you prefer Atlas later, set `DB_DSN` to the Atlas connection string and update `DB_DATABASE` accordingly.

## Troubleshooting

### MongoDB Connection Error
- Check your connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

### CORS Issues
- Verify `FRONTEND_URL` in `.env`
- Check `config/cors.php` settings
- Clear config cache: `php artisan config:clear`

### Authentication Issues
- Run: `php artisan config:cache`
- Check Sanctum configuration
- Verify API token in request headers

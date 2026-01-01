# Laravel Backend Deployment Guide for Railway.app

## Prerequisites
- GitHub repository already pushed: https://github.com/MeetDave-25/CodeSprintLabs
- MongoDB Atlas database already configured

## Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account

## Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not already connected
4. Select the **CodeSprintLabs** repository

## Step 3: Configure the Service
Railway will auto-detect the project. You need to configure it for the Laravel backend:

1. Click on the service that was created
2. Go to **Settings** tab
3. Under **Root Directory**, set it to: `backend/codesprintlab-api`
4. Click **Save**

## Step 4: Add Environment Variables
Go to the **Variables** tab and add these environment variables:

```env
APP_NAME=CodeSprintLab
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_URL=https://YOUR_RAILWAY_URL.railway.app

FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mongodb
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/codesprintlab?retryWrites=true&w=majority
MONGODB_DATABASE=codesprintlab

JWT_SECRET=YOUR_JWT_SECRET
JWT_TTL=1440

SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="CodeSprintLab"

RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Generate APP_KEY
Run locally: `php artisan key:generate --show`

### Generate JWT_SECRET
Run locally: `php artisan jwt:secret --show`

## Step 5: Deploy
1. Railway will automatically deploy when you save the settings
2. Wait for the build to complete (may take 5-10 minutes first time)
3. Once deployed, go to **Settings** > **Networking** > **Generate Domain**
4. Copy your Railway URL (e.g., `https://your-app.railway.app`)

## Step 6: Configure Vercel Frontend
1. Go to your Vercel dashboard
2. Select your CodeSprintLabs project
3. Go to **Settings** > **Environment Variables**
4. Add: `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app/api`
5. **Redeploy** the frontend for changes to take effect

## Step 7: Update Backend CORS (if needed)
If you face CORS issues, update the `FRONTEND_URL` environment variable on Railway to match your Vercel URL.

---

## Alternative: Render.com Deployment

### Step 1: Create Account
Go to [Render.com](https://render.com) and sign up with GitHub

### Step 2: Create New Web Service
1. Click **"New"** > **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend/codesprintlab-api`
   - **Environment**: PHP
   - **Build Command**: `composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`

### Step 3: Add Environment Variables
Same as Railway (see above)

---

## Troubleshooting

### MongoDB Extension Issue
If you see "MongoDB driver not found", the hosting may not support the MongoDB PHP extension. In this case:
- Try **Fly.io** which has better PHP extension support
- Or use **DigitalOcean App Platform**

### CORS Errors
Update `config/cors.php` to specifically allow your Vercel domain:
```php
'allowed_origins' => [env('FRONTEND_URL', '*')],
```

### 500 Server Error
Check the logs in Railway/Render dashboard. Common issues:
- Missing APP_KEY
- Missing JWT_SECRET
- Incorrect MONGODB_URI

### Build Fails
Make sure the root directory is set to `backend/codesprintlab-api`

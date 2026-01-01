# Laravel Backend Deployment Guide for Render.com

## Prerequisites
- GitHub repository: https://github.com/MeetDave-25/CodeSprintLabs
- MongoDB Atlas database already configured

---

## Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with your **GitHub** account

---

## Step 2: Create New Web Service
1. Click **"New +"** button in the top right
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Find and select the **CodeSprintLabs** repository
5. Click **"Connect"**

---

## Step 3: Configure the Service

### Basic Settings:
| Setting | Value |
|---------|-------|
| **Name** | `codesprintlab-api` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend/codesprintlab-api` |
| **Runtime** | `PHP` |

### Build & Start Commands:
| Setting | Command |
|---------|---------|
| **Build Command** | `composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache` |
| **Start Command** | `php artisan serve --host=0.0.0.0 --port=$PORT` |

### Instance Type:
- Select **Free** (for testing) or **Starter** ($7/month for production)

---

## Step 4: Add Environment Variables

Click **"Advanced"** to expand, then add these environment variables:

### Required Variables:

| Key | Value |
|-----|-------|
| `APP_NAME` | `CodeSprintLab` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | *(see below to generate)* |
| `APP_URL` | `https://YOUR-APP.onrender.com` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-APP.vercel.app` |
| `LOG_CHANNEL` | `stack` |
| `LOG_LEVEL` | `error` |
| `DB_CONNECTION` | `mongodb` |
| `MONGODB_URI` | `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/codesprintlab?retryWrites=true&w=majority` |
| `MONGODB_DATABASE` | `codesprintlab` |
| `JWT_SECRET` | *(see below to generate)* |
| `SESSION_DRIVER` | `file` |
| `SESSION_LIFETIME` | `120` |

### Optional (for email & payments):

| Key | Value |
|-----|-------|
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Your email |
| `MAIL_PASSWORD` | Your app password |
| `MAIL_ENCRYPTION` | `tls` |
| `MAIL_FROM_ADDRESS` | Your email |
| `MAIL_FROM_NAME` | `CodeSprintLab` |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |

---

## Step 5: Generate Keys Locally

Open terminal in `backend/codesprintlab-api` and run:

### Generate APP_KEY:
```bash
php artisan key:generate --show
```
Copy the output (starts with `base64:...`)

### Generate JWT_SECRET:
```bash
php artisan jwt:secret --show
```
Copy the 32+ character string

---

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-15 minutes first time)
3. Once deployed, copy your Render URL (e.g., `https://codesprintlab-api.onrender.com`)

---

## Step 7: Configure Vercel Frontend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **CodeSprintLabs** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://codesprintlab-api.onrender.com/api`
5. Click **"Save"**
6. Go to **Deployments** → Click **"..."** on latest → **"Redeploy"**

---

## ⚠️ Important Notes

### MongoDB PHP Extension
Render's default PHP environment may not include the MongoDB extension. If you see errors about MongoDB driver:

**Option 1:** Use the Docker runtime instead:
1. Create a `Dockerfile` in `backend/codesprintlab-api`
2. Change Runtime to **Docker** in Render settings

**Option 2:** Try adding to Build Command:
```bash
pecl install mongodb && composer install --no-dev --optimize-autoloader
```

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider **Starter** plan ($7/month) for always-on

### CORS Issues
If you get CORS errors, make sure `FRONTEND_URL` matches your exact Vercel URL.

---

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure Root Directory is set to `backend/codesprintlab-api`

### 500 Server Error
- Check Logs tab in Render dashboard
- Verify all required environment variables are set
- Make sure APP_KEY and JWT_SECRET are valid

### Cannot Connect to MongoDB
- Verify MONGODB_URI is correct
- Check MongoDB Atlas Network Access allows `0.0.0.0/0` (allow from anywhere)

### API Returns 404
- Check APP_URL is set to your Render URL
- Verify routes are cached: `php artisan route:cache`

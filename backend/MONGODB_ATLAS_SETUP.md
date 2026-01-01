# MongoDB Atlas Setup Guide for CodeSprint Labs

This guide will help you set up MongoDB Atlas (cloud database) for your Laravel backend.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (no credit card required)
3. Verify your email address

## Step 2: Create a New Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (perfect for development)
3. Select a cloud provider and region (choose closest to your location):
   - **Provider**: AWS, Google Cloud, or Azure
   - **Region**: Choose one close to India (e.g., Mumbai, Singapore)
4. Name your cluster (e.g., "CodeSprintLabs")
5. Click **"Create"** (takes 3-5 minutes to deploy)

## Step 3: Create Database User

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `codesprintadmin`
5. Set a strong password (save this - you'll need it!)
6. Set **"Built-in Role"** to **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Note**: For production, restrict to specific IPs
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Database"** (Clusters view)
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose:
   - **Driver**: PHP
   - **Version**: 1.13 or later
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://codesprintadmin:<password>@codesprintlabs.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual database user password
7. Add database name before the `?` - final format:
   ```
   mongodb+srv://codesprintadmin:YOUR_PASSWORD@codesprintlabs.xxxxx.mongodb.net/codesprintlab?retryWrites=true&w=majority
   ```

## Step 6: Save Connection Details

You'll need these for your Laravel `.env` file:

```env
DB_CONNECTION=mongodb
DB_DSN=mongodb+srv://codesprintadmin:YOUR_PASSWORD@codesprintlabs.xxxxx.mongodb.net/codesprintlab?retryWrites=true&w=majority
DB_DATABASE=codesprintlab
```

## Step 7: Create Database Collections (Optional)

MongoDB will automatically create collections when you insert data, but you can create them manually:

1. Click **"Browse Collections"** on your cluster
2. Click **"Add My Own Data"**
3. Database name: `codesprintlab`
4. Collection name: `users` (you can add more later)
5. Click **"Create"**

## Collections We'll Use

Your Laravel app will automatically create these collections:
- `users` - Students and admins
- `internships` - Internship programs
- `courses` - Course content
- `tasks` - Daily coding tasks
- `submissions` - Student task submissions
- `certificates` - Issued certificates
- `payments` - Payment records
- `notifications` - User notifications
- `announcements` - System announcements

## MongoDB Atlas Features You Can Use

### 1. **Charts** (Data Visualization)
- Create dashboards to visualize your data
- Track student progress, enrollments, etc.

### 2. **Realm** (Real-time Sync)
- Optional: For real-time features

### 3. **Backup**
- Automatic backups (available in free tier)
- Point-in-time recovery

### 4. **Monitoring**
- View database performance
- Track queries and operations

## Security Best Practices

1. ✅ Use strong passwords for database users
2. ✅ Restrict IP addresses in production
3. ✅ Never commit `.env` file to Git
4. ✅ Use environment variables for sensitive data
5. ✅ Enable MongoDB Atlas alerts for unusual activity

## Troubleshooting

### Connection Issues
- Verify IP whitelist includes your current IP
- Check username and password are correct
- Ensure connection string has database name

### Slow Queries
- MongoDB Atlas free tier has limitations
- Consider upgrading if you have many users

### Storage Limits
- Free tier: 512 MB storage
- Monitor usage in Atlas dashboard
- Upgrade when needed

## Next Steps

Once you have your connection string, we'll:
1. Install MongoDB PHP driver in Laravel
2. Configure the connection in `.env`
3. Create models and start building the API

---

**Need Help?** MongoDB Atlas has excellent documentation at [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com/)

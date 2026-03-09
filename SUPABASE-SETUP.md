# Supabase Setup Guide (PostgreSQL + Auth + Storage)

## Why Supabase?
- ✅ FREE PostgreSQL database (500MB)
- ✅ Built-in authentication
- ✅ File storage (1GB free)
- ✅ Real-time subscriptions
- ✅ Auto-generated REST API
- ✅ No credit card required

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
4. Fill in:
   - **Name**: woreda-reporting
   - **Database Password**: (save this!)
   - **Region**: Choose closest to Ethiopia (e.g., Singapore)
5. Click "Create new project" (takes 2 minutes)

## Step 2: Create Database Tables

1. In Supabase Dashboard → Click "SQL Editor"
2. Click "New Query"
3. Copy and paste the SQL from `supabase-schema.sql`
4. Click "Run" (bottom right)

## Step 3: Get Your Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (for backend only)

## Step 4: Install Supabase Client

Run in your project:
```bash
npm install @supabase/supabase-js
```

## Step 5: Configure Backend

Create `.env` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret
PORT=5000
```

## Step 6: Deploy Backend

### Option A: Render.com
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Settings:
   - **Build**: `npm install`
   - **Start**: `node server/index-supabase.js`
4. Add environment variables from Step 5
5. Deploy

### Option B: Railway.app
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Auto-deploys

## Step 7: Update Frontend

In Netlify:
1. Site settings → Environment variables
2. Add:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
3. Trigger redeploy

## Step 8: Enable File Storage (Optional)

1. In Supabase → Storage
2. Create new bucket: `report-attachments`
3. Make it public
4. Update backend to use Supabase storage

## Testing

1. Visit your Netlify site
2. Login: `subcity` / `admin123`
3. Create a report
4. Check Supabase dashboard → Table Editor to see data

## Costs

- **Supabase**: FREE
  - 500MB database
  - 1GB file storage
  - 2GB bandwidth/month
  - Unlimited API requests

- **Render**: FREE
  - 750 hours/month
  - Sleeps after 15min inactivity

- **Netlify**: FREE
  - 100GB bandwidth/month

## Advantages over MongoDB

✅ SQL queries (more powerful)
✅ Built-in authentication
✅ File storage included
✅ Real-time updates
✅ Better for relational data
✅ Automatic REST API
✅ Better free tier limits

## Support

- Supabase Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

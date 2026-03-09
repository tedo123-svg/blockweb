# Quick Fix for Connection Error

## The Problem
Your frontend (Netlify) can't connect to your backend (Render) because:
1. Backend might not be running
2. Frontend is using wrong API URL
3. Environment variables not set

## Quick Solution

### Step 1: Fix Render Backend
1. Go to your Render dashboard
2. Find your service
3. Check if it's running (should be green)
4. If failed, change **Start Command** to: `node server/index.js`
5. Save and wait for redeploy

### Step 2: Get Your Backend URL
Your Render backend URL should be something like:
`https://blockweb-xxxx.onrender.com`

Copy this URL!

### Step 3: Update Netlify Environment
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-render-url.onrender.com` (your backend URL)
4. Save
5. Trigger redeploy (Deploys → Trigger deploy → Deploy site)

### Step 4: Test
1. Wait for both deployments to finish
2. Visit your Netlify site
3. Try logging in with: `subcity` / `admin123`

## If Still Not Working

### Check Backend Health
Visit your Render URL directly in browser:
- If you see "Cannot GET /" - Backend is running ✅
- If connection refused - Backend is down ❌

### Check Frontend Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Try logging in
4. Look for the actual API URL being called

### Common Issues
- **503 Service Unavailable**: Backend is starting up (wait 30 seconds)
- **CORS Error**: Backend needs frontend URL in CORS settings
- **404 Not Found**: Wrong API endpoint

## Environment Variables Needed

**Netlify (Frontend):**
```
VITE_API_URL=https://your-render-backend.onrender.com
```

**Render (Backend):**
```
JWT_SECRET=your-random-secret-key
PORT=5000
```

## Test URLs
- Frontend: https://your-netlify-site.netlify.app
- Backend: https://your-render-backend.onrender.com
- API Test: https://your-render-backend.onrender.com/api/login (should show method not allowed)
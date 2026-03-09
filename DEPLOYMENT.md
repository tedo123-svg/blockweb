# Deployment Guide

## Architecture
- **Frontend**: Netlify (Static React App)
- **Backend**: Render/Railway (Node.js API)
- **Database**: MongoDB Atlas (Free Tier)
- **File Storage**: Backend server or Cloudinary

## Step 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Save this connection string for later

## Step 2: Deploy Backend to Render

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: woreda-reporting-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index-db.js`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-random-secret-key
   PORT=5000
   ```

6. Click "Create Web Service"
7. Copy your backend URL (e.g., https://woreda-reporting-api.onrender.com)

## Step 3: Update Frontend for Production

Update `src/components/*` files to use environment variable for API URL:

Replace `http://localhost:5000` with:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Step 4: Deploy Frontend to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```

6. Click "Deploy site"

## Step 5: Update CORS in Backend

In `server/index-db.js`, update CORS:
```javascript
app.use(cors({
  origin: 'https://your-netlify-app.netlify.app'
}));
```

## Alternative: Deploy Backend to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables (same as Render)
5. Railway will auto-detect and deploy

## Testing

1. Visit your Netlify URL
2. Login with: `subcity` / `admin123`
3. Test creating reports and user management

## Costs

- MongoDB Atlas: FREE (512MB storage)
- Render: FREE (750 hours/month, sleeps after 15min inactivity)
- Netlify: FREE (100GB bandwidth/month)
- Railway: FREE ($5 credit/month)

## Notes

- Free tier backends sleep after inactivity (first request takes 30s to wake)
- For production, consider paid tiers for better performance
- Use Cloudinary for file uploads in production

# Deploy to Vercel (Netlify Alternative)

## Why Vercel?
- ✅ FREE tier with generous limits
- ✅ Faster than Netlify
- ✅ Better developer experience
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variables
- ✅ Zero configuration for React/Vite

## Setup Steps

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### 2. Import Your Project
1. Click "Add New..." → "Project"
2. Find your `blockweb` repository
3. Click "Import"
4. Vercel will auto-detect it's a Vite project ✅

### 3. Configure Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Add Environment Variable
1. Before deploying, click "Environment Variables"
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://blockweb.onrender.com`
3. Click "Add"

### 5. Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Get your new URL: `https://blockweb-xxx.vercel.app`

### 6. Test
1. Visit your new Vercel URL
2. Try logging in: `subcity` / `admin123`

## Custom Domain (Optional)
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Automatic Deployments
Every time you push to GitHub, Vercel automatically:
- Builds your app
- Deploys the new version
- Updates your live site

## Comparison: Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|---------|
| Free Bandwidth | 100GB | 100GB |
| Build Minutes | 300/month | Unlimited |
| Sites | Unlimited | Unlimited |
| Speed | Fast | Faster |
| GitHub Integration | ✅ | ✅ |
| Environment Variables | ✅ | ✅ |
| Custom Domains | ✅ | ✅ |

## Migration Benefits
- ✅ Faster build times
- ✅ Better performance
- ✅ More reliable deployments
- ✅ Better developer experience
- ✅ Same features as Netlify
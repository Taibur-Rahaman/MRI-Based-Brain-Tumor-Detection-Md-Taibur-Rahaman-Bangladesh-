# Complete Deployment Guide - Brain Tumor Detection App

This guide will walk you through deploying your brain tumor detection application to production on Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Python 3.8+ (for Python API)
- Node.js 18+ (for Next.js app)

## 🚀 Step-by-Step Deployment

### Part 1: Deploy Python Inference API (Recommended)

The Python API provides the most accurate predictions using your trained Keras model.

#### Option A: Deploy to Render (Easiest - Free Tier)

1. **Sign up at [Render.com](https://render.com)**

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure the Service:**
   - **Name**: `brain-tumor-api` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `vercel-app/python-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn inference_api:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables:**
   - Click "Environment" tab
   - Add if needed: `MODEL_PATH=../cse499_brain_tumor_model-keras-default-v1/brain_tumor_model.keras`
   - Or copy your model file to the `python-api` directory

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your service URL: `https://brain-tumor-api.onrender.com`

6. **Test the API:**
   ```bash
   curl https://your-api-url.onrender.com/health
   ```

#### Option B: Deploy to Railway

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service:**
   - Add Python service
   - Set working directory: `vercel-app/python-api`
   - Set start command: `uvicorn inference_api:app --host 0.0.0.0 --port $PORT`

4. **Deploy and get URL**

#### Option C: Deploy to Google Cloud Run

1. **Install Google Cloud SDK**

2. **Build and deploy:**
   ```bash
   cd vercel-app/python-api
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/brain-tumor-api
   gcloud run deploy brain-tumor-api \
     --image gcr.io/YOUR_PROJECT/brain-tumor-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Part 2: Deploy Next.js App to Vercel

1. **Push Code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import" and select your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `vercel-app`
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)

3. **Add Environment Variables:**
   - In project settings, go to "Environment Variables"
   - Add: `INFERENCE_API_URL` = `https://your-python-api-url.com/predict`
   - Make sure to select all environments (Production, Preview, Development)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build (2-5 minutes)
   - Your app is live! 🎉

## ✅ Post-Deployment Checklist

- [ ] Test file upload with all 4 modalities
- [ ] Verify predictions are working
- [ ] Check 3D visualization loads correctly
- [ ] Test on mobile devices
- [ ] Monitor error logs in Vercel dashboard
- [ ] Set up custom domain (optional)

## 🔧 Configuration

### Environment Variables

**Vercel Project:**
- `INFERENCE_API_URL`: Your Python API endpoint
- `NODE_ENV`: `production`

**Python API:**
- `MODEL_PATH`: Path to your Keras model (if not default)
- `PORT`: Server port (auto-set by platform)

### Vercel Settings

- **Function Timeout**: 60 seconds (requires Pro plan)
- **File Size Limit**: 50MB (configured in `next.config.js`)

## 🐛 Troubleshooting

### API Not Responding

1. Check Python API is running:
   ```bash
   curl https://your-api-url.com/health
   ```

2. Check CORS settings in `inference_api.py`

3. Verify environment variable is set correctly in Vercel

### Build Failures

1. **Next.js build fails:**
   - Check Node.js version (should be 18+)
   - Run `npm install` locally to check for dependency issues
   - Check build logs in Vercel dashboard

2. **Python API build fails:**
   - Verify `requirements.txt` is correct
   - Check Python version (3.8+)
   - Ensure model file is accessible

### Runtime Errors

1. **"Function Timeout":**
   - Upgrade to Vercel Pro (60s timeout)
   - Or optimize model/preprocessing

2. **"Payload Too Large":**
   - Reduce file size
   - Or increase limit in `next.config.js`

3. **"Model Not Found":**
   - Verify model file path
   - Check file permissions
   - Ensure model is in repository or accessible

## 📊 Monitoring

### Vercel Analytics

- Go to your project → Analytics
- Monitor:
  - Page views
  - Function execution time
  - Error rates

### Python API Monitoring

- Check platform logs:
  - Render: Dashboard → Logs
  - Railway: Deployments → Logs
  - Cloud Run: Logs Explorer

## 🔒 Security Recommendations

1. **Add Authentication:**
   - Use NextAuth.js for user login
   - Or API key system

2. **Rate Limiting:**
   - Add rate limiting to API routes
   - Use Vercel Edge Config or Upstash

3. **Input Validation:**
   - Already implemented in API routes
   - Add file type/size validation

4. **HTTPS:**
   - Automatic on Vercel
   - Ensure Python API uses HTTPS

## 🚀 Performance Optimization

1. **Enable Caching:**
   - Cache static assets
   - Use Vercel Edge Network

2. **Optimize Images:**
   - Use Next.js Image component
   - Enable image optimization

3. **Reduce Bundle Size:**
   - Code splitting
   - Dynamic imports (already done for Plotly)

## 📝 Next Steps

1. Set up custom domain
2. Add analytics (Vercel Analytics, Google Analytics)
3. Set up error monitoring (Sentry)
4. Add user authentication
5. Implement rate limiting
6. Add more comprehensive logging

## 🆘 Need Help?

- Check Vercel docs: https://vercel.com/docs
- Check Python API logs
- Review error messages in browser console
- Check Vercel function logs

## ✨ Success!

Your brain tumor detection app is now live and ready for real-world use! 🎉

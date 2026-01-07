# Quick Start Guide

Get your brain tumor detection app running in 5 minutes!

## 🚀 Fastest Path to Production

### 1. Deploy Python API (2 minutes)

**Using Render (Free):**

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - Root Directory: `vercel-app/python-api`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn inference_api:app --host 0.0.0.0 --port $PORT`
5. Deploy and copy the URL

### 2. Deploy Next.js App (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Set Root Directory: `vercel-app`
4. Add Environment Variable:
   - `INFERENCE_API_URL` = `https://your-render-url.onrender.com/predict`
5. Deploy!

### 3. Test (1 minute)

1. Open your Vercel URL
2. Upload 4 MRI files (T1, T1ce, T2, FLAIR)
3. Click "Detect Brain Tumor"
4. View results! 🎉

## 📝 What You Need

- GitHub repository with your code
- Vercel account (free)
- Render account (free) or similar
- Your trained model file (`brain_tumor_model.keras`)

## ⚡ That's It!

Your app is now live and ready to detect brain tumors from MRI scans!

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

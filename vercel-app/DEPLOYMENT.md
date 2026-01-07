# Deployment Guide for Vercel

This guide will help you deploy the Brain Tumor Detection application to Vercel.

## 📋 Pre-Deployment Checklist

- [ ] Model converted to TensorFlow.js format
- [ ] Model files hosted on CDN or Vercel Blob Storage
- [ ] Environment variables configured
- [ ] All dependencies installed
- [ ] Application tested locally

## 🔄 Step-by-Step Deployment

### 1. Prepare Your Model

Since Vercel has file size limitations, you need to host your model externally or convert it properly.

**Option A: Host Model on CDN (Recommended)**
1. Convert your Keras model:
   ```bash
   cd vercel-app
   chmod +x scripts/convert-model.sh
   ./scripts/convert-model.sh
   ```
2. Upload model files to:
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Blob Storage
   - Vercel Blob Storage
3. Update `MODEL_CDN_URL` in environment variables

**Option B: Use Git LFS for Model Files**
1. Install Git LFS: `git lfs install`
2. Track model files: `git lfs track "*.keras" "*.h5"`
3. Push to repository

### 2. Set Up Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - `MODEL_CDN_URL`: URL to your model.json
   - `NODE_ENV`: `production`

### 3. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd vercel-app
vercel

# For production
vercel --prod
```

### 4. Deploy via GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure:
   - **Root Directory**: `vercel-app`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables
6. Deploy!

## ⚙️ Vercel Configuration

The `vercel.json` file is already configured with:
- **Function Timeout**: 60 seconds (requires Vercel Pro)
- **CORS Headers**: Enabled for API routes
- **File Size Limits**: 50MB per request

### Vercel Plan Requirements

- **Hobby Plan**: 10s function timeout (may not be enough for large MRI processing)
- **Pro Plan**: 60s function timeout (recommended for production)
- **Enterprise**: Custom limits

## 🔧 Troubleshooting

### Issue: "Function Timeout"
**Solution**: 
- Upgrade to Vercel Pro plan
- Optimize model size
- Use serverless function caching
- Process files in chunks

### Issue: "Payload Too Large"
**Solution**:
- Increase limit in `next.config.js`
- Compress files before upload
- Use streaming for large files

### Issue: "Model Not Loading"
**Solution**:
- Verify model URL is accessible
- Check CORS settings on CDN
- Ensure model is in TensorFlow.js format
- Check environment variables

### Issue: "Memory Limit Exceeded"
**Solution**:
- Use model quantization
- Reduce batch size
- Use smaller input resolution
- Consider using external ML service

## 🚀 Performance Optimization

1. **Enable Edge Caching**:
   - Cache static model files
   - Use Vercel Edge Network

2. **Optimize Model**:
   - Quantize model weights
   - Use TensorFlow.js quantization
   - Reduce model size

3. **Use Serverless Functions Efficiently**:
   - Cache model in global scope
   - Reuse connections
   - Minimize cold starts

## 📊 Monitoring

After deployment:
1. Check Vercel Analytics
2. Monitor function execution time
3. Track error rates
4. Monitor API usage

## 🔐 Security Considerations

1. **Add Authentication**:
   - Use NextAuth.js
   - Implement API key system
   - Rate limiting

2. **Validate Inputs**:
   - Check file types
   - Validate file sizes
   - Sanitize inputs

3. **Secure Model Files**:
   - Use signed URLs
   - Implement access control
   - Monitor usage

## 📝 Post-Deployment

1. Test all functionality
2. Monitor performance
3. Set up error alerts
4. Configure custom domain (optional)
5. Enable HTTPS (automatic on Vercel)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)

# MRI-Based Brain Tumor Detection – Md Taibur Rahaman (Bangladesh)

A production-ready Next.js web application for MRI-based brain tumor detection and segmentation, optimized for Vercel deployment. Built and maintained by **Md Taibur Rahaman (Bangladesh)**.

## 🚀 Features

- **Modern Web Interface**: Beautiful, responsive UI built with Next.js 14 and Tailwind CSS
- **Multi-Modality Support**: Upload and process T1, T1ce, T2, and FLAIR MRI sequences
- **3D Visualization**: Interactive 3D visualization of tumor segmentation using Plotly
- **Real-time Processing**: Fast inference with optimized preprocessing
- **Production Ready**: Configured for easy deployment on Vercel
- **TypeScript**: Fully typed for better development experience

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for deployment)

## 🛠️ Installation

1. **Navigate to the vercel-app directory:**
   ```bash
   cd vercel-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   # Optional: Model path or CDN URL
   MODEL_URL=/path/to/model
   # or
   MODEL_CDN_URL=https://your-cdn.com/model
   ```

## 🔧 Inference Setup

This application supports two inference methods for production use:

### Option A: External Python API (Recommended - Best Accuracy) ⭐

For the most accurate predictions, deploy the Python inference API separately:

1. **Deploy Python API:**
   - See `python-api/README.md` for detailed instructions
   - Recommended platforms: Render (free tier), Railway, Google Cloud Run
   - The API uses your trained Keras model directly for maximum accuracy

2. **Configure Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `INFERENCE_API_URL` = `https://your-python-api-url.com/predict`
   - Redeploy your Next.js app

3. **Benefits:**
   - ✅ Full model accuracy (no conversion needed)
   - ✅ Better performance with Python/TensorFlow
   - ✅ Handles large files efficiently
   - ✅ Proper NIfTI file parsing with nibabel

### Option B: TensorFlow.js (Fallback)

If you prefer to run inference directly in Vercel:

1. **Convert your model:**
   ```bash
   cd vercel-app
   chmod +x scripts/convert-model.sh
   ./scripts/convert-model.sh
   ```

2. **Host model files:**
   - Upload to CDN (AWS S3, Cloudflare, etc.)
   - Or use Vercel Blob Storage

3. **Set environment variable:**
   - `MODEL_CDN_URL` = `https://your-cdn.com/model/model.json`

4. **Note:** TensorFlow.js may have slightly lower accuracy due to model conversion and JavaScript limitations.

## 🏃 Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### Step 1: Deploy Python API (Recommended)

First, deploy the Python inference API for best accuracy:

1. **Choose a platform** (Render recommended for free tier):
   - [Render](https://render.com) - Free tier available
   - [Railway](https://railway.app) - Free tier available
   - [Google Cloud Run](https://cloud.google.com/run) - Pay per use
   - See `python-api/README.md` for detailed instructions

2. **Deploy the API:**
   - Follow the platform-specific guide in `python-api/README.md`
   - Note your API URL (e.g., `https://brain-tumor-api.onrender.com`)

### Step 2: Deploy Next.js App to Vercel

#### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd vercel-app
   vercel
   ```

4. **Set environment variables:**
   ```bash
   vercel env add INFERENCE_API_URL
   # Enter your Python API URL when prompted
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import project on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import" and select your GitHub repository
   - Configure:
     - **Root Directory**: `vercel-app`
     - **Framework Preset**: Next.js (auto-detected)
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)

3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add: `INFERENCE_API_URL` = `https://your-python-api-url.com/predict`
   - Select all environments (Production, Preview, Development)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Important Vercel Configuration

- **Function Timeout**: Increased to 60 seconds in `vercel.json` for model inference
- **File Size Limits**: API routes handle up to 50MB (configured in `next.config.js`)
- **Model Files**: Large model files should be hosted externally or use Vercel Blob Storage

## 📁 Project Structure

```
vercel-app/
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.ts          # API endpoint for predictions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── FileUpload.tsx            # File upload component
│   └── PredictionResults.tsx     # Results visualization
├── lib/
│   ├── model-loader.ts           # Model loading utilities
│   └── utils.ts                  # Image processing utilities
├── public/
│   └── models/                   # TensorFlow.js models (if hosting locally)
├── next.config.js                # Next.js configuration
├── vercel.json                   # Vercel configuration
└── package.json                  # Dependencies
```

## 🔍 API Endpoint

### POST `/api/predict`

Predicts brain tumor segmentation from uploaded MRI files.

**Request:**
- `Content-Type: multipart/form-data`
- Form fields:
  - `t1`: T1-weighted MRI file (.nii)
  - `t1ce`: T1ce-weighted MRI file (.nii)
  - `t2`: T2-weighted MRI file (.nii)
  - `flair`: FLAIR MRI file (.nii)

**Response:**
```json
{
  "success": true,
  "prediction": [...],
  "shape": [128, 128, 96],
  "statistics": {
    "totalVoxels": 1572864,
    "tumorVoxels": 12345,
    "tumorPercentage": 0.78,
    "regions": {
      "1": {
        "name": "NCR/NET",
        "voxels": 5000,
        "percentage": 0.32
      },
      ...
    }
  },
  "timestamp": "2024-01-07T12:00:00.000Z"
}
```

## 🎨 Customization

### Styling
The app uses Tailwind CSS. Customize colors in `tailwind.config.js`.

### Model Improvements
To improve accuracy, consider:
- Better preprocessing (enhanced normalization, noise reduction)
- Data augmentation during training
- Ensemble models
- Fine-tuning on domain-specific data

## ⚠️ Important Notes

1. **File Format**: Currently supports uncompressed `.nii` files. For `.nii.gz` files, use the Python API which handles gzip decompression.

2. **File Size Limits**: 
   - Vercel: 50MB per request (configured in `next.config.js`)
   - Python API: Depends on hosting platform (typically 100MB)
   - For larger files, consider compression or chunked uploads

3. **Processing Time**: 
   - Vercel Hobby: 10s timeout (may not be enough)
   - Vercel Pro: 60s timeout (recommended)
   - Python API: No timeout limits (depends on platform)

4. **Accuracy**: 
   - Python API: Full model accuracy (recommended)
   - TensorFlow.js: Slightly lower due to conversion, but still good

5. **Security**: For production, consider:
   - Adding authentication (NextAuth.js, API keys)
   - Rate limiting
   - Input validation (already implemented)
   - HTTPS only (automatic on Vercel)

## 🐛 Troubleshooting

### Common Issues

**Issue: "Function Timeout"**
- Solution: Upgrade to Vercel Pro or use Python API

**Issue: "Payload Too Large"**
- Solution: Ensure files are under 50MB, or increase limit in `next.config.js`

**Issue: "Model Not Loading"**
- Solution: Check `MODEL_CDN_URL` or `INFERENCE_API_URL` environment variable

**Issue: "NIfTI Parsing Failed"**
- Solution: Ensure files are valid uncompressed `.nii` files (not `.nii.gz`)

**Issue: "External API Error"**
- Solution: Check Python API is running and accessible, verify CORS settings

## 📝 License

This project is part of CSE499 coursework. Please refer to the original dataset licenses for usage terms.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or issues, please open an issue on GitHub.

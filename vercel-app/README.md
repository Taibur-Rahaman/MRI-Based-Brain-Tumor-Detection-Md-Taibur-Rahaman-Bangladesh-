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

## 🔧 Inference Setup (External API Recommended)

This Vercel deployment uses a lightweight API that can proxy your upload to an external inference service.

### Option A: Use an external inference API (recommended)
1. Deploy your model behind an HTTPS endpoint (e.g., FastAPI on Render/Cloud Run, or Gradio/Hugging Face Spaces).
2. Set the environment variable on Vercel:
   - In Project Settings → Environment Variables:
     - `INFERENCE_API_URL` = `https://your-inference.example.com/predict`
3. The API route will forward the uploaded files to this URL and return the result to the UI.

### Option B: Keep mock predictions (no model)
If `INFERENCE_API_URL` is not set, the API returns mock predictions for demo purposes. This requires no model on Vercel.

## 🏃 Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd vercel-app
   vercel
   ```

3. **Follow the prompts** to link your project and deploy.

### Option 2: Deploy via GitHub

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel app"
   git push
   ```

2. **Import project on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `vercel-app`
   - Deploy!

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

1. **Model Size**: Large model files may exceed Vercel's limits. Consider:
   - Using Git LFS
   - Hosting models externally
   - Using model compression/quantization

2. **Processing Time**: MRI processing can be slow. Vercel Pro plan recommended for production (60s timeout).

3. **File Parsing**: The current implementation uses mock data. For production, integrate a proper NIfTI parser like:
   - `nifti-reader-js`
   - `nifti-js`

4. **Security**: Add authentication and rate limiting for production use.

## 📝 License

This project is part of CSE499 coursework. Please refer to the original dataset licenses for usage terms.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or issues, please open an issue on GitHub.

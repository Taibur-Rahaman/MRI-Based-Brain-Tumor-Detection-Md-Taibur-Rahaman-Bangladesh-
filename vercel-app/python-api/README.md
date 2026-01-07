# Python Inference API for Brain Tumor Detection

This is a FastAPI server that provides accurate brain tumor detection inference using the trained Keras model. Deploy this separately from your Next.js app for better accuracy and performance.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Place your model file:**
   - Copy `brain_tumor_model.keras` to this directory
   - Or update `MODEL_PATH` in `inference_api.py`

3. **Run the server:**
   ```bash
   python inference_api.py
   ```
   Or with uvicorn:
   ```bash
   uvicorn inference_api:app --host 0.0.0.0 --port 8000
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:8000/health
   ```

## 📦 Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set:
   - **Build Command**: `pip install -r python-api/requirements.txt`
   - **Start Command**: `cd python-api && uvicorn inference_api:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3
4. Add environment variables if needed
5. Deploy!

### Option 2: Railway

1. Create new project on [Railway](https://railway.app)
2. Connect GitHub repo
3. Add Python service
4. Set start command: `cd python-api && uvicorn inference_api:app --host 0.0.0.0 --port $PORT`
5. Deploy!

### Option 3: Google Cloud Run

1. Build container:
   ```bash
   cd python-api
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/brain-tumor-api
   ```

2. Deploy:
   ```bash
   gcloud run deploy brain-tumor-api \
     --image gcr.io/YOUR_PROJECT/brain-tumor-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Option 4: AWS Lambda (with Serverless Framework)

1. Install serverless:
   ```bash
   npm install -g serverless
   ```

2. Deploy:
   ```bash
   serverless deploy
   ```

## 🔧 Configuration

### Environment Variables

- `MODEL_PATH`: Path to your Keras model file (default: `brain_tumor_model.keras`)
- `PORT`: Server port (default: 8000)

### Model Setup

1. Convert your model if needed:
   ```python
   import tensorflow as tf
   model = tf.keras.models.load_model('path/to/your/model.h5')
   model.save('brain_tumor_model.keras')
   ```

2. Ensure custom objects are compatible (dice loss, etc.)

## 📡 API Endpoints

### POST `/predict`

Predict brain tumor segmentation from MRI files.

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
    "regions": {...}
  },
  "timestamp": "2024-01-07T12:00:00.000Z",
  "method": "python_api"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## 🔗 Connect to Next.js App

After deploying, set the environment variable in your Vercel project:

```
INFERENCE_API_URL=https://your-api-url.com/predict
```

## 🐳 Docker Support

Create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY python-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY python-api/ .
COPY cse499_brain_tumor_model-keras-default-v1/brain_tumor_model.keras .

EXPOSE 8000

CMD ["uvicorn", "inference_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t brain-tumor-api .
docker run -p 8000:8000 brain-tumor-api
```

## ⚠️ Important Notes

1. **Model Size**: Large models may require more memory. Consider:
   - Using model quantization
   - Increasing memory allocation on your hosting platform
   - Using GPU instances for faster inference

2. **File Size Limits**: Adjust based on your hosting platform:
   - Render: 100MB request limit
   - Railway: 100MB request limit
   - Cloud Run: Configurable

3. **Cold Starts**: Serverless platforms may have cold start delays. Consider:
   - Using always-on instances
   - Implementing health checks to keep warm
   - Using provisioned concurrency

## 🔒 Security

For production, consider:
- Adding authentication (API keys, JWT)
- Rate limiting
- Input validation
- CORS restrictions
- HTTPS only

## 📊 Monitoring

Monitor your API:
- Response times
- Error rates
- Memory usage
- Model loading times

## 🆘 Troubleshooting

### Model not loading
- Check model path
- Verify custom objects are defined correctly
- Check file permissions

### Out of memory
- Reduce batch size
- Use model quantization
- Increase instance memory

### Slow inference
- Use GPU instances
- Optimize preprocessing
- Cache model in memory

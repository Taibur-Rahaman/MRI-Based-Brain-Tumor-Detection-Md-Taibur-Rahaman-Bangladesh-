"""
Python FastAPI server for brain tumor detection inference
Deploy this separately (Render, Railway, Google Cloud Run, etc.) for better accuracy
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import nibabel as nib
from io import BytesIO
import tensorflow as tf
from typing import List
import json
from datetime import datetime

app = FastAPI(title="Brain Tumor Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None
MODEL_PATH = "brain_tumor_model.keras"  # Update this path

def load_custom_objects():
    """Define custom loss and metric functions"""
    def dice_loss(y_true, y_pred, smooth=1.0):
        import tensorflow.keras.backend as K
        y_true_f = K.flatten(y_true)
        y_pred_f = K.flatten(y_pred)
        intersection = K.sum(y_true_f * y_pred_f)
        dice = (2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)
        return 1 - dice
    
    def combined_loss(y_true, y_pred):
        dice = dice_loss(y_true, y_pred)
        ce = tf.keras.losses.categorical_crossentropy(y_true, y_pred)
        return dice + ce
    
    return {
        'dice_loss': dice_loss,
        'combined_loss': combined_loss,
    }

def load_model():
    """Load the trained model"""
    global model
    if model is None:
        try:
            custom_objects = load_custom_objects()
            model = tf.keras.models.load_model(MODEL_PATH, custom_objects=custom_objects)
            print(f"Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    return model

def preprocess_mri(volume: np.ndarray) -> np.ndarray:
    """Preprocess MRI volume with normalization"""
    # Clip outliers (top and bottom 1%)
    flat = volume.flatten()
    sorted_flat = np.sort(flat)
    min_percentile = sorted_flat[int(len(sorted_flat) * 0.01)]
    max_percentile = sorted_flat[int(len(sorted_flat) * 0.99)]
    
    # Normalize to [0, 1]
    range_val = max_percentile - min_percentile
    if range_val < 1e-6:
        range_val = 1e-6
    
    normalized = np.clip(volume, min_percentile, max_percentile)
    normalized = (normalized - min_percentile) / range_val
    
    # Apply noise reduction
    normalized[normalized < 0.05] = 0
    
    return normalized.astype(np.float32)

def resize_volume(volume: np.ndarray, target_shape: tuple = (128, 128, 96)) -> np.ndarray:
    """Resize volume to target shape using nearest neighbor"""
    from scipy.ndimage import zoom
    
    current_shape = volume.shape
    zoom_factors = [
        target_shape[i] / current_shape[i] 
        for i in range(len(current_shape))
    ]
    
    resized = zoom(volume, zoom_factors, order=0, mode='nearest')
    return resized.astype(np.float32)

def parse_nifti(file_content: bytes) -> np.ndarray:
    """Parse NIfTI file from bytes"""
    try:
        nii_file = BytesIO(file_content)
        nii_img = nib.load(nii_file)
        data = nii_img.get_fdata()
        return data
    except Exception as e:
        raise ValueError(f"Failed to parse NIfTI file: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model()
    except Exception as e:
        print(f"Warning: Could not load model on startup: {e}")
        print("Model will be loaded on first request")

@app.get("/")
async def root():
    return {
        "message": "Brain Tumor Detection API",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict(
    t1: UploadFile = File(...),
    t1ce: UploadFile = File(...),
    t2: UploadFile = File(...),
    flair: UploadFile = File(...)
):
    """
    Predict brain tumor segmentation from MRI files
    """
    try:
        # Load model if not already loaded
        if model is None:
            load_model()
        
        # Read and parse NIfTI files
        t1_content = await t1.read()
        t1ce_content = await t1ce.read()
        t2_content = await t2.read()
        flair_content = await flair.read()
        
        t1_data = parse_nifti(t1_content)
        t1ce_data = parse_nifti(t1ce_content)
        t2_data = parse_nifti(t2_content)
        flair_data = parse_nifti(flair_content)
        
        # Preprocess
        t1_processed = preprocess_mri(t1_data)
        t1ce_processed = preprocess_mri(t1ce_data)
        t2_processed = preprocess_mri(t2_data)
        flair_processed = preprocess_mri(flair_data)
        
        # Resize to model input size
        target_shape = (128, 128, 96)
        t1_resized = resize_volume(t1_processed, target_shape)
        t1ce_resized = resize_volume(t1ce_processed, target_shape)
        t2_resized = resize_volume(t2_processed, target_shape)
        flair_resized = resize_volume(flair_processed, target_shape)
        
        # Stack modalities: [H, W, D, 4]
        stacked = np.stack([t1_resized, t1ce_resized, t2_resized, flair_resized], axis=-1)
        
        # Add batch dimension: [1, H, W, D, 4]
        input_tensor = np.expand_dims(stacked, axis=0)
        
        # Run inference
        prediction = model.predict(input_tensor, verbose=0)
        
        # Get class predictions (argmax over last dimension)
        predicted_classes = np.argmax(prediction[0], axis=-1)
        
        # Flatten to 1D array
        prediction_flat = predicted_classes.flatten().tolist()
        
        # Calculate statistics
        total_voxels = target_shape[0] * target_shape[1] * target_shape[2]
        unique, counts = np.unique(predicted_classes, return_counts=True)
        
        region_counts = {int(u): int(c) for u, c in zip(unique, counts)}
        tumor_voxels = total_voxels - region_counts.get(0, 0)
        tumor_percentage = (tumor_voxels / total_voxels) * 100
        
        tumor_labels = {
            0: "Background",
            1: "NCR/NET",
            2: "Edema",
            3: "Enhancing Tumor"
        }
        
        regions = {}
        for class_id, count in region_counts.items():
            if class_id > 0:
                regions[class_id] = {
                    "name": tumor_labels.get(class_id, f"Class {class_id}"),
                    "voxels": count,
                    "percentage": (count / total_voxels) * 100
                }
        
        statistics = {
            "totalVoxels": int(total_voxels),
            "tumorVoxels": int(tumor_voxels),
            "tumorPercentage": float(tumor_percentage),
            "regions": regions
        }
        
        return JSONResponse({
            "success": True,
            "prediction": prediction_flat,
            "shape": list(target_shape),
            "statistics": statistics,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "method": "python_api"
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

/**
 * API Route for Brain Tumor Detection Prediction
 * 
 * Note: For Vercel deployment, you may need to:
 * 1. Convert Keras model to TensorFlow.js format
 * 2. Host model files on a CDN or use Vercel Blob Storage
 * 3. Consider using a dedicated ML inference service for large models
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTumorStatistics } from '@/lib/utils';

// Model loading (should be initialized once and reused)
let model: any | null = null;

async function loadModelOnce() {
  if (!model) {
    try {
      // Option 1: Load from local converted model
      // model = await tf.loadLayersModel('file:///path/to/model/model.json');
      
      // Option 2: Load from CDN/hosted URL
      // model = await tf.loadLayersModel('https://your-cdn.com/model/model.json');
      
      // For now, return null if model not available
      // In production, ensure model is converted to TF.js format and accessible
      console.warn('Model not loaded. Please configure model path.');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }
  return model;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get uploaded files
    const t1File = formData.get('t1') as File | null;
    const t1ceFile = formData.get('t1ce') as File | null;
    const t2File = formData.get('t2') as File | null;
    const flairFile = formData.get('flair') as File | null;
    
    if (!t1File || !t1ceFile || !t2File || !flairFile) {
      return NextResponse.json(
        { error: 'All four MRI modalities (T1, T1ce, T2, FLAIR) are required' },
        { status: 400 }
      );
    }

    // Load model
    const loadedModel = await loadModelOnce();
    if (!loadedModel) {
      return NextResponse.json(
        { error: 'Model not available. Please ensure model is properly configured.' },
        { status: 503 }
      );
    }

    // Process files (simplified - in production, use proper NIfTI parser)
    // For now, we'll return a mock response structure
    // You'll need to implement proper NIfTI file parsing using a library like 'nifti-reader-js'
    
    // Mock processing for demonstration
    const processedData = {
      shape: [128, 128, 96] as [number, number, number],
      processed: true
    };

    // Generate prediction (mock - replace with actual model inference)
    // For our current visualization/statistics we only need a single class
    // label per voxel, so we generate a 1D array of length H * W * D with
    // values in [0, 3] corresponding to background and 3 tumor classes.
    const [H, W, D] = processedData.shape;
    const voxelCount = H * W * D;
    const mockPrediction = Array.from({ length: voxelCount }, () =>
      Math.floor(Math.random() * 4)
    );

    // Extract statistics
    const statistics = extractTumorStatistics(mockPrediction, processedData.shape);

    // Return response
    return NextResponse.json({
      success: true,
      prediction: mockPrediction,
      shape: processedData.shape,
      statistics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { 
        error: 'Prediction failed', 
        message: error.message || 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
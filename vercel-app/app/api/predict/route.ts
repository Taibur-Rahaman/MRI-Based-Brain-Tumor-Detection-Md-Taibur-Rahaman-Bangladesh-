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

    // If external inference API is configured, proxy the request there
    const externalUrl = process.env.INFERENCE_API_URL;
    if (externalUrl) {
      const proxied = await fetch(externalUrl, {
        method: 'POST',
        body: formData as any,
      });
      if (!proxied.ok) {
        const errText = await proxied.text();
        return NextResponse.json(
          { error: 'Upstream inference failed', details: errText },
          { status: proxied.status }
        );
      }
      const json = await proxied.json();
      return NextResponse.json(json);
    }

    // Process files (simplified - in production, use proper NIfTI parser)
    // For now, we'll return a mock response structure (no TF on Vercel)
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
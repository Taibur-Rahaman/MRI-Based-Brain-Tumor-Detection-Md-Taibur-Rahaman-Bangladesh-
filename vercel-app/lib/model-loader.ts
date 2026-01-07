/**
 * Model loading utilities - Serverless compatible
 * Works in Vercel serverless functions without Node.js fs
 */

import * as tf from '@tensorflow/tfjs';

// Custom loss and metric functions
export function diceLoss(yTrue: tf.Tensor, yPred: tf.Tensor, smooth: number = 1.0): tf.Scalar {
  const intersection = tf.sum(tf.mul(yTrue, yPred));
  const union = tf.add(tf.sum(yTrue), tf.sum(yPred));
  const dice = tf.div(tf.add(tf.mul(intersection, 2), smooth), tf.add(union, smooth));
  return tf.sub(1, dice);
}

export function diceCoefficient(yTrue: tf.Tensor, yPred: tf.Tensor, smooth: number = 1.0): tf.Scalar {
  const intersection = tf.sum(tf.mul(yTrue, yPred));
  const union = tf.add(tf.sum(yTrue), tf.sum(yPred));
  return tf.div(tf.add(tf.mul(intersection, 2), smooth), tf.add(union, smooth));
}

export function combinedLoss(yTrue: tf.Tensor, yPred: tf.Tensor): tf.Scalar {
  const dice = diceLoss(yTrue, yPred);
  const crossEntropy = tf.losses.softmaxCrossEntropy(yTrue, yPred);
  return tf.add(dice, crossEntropy);
}

// Global model cache for serverless functions
let cachedModel: tf.LayersModel | null = null;

/**
 * Load model from URL (CDN or external storage)
 * Serverless-compatible - works in Vercel functions
 */
export async function loadModel(modelUrl?: string): Promise<tf.LayersModel> {
  try {
    // Return cached model if available
    if (cachedModel) {
      return cachedModel;
    }

    // Get model URL from environment or parameter
    const url = modelUrl || process.env.MODEL_CDN_URL || process.env.NEXT_PUBLIC_MODEL_URL;
    
    if (!url) {
      throw new Error('Model URL not provided. Set MODEL_CDN_URL or NEXT_PUBLIC_MODEL_URL environment variable.');
    }

    // Load model from URL (TensorFlow.js format)
    const model = await tf.loadLayersModel(url);
    
    // Cache the model for reuse in serverless functions
    cachedModel = model;
    
    return model;
  } catch (error: any) {
    console.error('Error loading model:', error);
    throw new Error(`Failed to load model: ${error.message}`);
  }
}

/**
 * Clear model cache (useful for testing or memory management)
 */
export function clearModelCache(): void {
  if (cachedModel) {
    cachedModel.dispose();
    cachedModel = null;
  }
}
/**
 * Model loading utilities with custom objects support
 */

import * as tf from '@tensorflow/tfjs';
import path from 'path';
import fs from 'fs';

// Custom Dice Coefficient metric class
export class DiceCoefficient extends tf.metrics.Metric {
  classId: number;
  diceSum: tf.Scalar;
  count: tf.Scalar;

  constructor(classId: number, name: string = 'dice_coefficient') {
    super(name);
    this.classId = classId;
    this.diceSum = tf.scalar(0);
    this.count = tf.scalar(0);
  }

  updateState(yTrue: tf.Tensor, yPred: tf.Tensor, sampleWeight?: tf.Tensor): void {
    // Implementation for dice coefficient calculation
    const yTrueMask = tf.cast(tf.gather(yTrue, this.classId, -1), 'float32');
    const yPredClass = tf.argMax(yPred, -1);
    const yPredMask = tf.cast(tf.equal(yPredClass, this.classId), 'float32');
    
    const intersection = tf.sum(tf.mul(yTrueMask, yPredMask));
    const union = tf.add(tf.sum(yTrueMask), tf.sum(yPredMask));
    const dice = tf.div(tf.add(tf.mul(intersection, 2), 1), tf.add(union, 1));
    
    this.diceSum = tf.add(this.diceSum, dice);
    this.count = tf.add(this.count, 1);
  }

  result(): tf.Scalar {
    return tf.div(this.diceSum, this.count);
  }

  resetStates(): void {
    this.diceSum = tf.scalar(0);
    this.count = tf.scalar(0);
  }
}

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

/**
 * Load model with custom objects
 * Note: In production, you may need to convert the Keras model to TensorFlow.js format
 */
export async function loadModel(modelPath: string): Promise<tf.LayersModel> {
  try {
    // For Vercel deployment, the model should be converted to TensorFlow.js format
    // You can convert using: tensorflowjs_converter --input_format keras model.h5 model_js/
    
    // Try loading from local path first
    if (fs.existsSync(modelPath)) {
      const model = await tf.loadLayersModel(`file://${modelPath}`);
      return model;
    }
    
    // Fallback: load from URL (if hosted elsewhere)
    throw new Error(`Model not found at ${modelPath}. Please convert to TensorFlow.js format.`);
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
}
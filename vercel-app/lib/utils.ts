/**
 * Utility functions for image processing and model inference
 */

import * as tf from '@tensorflow/tfjs-node';

export interface ModalityMap {
  FLAIR: number;
  T1ce: number;
  T1: number;
  T2: number;
}

export const modalityMap: ModalityMap = {
  'FLAIR': 0,
  'T1ce': 1,
  'T1': 2,
  'T2': 3
};

export interface TumorLabels {
  [key: number]: {
    name: string;
    color: string;
    description: string;
  };
}

export const tumorLabels: TumorLabels = {
  0: { name: 'Background', color: '#000000', description: 'No tumor tissue' },
  1: { name: 'NCR/NET', color: '#3498db', description: 'Necrotic and Non-Enhancing Tumor' },
  2: { name: 'Edema', color: '#2ecc71', description: 'Peritumoral Edema' },
  3: { name: 'Enhancing Tumor', color: '#e74c3c', description: 'GD-enhancing Tumor' }
};

/**
 * Enhanced preprocessing with better normalization
 */
export function preprocessMRI(volume: number[] | Float32Array | number[][][], shape?: number[]): Float32Array {
  let vol: Float32Array;
  
  if (volume instanceof Float32Array) {
    vol = volume;
  } else if (Array.isArray(volume)) {
    // Flatten nested arrays
    const flat = volume.flat(Infinity) as number[];
    vol = new Float32Array(flat);
  } else {
    throw new Error('Invalid volume type');
  }

  // Clip outliers (top and bottom 1%)
  const sorted = Array.from(vol).sort((a, b) => a - b);
  const minPercentile = sorted[Math.floor(sorted.length * 0.01)];
  const maxPercentile = sorted[Math.floor(sorted.length * 0.99)];
  
  // Normalize to [0, 1] range with outlier clipping
  const range = maxPercentile - minPercentile || 1e-6;
  const normalized = new Float32Array(vol.length);
  
  for (let i = 0; i < vol.length; i++) {
    const clipped = Math.max(minPercentile, Math.min(maxPercentile, vol[i]));
    normalized[i] = (clipped - minPercentile) / range;
  }

  // Apply noise reduction threshold
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i] < 0.05) {
      normalized[i] = 0;
    }
  }

  return normalized;
}

/**
 * Enhanced volume resizing with better interpolation
 */
export function resizeVolume(
  img: Float32Array | number[][][],
  currentShape: [number, number, number],
  desiredShape: [number, number, number] = [128, 128, 96]
): Float32Array {
  const [h, w, d] = currentShape;
  const [newH, newW, newD] = desiredShape;
  
  // Convert to 3D array if needed
  let volume: number[][][];
  if (img instanceof Float32Array) {
    volume = new Array(h);
    for (let i = 0; i < h; i++) {
      volume[i] = new Array(w);
      for (let j = 0; j < w; j++) {
        volume[i][j] = Array.from(img.slice(i * w * d + j * d, i * w * d + j * d + d));
      }
    }
  } else {
    volume = img as number[][][];
  }

  // Simple nearest-neighbor resizing (for production, consider trilinear interpolation)
  const resized = new Float32Array(newH * newW * newD);
  
  for (let i = 0; i < newH; i++) {
    for (let j = 0; j < newW; j++) {
      for (let k = 0; k < newD; k++) {
        const srcI = Math.floor((i / newH) * h);
        const srcJ = Math.floor((j / newW) * w);
        const srcK = Math.floor((k / newD) * d);
        
        const srcIdx = srcI * w * d + srcJ * d + srcK;
        const newIdx = i * newW * newD + j * newD + k;
        
        if (srcIdx >= 0 && srcIdx < h * w * d) {
          resized[newIdx] = volume[srcI]?.[srcJ]?.[srcK] || 0;
        }
      }
    }
  }

  return resized;
}

/**
 * Stack multiple MRI modalities
 */
export function stackModalities(
  t1: Float32Array,
  t1ce: Float32Array,
  t2: Float32Array,
  flair: Float32Array,
  shape: [number, number, number] = [128, 128, 96]
): Float32Array {
  const [h, w, d] = shape;
  const total = h * w * d;
  const stacked = new Float32Array(total * 4);
  
  // Stack as [T1, T1ce, T2, FLAIR]
  for (let i = 0; i < total; i++) {
    stacked[i * 4 + 0] = t1[i] || 0;
    stacked[i * 4 + 1] = t1ce[i] || 0;
    stacked[i * 4 + 2] = t2[i] || 0;
    stacked[i * 4 + 3] = flair[i] || 0;
  }
  
  return stacked;
}

/**
 * Calculate Dice coefficient for accuracy metrics
 */
export function calculateDiceCoefficient(
  pred: Float32Array,
  trueMask: Float32Array,
  classId: number
): number {
  let intersection = 0;
  let union = 0;
  
  for (let i = 0; i < pred.length; i++) {
    const predClass = pred[i] === classId ? 1 : 0;
    const trueClass = trueMask[i] === classId ? 1 : 0;
    
    intersection += predClass * trueClass;
    union += predClass + trueClass;
  }
  
  return (2 * intersection + 1) / (union + 1);
}

/**
 * Extract tumor statistics from prediction
 */
export function extractTumorStatistics(prediction: number[], shape: [number, number, number]): {
  totalVoxels: number;
  tumorVoxels: number;
  tumorPercentage: number;
  regions: {
    [key: number]: {
      name: string;
      voxels: number;
      percentage: number;
    };
  };
} {
  const [h, w, d] = shape;
  const totalVoxels = h * w * d;
  const regionCounts: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };
  
  for (let i = 0; i < prediction.length; i++) {
    const classId = prediction[i];
    regionCounts[classId] = (regionCounts[classId] || 0) + 1;
  }
  
  const tumorVoxels = totalVoxels - regionCounts[0];
  const tumorPercentage = (tumorVoxels / totalVoxels) * 100;
  
  const regions: any = {};
  for (const [classId, count] of Object.entries(regionCounts)) {
    const id = parseInt(classId);
    if (id > 0) {
      regions[id] = {
        name: tumorLabels[id].name,
        voxels: count,
        percentage: (count / totalVoxels) * 100
      };
    }
  }
  
  return {
    totalVoxels,
    tumorVoxels,
    tumorPercentage,
    regions
  };
}

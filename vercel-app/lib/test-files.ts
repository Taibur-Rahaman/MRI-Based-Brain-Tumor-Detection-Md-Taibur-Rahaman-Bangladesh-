/**
 * Test file utilities - provides sample/demo data
 */

export interface TestFile {
  name: string;
  description: string;
  url: string;
  type: 'nifti' | 'image';
}

/**
 * Generate mock prediction data for testing/demo
 */
export function generateMockPrediction(shape: [number, number, number] = [128, 128, 96]): {
  prediction: number[];
  shape: [number, number, number];
} {
  const [h, w, d] = shape;
  const voxelCount = h * w * d;
  
  // Generate more realistic mock data with tumor regions
  const prediction: number[] = [];
  
  // Create some tumor-like regions
  const centerX = w / 2;
  const centerY = h / 2;
  const centerZ = d / 2;
  
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      for (let k = 0; k < d; k++) {
        const dx = i - centerX;
        const dy = j - centerY;
        const dz = k - centerZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Create tumor regions at different distances
        if (dist < 15) {
          // Core tumor (enhancing)
          prediction.push(3);
        } else if (dist < 25) {
          // Edema region
          prediction.push(2);
        } else if (dist < 35) {
          // NCR/NET region
          prediction.push(1);
        } else {
          // Background
          prediction.push(0);
        }
      }
    }
  }
  
  return { prediction, shape };
}

/**
 * Create test file objects (for UI display)
 * These would typically point to sample files in public/test-data/
 */
export const testFiles: {
  t1: TestFile[];
  t1ce: TestFile[];
  t2: TestFile[];
  flair: TestFile[];
} = {
  t1: [
    {
      name: 'Sample T1',
      description: 'Demo T1-weighted MRI',
      url: '/test-data/sample_t1.nii',
      type: 'nifti'
    }
  ],
  t1ce: [
    {
      name: 'Sample T1ce',
      description: 'Demo T1ce-weighted MRI',
      url: '/test-data/sample_t1ce.nii',
      type: 'nifti'
    }
  ],
  t2: [
    {
      name: 'Sample T2',
      description: 'Demo T2-weighted MRI',
      url: '/test-data/sample_t2.nii',
      type: 'nifti'
    }
  ],
  flair: [
    {
      name: 'Sample FLAIR',
      description: 'Demo FLAIR MRI',
      url: '/test-data/sample_flair.nii',
      type: 'nifti'
    }
  ]
};

/**
 * Load test file from URL
 */
export async function loadTestFile(url: string): Promise<File> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load test file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const fileName = url.split('/').pop() || 'test_file.nii';
    
    return new File([blob], fileName, { type: blob.type });
  } catch (error: any) {
    throw new Error(`Error loading test file: ${error.message}`);
  }
}

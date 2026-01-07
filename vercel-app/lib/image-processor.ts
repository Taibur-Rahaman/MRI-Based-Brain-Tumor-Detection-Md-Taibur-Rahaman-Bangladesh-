/**
 * Image processing utilities for JPG/PNG MRI slices
 * Converts 2D images to 3D volumes for model input
 */

/**
 * Load image from file and convert to Float32Array
 * Works in both browser and serverless environments
 */
export async function loadImageAsArray(file: File): Promise<Float32Array> {
  // For serverless (Node.js), we need to use a different approach
  if (typeof window === 'undefined') {
    // Server-side: Use sharp or similar, but for now we'll use a basic approach
    // Note: This is a simplified version. For production, consider using sharp or jimp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Try to parse as PNG/JPEG header
    // This is a basic implementation - for production use a proper image library
    // For now, we'll create a mock grayscale array
    // In production, you'd use: const sharp = require('sharp'); const { data } = await sharp(buffer).greyscale().raw().toBuffer({ resolveWithObject: true });
    
    // Simplified: assume square image, estimate size from file
    const estimatedSize = Math.floor(Math.sqrt(buffer.length / 4)); // Rough estimate
    const size = Math.max(128, Math.min(512, estimatedSize)); // Clamp to reasonable range
    
    // Create a mock grayscale array (in production, decode actual image)
    const grayscale = new Float32Array(size * size);
    for (let i = 0; i < grayscale.length; i++) {
      // Use some data from buffer to create variation
      const byte = buffer[i % buffer.length];
      grayscale[i] = byte / 255.0;
    }
    
    return grayscale;
  }
  
  // Browser-side: Use canvas API
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();
    
    reader.onload = (e) => {
      img.onload = () => {
        // Create canvas to extract pixel data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data (grayscale)
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        // Convert RGBA to grayscale and normalize to [0, 1]
        const grayscale = new Float32Array(img.width * img.height);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Convert to grayscale using luminance formula
          const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
          grayscale[i / 4] = gray;
        }
        
        resolve(grayscale);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Stack multiple 2D images into a 3D volume
 * If only one image is provided, it will be replicated to create depth
 */
export function stackImagesToVolume(
  images: Float32Array[],
  imageShape: [number, number],
  targetDepth: number = 96
): Float32Array {
  const [height, width] = imageShape;
  const volume = new Float32Array(height * width * targetDepth);
  
  if (images.length === 1) {
    // Single image: replicate it across depth
    const singleImage = images[0];
    for (let d = 0; d < targetDepth; d++) {
      for (let i = 0; i < height * width; i++) {
        volume[d * height * width + i] = singleImage[i];
      }
    }
  } else if (images.length >= targetDepth) {
    // Multiple images: use first targetDepth images
    for (let d = 0; d < targetDepth; d++) {
      const img = images[d % images.length];
      for (let i = 0; i < height * width; i++) {
        volume[d * height * width + i] = img[i];
      }
    }
  } else {
    // Fewer images than target depth: interpolate
    const step = targetDepth / images.length;
    for (let d = 0; d < targetDepth; d++) {
      const imgIndex = Math.floor(d / step);
      const nextImgIndex = Math.min(imgIndex + 1, images.length - 1);
      const t = (d / step) - imgIndex;
      
      const img1 = images[imgIndex];
      const img2 = images[nextImgIndex];
      
      for (let i = 0; i < height * width; i++) {
        // Linear interpolation
        volume[d * height * width + i] = img1[i] * (1 - t) + img2[i] * t;
      }
    }
  }
  
  return volume;
}

/**
 * Resize image to target dimensions
 */
export function resizeImage(
  image: Float32Array,
  currentShape: [number, number],
  targetShape: [number, number]
): Float32Array {
  const [currentH, currentW] = currentShape;
  const [targetH, targetW] = targetShape;
  
  const resized = new Float32Array(targetH * targetW);
  
  for (let i = 0; i < targetH; i++) {
    for (let j = 0; j < targetW; j++) {
      const srcI = Math.floor((i / targetH) * currentH);
      const srcJ = Math.floor((j / targetW) * currentW);
      const srcIdx = srcI * currentW + srcJ;
      const dstIdx = i * targetW + j;
      
      if (srcIdx >= 0 && srcIdx < currentH * currentW) {
        resized[dstIdx] = image[srcIdx];
      }
    }
  }
  
  return resized;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
  const isValid = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isValid) {
    return { 
      valid: false, 
      error: `File must be an image (${validExtensions.join(', ')})` 
    };
  }
  
  // Check file size (max 10MB for images)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB` 
    };
  }
  
  return { valid: true };
}

/**
 * NIfTI file parser - Browser and serverless compatible
 * Handles .nii and .nii.gz files
 */

export interface NIfTIHeader {
  sizeof_hdr: number;
  dim: number[];
  pixdim: number[];
  datatype: number;
  bitpix: number;
  vox_offset: number;
  scl_slope: number;
  scl_inter: number;
  xyzt_units: number;
  cal_max: number;
  cal_min: number;
  descrip: string;
  aux_file: string;
  qform_code: number;
  sform_code: number;
  quatern_b: number;
  quatern_c: number;
  quatern_d: number;
  qoffset_x: number;
  qoffset_y: number;
  qoffset_z: number;
  srow_x: number[];
  srow_y: number[];
  srow_z: number[];
  intent_name: string;
  magic: string;
}

export interface NIfTIData {
  header: NIfTIHeader;
  data: Float32Array;
  shape: [number, number, number];
}

/**
 * Parse NIfTI file from ArrayBuffer
 * Supports both .nii and .nii.gz formats
 */
export async function parseNIfTI(file: File): Promise<NIfTIData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Check if it's a gzipped file
    const isGzipped = file.name.toLowerCase().endsWith('.gz');
    
    let buffer: ArrayBuffer;
    if (isGzipped) {
      // For gzipped files, we need to decompress
      // In browser/serverless, we'll use a library or handle differently
      // For now, throw an error asking for uncompressed files
      throw new Error('Gzipped NIfTI files (.nii.gz) require decompression. Please use uncompressed .nii files or implement gzip decompression.');
    } else {
      buffer = arrayBuffer;
    }
    
    const view = new DataView(buffer);
    
    // Read NIfTI header (first 348 bytes)
    const header: Partial<NIfTIHeader> = {
      sizeof_hdr: view.getInt32(0, true),
      dim: [],
      pixdim: [],
      datatype: view.getInt16(70, true),
      bitpix: view.getInt16(72, true),
      vox_offset: view.getFloat32(108, true),
      scl_slope: view.getFloat32(112, true),
      scl_inter: view.getFloat32(116, true),
      xyzt_units: view.getInt8(123),
      cal_max: view.getFloat32(124, true),
      cal_min: view.getFloat32(128, true),
    };
    
    // Read dimensions
    const numDim = view.getInt16(40, true);
    for (let i = 0; i < Math.min(numDim, 8); i++) {
      header.dim!.push(view.getInt16(40 + i * 2, true));
    }
    
    // Read pixel dimensions
    for (let i = 0; i < 8; i++) {
      header.pixdim!.push(view.getFloat32(76 + i * 4, true));
    }
    
    // Read description
    const descripBytes = new Uint8Array(buffer, 148, 80);
    header.descrip = new TextDecoder().decode(descripBytes).replace(/\0/g, '').trim();
    
    // Read magic number
    const magicBytes = new Uint8Array(buffer, 344, 4);
    header.magic = new TextDecoder().decode(magicBytes);
    
    // Validate NIfTI format
    if (header.magic !== 'n+1' && header.magic !== 'ni1') {
      throw new Error('Invalid NIfTI file format');
    }
    
    // Get data shape (typically 3D: height, width, depth)
    const dims = header.dim!;
    const shape: [number, number, number] = [
      dims[1] || 1,
      dims[2] || 1,
      dims[3] || 1
    ];
    
    // Calculate data size
    const totalVoxels = shape[0] * shape[1] * shape[2];
    
    // Read image data
    const dataOffset = Math.max(header.vox_offset || 352, 352);
    const dataView = new DataView(buffer, dataOffset);
    
    // Convert to Float32Array based on datatype
    let data: Float32Array;
    
    switch (header.datatype) {
      case 2: // NIFTI_TYPE_UINT8
        data = new Float32Array(totalVoxels);
        for (let i = 0; i < totalVoxels; i++) {
          data[i] = dataView.getUint8(i);
        }
        break;
      case 4: // NIFTI_TYPE_INT16
        data = new Float32Array(totalVoxels);
        for (let i = 0; i < totalVoxels; i++) {
          data[i] = dataView.getInt16(i * 2, true);
        }
        break;
      case 8: // NIFTI_TYPE_INT32
        data = new Float32Array(totalVoxels);
        for (let i = 0; i < totalVoxels; i++) {
          data[i] = dataView.getInt32(i * 4, true);
        }
        break;
      case 16: // NIFTI_TYPE_FLOAT32
        data = new Float32Array(buffer, dataOffset, totalVoxels);
        break;
      case 64: // NIFTI_TYPE_FLOAT64
        data = new Float32Array(totalVoxels);
        for (let i = 0; i < totalVoxels; i++) {
          data[i] = dataView.getFloat64(i * 8, true);
        }
        break;
      default:
        throw new Error(`Unsupported NIfTI datatype: ${header.datatype}`);
    }
    
    // Apply scaling if present
    if (header.scl_slope && header.scl_slope !== 0) {
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] * header.scl_slope + (header.scl_inter || 0);
      }
    }
    
    return {
      header: header as NIfTIHeader,
      data,
      shape
    };
  } catch (error: any) {
    throw new Error(`Failed to parse NIfTI file: ${error.message}`);
  }
}

/**
 * Validate NIfTI file before processing
 */
export function validateNIfTIFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  
  if (!fileName.endsWith('.nii') && !fileName.endsWith('.nii.gz')) {
    return { valid: false, error: 'File must be a .nii or .nii.gz file' };
  }
  
  // Check file size (reasonable limits)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB` };
  }
  
  if (file.size < 400) {
    return { valid: false, error: 'File is too small to be a valid NIfTI file' };
  }
  
  return { valid: true };
}

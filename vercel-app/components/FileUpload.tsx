'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, Sparkles, Image as ImageIcon, TestTube } from 'lucide-react';
import { validateImageFile } from '@/lib/image-processor';
import { validateNIfTIFile } from '@/lib/nifti-parser';

interface FileUploadProps {
  onPredict: (files: { t1: File; t1ce: File; t2: File; flair: File } | null) => void;
  loading: boolean;
}

export default function FileUpload({ onPredict, loading }: FileUploadProps) {
  const [files, setFiles] = useState<{
    t1: File | null;
    t1ce: File | null;
    t2: File | null;
    flair: File | null;
  }>({
    t1: null,
    t1ce: null,
    t2: null,
    flair: null,
  });

  const fileInputs = {
    t1: useRef<HTMLInputElement>(null),
    t1ce: useRef<HTMLInputElement>(null),
    t2: useRef<HTMLInputElement>(null),
    flair: useRef<HTMLInputElement>(null),
  };

  const handleFileSelect = (modality: keyof typeof files, file: File | null) => {
    if (file) {
      const fileName = file.name.toLowerCase();
      const isNIfTI = fileName.endsWith('.nii') || fileName.endsWith('.nii.gz');
      const isImage = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
                      fileName.endsWith('.png') || fileName.endsWith('.bmp') || 
                      fileName.endsWith('.webp');
      
      if (isNIfTI) {
        const validation = validateNIfTIFile(file);
        if (!validation.valid) {
          alert(`Invalid NIfTI file for ${modality}: ${validation.error}`);
          return;
        }
      } else if (isImage) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(`Invalid image file for ${modality}: ${validation.error}`);
          return;
        }
      } else {
        alert(`Invalid file type for ${modality}. Please upload a .nii, .nii.gz, or image file (JPG, PNG).`);
        return;
      }

      setFiles(prev => ({ ...prev, [modality]: file }));
    }
  };

  const handleRemoveFile = (modality: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [modality]: null }));
    if (fileInputs[modality].current) {
      fileInputs[modality].current!.value = '';
    }
  };

  const handlePredict = () => {
    if (files.t1 && files.t1ce && files.t2 && files.flair) {
      onPredict({
        t1: files.t1,
        t1ce: files.t1ce,
        t2: files.t2,
        flair: files.flair,
      });
    } else {
      alert('Please upload all four MRI modalities (T1, T1ce, T2, and FLAIR)');
    }
  };

  const allFilesUploaded = files.t1 && files.t1ce && files.t2 && files.flair;

  const handleTestMode = () => {
    onPredict(null);
  };

  const modalities = [
    { key: 't1' as const, label: 'T1', description: 'T1-weighted MRI' },
    { key: 't1ce' as const, label: 'T1ce', description: 'T1-weighted contrast-enhanced MRI' },
    { key: 't2' as const, label: 'T2', description: 'T2-weighted MRI' },
    { key: 'flair' as const, label: 'FLAIR', description: 'Fluid-attenuated inversion recovery MRI' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {modalities.map(({ key, label, description }) => (
          <div
            key={key}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <label className="block cursor-pointer">
              <div className="flex flex-col items-center text-center">
                {files[key] ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {files[key]!.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(files[key]!.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(key);
                        }}
                        className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {description}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Click to upload .nii or image file
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Supports: .nii, .jpg, .png
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputs[key]}
                type="file"
                accept=".nii,.nii.gz,.jpg,.jpeg,.png,.bmp,.webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileSelect(key, file);
                }}
                disabled={loading}
              />
            </label>
          </div>
        ))}
      </div>

      {!allFilesUploaded && (
        <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-1">
              Please upload all four MRI modalities (T1, T1ce, T2, and FLAIR) to proceed with tumor detection.
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Supported formats: NIfTI (.nii) or image files (.jpg, .png)
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handlePredict}
          disabled={!allFilesUploaded || loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Detect Brain Tumor</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleTestMode}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          title="Try with demo/test data"
        >
          <TestTube className="w-5 h-5" />
          <span className="hidden sm:inline">Test Mode</span>
        </button>
      </div>
    </div>
  );
}

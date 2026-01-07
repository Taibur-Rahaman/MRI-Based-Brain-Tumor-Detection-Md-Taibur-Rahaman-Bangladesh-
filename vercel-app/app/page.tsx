'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import PredictionResults from '@/components/PredictionResults';
import { Brain, Upload, Sparkles } from 'lucide-react';

export default function Home() {
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = async (files: {
    t1: File;
    t1ce: File;
    t2: File;
    flair: File;
  } | null = null) => {
    setLoading(true);
    setError(null);
    setPredictionData(null);

    try {
      // If no files provided, use test mode
      if (!files) {
        const { generateMockPrediction } = await import('@/lib/test-files');
        const mockData = generateMockPrediction();
        const { extractTumorStatistics } = await import('@/lib/utils');
        const statistics = extractTumorStatistics(mockData.prediction, mockData.shape);
        
        setPredictionData({
          success: true,
          prediction: mockData.prediction,
          shape: mockData.shape,
          statistics,
          timestamp: new Date().toISOString(),
          method: 'test_mode'
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('t1', files.t1);
      formData.append('t1ce', files.t1ce);
      formData.append('t2', files.t2);
      formData.append('flair', files.flair);

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const data = await response.json();
      setPredictionData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleTestMode = () => {
    handlePrediction(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            MRI-Based Brain Tumor Detection – Md Taibur Rahaman (Bangladesh)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-powered brain tumor detection and segmentation using advanced deep learning
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Upload MRI Scans
            </h2>
          </div>
          <FileUpload onPredict={handlePrediction} loading={loading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {predictionData && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <PredictionResults data={predictionData} />
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🧠 Multi-Modality Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Supports T1, T1ce, T2, and FLAIR MRI sequences for comprehensive analysis
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📊 3D Visualization
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Interactive 3D visualization of detected tumor regions and segmentation masks
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ⚡ High Accuracy
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              State-of-the-art deep learning model trained on BraTS 2020 dataset
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

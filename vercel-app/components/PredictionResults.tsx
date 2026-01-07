'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { tumorLabels } from '@/lib/utils';

// Dynamically import Plotly to avoid SSR issues
// @ts-expect-error - react-plotly.js does not ship types; we also provide a local shim under /types
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PredictionResultsProps {
  data: {
    prediction: number[];
    shape: [number, number, number];
    statistics: {
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
    };
    timestamp: string;
  };
}

export default function PredictionResults({ data }: PredictionResultsProps) {
  const [selectedModality, setSelectedModality] = useState<'FLAIR' | 'T1' | 'T1ce' | 'T2'>('FLAIR');
  const [sliceIndex, setSliceIndex] = useState(Math.floor(data.shape[2] / 2));

  const { statistics } = data;

  // Prepare 3D visualization data (simplified)
  const prepare3DData = () => {
    const [h, w, d] = data.shape;
    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];
    const colors: string[] = [];

    // Sample points for visualization (reduce for performance)
    const step = 4;
    for (let i = 0; i < h; i += step) {
      for (let j = 0; j < w; j += step) {
        for (let k = 0; k < d; k += step) {
          const idx = i * w * d + j * d + k;
          if (idx < data.prediction.length) {
            const classId = data.prediction[idx];
            if (classId > 0) {
              x.push(i);
              y.push(j);
              z.push(k);
              colors.push(tumorLabels[classId]?.color || '#000000');
            }
          }
        }
      }
    }

    return { x, y, z, colors };
  };

  const plotData = prepare3DData();

  const plotConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tumor Volume
            </h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {statistics.tumorPercentage.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {statistics.tumorVoxels.toLocaleString()} voxels
          </p>
        </div>

        {Object.entries(statistics.regions).map(([classId, region]) => (
          <div
            key={classId}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tumorLabels[parseInt(classId)]?.color }}
              />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {region.name}
              </h3>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {region.percentage.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {region.voxels.toLocaleString()} voxels
            </p>
          </div>
        ))}
      </div>

      {/* Tumor Detection Status */}
      <div
        className={`p-4 rounded-lg border ${
          statistics.tumorPercentage > 0
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {statistics.tumorPercentage > 0 ? (
            <>
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Tumor Detected
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Abnormal tissue detected in the brain scan. Please consult with a medical professional for detailed analysis.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  No Tumor Detected
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  No abnormal tissue detected in the current scan.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          3D Tumor Visualization
        </h3>
        {typeof window !== 'undefined' && (
          <Plot
            data={[
              {
                type: 'scatter3d',
                mode: 'markers',
                x: plotData.x,
                y: plotData.y,
                z: plotData.z,
                marker: {
                  size: 3,
                  color: plotData.colors,
                  opacity: 0.6,
                },
                name: 'Tumor Regions',
              },
            ]}
            layout={{
              title: 'Brain Tumor Segmentation',
              scene: {
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
                zaxis: { title: 'Z' },
                bgcolor: 'rgba(0,0,0,0)',
                camera: {
                  eye: { x: 1.5, y: 1.5, z: 1.5 },
                },
              },
              height: 600,
              margin: { l: 0, r: 0, b: 0, t: 40 },
            }}
            config={plotConfig}
            style={{ width: '100%', height: '600px' }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Tumor Type Legend
        </h4>
        <div className="grid md:grid-cols-3 gap-3">
          {Object.entries(tumorLabels)
            .filter(([id]) => parseInt(id) > 0)
            .map(([id, label]) => (
              <div key={id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Analysis completed at: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
}

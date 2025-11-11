'use client';

import { WorkflowState } from '@/lib/types';
import ProductCard from './ProductCard';

interface ResultsProps {
  results: WorkflowState;
}

export default function Results({ results }: ResultsProps) {
  if (!results.products || results.products.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            No products were detected in the video. Please try another video with clearer product visibility.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Extraction Results
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Found {results.products.length} product{results.products.length !== 1 ? 's' : ''} in the video
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.products.map((product) => {
          const frame = results.extractedFrames.find(f => f.productId === product.id);
          const segmented = results.segmentedImages.find(s => s.productId === product.id);
          const enhanced = results.enhancedImages.filter(e => e.productId === product.id);

          return (
            <ProductCard
              key={product.id}
              product={product}
              frame={frame}
              segmented={segmented}
              enhanced={enhanced}
            />
          );
        })}
      </div>
    </div>
  );
}

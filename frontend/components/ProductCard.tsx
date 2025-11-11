'use client';

import { ProductInfo, ExtractedFrame, SegmentedImage, EnhancedImage } from '@/lib/types';

interface ProductCardProps {
  product: ProductInfo;
  frame?: ExtractedFrame;
  segmented?: SegmentedImage;
  enhanced: EnhancedImage[];
}

export default function ProductCard({ product, frame, segmented, enhanced }: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
          {product.description}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Confidence:
          </span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${product.confidence}%` }}
            ></div>
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {product.confidence}%
          </span>
        </div>
      </div>

      {/* Extracted Frame */}
      {frame && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Extracted Frame
          </h4>
          <div className="mb-3">
            <img
              src={`data:image/jpeg;base64,${frame.frameBase64}`}
              alt={`${product.name} frame`}
              className="w-full rounded-lg"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Timestamp:</strong> {frame.frameTimestamp}s</p>
            <p><strong>Reason:</strong> {frame.reason}</p>
          </div>
        </div>
      )}

      {/* Segmented Image */}
      {segmented && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Segmented Product
          </h4>
          <img
            src={`data:image/jpeg;base64,${segmented.segmentedBase64}`}
            alt={`${product.name} segmented`}
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Enhanced Images */}
      {enhanced.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Enhanced Product Shots
          </h4>
          <div className="space-y-4">
            {enhanced.map((img, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <img
                    src={`data:image/jpeg;base64,${img.enhancedBase64}`}
                    alt={`${product.name} ${img.style}`}
                    className="w-full rounded-lg"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Style: {img.style}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {img.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

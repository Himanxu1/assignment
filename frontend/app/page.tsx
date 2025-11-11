'use client';

import { useState } from 'react';
import VideoInput from '@/components/VideoInput';
import Results from '@/components/Results';
import { processVideo } from '@/lib/api';
import { WorkflowState } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WorkflowState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (videoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await processVideo(videoUrl);

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'Failed to process video');
      }
    } catch (err: any) {
      console.error('Error processing video:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred while processing the video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Product Image Extractor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extract, segment, and enhance product images from YouTube videos using Google Gemini AI
          </p>
        </header>

        <VideoInput onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Error Processing Video
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {results && <Results results={results} />}

        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Powered by Google Gemini, LangGraph, and Next.js</p>
        </footer>
      </div>
    </div>
  );
}

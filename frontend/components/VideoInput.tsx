"use client";

import { useState } from "react";

interface VideoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function VideoInput({ onSubmit, isLoading }: VideoInputProps) {
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onSubmit(videoUrl.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Extract Product Images from YouTube
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Enter a YouTube URL of a product review, unboxing, or demo video to
          extract and enhance product images.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="videoUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              YouTube Video URL
            </label>
            <input
              type="text"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !videoUrl.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Video...
              </span>
            ) : (
              "Try now"
            )}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This may take a few minutes. The AI is analyzing the video,
              extracting frames, and processing products...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

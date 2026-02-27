"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="w-full border border-border/60 bg-card rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
          </div>
          <span className="font-mono-custom text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase">
            Source Video
          </span>
        </div>
        <span className="font-mono-custom text-[10px] text-primary/50 tracking-widest">
          {isLoading ? "PROCESSING…" : "READY"}
        </span>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="videoUrl" className="font-mono-custom text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            YouTube Video URL
          </Label>
          <Input
            id="videoUrl"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            disabled={isLoading}
            required
            className="bg-background border-border/60 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/60 focus:ring-primary/20 font-mono-custom text-sm h-12 rounded-md transition-colors duration-200"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !videoUrl.trim()}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-xs tracking-widest uppercase font-medium py-5 transition-all duration-300 gold-glow"
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <div className="w-4 h-4 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin shrink-0" />
              Processing Video…
            </span>
          ) : (
            "Extract Product Images"
          )}
        </Button>
      </form>

      {/* Loading status */}
      {isLoading && (
        <div className="px-6 pb-6">
          <div className="border border-border/40 bg-background/60 rounded-md p-4 space-y-3">
            {/* Progress steps */}
            {[
              "Downloading video via ytdl-core",
              "Extracting frames with FFmpeg",
              "Identifying products with Gemini Vision",
              "Selecting best frames per product",
              "Segmenting and enhancing images",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-shimmer shrink-0"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                <span className="font-mono-custom text-[10px] text-muted-foreground/60 tracking-[0.15em]">
                  {step}
                </span>
              </div>
            ))}
            <p className="font-mono-custom text-[9px] text-muted-foreground/30 tracking-widest uppercase pt-1">
              This may take 2–5 minutes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

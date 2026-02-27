"use client";

import { useState } from "react";
import VideoInput from "@/components/VideoInput";
import Results from "@/components/Results";
import AuthGuard from "@/components/AuthGuard";
import { processVideo } from "@/lib/api";
import { WorkflowState } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WorkflowState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  const handleSubmit = async (videoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await processVideo(videoUrl);
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || "Failed to process video");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.message ||
          "An error occurred while processing the video"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-background text-foreground grain">

      {/* ── TOPBAR ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <span className="font-display text-2xl font-light tracking-wider">
          Pix<span className="text-primary font-semibold">Lift</span>
        </span>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-foreground font-medium">{user?.displayName ?? user?.email}</span>
            <span className="font-mono-custom text-[9px] text-muted-foreground/50 tracking-widest uppercase">Studio</span>
          </div>
          <Avatar className="w-8 h-8 border border-border">
            <AvatarImage src={user?.photoURL ?? ""} alt={user?.displayName ?? "User"} />
            <AvatarFallback className="bg-secondary text-muted-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Separator orientation="vertical" className="h-5 bg-border/60" />
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="py-12 px-6 md:px-10 max-w-5xl mx-auto">

        {/* ── PAGE HEADER ─────────────────────────────────────── */}
        <div className="mb-12">
          <div className="font-mono-custom text-[10px] text-primary tracking-[0.3em] uppercase mb-3">
            Session active
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-light text-foreground mb-3">
            Product<br />
            <span className="italic text-primary">Extraction Studio</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
            Paste a YouTube video URL below. PixLift will analyze the video,
            identify every product, and deliver enhanced product images.
          </p>
        </div>

        {/* ── VIDEO INPUT ─────────────────────────────────────── */}
        <VideoInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* ── ERROR ───────────────────────────────────────────── */}
        {error && (
          <div className="mt-8 border border-destructive/40 bg-destructive/5 rounded-lg px-6 py-5">
            <div className="font-mono-custom text-[10px] text-destructive tracking-[0.25em] uppercase mb-2">
              Error
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* ── RESULTS ─────────────────────────────────────────── */}
        {results && <Results results={results} />}

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer className="mt-20 pt-6 border-t border-border/30 flex items-center justify-between">
          <span className="font-display text-lg font-light text-muted-foreground/40">
            Pix<span className="text-primary/40">Lift</span>
          </span>
          <span className="font-mono-custom text-[9px] text-muted-foreground/30 tracking-widest uppercase">
            by Himanshu Singh
          </span>
        </footer>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

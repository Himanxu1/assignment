"use client";

import { ProductInfo, ExtractedFrame, SegmentedImage, EnhancedImage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface ProductCardProps {
  product: ProductInfo;
  frame?: ExtractedFrame;
  segmented?: SegmentedImage;
  enhanced: EnhancedImage[];
  index: number;
}

export default function ProductCard({
  product,
  frame,
  segmented,
  enhanced,
  index,
}: ProductCardProps) {
  const confidenceColor =
    product.confidence >= 80
      ? "text-emerald-400"
      : product.confidence >= 50
      ? "text-primary"
      : "text-muted-foreground";

  return (
    <div className="border border-border/60 bg-card rounded-lg overflow-hidden flex flex-col">
      {/* Card top bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-secondary/20">
        <div className="flex items-center gap-2">
          <span className="font-mono-custom text-[9px] text-muted-foreground/40 tracking-[0.3em] uppercase select-none">
            P–{String(index + 1).padStart(2, "0")}
          </span>
          <Separator orientation="vertical" className="h-3 bg-border/60" />
          <Badge
            variant="secondary"
            className="font-mono-custom text-[9px] tracking-widest uppercase border-0 bg-transparent text-muted-foreground/60 px-0"
          >
            AI Detected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono-custom text-xs font-medium ${confidenceColor}`}>
            {product.confidence}%
          </span>
          <span className="font-mono-custom text-[9px] text-muted-foreground/40 tracking-widest uppercase">
            confidence
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className="px-5 py-5 border-b border-border/30">
        <h3 className="font-display text-2xl font-medium text-foreground mb-1.5">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Confidence bar */}
        <div className="space-y-1.5">
          <Progress
            value={product.confidence}
            className="h-1 bg-border/60"
          />
        </div>
      </div>

      {/* Tabs for frame / segmented / enhanced */}
      <div className="flex-1 px-5 py-5">
        {(frame || segmented || enhanced.length > 0) && (
          <Tabs defaultValue={frame ? "frame" : segmented ? "segmented" : "enhanced"}>
            <TabsList className="w-full bg-secondary/30 border border-border/40 h-9 mb-5 p-0.5 rounded-md">
              {frame && (
                <TabsTrigger
                  value="frame"
                  className="flex-1 font-mono-custom text-[9px] tracking-[0.2em] uppercase data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm h-full"
                >
                  Frame
                </TabsTrigger>
              )}
              {segmented && (
                <TabsTrigger
                  value="segmented"
                  className="flex-1 font-mono-custom text-[9px] tracking-[0.2em] uppercase data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm h-full"
                >
                  Segmented
                </TabsTrigger>
              )}
              {enhanced.length > 0 && (
                <TabsTrigger
                  value="enhanced"
                  className="flex-1 font-mono-custom text-[9px] tracking-[0.2em] uppercase data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none rounded-sm h-full"
                >
                  Enhanced
                </TabsTrigger>
              )}
            </TabsList>

            {/* ── Extracted Frame ─────────────────────────────── */}
            {frame && (
              <TabsContent value="frame" className="mt-0 space-y-3">
                <div className="relative rounded-md overflow-hidden border border-border/30 bg-background">
                  <img
                    src={`data:image/jpeg;base64,${frame.frameBase64}`}
                    alt={`${product.name} extracted frame`}
                    className="w-full object-cover"
                  />
                  {/* Timecode overlay */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded border border-border/40">
                    <span className="font-mono-custom text-[9px] text-primary tracking-widest">
                      {String(Math.floor(frame.frameTimestamp / 3600)).padStart(2, "0")}:
                      {String(Math.floor((frame.frameTimestamp % 3600) / 60)).padStart(2, "0")}:
                      {String(Math.floor(frame.frameTimestamp % 60)).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="px-1">
                  <p className="font-mono-custom text-[9px] text-muted-foreground/50 tracking-[0.15em] uppercase mb-1">
                    Selection reason
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{frame.reason}</p>
                </div>
              </TabsContent>
            )}

            {/* ── Segmented Image ─────────────────────────────── */}
            {segmented && (
              <TabsContent value="segmented" className="mt-0">
                <div className="rounded-md overflow-hidden border border-border/30 bg-background">
                  <img
                    src={`data:image/jpeg;base64,${segmented.segmentedBase64}`}
                    alt={`${product.name} segmented`}
                    className="w-full object-cover"
                  />
                </div>
                <div className="mt-3 px-1">
                  <p className="font-mono-custom text-[9px] text-muted-foreground/40 tracking-[0.15em] uppercase">
                    Background removed · AI segmentation
                  </p>
                </div>
              </TabsContent>
            )}

            {/* ── Enhanced Images ─────────────────────────────── */}
            {enhanced.length > 0 && (
              <TabsContent value="enhanced" className="mt-0 space-y-4">
                {enhanced.map((img, idx) => (
                  <div key={idx} className="border border-border/30 rounded-md overflow-hidden bg-background">
                    <div className="relative">
                      <img
                        src={`data:image/jpeg;base64,${img.enhancedBase64}`}
                        alt={`${product.name} ${img.style}`}
                        className="w-full object-cover"
                      />
                      {/* Style badge */}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded border border-primary/30">
                        <span className="font-mono-custom text-[9px] text-primary tracking-widest capitalize">
                          {img.style}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-start justify-between gap-3">
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                        {img.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-border/60 hover:border-primary/50 hover:text-primary font-mono-custom text-[9px] tracking-widest uppercase h-7 px-3"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Gemini badge */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1 h-1 rounded-full bg-primary/60" />
                  <span className="font-mono-custom text-[9px] text-muted-foreground/40 tracking-[0.2em] uppercase">
                    Generated by Gemini 2.5
                  </span>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Empty state */}
        {!frame && !segmented && enhanced.length === 0 && (
          <div className="text-center py-8">
            <p className="font-mono-custom text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase">
              No media available for this product
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { WorkflowState } from "@/lib/types";
import ProductCard from "./ProductCard";
import { Separator } from "@/components/ui/separator";

interface ResultsProps {
  results: WorkflowState;
}

export default function Results({ results }: ResultsProps) {
  if (!results.products || results.products.length === 0) {
    return (
      <div className="mt-12 border border-border/40 bg-card rounded-lg px-6 py-8 text-center">
        <div className="font-mono-custom text-[10px] text-muted-foreground/50 tracking-[0.3em] uppercase mb-3">
          No results
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          No products were detected in this video. Try another video with
          clearer product visibility.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-14">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-10">
        <div>
          <div className="font-mono-custom text-[10px] text-primary tracking-[0.3em] uppercase mb-1">
            Extraction complete
          </div>
          <h2 className="font-display text-3xl font-light text-foreground">
            {results.products.length} Product{results.products.length !== 1 ? "s" : ""}{" "}
            <span className="italic text-primary">Found</span>
          </h2>
        </div>
        <Separator className="flex-1 bg-border/40 ml-4" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {results.products.map((product, idx) => {
          const frame = results.extractedFrames.find(
            (f) => f.productId === product.id
          );
          const segmented = results.segmentedImages.find(
            (s) => s.productId === product.id
          );
          const enhanced = results.enhancedImages.filter(
            (e) => e.productId === product.id
          );

          return (
            <ProductCard
              key={product.id}
              product={product}
              frame={frame}
              segmented={segmented}
              enhanced={enhanced}
              index={idx}
            />
          );
        })}
      </div>
    </div>
  );
}

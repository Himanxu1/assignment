import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden grain">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <span className="font-display text-2xl font-light tracking-wider text-foreground">
          Pix<span className="text-primary font-semibold">Lift</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs tracking-widest uppercase">
              Sign in
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-widest uppercase font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Background mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[80px]" />
        </div>

        {/* Frame counter badge */}
        <div className="animate-fade-in opacity-0-init mb-8 inline-flex items-center gap-3 px-4 py-2 border border-border rounded-full bg-card/60">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-shimmer" />
          <span className="font-mono-custom text-xs text-muted-foreground tracking-[0.2em] uppercase">
            Powered by Gemini 2.5 Vision
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-center text-6xl sm:text-7xl md:text-8xl lg:text-[96px] font-light leading-[0.95] tracking-tight mb-8 animate-fade-up">
          <span className="block text-foreground">Every Frame</span>
          <span className="block italic text-primary">Holds a Product.</span>
        </h1>

        <p className="font-body text-center text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed mb-12 animate-fade-up-1 opacity-0-init">
          Paste a YouTube URL. PixLift AI identifies every product, isolates
          it from the background, and delivers professional-grade product shots
          in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up-2 opacity-0-init">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow px-10 py-6 text-sm tracking-widest uppercase font-medium transition-all duration-300"
            >
              Start Extracting Free
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/50 px-10 py-6 text-sm tracking-widest uppercase transition-all duration-300"
            >
              How it works
            </Button>
          </a>
        </div>

        {/* Film strip decoration */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="font-mono-custom text-[10px] text-muted-foreground/30 tracking-widest absolute bottom-6 right-8 select-none">
          00:00:00:00
        </div>
      </section>

      {/* ── FILM STRIP SEPARATOR ────────────────────────────────── */}
      <div className="relative h-16 overflow-hidden border-y border-border/40 bg-card/30 flex items-center">
        <div className="flex gap-6 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
          {Array.from({ length: 20 }).map((_, idx) => (
            <span
              key={idx}
              className="font-mono-custom text-[10px] text-primary/40 tracking-[0.3em] uppercase shrink-0 select-none"
            >
              ◆ AI Frame Extraction &nbsp; ◆ Smart Segmentation &nbsp; ◆ Gemini Enhancement &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="font-mono-custom text-[10px] text-primary tracking-[0.3em] uppercase">01</span>
            <Separator className="flex-1 bg-border/60" />
            <span className="font-mono-custom text-[10px] text-muted-foreground/50 tracking-[0.3em] uppercase">Capabilities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40">
            {[
              {
                num: "F–01",
                title: "AI Frame Extraction",
                desc: "Gemini Vision analyzes your video at strategic intervals, selecting only the frames where each product appears at peak clarity and focus.",
                icon: "⬡",
              },
              {
                num: "F–02",
                title: "Smart Segmentation",
                desc: "Products are precisely isolated from backgrounds using AI-powered boundary detection, giving you clean cutout images every time.",
                icon: "◈",
              },
              {
                num: "F–03",
                title: "Studio-Grade Outputs",
                desc: "Three enhanced product photography styles generated per product — studio white, gradient marketing, and lifestyle context shots.",
                icon: "◉",
              },
            ].map((f) => (
              <div
                key={f.num}
                className="group bg-card p-10 hover:bg-secondary/30 transition-colors duration-300 border border-transparent hover:border-primary/20"
              >
                <div className="font-mono-custom text-primary/60 text-2xl mb-6">{f.icon}</div>
                <div className="font-mono-custom text-[10px] text-muted-foreground/50 tracking-[0.25em] uppercase mb-3">{f.num}</div>
                <h3 className="font-display text-2xl font-medium text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 md:px-12 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="font-mono-custom text-[10px] text-primary tracking-[0.3em] uppercase">02</span>
            <Separator className="flex-1 bg-border/60" />
            <span className="font-mono-custom text-[10px] text-muted-foreground/50 tracking-[0.3em] uppercase">Process</span>
          </div>

          <div className="space-y-0">
            {[
              {
                step: "01",
                title: "Paste a YouTube URL",
                desc: "Find any product review, unboxing, or demo video and copy the link. That's your only input.",
              },
              {
                step: "02",
                title: "AI Analyzes the Video",
                desc: "PixLift downloads the video, extracts frames with FFmpeg, and passes them through Gemini's vision pipeline to detect, score, and select the best representation of each product.",
              },
              {
                step: "03",
                title: "Download Your Images",
                desc: "Receive professionally enhanced product photography in three distinct styles — ready for your store, ads, or portfolio.",
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className="flex items-start gap-8 py-10 border-b border-border/30 last:border-0 group"
              >
                <div className="shrink-0 w-20 text-right">
                  <span className="font-display text-5xl font-light text-primary/20 group-hover:text-primary/40 transition-colors duration-300">
                    {s.step}
                  </span>
                </div>
                <div className="pt-2">
                  <h3 className="font-display text-2xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 border-t border-border/40 bg-card/20">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-px bg-border/40">
          {[
            { value: "2–5", unit: "min", label: "Per video" },
            { value: "3", unit: "styles", label: "Per product" },
            { value: "2.5", unit: "Flash", label: "Gemini model" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card text-center py-12 px-6">
              <div className="font-display text-5xl font-light text-primary mb-1">
                {stat.value}
                <span className="text-2xl text-muted-foreground ml-1">{stat.unit}</span>
              </div>
              <div className="font-mono-custom text-[10px] text-muted-foreground/60 tracking-[0.25em] uppercase mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 border-t border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-mono-custom text-[10px] text-primary tracking-[0.3em] uppercase mb-6">Begin</div>
          <h2 className="font-display text-5xl md:text-6xl font-light leading-tight mb-6">
            Ready to lift your<br />
            <span className="italic text-primary">product images?</span>
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto text-sm leading-relaxed">
            Sign in with Google and start extracting professional product shots
            from any YouTube video in seconds.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gold-glow px-12 py-6 text-sm tracking-widest uppercase font-medium transition-all duration-300"
            >
              Get Started — Free
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 px-6 md:px-12 py-8 flex items-center justify-between">
        <span className="font-display text-xl font-light text-muted-foreground">
          Pix<span className="text-primary">Lift</span>
        </span>
        <span className="font-mono-custom text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase">
          by Himanshu Singh
        </span>
        <span className="font-mono-custom text-[10px] text-muted-foreground/30 tracking-widest select-none">
          © 2025
        </span>
      </footer>
    </div>
  );
}

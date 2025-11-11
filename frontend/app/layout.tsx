import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Image Extractor",
  description: "AI-powered product image extraction from YouTube videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

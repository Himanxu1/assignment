import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private imageGenAI: GoogleGenAI;
  private visionModel: any;
  private textModel: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.imageGenAI = new GoogleGenAI({ apiKey });
    // Using stable Gemini 2.0 Flash (not experimental) - better rate limits
    // Free tier: 15 RPM, 1,000,000 TPM, 200 RPD
    this.visionModel = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    this.textModel = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
  }

  // Retry helper with exponential backoff for rate limit errors
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        const isRateLimitError =
          error.status === 429 || error.message?.includes("quota");
        const isLastAttempt = attempt === maxRetries - 1;

        if (!isRateLimitError || isLastAttempt) {
          throw error;
        }

        // Extract retry delay from error if available
        const retryDelay = error.retryDelay || baseDelay * Math.pow(2, attempt);
        console.log(
          `Rate limit hit. Retrying in ${retryDelay}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
    throw new Error("Max retries reached");
  }

  async analyzeFrameForProducts(imageBase64: string): Promise<any> {
    return this.retryWithBackoff(async () => {
      const prompt = `Analyze this image from a product video (review, unboxing, or demo).

      Identify ALL distinct products visible in the image. For each product:
      1. Give it a unique name
      2. Provide a brief description
      3. Rate the visibility/clarity of the product in this frame (0-100)
         - Consider: clear angle, good lighting, product in focus, not obscured
         - Only give high confidence (80+) if the product has excellent visibility from a clear angle
         - Give medium confidence (50-79) if partially visible or unclear angle
         - Give low confidence (<50) if barely visible or poor angle

      Return your response as a JSON array with this structure:
      [
        {
          "name": "product name",
          "description": "brief description",
          "confidence": 85
        }
      ]

      Focus on products with clear, unobstructed views and good angles for product photography.
      If no clear products are visible, return an empty array: []`;

      const result = await this.visionModel.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    });
  }

  async selectBestFrame(
    frames: Array<{ base64: string; timestamp: number }>,
    productName: string
  ): Promise<{ frameIndex: number; reason: string }> {
    return this.retryWithBackoff(async () => {
      const prompt = `You are analyzing ${frames.length} frames from a video to find the best frame showing "${productName}".

      Evaluate each frame and select the ONE best frame where this product is:
      - Most visible and clear
      - Well-lit
      - In focus
      - Takes up a good portion of the frame
      - Not obscured or partially hidden

      Return your response as JSON:
      {
        "frameIndex": <0-based index of best frame>,
        "reason": "<brief explanation why this frame is best>"
      }

      If the product is not clearly visible in any frame, return frameIndex: -1`;

      const imageParts = frames
        .map((frame, idx) => [
          `\n\nFrame ${idx} (timestamp: ${frame.timestamp}s):`,
          {
            inlineData: {
              data: frame.base64,
              mimeType: "image/jpeg",
            },
          },
        ])
        .flat();

      const result = await this.visionModel.generateContent([
        prompt,
        ...imageParts,
      ]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { frameIndex: 0, reason: "Default selection" };
    });
  }

  async segmentProduct(
    imageBase64: string,
    productName: string
  ): Promise<{ segmentedBase64: string; explanation: string }> {
    return this.retryWithBackoff(async () => {
      const prompt = `You are analyzing an image to segment/isolate the product: "${productName}".

      Describe in detail:
      1. The exact location and boundaries of the product in the image (bounding box coordinates if possible)
      2. The product's visual characteristics (color, shape, size relative to frame)
      3. What parts of the image should be kept vs removed
      4. Any challenges in segmenting this product

      Provide a detailed description that could be used for segmentation.`;

      const result = await this.visionModel.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const explanation = response.text();

      // Note: Gemini doesn't natively return segmented images
      // For this implementation, we'll return the original image with metadata
      // In production, you'd use a dedicated segmentation API
      return {
        segmentedBase64: imageBase64, // Placeholder - would use actual segmentation
        explanation,
      };
    });
  }

  async generateEnhancedImages(
    segmentedImageBase64: string,
    productName: string,
    styles: string[] = [
      "professional white background",
      "gradient background",
      "lifestyle setting",
    ]
  ): Promise<
    Array<{ style: string; enhancedBase64: string; description: string }>
  > {
    const enhancements = [];

    for (const style of styles) {
      const enhancement = await this.retryWithBackoff(async () => {
        console.log(
          `Generating enhanced image for ${productName} with ${style}...`
        );

        // Create prompt for image enhancement
        const prompt = `Transform this product image of ${productName} into a professional e-commerce photograph with a ${style}.

Make the product stand out with:
- Perfect lighting and clarity
- ${
          style === "professional white background"
            ? "Clean, pure white background"
            : style === "gradient background"
            ? "Beautiful gradient background"
            : "Attractive lifestyle setting"
        }
- Professional composition
- Enhanced colors and details
- Product-focused framing

Keep the product exactly as it is, only enhance the presentation and background.`;

        try {
          const contents = [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: segmentedImageBase64,
              },
            },
          ];

          const response = await this.imageGenAI.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents,
          });

          // Extract the generated image from response
          let enhancedBase64 = segmentedImageBase64; // Fallback to original
          let description = "Enhanced with AI image generation";

          if (
            response.candidates &&
            response.candidates[0] &&
            response.candidates[0].content
          ) {
            for (const part of response.candidates[0].content.parts || []) {
              if (part.text) {
                description = part.text;
              } else if (part.inlineData && part.inlineData.data) {
                enhancedBase64 = part.inlineData.data;
                console.log(
                  `✓ Generated enhanced image for ${productName} with ${style}`
                );
              }
            }
          }

          return {
            style,
            enhancedBase64,
            description,
          };
        } catch (error: any) {
          console.error(
            `Failed to generate enhanced image for ${style}:`,
            error.message
          );
          // Fallback: return original image with descriptive text
          const fallbackDescription = await this.textModel.generateContent(
            `Describe how to create a professional product photo of ${productName} with a ${style}.`
          );

          return {
            style,
            enhancedBase64: segmentedImageBase64,
            description: (await fallbackDescription.response).text(),
          };
        }
      });

      enhancements.push(enhancement);
    }

    return enhancements;
  }
}

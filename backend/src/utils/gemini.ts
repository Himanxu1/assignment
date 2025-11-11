import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private visionModel: any;
  private textModel: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeFrameForProducts(imageBase64: string): Promise<any> {
    const prompt = `Analyze this image from a product video (review, unboxing, or demo).

    Identify ALL distinct products visible in the image. For each product:
    1. Give it a unique name
    2. Provide a brief description
    3. Rate the visibility/clarity of the product in this frame (0-100)

    Return your response as a JSON array with this structure:
    [
      {
        "name": "product name",
        "description": "brief description",
        "confidence": 85
      }
    ]

    If no clear products are visible, return an empty array: []`;

    const result = await this.visionModel.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
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
  }

  async selectBestFrame(frames: Array<{ base64: string; timestamp: number }>, productName: string): Promise<{ frameIndex: number; reason: string }> {
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

    const imageParts = frames.map((frame, idx) => [
      `\n\nFrame ${idx} (timestamp: ${frame.timestamp}s):`,
      {
        inlineData: {
          data: frame.base64,
          mimeType: 'image/jpeg',
        },
      },
    ]).flat();

    const result = await this.visionModel.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { frameIndex: 0, reason: 'Default selection' };
  }

  async segmentProduct(imageBase64: string, productName: string): Promise<{ segmentedBase64: string; explanation: string }> {
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
          mimeType: 'image/jpeg',
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
  }

  async generateEnhancedImages(
    segmentedImageBase64: string,
    productName: string,
    styles: string[] = ['professional white background', 'gradient background', 'lifestyle setting']
  ): Promise<Array<{ style: string; description: string }>> {
    const enhancements = [];

    for (const style of styles) {
      const prompt = `Generate a detailed description for creating an enhanced product image of "${productName}" with a ${style}.

      Describe:
      1. The ideal background style and colors
      2. Lighting setup and mood
      3. Product positioning and angle
      4. Any additional props or elements
      5. Overall aesthetic and feel

      Make it suitable for e-commerce or marketing use.`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const description = response.text();

      enhancements.push({
        style,
        description,
      });
    }

    return enhancements;
  }
}

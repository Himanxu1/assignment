import { StateGraph, END, Annotation } from '@langchain/langgraph';
import { WorkflowState, ProductInfo, ExtractedFrame, SegmentedImage, EnhancedImage } from '../types/index.js';
import { VideoProcessor } from '../utils/video.js';
import { GeminiClient } from '../utils/gemini.js';
import { v4 as uuidv4 } from 'uuid';

// Define state annotation for LangGraph
const GraphState = Annotation.Root({
  videoUrl: Annotation<string>,
  videoPath: Annotation<string | undefined>,
  products: Annotation<ProductInfo[]>,
  extractedFrames: Annotation<ExtractedFrame[]>,
  segmentedImages: Annotation<SegmentedImage[]>,
  enhancedImages: Annotation<EnhancedImage[]>,
  error: Annotation<string | undefined>,
});

type GraphStateType = typeof GraphState.State;

export class ProductExtractionWorkflow {
  private videoProcessor: VideoProcessor;
  private geminiClient: GeminiClient;

  constructor(geminiApiKey: string) {
    this.videoProcessor = new VideoProcessor();
    this.geminiClient = new GeminiClient(geminiApiKey);
  }

  // Node 1: Download video and extract frames
  async downloadAndExtractFrames(state: GraphStateType): Promise<Partial<GraphStateType>> {
    try {
      console.log('Step 1: Downloading video and extracting frames...');

      const videoPath = await this.videoProcessor.downloadYouTubeVideo(state.videoUrl);
      console.log(`Video downloaded to: ${videoPath}`);

      // Extract frames at various intervals
      const framePaths = await this.videoProcessor.extractFrames(videoPath, [2, 5, 10, 15, 20, 30, 45]);
      console.log(`Extracted ${framePaths.length} frames`);

      return {
        videoPath,
      };
    } catch (error: any) {
      console.error('Error in downloadAndExtractFrames:', error);
      return {
        error: `Failed to download/extract frames: ${error.message}`,
      };
    }
  }

  // Node 2: Identify all products in the video
  async identifyProducts(state: GraphStateType): Promise<Partial<GraphStateType>> {
    try {
      if (state.error) return {};

      console.log('Step 2: Identifying products in frames...');

      const videoPath = state.videoPath!;
      const framePaths = await this.videoProcessor.extractFrames(videoPath, [5, 15, 30]);

      const allProducts = new Map<string, ProductInfo>();

      for (const framePath of framePaths) {
        const base64 = await this.videoProcessor.frameToBase64(framePath);
        const detectedProducts = await this.geminiClient.analyzeFrameForProducts(base64);

        for (const product of detectedProducts) {
          const key = product.name.toLowerCase().trim();
          if (!allProducts.has(key) || allProducts.get(key)!.confidence < product.confidence) {
            allProducts.set(key, {
              id: uuidv4(),
              name: product.name,
              description: product.description,
              confidence: product.confidence,
            });
          }
        }
      }

      await this.videoProcessor.cleanup(framePaths);

      const products = Array.from(allProducts.values()).filter(p => p.confidence > 50);
      console.log(`Identified ${products.length} products:`, products.map(p => p.name));

      return {
        products,
      };
    } catch (error: any) {
      console.error('Error in identifyProducts:', error);
      return {
        error: `Failed to identify products: ${error.message}`,
      };
    }
  }

  // Node 3: Extract best frame for each product
  async extractKeyFrames(state: GraphStateType): Promise<Partial<GraphStateType>> {
    try {
      if (state.error || !state.products || state.products.length === 0) {
        return {};
      }

      console.log('Step 3: Extracting key frames for each product...');

      const videoPath = state.videoPath!;
      const extractedFrames: ExtractedFrame[] = [];

      for (const product of state.products) {
        console.log(`Finding best frame for: ${product.name}`);

        // Extract multiple frames for comparison
        const framePaths = await this.videoProcessor.extractFrames(videoPath, [3, 8, 15, 25, 40]);

        const frames = await Promise.all(
          framePaths.map(async (path, idx) => ({
            base64: await this.videoProcessor.frameToBase64(path),
            timestamp: [3, 8, 15, 25, 40][idx],
            path,
          }))
        );

        // Let Gemini select the best frame
        const selection = await this.geminiClient.selectBestFrame(
          frames.map(f => ({ base64: f.base64, timestamp: f.timestamp })),
          product.name
        );

        if (selection.frameIndex >= 0 && selection.frameIndex < frames.length) {
          const bestFrame = frames[selection.frameIndex];
          extractedFrames.push({
            productId: product.id,
            frameTimestamp: bestFrame.timestamp,
            frameBase64: bestFrame.base64,
            reason: selection.reason,
          });
          console.log(`Selected frame at ${bestFrame.timestamp}s for ${product.name}: ${selection.reason}`);
        }

        await this.videoProcessor.cleanup(framePaths);
      }

      return {
        extractedFrames,
      };
    } catch (error: any) {
      console.error('Error in extractKeyFrames:', error);
      return {
        error: `Failed to extract key frames: ${error.message}`,
      };
    }
  }

  // Node 4: Segment products from frames
  async segmentProducts(state: GraphStateType): Promise<Partial<GraphStateType>> {
    try {
      if (state.error || !state.extractedFrames || state.extractedFrames.length === 0) {
        return {};
      }

      console.log('Step 4: Segmenting products from frames...');

      const segmentedImages: SegmentedImage[] = [];

      for (const frame of state.extractedFrames) {
        const product = state.products.find(p => p.id === frame.productId);
        if (!product) continue;

        console.log(`Segmenting: ${product.name}`);

        const segmentResult = await this.geminiClient.segmentProduct(frame.frameBase64, product.name);

        segmentedImages.push({
          productId: product.id,
          segmentedBase64: segmentResult.segmentedBase64,
        });

        console.log(`Segmentation complete for ${product.name}`);
      }

      return {
        segmentedImages,
      };
    } catch (error: any) {
      console.error('Error in segmentProducts:', error);
      return {
        error: `Failed to segment products: ${error.message}`,
      };
    }
  }

  // Node 5: Enhance segmented images with different backgrounds
  async enhanceImages(state: GraphStateType): Promise<Partial<GraphStateType>> {
    try {
      if (state.error || !state.segmentedImages || state.segmentedImages.length === 0) {
        return {};
      }

      console.log('Step 5: Enhancing product images...');

      const enhancedImages: EnhancedImage[] = [];

      for (const segmentedImg of state.segmentedImages) {
        const product = state.products.find(p => p.id === segmentedImg.productId);
        if (!product) continue;

        console.log(`Enhancing: ${product.name}`);

        const enhancements = await this.geminiClient.generateEnhancedImages(
          segmentedImg.segmentedBase64,
          product.name,
          ['professional white background', 'gradient blue background', 'lifestyle wooden desk setting']
        );

        for (const enhancement of enhancements) {
          enhancedImages.push({
            productId: product.id,
            style: enhancement.style,
            enhancedBase64: segmentedImg.segmentedBase64, // In production, would generate actual enhanced image
            description: enhancement.description,
          });
        }

        console.log(`Generated ${enhancements.length} enhanced versions for ${product.name}`);
      }

      return {
        enhancedImages,
      };
    } catch (error: any) {
      console.error('Error in enhanceImages:', error);
      return {
        error: `Failed to enhance images: ${error.message}`,
      };
    }
  }

  // Cleanup node
  async cleanup(state: GraphStateType): Promise<Partial<GraphStateType>> {
    try {
      if (state.videoPath) {
        await this.videoProcessor.cleanup([state.videoPath]);
      }
      await this.videoProcessor.cleanupTempDir();
      console.log('Cleanup complete');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
    return {};
  }

  // Build the workflow graph
  buildWorkflow() {
    const workflow = new StateGraph(GraphState);

    // Add nodes
    workflow.addNode('downloadAndExtractFrames', this.downloadAndExtractFrames.bind(this));
    workflow.addNode('identifyProducts', this.identifyProducts.bind(this));
    workflow.addNode('extractKeyFrames', this.extractKeyFrames.bind(this));
    workflow.addNode('segmentProducts', this.segmentProducts.bind(this));
    workflow.addNode('enhanceImages', this.enhanceImages.bind(this));
    workflow.addNode('cleanup', this.cleanup.bind(this));

    // Set entry point
    workflow.setEntryPoint('downloadAndExtractFrames');

    // Define edges
    workflow.addEdge('downloadAndExtractFrames', 'identifyProducts');
    workflow.addEdge('identifyProducts', 'extractKeyFrames');
    workflow.addEdge('extractKeyFrames', 'segmentProducts');
    workflow.addEdge('segmentProducts', 'enhanceImages');
    workflow.addEdge('enhanceImages', 'cleanup');
    workflow.addEdge('cleanup', END);

    return workflow.compile();
  }

  async processVideo(videoUrl: string): Promise<WorkflowState> {
    const workflow = this.buildWorkflow();

    const initialState: WorkflowState = {
      videoUrl,
      products: [],
      extractedFrames: [],
      segmentedImages: [],
      enhancedImages: [],
    };

    const result = await workflow.invoke(initialState);
    return result as WorkflowState;
  }
}

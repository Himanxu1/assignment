export interface ProductInfo {
  id: string;
  name: string;
  description: string;
  confidence: number;
}

export interface ExtractedFrame {
  productId: string;
  frameTimestamp: number;
  frameBase64: string;
  reason: string;
}

export interface SegmentedImage {
  productId: string;
  segmentedBase64: string;
  maskBase64?: string;
}

export interface EnhancedImage {
  productId: string;
  style: string;
  enhancedBase64: string;
  description: string;
}

export interface WorkflowState {
  videoUrl: string;
  videoPath?: string;
  products: ProductInfo[];
  extractedFrames: ExtractedFrame[];
  segmentedImages: SegmentedImage[];
  enhancedImages: EnhancedImage[];
  error?: string;
}

export interface ProcessVideoRequest {
  videoUrl: string;
}

export interface ProcessVideoResponse {
  success: boolean;
  data?: WorkflowState;
  error?: string;
}

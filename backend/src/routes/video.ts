import express from 'express';
import { ProductExtractionWorkflow } from '../workflows/productExtraction.js';
import { ProcessVideoRequest, ProcessVideoResponse } from '../types/index.js';

const router = express.Router();

router.post('/process', async (req: express.Request, res: express.Response) => {
  try {
    const { videoUrl } = req.body as ProcessVideoRequest;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Video URL is required',
      } as ProcessVideoResponse);
    }

    // Validate YouTube URL
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL',
      } as ProcessVideoResponse);
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured',
      } as ProcessVideoResponse);
    }

    console.log(`Processing video: ${videoUrl}`);

    const workflow = new ProductExtractionWorkflow(geminiApiKey);
    const result = await workflow.processVideo(videoUrl);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
      } as ProcessVideoResponse);
    }

    res.json({
      success: true,
      data: result,
    } as ProcessVideoResponse);
  } catch (error: any) {
    console.error('Error processing video:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ProcessVideoResponse);
  }
});

router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Video processing service is running' });
});

export default router;

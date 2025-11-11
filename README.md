# AI Product Image Extractor

An end-to-end AI-powered solution for extracting and enhancing product images from YouTube videos (reviews, unboxings, demos) using Google Gemini and LangGraph.

## Overview

This application automatically:
1. Accepts a YouTube video URL of a product showcase
2. Identifies all products visible in the video
3. Extracts the best frame for each product where it's most clearly shown
4. Segments the product from the background
5. Generates 2-3 enhanced product shots with different backgrounds/styles

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Orchestration**: LangGraph (workflow state management)
- **AI Model**: Google Gemini 1.5 Flash (multimodal vision and text)
- **Video Processing**: ytdl-core (download), fluent-ffmpeg (frame extraction)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## Architecture

### LangGraph Workflow

The backend uses LangGraph to orchestrate a sequential AI processing pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph Workflow                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. downloadAndExtractFrames                                 │
│     ├─ Download YouTube video                               │
│     └─ Extract frames at multiple timestamps                │
│                        ↓                                     │
│  2. identifyProducts                                         │
│     ├─ Analyze frames with Gemini vision                    │
│     └─ Detect all products with confidence scores           │
│                        ↓                                     │
│  3. extractKeyFrames                                         │
│     ├─ For each product, extract candidate frames           │
│     └─ Let Gemini select the best frame                     │
│                        ↓                                     │
│  4. segmentProducts                                          │
│     ├─ Analyze product boundaries with Gemini               │
│     └─ Generate segmentation metadata                       │
│                        ↓                                     │
│  5. enhanceImages                                            │
│     ├─ Generate enhancement descriptions                    │
│     └─ Create 2-3 styled variants per product               │
│                        ↓                                     │
│  6. cleanup                                                  │
│     └─ Remove temporary files                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│          │   HTTP   │          │  Gemini  │          │
│ Next.js  │ ────────▶│ Express  │ ────────▶│  Gemini  │
│ Frontend │  POST    │ Backend  │   API    │   API    │
│          │◀──────── │          │◀──────── │          │
│          │   JSON   │          │  Vision  │          │
└──────────┘          └──────────┘          └──────────┘
     │                     │
     │                     │
     │                     └──────┐
     │                            │
     │                     ┌──────▼──────┐
     │                     │             │
     └────────────────────▶│  LangGraph  │
       Display Results     │  Workflow   │
                           │             │
                           └─────────────┘
```

### API Endpoints

**POST** `/api/video/process`
- Accepts YouTube video URL
- Returns extracted products, frames, segmented images, and enhancements
- Processing time: 2-5 minutes depending on video length

**GET** `/api/video/health`
- Health check endpoint

## Setup Instructions

### Prerequisites

1. **Node.js 18+** and npm
2. **FFmpeg** - Required for video processing
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # Windows - Download from ffmpeg.org
   ```
3. **Google Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# Run development server
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Enter a YouTube URL of a product video (review, unboxing, or demo)
4. Click "Extract Product Images"
5. Wait 2-5 minutes for processing
6. View results showing:
   - Identified products with confidence scores
   - Best extracted frame per product with timestamp
   - Segmented product images
   - Enhanced product shots with different backgrounds

## Project Structure

```
assignment/
├── backend/                    # Express + LangGraph backend
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── routes/
│   │   │   └── video.ts       # API route handlers
│   │   ├── workflows/
│   │   │   └── productExtraction.ts  # LangGraph workflow
│   │   ├── utils/
│   │   │   ├── video.ts       # Video download/frame extraction
│   │   │   └── gemini.ts      # Gemini API client
│   │   └── types/
│   │       └── index.ts       # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── VideoInput.tsx     # URL input form
│   │   ├── ProductCard.tsx    # Product display
│   │   └── Results.tsx        # Results grid
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── planning.md                 # Original requirements
└── README.md                   # This file
```

## How It Works

### Step 1: Video Input & Frame Extraction
- Frontend sends YouTube URL to backend
- Backend downloads video using `ytdl-core`
- FFmpeg extracts frames at strategic intervals (2s, 5s, 10s, 15s, etc.)

### Step 2: Product Identification (LangGraph Node)
- Gemini analyzes multiple frames using vision capabilities
- Identifies all distinct products across frames
- Assigns confidence scores based on visibility and clarity
- Deduplicates products found in multiple frames

**Prompt Strategy**: Ask Gemini to return structured JSON with product names, descriptions, and confidence scores.

### Step 3: Key Frame Selection (LangGraph Node)
- For each identified product, extract more candidate frames
- Send all frames to Gemini with the product name
- Gemini evaluates and selects the single best frame based on:
  - Product visibility and clarity
  - Lighting quality
  - Focus and sharpness
  - Frame composition
- Returns selected frame with reasoning

**Prompt Strategy**: Comparative analysis prompt asking Gemini to evaluate multiple options and explain its choice.

### Step 4: Image Segmentation (LangGraph Node)
- Send selected frame to Gemini with product name
- Gemini analyzes product boundaries and provides segmentation metadata
- Describes what should be kept vs removed

**Current Implementation**: Uses Gemini for segmentation analysis (returns original image with metadata)

**Future Enhancement**: Integrate with Segment Anything Model (SAM) or similar for pixel-perfect segmentation.

### Step 5: Image Enhancement (LangGraph Node)
- For each segmented product image, generate 2-3 enhanced versions
- Styles used:
  1. Professional white background (e-commerce style)
  2. Gradient background (modern marketing)
  3. Lifestyle setting (contextual placement)
- Gemini generates detailed enhancement descriptions for each style

**Current Implementation**: Returns descriptions and original images

**Future Enhancement**: Integrate with Imagen, DALL-E 3, or Stable Diffusion for actual image generation.

### Step 6: Display Results
- Backend returns all data to frontend as JSON with base64-encoded images
- Frontend displays products in responsive grid
- Each product card shows: original frame, segmented image, and enhanced versions

## Approach & Design Decisions

### Why LangGraph?
- **State Management**: Cleanly manages complex multi-step workflow state
- **Debuggability**: Each node's input/output is traceable
- **Reliability**: Built-in retry logic and error handling
- **Scalability**: Easy to add new processing steps or parallel branches

### Why Gemini?
- **Multimodal**: Single model handles both vision and text tasks
- **Quality**: Strong performance on product identification and frame selection
- **API Design**: Simple REST API with good documentation
- **Cost**: Competitive pricing for vision tasks

### Why Base64 for Images?
- **Simplicity**: No need for separate image storage/CDN in MVP
- **Completeness**: All data in single API response
- **Trade-off**: Large payload size (future: use cloud storage + URLs)

## Challenges Faced

### 1. YouTube Download Restrictions
**Challenge**: `ytdl-core` struggles with some YouTube videos due to rate limiting and signature decryption.

**Solution**:
- Used highest quality streams
- Added error handling and retry logic
- Future: Consider `yt-dlp` Python wrapper

### 2. Frame Extraction Timing
**Challenge**: Selecting which timestamps to extract frames from.

**Solution**:
- Extract frames at strategic intervals (early, middle, late in video)
- Let Gemini handle frame quality assessment
- Trade-off: More frames = longer processing but better results

### 3. Gemini Vision Context Window
**Challenge**: Gemini has limits on number of images per request.

**Solution**:
- Process frames in batches for product identification
- Send curated set for frame selection (5-7 frames max)
- Future: Implement smarter frame pre-filtering

### 4. Image Segmentation Limitations
**Challenge**: Gemini can analyze but not perform pixel-level segmentation.

**Solution**:
- Return segmentation metadata/descriptions
- Noted as future improvement to integrate SAM or similar
- Current implementation is a proof of concept

### 5. Image Enhancement Limitations
**Challenge**: No native image generation in LangGraph/Gemini ecosystem used.

**Solution**:
- Generate detailed enhancement descriptions
- Return original images as placeholders
- Documented as future enhancement with Imagen/DALL-E

## Time Spent

| Section | Time | Notes |
|---------|------|-------|
| Planning & Architecture | 30 min | Designed LangGraph workflow, chose tech stack |
| Backend Setup | 45 min | TypeScript config, Express, LangGraph setup |
| Video Processing Utils | 30 min | ytdl-core and ffmpeg integration |
| Gemini Client | 45 min | API integration, prompt engineering |
| LangGraph Workflow | 60 min | 5 workflow nodes, state management, error handling |
| Frontend Setup | 30 min | Next.js, Tailwind, TypeScript config |
| UI Components | 60 min | VideoInput, ProductCard, Results components |
| API Integration | 20 min | Axios client, error handling |
| Testing & Debugging | 45 min | End-to-end testing, bug fixes |
| Documentation | 45 min | README files for both frontend and backend |
| **Total** | **~6.5 hours** | |

## Ideas for Improvements & Scalability

### Near-Term Improvements
1. **Real Segmentation**: Integrate Segment Anything Model (SAM) for actual product segmentation
2. **Real Enhancement**: Use Imagen 3, DALL-E 3, or Stable Diffusion for image generation
3. **Progress Updates**: WebSocket or SSE for real-time progress notifications
4. **Video Preview**: Embed YouTube player so users can preview the video
5. **Batch Processing**: Allow multiple videos in queue

### Scalability Enhancements
1. **Database**:
   - PostgreSQL for results persistence
   - Redis for caching Gemini responses
   - S3/Cloudinary for image storage instead of base64

2. **Job Queue**:
   - Bull/BullMQ for async job processing
   - Separate worker processes for video downloading
   - Handle multiple concurrent video processing jobs

3. **Microservices**:
   - Separate video processing service
   - Dedicated AI inference service
   - API gateway for routing

4. **Performance**:
   - Parallelize frame analysis (currently sequential)
   - Implement frame pre-filtering to reduce Gemini API calls
   - Use GPU for any local ML operations
   - Compress images before transmission

5. **Reliability**:
   - Implement comprehensive retry logic
   - Add circuit breakers for external API calls
   - Store intermediate results for resume capability
   - Health checks and monitoring

6. **Features**:
   - User authentication and history
   - Saved collections of extracted products
   - Comparison mode for A/B testing enhancements
   - Export to various formats (PNG, PDF, catalog)
   - Bulk upload from CSV of video URLs
   - Integration with e-commerce platforms

7. **ML Improvements**:
   - Fine-tune custom model for product detection
   - Train model on e-commerce product images
   - Use ensemble of models for better accuracy
   - Implement active learning from user feedback

## Known Limitations

1. **Video Length**: Very long videos (>15 min) may timeout or consume excessive resources
2. **Product Types**: Best for physical products; struggles with abstract concepts or services
3. **Video Quality**: Requires decent video quality; struggles with heavily compressed or low-res videos
4. **API Costs**: Each video incurs multiple Gemini API calls (can add up for high volume)
5. **Processing Time**: 2-5 minutes per video (not suitable for real-time use cases)
6. **No Authentication**: Current implementation has no user auth or rate limiting
7. **Single Language**: Prompts and responses in English only

## License

ISC

## Author

himanxu1 (technophilic000@gmail.com)

## Acknowledgments

- Google Gemini for multimodal AI capabilities
- LangGraph for workflow orchestration
- Next.js and React teams for the excellent framework
- ytdl-core and fluent-ffmpeg contributors

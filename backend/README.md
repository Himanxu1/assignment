# Product Image Extractor - Backend

AI-powered backend service for extracting and enhancing product images from YouTube videos using LangGraph and Google Gemini.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Orchestration**: LangGraph
- **AI Model**: Google Gemini (multimodal)
- **Video Processing**: ytdl-core, fluent-ffmpeg

## Architecture

The backend uses LangGraph to orchestrate a multi-step AI workflow:

1. **Download & Extract Frames**: Downloads YouTube video and extracts frames at various timestamps
2. **Identify Products**: Uses Gemini vision to identify all products across multiple frames
3. **Extract Key Frames**: For each product, Gemini selects the best frame where it's most visible
4. **Segment Products**: Gemini analyzes and segments the product from the background
5. **Enhance Images**: Generates enhanced product shots with different backgrounds/styles

## Setup

### Prerequisites

- Node.js 18+ and npm
- FFmpeg installed on your system
- Google Gemini API key

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Build and run production:**
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/video/process

Process a YouTube video to extract and enhance product images.

**Request:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoUrl": "...",
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "description": "Description",
        "confidence": 85
      }
    ],
    "extractedFrames": [
      {
        "productId": "uuid",
        "frameTimestamp": 15,
        "frameBase64": "...",
        "reason": "Best visibility and lighting"
      }
    ],
    "segmentedImages": [
      {
        "productId": "uuid",
        "segmentedBase64": "..."
      }
    ],
    "enhancedImages": [
      {
        "productId": "uuid",
        "style": "professional white background",
        "enhancedBase64": "...",
        "description": "Enhancement description"
      }
    ]
  }
}
```

### GET /api/video/health

Health check endpoint.

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Express server entry point
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── routes/
│   │   └── video.ts             # API route handlers
│   ├── workflows/
│   │   └── productExtraction.ts # LangGraph workflow
│   └── utils/
│       ├── video.ts             # Video processing utilities
│       └── gemini.ts            # Gemini API client
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### LangGraph Workflow

The `ProductExtractionWorkflow` class defines a state graph with 6 nodes:

```
downloadAndExtractFrames → identifyProducts → extractKeyFrames
    → segmentProducts → enhanceImages → cleanup → END
```

Each node is a pure function that takes the current state and returns state updates. This makes the workflow:
- **Debuggable**: Each step's input/output is traceable
- **Recoverable**: Can retry individual nodes on failure
- **Testable**: Each node can be tested independently

### Gemini Integration

The `GeminiClient` class provides methods for:

- **Product Detection**: Analyzes frames to identify products with confidence scores
- **Frame Selection**: Evaluates multiple frames to pick the best one per product
- **Product Segmentation**: Describes segmentation boundaries (placeholder for actual segmentation)
- **Image Enhancement**: Generates descriptions for enhanced product shots

## Limitations & Future Improvements

1. **Image Segmentation**: Currently uses Gemini for analysis but doesn't perform actual pixel-level segmentation. Could integrate with specialized segmentation APIs like Segment Anything Model (SAM).

2. **Image Enhancement**: Generates descriptions but doesn't create actual enhanced images. Could integrate with Imagen or Stable Diffusion for real image generation.

3. **Video Download**: Limited by ytdl-core capabilities. May need alternative solutions for restricted videos.

4. **Performance**: Processing is sequential. Could parallelize frame analysis for faster results.

5. **Storage**: All data kept in memory. Should add database for persistence and job queue for long-running tasks.

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- TypeScript compiled to `dist/` directory
- Temporary files stored in `tmp/` directory (gitignored)
- Supports hot reload via `tsx watch` in development

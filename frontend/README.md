# Product Image Extractor - Frontend

Modern Next.js frontend for the AI-powered product image extraction application.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI**: React 19

## Features

- YouTube video URL input form
- Real-time processing status with loading indicators
- Responsive display of extraction results:
  - Identified products with confidence scores
  - Extracted key frames with timestamps
  - Segmented product images
  - Enhanced product shots with different styles
- Dark mode support
- Mobile-responsive design

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Configure API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the Application

**Development mode (with hot reload):**
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

**Build for production:**
```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── VideoInput.tsx      # YouTube URL input form
│   ├── ProductCard.tsx     # Individual product display
│   └── Results.tsx         # Results grid container
├── lib/
│   ├── api.ts              # API client functions
│   └── types.ts            # TypeScript type definitions
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Component Architecture

### VideoInput Component
- Accepts YouTube URL from user
- Validates input format
- Shows loading state during processing
- Displays processing status message

### Results Component
- Grid layout for multiple products
- Handles empty state (no products found)
- Responsive design (1 column on mobile, 2 on desktop)

### ProductCard Component
- Displays comprehensive product information:
  - Product name, description, and confidence
  - Extracted frame with timestamp and reason
  - Segmented product image
  - 2-3 enhanced product shots with descriptions
- Organized in collapsible sections

## API Integration

The frontend communicates with the backend via RESTful API:

**Endpoint:** `POST /api/video/process`

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
    "products": [...],
    "extractedFrames": [...],
    "segmentedImages": [...],
    "enhancedImages": [...]
  }
}
```

## Styling

- Uses Tailwind CSS for utility-first styling
- Dark mode support via CSS variables
- Responsive breakpoints for mobile/tablet/desktop
- Custom color scheme with gradients
- Loading animations and transitions

## Error Handling

- Network errors: Displays user-friendly error message
- API errors: Shows specific error from backend
- Empty results: Helpful message suggesting to try another video
- Form validation: Ensures valid YouTube URL before submission

## Future Improvements

1. **Progress Tracking**: Real-time progress updates via WebSockets or Server-Sent Events
2. **History**: Save and display previously processed videos
3. **Download**: Allow users to download extracted/enhanced images
4. **Comparison**: Side-by-side comparison of original vs enhanced
5. **Batch Processing**: Process multiple videos at once
6. **Video Preview**: Embed YouTube player to preview the video
7. **Image Editor**: Basic editing tools for further customization
8. **Share**: Generate shareable links to results

## Performance Considerations

- Images transmitted as base64 strings (convenient but large payloads)
- Consider implementing:
  - Image compression
  - Cloud storage for images (S3, Cloudinary)
  - Pagination for multiple products
  - Lazy loading for enhanced images
  - CDN for static assets

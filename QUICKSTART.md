# Quick Start Guide

Get the AI Product Image Extractor running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] FFmpeg installed (`ffmpeg -version`)
- [ ] Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

## Installation Steps

### 1. Install FFmpeg (if not already installed)

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

### 2. Set Up Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here

# Start the backend server
npm run dev
```

Backend should now be running on `http://localhost:3001`

### 3. Set Up Frontend (in a new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start the frontend server
npm run dev
```

Frontend should now be running on `http://localhost:3000`

## Usage

1. Open your browser to `http://localhost:3000`
2. Paste a YouTube URL of a product video (example: product review, unboxing, or demo)
3. Click "Extract Product Images"
4. Wait 2-5 minutes for processing
5. View the extracted and enhanced product images!

## Example YouTube Videos to Try

Good test videos (product reviews with clear product shots):
- iPhone unboxing videos
- Tech gadget reviews
- Product demos on official channels
- Unboxing videos with good lighting

## Troubleshooting

### "Cannot find ffmpeg"
- Make sure FFmpeg is installed and in your system PATH
- Try running `ffmpeg -version` in terminal

### "Gemini API key not configured"
- Check that your `.env` file in the backend has `GEMINI_API_KEY=your_key`
- Make sure there are no quotes around the key
- Verify the key is valid at Google AI Studio

### "Failed to download video"
- Some YouTube videos have download restrictions
- Try a different video
- Check your internet connection

### Backend not connecting to Frontend
- Ensure backend is running on port 3001
- Check CORS settings in backend `.env` file
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Port already in use
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill

# Frontend (port 3000)
lsof -ti:3000 | xargs kill
```

## What to Expect

**Processing Time**: 2-5 minutes per video

**Output**:
- Identified products with confidence scores
- Best frame for each product with AI reasoning
- Segmented product images
- 2-3 enhanced versions with different backgrounds

**Resource Usage**:
- CPU: Moderate during video download and frame extraction
- Memory: ~200-500 MB per video being processed
- Disk: Temporary files are cleaned up automatically

## Next Steps

- Read the full [README.md](README.md) for architecture details
- Check [backend/README.md](backend/README.md) for API documentation
- See [frontend/README.md](frontend/README.md) for component details
- Review [planning.md](planning.md) for original requirements

## Support

Having issues? Check:
1. Console logs in terminal (both backend and frontend)
2. Browser developer console (F12)
3. Ensure all prerequisites are installed
4. Verify API key is correct

## Production Deployment

For production use:

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

Consider:
- Using a process manager (PM2, systemd)
- Setting up reverse proxy (nginx)
- Enabling HTTPS
- Adding rate limiting
- Implementing authentication
- Using cloud storage for images

---

Happy extracting!

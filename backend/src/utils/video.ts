import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class VideoProcessor {
  private tempDir: string;

  constructor(tempDir: string = './tmp') {
    this.tempDir = tempDir;
  }

  async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  async downloadYouTubeVideo(videoUrl: string): Promise<string> {
    await this.ensureTempDir();
    const videoId = uuidv4();
    const videoPath = path.join(this.tempDir, `${videoId}.mp4`);

    return new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, { quality: 'highest' });
      const writeStream = require('fs').createWriteStream(videoPath);

      stream.pipe(writeStream);

      writeStream.on('finish', () => resolve(videoPath));
      writeStream.on('error', reject);
      stream.on('error', reject);
    });
  }

  async extractFrames(videoPath: string, intervals: number[] = [1, 3, 5, 10, 15, 20, 30, 45, 60]): Promise<string[]> {
    await this.ensureTempDir();
    const framePaths: string[] = [];

    for (const timestamp of intervals) {
      const framePath = path.join(this.tempDir, `frame_${uuidv4()}_${timestamp}s.jpg`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [timestamp],
            filename: path.basename(framePath),
            folder: this.tempDir,
          })
          .on('end', () => {
            framePaths.push(framePath);
            resolve();
          })
          .on('error', (err) => {
            console.error(`Error extracting frame at ${timestamp}s:`, err.message);
            resolve(); // Continue even if one frame fails
          });
      });
    }

    return framePaths;
  }

  async frameToBase64(framePath: string): Promise<string> {
    const buffer = await fs.readFile(framePath);
    return buffer.toString('base64');
  }

  async cleanup(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  }

  async cleanupTempDir(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(path.join(this.tempDir, file));
      }
    } catch (error) {
      console.error('Error cleaning temp directory:', error);
    }
  }
}

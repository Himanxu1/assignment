import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import YTDlpWrapLib from "yt-dlp-wrap";
// yt-dlp-wrap is a CJS module; in ESM context the full module.exports becomes
// the default import, so the actual class sits on .default.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YTDlpWrap: typeof YTDlpWrapLib = (YTDlpWrapLib as any).default ?? YTDlpWrapLib;

/**
 * This is vedioProcessor class
 * used to create the video and process the video
 * the main task it to process the video and figure out the segments where the product
 * is shown and then find the best shot of that product ,
 *
 */
export class VideoProcessor {
  private tempDir: string;

  constructor(tempDir: string = "./tmp") {
    this.tempDir = tempDir;
  }

  async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error("Error creating temp directory:", error);
    }
  }

  async downloadYouTubeVideo(videoUrl: string): Promise<string> {
    await this.ensureTempDir();

    const videoId = uuidv4();
    const outputPath = path.join(this.tempDir, `${videoId}.mp4`);
    const binaryPath = path.resolve("./yt-dlp-bin");

    // Download latest yt-dlp binary if not present
    try {
      await fs.access(binaryPath);
    } catch {
      console.log("Downloading latest yt-dlp binary...");
      await YTDlpWrap.downloadFromGithub(binaryPath);
      console.log("yt-dlp binary ready.");
    }

    const ytDlp = new YTDlpWrap(binaryPath);

    console.log(`Running yt-dlp for: ${videoUrl}`);

    await ytDlp.execPromise([
      videoUrl,
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", outputPath,
      "--no-update",
    ]);

    return outputPath;
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          return reject(err);
        }
        const duration = metadata.format.duration || 0;
        resolve(duration);
      });
    });
  }

  async extractFrames(
    videoPath: string,
    intervals: number[] = [1, 3, 5, 10, 15, 20, 30, 45, 60]
  ): Promise<string[]> {
    await this.ensureTempDir();
    const framePaths: string[] = [];

    // Get video duration first
    const duration = await this.getVideoDuration(videoPath);
    console.log(`Video duration: ${duration.toFixed(2)}s`);

    // Filter intervals to only include timestamps within video duration
    // Leave 0.5s buffer at the end to avoid edge cases
    const validIntervals = intervals.filter(t => t < duration - 0.5);

    if (validIntervals.length === 0) {
      // If video is very short, extract frames at 10%, 30%, 50%, 70%, 90% of duration
      const percentages = [0.1, 0.3, 0.5, 0.7, 0.9];
      validIntervals.push(...percentages.map(p => p * duration));
    }

    console.log(`Extracting ${validIntervals.length} frames at timestamps:`, validIntervals.map(t => `${t.toFixed(1)}s`).join(', '));

    for (const timestamp of validIntervals) {
      const framePath = path.join(
        this.tempDir,
        `frame_${uuidv4()}_${timestamp.toFixed(1)}s.jpg`
      );

      await new Promise<void>((resolve) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [timestamp],
            filename: path.basename(framePath),
            folder: this.tempDir,
          })
          .on("end", () => {
            framePaths.push(framePath);
            resolve();
          })
          .on("error", (err) => {
            console.error(
              `Error extracting frame at ${timestamp}s:`,
              err.message
            );
            resolve(); // Continue even if one frame fails
          });
      });
    }

    console.log(`Successfully extracted ${framePaths.length} frames`);
    return framePaths;
  }

  async frameToBase64(framePath: string): Promise<string> {
    const buffer = await fs.readFile(framePath);
    return buffer.toString("base64");
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
      console.error("Error cleaning temp directory:", error);
    }
  }
}

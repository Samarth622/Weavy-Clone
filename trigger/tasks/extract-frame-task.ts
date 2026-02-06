import { task } from "@trigger.dev/sdk/v3";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegStatic from "ffmpeg-static";

export const extractFrameTask = task({
  id: "extract-frame-task",
  run: async (payload: {
    video: string;
    timestamp: number; // seconds
  }) => {
    const { video, timestamp } = payload;

    const ffmpegPath = "C:\\Users\\gupta\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe";

    if (!ffmpegPath) {
      throw new Error("ffmpeg-static failed to resolve binary path");
    }

    const base64Data = video.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `frame-${Date.now()}.png`);

    fs.writeFileSync(inputPath, buffer);

    await new Promise<void>((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegPath, [
        "-y",
        "-i", inputPath,
        "-ss", String(timestamp),
        "-vframes", "1",
        outputPath,
      ]);

      ffmpegProcess.stderr.on("data", (data) => {
        console.log("FFmpeg stderr:", data.toString());
      });

      ffmpegProcess.stdout.on("data", (data) => {
        console.log("FFmpeg stdout:", data.toString());
      });

      ffmpegProcess.on("close", (code) => {
        console.log("FFmpeg exit code:", code);
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });

      ffmpegProcess.on("error", reject);
    });

    const outputBuffer = fs.readFileSync(outputPath);
    const outputBase64 =
      "data:image/png;base64," +
      outputBuffer.toString("base64");

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return outputBase64;
  },
});

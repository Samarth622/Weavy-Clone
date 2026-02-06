import { task } from "@trigger.dev/sdk/v3";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const cropTask = task({
  id: "crop-task",
  run: async (payload: {
    image: string;
    width: number;
    height: number;
    x: number;
    y: number;
  }) => {
    const { image, width, height, x, y } = payload;

    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.png`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.png`);

    fs.writeFileSync(inputPath, buffer);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath as string, [
        "-i",
        inputPath,
        "-filter:v",
        `crop=${width}:${height}:${x}:${y}`,
        outputPath,
      ]);

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("FFmpeg failed"));
      });

      ffmpeg.on("error", reject);
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

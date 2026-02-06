import { task } from "@trigger.dev/sdk/v3";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const cropTask = task({
  id: "crop-task",
  run: async (payload: {
    image: string;
    mode: "full" | "1:1" | "16:9" | "4:3";
  }) => {
    const { image, mode } = payload;

    // If full image selected, skip cropping
    if (mode === "full") {
      return image;
    }

    const ffmpegPath = "C:\\Users\\gupta\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe";

    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.png`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.png`);

    fs.writeFileSync(inputPath, buffer);

    // First: get image dimensions using ffprobe
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const probe = spawn(ffmpegPath, [
          "-i",
          inputPath,
        ]);

        let stderr = "";

        probe.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        probe.on("close", () => {
          const match = stderr.match(/, (\d+)x(\d+)/);
          if (!match) return reject(new Error("Could not detect dimensions"));

          resolve({
            width: parseInt(match[1]),
            height: parseInt(match[2]),
          });
        });

        probe.on("error", reject);
      }
    );

    const { width: imgW, height: imgH } = dimensions;

    let cropW = imgW;
    let cropH = imgH;

    const ratioMap: any = {
      "1:1": 1,
      "16:9": 16 / 9,
      "4:3": 4 / 3,
    };

    const targetRatio = ratioMap[mode];

    if (imgW / imgH > targetRatio) {
      cropH = imgH;
      cropW = imgH * targetRatio;
    } else {
      cropW = imgW;
      cropH = imgW / targetRatio;
    }

    const x = Math.floor((imgW - cropW) / 2);
    const y = Math.floor((imgH - cropH) / 2);

    await new Promise<void>((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegPath, [
        "-y",
        "-i",
        inputPath,
        "-filter:v",
        `crop=${Math.floor(cropW)}:${Math.floor(cropH)}:${x}:${y}`,
        outputPath,
      ]);

      ffmpegProcess.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Crop failed with code ${code}`));
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

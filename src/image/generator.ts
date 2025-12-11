import type { Config } from "../config/schema";
import { composeBase } from "./composer";
import { compositeTextOnImage } from "./text-renderer";

export interface GenerateImageOptions {
  config: Config;
  currentTrackIndex: number;
  outputPath: string;
}

export async function generateImage(options: GenerateImageOptions): Promise<void> {
  const { config, currentTrackIndex, outputPath } = options;

  try {
    const baseImage = await composeBase(config.cover);

    const baseBuffer = await baseImage.png().toBuffer();

    const finalImage = await compositeTextOnImage(baseBuffer, config, currentTrackIndex);

    await finalImage.png({ quality: 100 }).toFile(outputPath);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate image for track ${currentTrackIndex + 1}: ${error.message}`);
    }
    throw error;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

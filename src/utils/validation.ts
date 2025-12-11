import { existsSync } from "fs";
import { resolve } from "path";
import { FONT_PATHS } from "../image/layout";
import sharp from "sharp";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateFonts(): void {
  const missingFonts: string[] = [];

  for (const [fontName, fontPath] of Object.entries(FONT_PATHS)) {
    const absolutePath = resolve(fontPath);
    if (!existsSync(absolutePath)) {
      missingFonts.push(`${fontName}: ${absolutePath}`);
    }
  }

  if (missingFonts.length > 0) {
    throw new ValidationError(
      `Missing font files:\n${missingFonts.map(f => `  - ${f}`).join("\n")}`
    );
  }
}

export async function validateCoverImage(coverPath: string): Promise<void> {
  const absolutePath = resolve(coverPath);

  if (!existsSync(absolutePath)) {
    throw new ValidationError(`Cover image not found: ${absolutePath}`);
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".gif"];
  const hasValidExtension = validExtensions.some(ext =>
    absolutePath.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    throw new ValidationError(
      `Invalid cover image format. Supported formats: ${validExtensions.join(", ")}`
    );
  }

  try {
    const metadata = await sharp(absolutePath).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 3000 || height < 3000) {
      throw new ValidationError(
        `Cover image must be at least 3000x3000 pixels. Current size: ${width}x${height}`
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Failed to read cover image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

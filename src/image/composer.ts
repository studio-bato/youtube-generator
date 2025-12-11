import sharp from "sharp";
import { LAYOUT } from "./layout";
import { Config } from "@/config/schema";

export interface CachedCoverBuffers {
  albumCoverBuffer: Buffer;
  blurredBgBuffer: Buffer;
}

export async function createBaseCanvas(): Promise<sharp.Sharp> {
  return sharp({
    create: {
      width: LAYOUT.canvas.width,
      height: LAYOUT.canvas.height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  });
}

export async function prepareAlbumCover(coverPath: string): Promise<Buffer> {
  return sharp(coverPath)
    .resize(LAYOUT.albumCover.width, LAYOUT.albumCover.height, {
      fit: "cover",
      position: "center",
    })
    .toBuffer();
}

export async function createBlurredBackground(
  coverPath: string,
  backgroundConfig: Config["background"]
): Promise<Buffer> {
  return sharp(coverPath, {
    unlimited: true, // Allow larger images
  })
    .resize(LAYOUT.rightPanel.width, LAYOUT.rightPanel.height, {
      fit: "cover",
      position: "center",
      kernel: sharp.kernel.lanczos3, // High-quality resize
    })
    .toColorspace("rgb16") // 16-bit processing
    .blur(10)
    .blur(20)
    .modulate({
      brightness: backgroundConfig.blurBrightness,
      saturation: 0.8,
    })
    .linear(1.003, -0.5) // Add subtle noise/dithering
    .toColorspace("srgb")
    .toBuffer();
}

export async function createColorBackground(
  backgroundConfig: Config["background"]
): Promise<Buffer> {
  if (!backgroundConfig.color) throw new Error("Missing background color");

  const noisebuffer = await sharp({
    create: {
      width: LAYOUT.rightPanel.width,
      height: LAYOUT.rightPanel.height,
      channels: 3,
      background: "#ffffff",
      noise: {
        type: "gaussian",
        mean: 128,
        sigma: 5, // Control the intensity/amount of grain
      },
    },
  }).toBuffer();

  return sharp({
    create: {
      width: LAYOUT.rightPanel.width,
      height: LAYOUT.rightPanel.height,
      channels: 3,
      background: backgroundConfig.color,
    },
  })
    .composite([
      {
        input: noisebuffer,
        blend: "overlay", // Common blend mode for adding grain
        raw: {
          width: LAYOUT.rightPanel.width,
          height: LAYOUT.rightPanel.height,
          channels: 3,
        },
      },
    ])
    .png()
    .toBuffer();
}

export async function prepareCoverCache(
  coverPath: string,
  backgroundConfig: Config["background"]
): Promise<CachedCoverBuffers> {
  const [albumCoverBuffer, blurredBgBuffer] = await Promise.all([
    prepareAlbumCover(coverPath),
    backgroundConfig.color
      ? createColorBackground(backgroundConfig)
      : createBlurredBackground(coverPath, backgroundConfig),
  ]);

  return { albumCoverBuffer, blurredBgBuffer };
}

export async function composeBaseFromCache(
  cache: CachedCoverBuffers
): Promise<sharp.Sharp> {
  const base = await createBaseCanvas();

  return base.composite([
    {
      input: cache.albumCoverBuffer,
      top: LAYOUT.albumCover.y,
      left: LAYOUT.albumCover.x,
    },
    {
      input: cache.blurredBgBuffer,
      top: LAYOUT.rightPanel.y,
      left: LAYOUT.rightPanel.x,
    },
  ]);
}

export async function composeBase(config: Config): Promise<sharp.Sharp> {
  const cache = await prepareCoverCache(config.cover, config.background);
  return composeBaseFromCache(cache);
}

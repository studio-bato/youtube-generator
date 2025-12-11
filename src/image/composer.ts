import sharp from "sharp";
import { LAYOUT } from "./layout";

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

export async function createBlurredBackground(coverPath: string): Promise<Buffer> {
  return sharp(coverPath)
    .resize(LAYOUT.rightPanel.width, LAYOUT.rightPanel.height, {
      fit: "cover",
      position: "center",
    })
    .blur(25)
    .modulate({
      brightness: 0.35,
    })
    .toBuffer();
}

export async function composeBase(coverPath: string): Promise<sharp.Sharp> {
  const [albumCoverBuffer, blurredBgBuffer] = await Promise.all([
    prepareAlbumCover(coverPath),
    createBlurredBackground(coverPath),
  ]);

  const base = await createBaseCanvas();

  return base.composite([
    {
      input: albumCoverBuffer,
      top: LAYOUT.albumCover.y,
      left: LAYOUT.albumCover.x,
    },
    {
      input: blurredBgBuffer,
      top: LAYOUT.rightPanel.y,
      left: LAYOUT.rightPanel.x,
    },
  ]);
}

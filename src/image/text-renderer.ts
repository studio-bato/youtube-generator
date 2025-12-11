import sharp from "sharp";
import type { Config } from "../config/schema";
import { FONT_SIZES, LAYOUT } from "./layout";

function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface TextLayer {
  buffer: Buffer;
  top: number;
  left: number;
}

export async function renderTextLayers(
  config: Config,
  currentTrackIndex: number
): Promise<TextLayer[]> {
  const layers: TextLayer[] = [];
  const maxWidth = LAYOUT.rightPanel.width;
  const centerX = maxWidth / 2;
  const panelLeft = LAYOUT.rightPanel.x;

  const artistName = escapeXML(config.artist);
  const albumName = escapeXML(config.album);
  const currentTrack = config.tracks[currentTrackIndex];

  // Calculate total content height
  const lineHeight = FONT_SIZES.trackList * 1.8;
  const trackListHeight = config.tracks.length * lineHeight;
  const spacingBetweenSections = 120;
  const spacingAfterArtist = 60;
  const spacingAfterCurrentSong = 30;

  let totalHeight = FONT_SIZES.artist + spacingAfterArtist + FONT_SIZES.album + spacingBetweenSections + trackListHeight + spacingBetweenSections + FONT_SIZES.currentSong + spacingAfterCurrentSong;

  if (currentTrack.artists.length > 0) {
    totalHeight += FONT_SIZES.currentArtists;
  }

  // Start Y position to center content vertically
  const centerY = LAYOUT.rightPanel.height / 2;
  let currentY = centerY - totalHeight / 2;

  currentY += FONT_SIZES.artist;
  const artistSvg = `
    <svg width="${maxWidth}" height="${FONT_SIZES.artist + 20}">
      <style>
        @font-face {
          font-family: 'Clear Sans';
          src: url('./fonts/clear-sans/TTF/ClearSans-Regular.ttf');
          font-weight: normal;
        }
      </style>
      <text x="${centerX}" y="${FONT_SIZES.artist}"
        font-family="Clear Sans, Arial, sans-serif"
        font-size="${FONT_SIZES.artist}"
        text-anchor="middle"
        fill="${config.colors.main}">
        ${artistName}
      </text>
    </svg>
  `;

  layers.push({
    buffer: Buffer.from(artistSvg),
    top: currentY - FONT_SIZES.artist,
    left: panelLeft,
  });

  currentY += spacingAfterArtist;

  const albumSvg = `
    <svg width="${maxWidth}" height="${FONT_SIZES.album + 20}">
      <style>
        @font-face {
          font-family: 'Clear Sans Thin';
          src: url('./fonts/clear-sans/TTF/ClearSans-Thin.ttf');
          font-weight: 100;
        }
      </style>
      <text x="${centerX}" y="${FONT_SIZES.album}"
        font-family="Clear Sans Thin, Arial, sans-serif"
        font-size="${FONT_SIZES.album}"
        font-weight="100"
        text-anchor="middle"
        fill="${config.colors.primary}">
        ${albumName}
      </text>
    </svg>
  `;

  layers.push({
    buffer: Buffer.from(albumSvg),
    top: currentY,
    left: panelLeft,
  });

  currentY += FONT_SIZES.album + spacingBetweenSections;

  for (let i = 0; i < config.tracks.length; i++) {
    const track = config.tracks[i];
    const trackName = escapeXML(track.name);
    const isCurrent = i === currentTrackIndex;
    const trackColor = isCurrent ? config.colors.secondary : config.colors.main;
    const fontStyle = isCurrent ? "italic" : "normal";

    const trackSvg = `
      <svg width="${maxWidth}" height="${lineHeight + 10}">
        <style>
          @font-face {
            font-family: 'Klima';
            src: url('./fonts/Klima Regular/Klima Regular.otf');
          }
        </style>
        <text x="${centerX}" y="${FONT_SIZES.trackList}"
          font-family="Klima, Arial, sans-serif"
          font-size="${FONT_SIZES.trackList}"
          font-style="${fontStyle}"
          text-anchor="middle"
          fill="${trackColor}">
          ${i + 1}. ${trackName}
        </text>
      </svg>
    `;

    layers.push({
      buffer: Buffer.from(trackSvg),
      top: Math.round(currentY),
      left: panelLeft,
    });

    currentY += lineHeight;
  }

  currentY += spacingBetweenSections;

  const currentSongName = escapeXML(currentTrack.name);
  const currentSongSvg = `
    <svg width="${maxWidth}" height="${FONT_SIZES.currentSong + 20}">
      <style>
        @font-face {
          font-family: 'Klima';
          src: url('./fonts/Klima Regular/Klima Regular.otf');
        }
      </style>
      <text x="${centerX}" y="${FONT_SIZES.currentSong}"
        font-family="Klima, Arial, sans-serif"
        font-size="${FONT_SIZES.currentSong}"
        font-weight="bold"
        text-anchor="middle"
        fill="${config.colors.secondary}">
        ${currentSongName}
      </text>
    </svg>
  `;

  layers.push({
    buffer: Buffer.from(currentSongSvg),
    top: Math.round(currentY),
    left: panelLeft,
  });

  currentY += FONT_SIZES.currentSong + spacingAfterCurrentSong;

  if (currentTrack.artists.length > 0) {
    const artistsText = escapeXML(currentTrack.artists.join(", "));
    const artistsSvg = `
      <svg width="${maxWidth}" height="${FONT_SIZES.currentArtists + 20}">
        <style>
          @font-face {
            font-family: 'Klima';
            src: url('./fonts/Klima Regular/Klima Regular.otf');
          }
        </style>
        <text x="${centerX}" y="${FONT_SIZES.currentArtists}"
          font-family="Klima, Arial, sans-serif"
          font-size="${FONT_SIZES.currentArtists}"
          text-anchor="middle"
          fill="${config.colors.main}">
          ${artistsText}
        </text>
      </svg>
    `;

    layers.push({
      buffer: Buffer.from(artistsSvg),
      top: Math.round(currentY),
      left: panelLeft,
    });
  }

  return layers;
}

export async function compositeTextOnImage(
  imageBuffer: Buffer,
  config: Config,
  currentTrackIndex: number
): Promise<sharp.Sharp> {
  const textLayers = await renderTextLayers(config, currentTrackIndex);

  const compositeInputs = textLayers.map((layer) => ({
    input: layer.buffer,
    top: layer.top,
    left: layer.left,
  }));

  return sharp(imageBuffer).composite(compositeInputs);
}

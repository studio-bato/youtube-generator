import sharp from "sharp";
import type { Config } from "../config/schema";
import { FONT_SIZES, LAYOUT } from "./layout";
import { FONTS } from "../config/fonts";

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

  const isAlbum = config.tracks.length > 1;

  // Calculate total content height
  const lineHeight = FONT_SIZES.trackList * 1.8;
  const trackListHeight = isAlbum ? config.tracks.length * lineHeight : 0;
  const spacingBetweenSections = 120;
  const spacingAfterArtist = isAlbum ? 60 : 0;
  const spacingAfterCurrentSong = 30;

  let totalHeight =
    FONT_SIZES.artist +
    spacingAfterArtist +
    trackListHeight +
    spacingBetweenSections +
    FONT_SIZES.currentSong;

  if (isAlbum) {
    totalHeight += FONT_SIZES.album + spacingBetweenSections;
  }

  if (currentTrack.artists.length > 0) {
    totalHeight += spacingAfterCurrentSong + FONT_SIZES.currentArtists;
  }

  const elevationDef = `<defs>
    <filter id="elevation" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Multiple shadow layers for depth -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur1"/>
      <feOffset in="blur1" dx="0" dy="4" result="offsetBlur1"/>
      <feComponentTransfer in="offsetBlur1" result="shadow1">
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      
      <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur2"/>
      <feOffset in="blur2" dx="0" dy="8" result="offsetBlur2"/>
      <feComponentTransfer in="offsetBlur2" result="shadow2">
        <feFuncA type="linear" slope="0.15"/>
      </feComponentTransfer>
      
      <!-- Combine shadows -->
      <feMerge result="shadows">
        <feMergeNode in="shadow2"/>
        <feMergeNode in="shadow1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`;

  if (!config.hide_label) {
    const studiobatoSVG = `
    <svg width="${maxWidth}" height="${FONT_SIZES.label + 20}">
      <style>
        @font-face {
          font-family: '${FONTS.label.family}';
          font-weight: normal;
        }
      </style>
      ${elevationDef}
      <text x="0" y="${FONT_SIZES.label}"
        font-family="${FONTS.label.family}, Arial, sans-serif"
        font-size="${FONT_SIZES.label}"
        text-anchor="left"
        filter="url(#elevation)"
        fill="${config.colors.main}">
        STUDIO BATO
      </text>
    </svg>
  `;

    layers.push({
      buffer: Buffer.from(studiobatoSVG),
      top: 50,
      left: LAYOUT.canvas.width - 600,
    });
  }

  // Start Y position to center content vertically
  const centerY = LAYOUT.rightPanel.height / 2;
  let currentY = centerY - totalHeight / 2;

  currentY += FONT_SIZES.artist;
  const artistSvg = `
    <svg width="${maxWidth}" height="${FONT_SIZES.artist + 20}">
      <style>
        @font-face {
          font-family: '${FONTS.artist.family}';
          font-weight: normal;
        }
      </style>
      ${elevationDef}
      <text x="${centerX}" y="${FONT_SIZES.artist}"
        font-family="${FONTS.artist.family}, Arial, sans-serif"
        font-size="${FONT_SIZES.artist}"
        text-anchor="middle"
        filter="url(#elevation)"
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

  if (isAlbum) {
    const albumSvg = `
    <svg width="${maxWidth}" height="${FONT_SIZES.album + 20}">
      <style>
        @font-face {
          font-family: '${FONTS.album.family}';
          src: url('${FONTS.album.path}');
          font-weight: 100;
        }
      </style>
      ${elevationDef}
      <text x="${centerX}" y="${FONT_SIZES.album}"
        font-family="${FONTS.album.family}, Arial, sans-serif"
        font-size="${FONT_SIZES.album}"
        font-weight="100"
        text-anchor="middle"
        filter="url(#elevation)"
        fill="${config.colors.secondary}">
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
  }

  if (isAlbum) {
    for (let i = 0; i < config.tracks.length; i++) {
      const track = config.tracks[i];
      const trackName = escapeXML(track.name);
      const isCurrent = i === currentTrackIndex;
      const trackColor = isCurrent ? config.colors.primary : config.colors.main;
      const fontStyle = isCurrent ? "italic" : "normal";

      const trackSvg = `
      <svg width="${maxWidth}" height="${lineHeight + 10}">
        <style>
          @font-face {
            font-family: '${FONTS.trackList.family}';
            src: url('${FONTS.trackList.path}');
          }
        </style>
        ${elevationDef}
        <text x="${centerX}" y="${FONT_SIZES.trackList}"
          font-family="${FONTS.trackList.family}, Arial, sans-serif"
          font-size="${FONT_SIZES.trackList}"
          font-style="${fontStyle}"
          text-anchor="middle"
          filter="url(#elevation)"
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
  }

  const currentSongName = escapeXML(currentTrack.name);
  const currentSongSvg = `
    <svg width="${maxWidth}" height="${FONT_SIZES.currentSong + 20}">
      <style>
        @font-face {
          font-family: '${FONTS.currentSong.family}';
          src: url('${FONTS.currentSong.path}');
        }
      </style>
      ${elevationDef}
      <text x="${centerX}" y="${FONT_SIZES.currentSong}"
        font-family="${FONTS.currentSong.family}, Arial, sans-serif"
        font-size="${FONT_SIZES.currentSong}"
        font-weight="bold"
        text-anchor="middle"
        filter="url(#elevation)"
        fill="${config.colors.primary}">
        ${currentSongName}
      </text>
    </svg>
  `;

  layers.push({
    buffer: Buffer.from(currentSongSvg),
    top: Math.round(currentY),
    left: panelLeft,
  });

  if (currentTrack.artists.length > 0) {
    currentY += FONT_SIZES.currentSong + spacingAfterCurrentSong;

    const artistsText = escapeXML(currentTrack.artists.join(", "));
    const artistsSvg = `
      <svg width="${maxWidth}" height="${FONT_SIZES.currentArtists + 20}">
        <style>
          @font-face {
            font-family: '${FONTS.currentArtists.family}';
          }
        </style>
        ${elevationDef}
        <text x="${centerX}" y="${FONT_SIZES.currentArtists}"
          font-family="Klima, Arial, sans-serif"
          font-size="${FONT_SIZES.currentArtists}"
          text-anchor="middle"
          filter="url(#elevation)"
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

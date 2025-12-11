export interface LayoutDimensions {
  canvas: {
    width: number;
    height: number;
  };
  albumCover: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rightPanel: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  textArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const LAYOUT: LayoutDimensions = {
  canvas: {
    width: 3840,
    height: 2160,
  },
  albumCover: {
    x: 0,
    y: 0,
    width: 2160,
    height: 2160,
  },
  rightPanel: {
    x: 2160,
    y: 0,
    width: 1680,
    height: 2160,
  },
  textArea: {
    x: 2280,
    y: 120,
    width: 1440,
    height: 1920,
  },
};

export interface FontSizes {
  artist: number;
  album: number;
  trackList: number;
  currentSong: number;
  currentArtists: number;
}

export const FONT_SIZES: FontSizes = {
  artist: 140,
  album: 130,
  trackList: 80,
  currentSong: 160,
  currentArtists: 90,
};

export const FONT_PATHS = {
  clearSansRegular: "./fonts/clear-sans/ClearSans-Regular.ttf",
  clearSansThin: "./fonts/clear-sans/ClearSans-Thin.ttf",
  klima: "./fonts/Klima Regular/Klima Regular.otf",
};

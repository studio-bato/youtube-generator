export interface FontConfig {
  family: string;
  path: string;
}

export interface FontsConfig {
  artist: FontConfig;
  album: FontConfig;
  trackList: FontConfig;
  currentSong: FontConfig;
  currentArtists: FontConfig;
}

export const FONTS: FontsConfig = {
  artist: {
    family: "Clear Sans Regular",
    path: "./fonts/clear-sans/ClearSans-Regular.ttf",
  },
  album: {
    family: "Clear Sans Thin",
    path: "./fonts/clear-sans/ClearSans-Thin.ttf",
  },
  trackList: {
    family: "Klima",
    path: "./fonts/klima/Klima-Regular.ttf",
  },
  currentSong: {
    family: "Klima",
    path: "./fonts/klima/Klima-Regular.ttf",
  },
  currentArtists: {
    family: "Klima",
    path: "./fonts/klima/Klima-Regular.ttf",
  },
};

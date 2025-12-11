export interface Track {
  name: string;
  artists: string[];
}

export interface Colors {
  main: string;
  primary: string;
  secondary: string;
}

export interface AlbumConfig {
  artist: string;
  album: string;
  cover: string;
  colors: Colors;
  tracks: Track[];
}

# Coversyt - YouTube Music Video Background Generator

Generate professional background images for YouTube music videos with album cover and track information.

## Features

- Generates one image per track for an entire album
- Album cover on the left, blurred background with track info on the right
- Fully customizable colors via YAML configuration
- Custom font support (Clear Sans and Klima included)
- High-quality 4K (3840x2160) PNG output

## Installation

### Requirements

- Bun runtime
- Album cover image (square format recommended)
- Install fonts included in `fonts/` directory on your system

```bash
bun install
```

## Usage

### Basic Usage

```bash
bun run src/index.ts --config input/[album_name].yaml -b
```

Use first `-b` to generate background images then `-v` to generate videos.

### Options

```
-c, --config <path>   Path to YAML config file (required)
-o, --output <path>   Output directory (default: ./output)
-b, --background      Generate background covers
-v, --video           Generate videos
-m, --mac             On MacOS, use OSX VideoToolbox for compression
-h, --help            Display help
-V, --version         Display version
```

## Configuration

Create a YAML configuration file for your album:

```yaml
artist: "Artist Name"
album: "Album Name"
cover: "./path/to/cover.jpg"
colors:
  main: "#ffffff" # Primary text color
  primary: "#ffa500" # Album name color
  secondary: "#4a9eff" # Current track highlight
tracks:
  - name: "Track 1"
    artists: []
    audio: "./path/to/audio.wav"
  - name: "Track 2"
    artists: ["Featured Artist"]
    audio: "./path/to/audio.wav"
```

See `example_config.yaml` for a complete example configuration.

### Configuration Fields

- **artist** (required) - Name of the main artist
- **album** (required) - Album name
- **cover** (required) - Path to album cover image (square recommended, relative to config file)
- **colors** (required) - Color scheme using hex colors (#RRGGBB)
  - **main** - Primary text color
  - **primary** - Album name color
  - **secondary** - Current track highlight color
- **tracks** (required) - Array of tracks

  - **name** - Track name
  - **artists** - Array of featured artists (optional, can be empty)
  - **audio** - Array of featured artists (relative to config file)

- **background** - Configuration for the text background

  - **blurBrightness** - Adjust brightness of the blurred cover (0-2)
  - **blurAmount** - Amount of blur (0-100)
  - **zoom** - Zoom on the blurred image (in percent, 0-100)
  - **color** - Do not blur image and use solid color instead

- **hide_label** - (true/false) Hide label name (if already on cover)

## Output

Images are generated in `./output/[album-name]/` directory with the following naming convention:

```
01-track-name.png
02-another-track.png
...
```

Each image is 3840x2160 pixels (4K), perfect for high-quality YouTube videos.

## Layout

- **Left panel (2160x2160)**: Album cover (square, full height)
- **Right panel (1680x2160)**: Blurred + darkened album cover with text overlay
  - Artist name (Clear Sans Regular)
  - Album name (Clear Sans Thin)
  - Track list (Klima, current track highlighted in italic)
  - Current track name (Klima, bold)
  - Featured artists (Klima)

## License

MIT

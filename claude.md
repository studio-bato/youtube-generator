# Image generator

I am a music label manager.

I need a program that helps me publishing music content on Youtube.

When I publish an album on youtube, I usually create one video per track of the album, with the videos made of an image and the music track.

The background image that appear in the video is the only visual content of the video. Let's call this image "track youtube background".

The track youtube background contains:

- on the left, the album cover
- on the right:
  - name of the artist
  - name of the album
  - the list of the songs in the album (the current playing track being highlighted)
  - the name of the current playing track
  - the name of artists in the current playing track

You can see an example background image in @./example_background.jpg

## Design

The album cover image, which is always square, should be placed on the left, taking all vertical space. The remaining space on the right should contain all the text. In this right space, the background should be the album cover blurred and darkened.

The image size should be 4k (3840\*2160)

On the right part with the text, all texts must be centrally aligned and be placed in the middle of the space.

### Fonts

All the fonts are available in @./fonts folder.

- Name of the artist: Clear Sans Regular (main color)
- Name of the album: Clear Sans Thin (primary color)
- Tracks: Klima (main font color, current track secondary color)
- Name of current playing song: Klima (secondary color)
- Name of current artists: Klima (main color)

## Config

The configuration for an album must be passed via a YAML file.

The YAML should contain:

- Name of the artist
- Name of the album
- Location of the album cover image file (relative to the config file)
- Main font color
- Primary font color
- Secondary font color
- List of the tracks

For each track:

- name of the track
- artists on that track
- path of the music track file (relative to the config file)

## Tech

The program must be written in typescript and ran using Bun, using as much as possible the Bun capabilities (like native parsing of files and YAML)

The outputs should go in the ./output/[album name] folder

the program should takes the config files and generate one image per track.

### Tests

When testing outputs, put them in the test_output folder

# Video generator

The video generator should take the previously generated images and songs and generate one video per track. 
Use ffmpeg for that. Use a command that takes as input an image and an audio track. The audio track should not be converted to another format or compressed, and the image should not be degraded by compression too. The video should be only an image, then the final file should me small (but not smaller than the original audio file)
The output videos must be 4K in mp4 format. 

The video generator should be a different TS program that has to be executed mannualy after the image generation tool. In src folder there can be a background-generator.ts and video-generator.ts main scripts instead of one index.ts. Factorize the common code in external files if they share some logic. 
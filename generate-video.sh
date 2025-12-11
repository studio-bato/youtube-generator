#!/bin/bash

# Check if enough arguments are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 [-m] <image_file> <audio_file> [output_file]"
    echo "  -m: Use macOS VideoToolbox hardware acceleration"
    echo "  If output_file is not specified, it will be named 'output.mp4'"
    exit 1
fi

# Check if first argument is -m flag
USE_VIDEOTOOLBOX=false
if [ "$1" = "-m" ]; then
    USE_VIDEOTOOLBOX=true
    shift  # Remove -m from arguments
fi

# Get input files
IMAGE_FILE="$1"
AUDIO_FILE="$2"
OUTPUT_FILE="${3:-output.mp4}"  # Use third argument or default to output.mp4

# Validate input files exist
if [ ! -f "$IMAGE_FILE" ]; then
    echo "Error: Image file '$IMAGE_FILE' not found"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file '$AUDIO_FILE' not found"
    exit 1
fi

# Color space settings to ensure consistency
COLOR_OPTS="-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"

# Build ffmpeg command based on encoder choice
if [ "$USE_VIDEOTOOLBOX" = true ]; then
    echo "Using VideoToolbox hardware acceleration..."
    ffmpeg -y -loop 1 -framerate 1 -i "$IMAGE_FILE" -i "$AUDIO_FILE" \
        -c:v h264_videotoolbox -b:v 5000k -q:v 75 \
        $COLOR_OPTS \
        -c:a copy -shortest -pix_fmt yuv420p \
        "$OUTPUT_FILE"
else
    echo "Using software encoding (libx264) - optimized for still image..."
    ffmpeg -y -loop 1 -framerate 1 -i "$IMAGE_FILE" -i "$AUDIO_FILE" \
        -c:v libx264 -tune stillimage -crf 12 -preset fast \
        $COLOR_OPTS \
        -c:a copy -shortest -pix_fmt yuv420p \
        "$OUTPUT_FILE"
fi

# Check if ffmpeg succeeded
if [ $? -eq 0 ]; then
    echo "Video created successfully: $OUTPUT_FILE"
    ls -lh "$OUTPUT_FILE"
else
    echo "Error: ffmpeg failed to create video"
    exit 1
fi
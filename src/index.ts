#!/usr/bin/env bun

import { Command } from "commander";
import { loadConfig } from "./config/loader";
import { generateImage, slugify } from "./image/generator";
import { resolve, join } from "path";
import { mkdirSync, existsSync } from "fs";
import { validateFonts } from "./utils/validation";
import { prepareCoverCache } from "./image/composer";
import { Config } from "./config/schema";
import { $ } from "bun";

const program = new Command();

program
  .name("coversyt")
  .description("Generate YouTube music video background images")
  .version("1.0.0")
  .requiredOption("-c, --config <path>", "Path to YAML config file")
  .option("-o, --output <path>", "Output directory", "./output")
  .option("-b, --background", "Generate background images")
  .option("-v, --video", "Generate videos")
  .parse();

const options = program.opts();

async function generateCovers(config: Config, outputDir: string) {
  console.log(`\nPreparing cover cache...`);
  const coverCache = await prepareCoverCache(config.cover, config.background);

  console.log(
    `\nGenerating ${config.tracks.length} images for "${config.album}" by ${config.artist}\n`
  );

  const BATCH_SIZE = 4;
  let completed = 0;

  for (let i = 0; i < config.tracks.length; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, config.tracks.length);
    const batch = config.tracks.slice(i, batchEnd);

    await Promise.all(
      batch.map(async (track, batchIdx) => {
        const trackIndex = i + batchIdx;
        const trackNumber = (trackIndex + 1).toString().padStart(2, "0");
        const filename = `${trackNumber}-${slugify(track.name)}.png`;
        const outputPath = join(outputDir, filename);

        await generateImage({
          config,
          currentTrackIndex: trackIndex,
          outputPath,
          coverCache,
        });

        completed++;
        console.log(
          `[${completed}/${config.tracks.length}] Generated: ${track.name} → ${filename}`
        );
      })
    );
  }

  console.log(
    `\n✓ Successfully generated ${config.tracks.length} images in ${outputDir}`
  );
}

async function generateVideos(config: Config, outputDir: string) {
  console.log(
    `\nGenerating ${config.tracks.length} videos for "${config.album}" by ${config.artist}\n`
  );

  for (let i = 0; i < config.tracks.length; i += 1) {
    const track = config.tracks[i];
    const trackNumber = (i + 1).toString().padStart(2, "0");
    const filename = `${trackNumber}-${slugify(track.name)}`;
    const outputPath = join(outputDir, filename);

    const inputImage = outputPath + ".png";

    await $`./generate-video.sh ${inputImage} ${track.audio} ${outputPath}.mp4`.text();

    console.log(
      `[${i + 1}/${config.tracks.length}] Generated: ${
        track.name
      } → ${filename}`
    );
  }

  console.log(
    `\n✓ Successfully generated ${config.tracks.length} images in ${outputDir}`
  );
}

async function main() {
  try {
    console.log("Validating fonts...");
    validateFonts();

    console.log("Loading configuration...");
    const config = await loadConfig(options.config);

    const outputDir = resolve(join(options.output, config.album));

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }

    if (options.background) {
      generateCovers(config, outputDir);
    } else if (options.video) {
      generateVideos(config, outputDir);
    } else {
      throw new Error("Unknown mode, use either -v or -b");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
      process.exit(1);
    }
    console.error("\nUnknown error occurred");
    process.exit(1);
  }
}

main();

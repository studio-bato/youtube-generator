#!/usr/bin/env bun

import { Command } from "commander";
import { loadConfig } from "./config/loader";
import { generateImage, slugify } from "./image/generator";
import { resolve, join } from "path";
import { mkdirSync, existsSync } from "fs";
import { validateFonts } from "./utils/validation";

const program = new Command();

program
  .name("coversyt")
  .description("Generate YouTube music video background images")
  .version("1.0.0")
  .requiredOption("-c, --config <path>", "Path to YAML config file")
  .option("-o, --output <path>", "Output directory", "./output")
  .parse();

const options = program.opts();

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

    console.log(`\nGenerating ${config.tracks.length} images for "${config.album}" by ${config.artist}\n`);

    for (let i = 0; i < config.tracks.length; i++) {
      const track = config.tracks[i];
      const trackNumber = (i + 1).toString().padStart(2, "0");
      const filename = `${trackNumber}-${slugify(track.name)}.png`;
      const outputPath = join(outputDir, filename);

      console.log(`[${i + 1}/${config.tracks.length}] Generating: ${track.name}`);

      await generateImage({
        config,
        currentTrackIndex: i,
        outputPath,
      });

      console.log(`    Saved: ${filename}`);
    }

    console.log(`\n✓ Successfully generated ${config.tracks.length} images in ${outputDir}`);
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

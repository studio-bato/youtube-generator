import { parse } from "yaml";
import { configSchema, type Config } from "./schema";
import { resolve, dirname } from "path";
import { existsSync } from "fs";
import { validateCoverImage, validateTracks } from "../utils/validation";

export class ConfigLoadError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = "ConfigLoadError";
  }
}

export async function loadConfig(configPath: string): Promise<Config> {
  const absolutePath = resolve(configPath);

  if (!existsSync(absolutePath)) {
    throw new ConfigLoadError(`Config file not found: ${absolutePath}`);
  }

  try {
    const fileContent = await Bun.file(absolutePath).text();
    const rawConfig = parse(fileContent);

    const validatedConfig = configSchema.parse(rawConfig);

    const configDir = dirname(absolutePath);
    const coverPath = resolve(configDir, validatedConfig.cover);

    try {
      await validateCoverImage(coverPath);
      validateTracks(validatedConfig, configDir);
    } catch (error) {
      if (error instanceof Error) {
        throw new ConfigLoadError(error.message);
      }
      throw error;
    }

    validatedConfig.cover = coverPath;
    for (let track of validatedConfig.tracks) {
      track.audio = resolve(configDir, track.audio);
    }

    return validatedConfig;
  } catch (error) {
    if (error instanceof ConfigLoadError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ConfigLoadError(
        `Failed to load or validate config: ${error.message}`,
        error
      );
    }

    throw new ConfigLoadError("Unknown error loading config", error);
  }
}

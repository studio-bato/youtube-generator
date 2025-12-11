import { z } from "zod";

export const trackSchema = z.object({
  name: z.string().min(1, "Track name is required"),
  artists: z.array(z.string()).default([]),
});

export const backgroundSchema = z
  .object({
    blurBrightness: z.number().min(0).max(2).default(0.6),
    color: z
      .string()
      .regex(
        /^#[0-9A-Fa-f]{6}$/,
        "Main color must be a valid hex color (e.g., #ffffff)"
      )
      .optional(),
  })
  .default({});

export const colorsSchema = z.object({
  main: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Main color must be a valid hex color (e.g., #ffffff)"
    ),
  primary: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Primary color must be a valid hex color (e.g., #ffa500)"
    ),
  secondary: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Secondary color must be a valid hex color (e.g., #4a9eff)"
    ),
});

export const configSchema = z.object({
  artist: z.string().min(1, "Artist name is required"),
  album: z.string().min(1, "Album name is required"),
  cover: z.string().min(1, "Cover image path is required"),
  colors: colorsSchema,
  background: backgroundSchema,
  tracks: z.array(trackSchema).min(1, "At least one track is required"),
});

export type Config = z.infer<typeof configSchema>;

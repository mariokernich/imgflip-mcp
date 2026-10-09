import { z } from "zod";

/** Shared schema for a caption text box. */
export const boxSchema = z.object({
  text: z.string().describe("Text to render in this box"),
  x: z.number().int().optional().describe("X coordinate in pixels (auto when omitted)"),
  y: z.number().int().optional().describe("Y coordinate in pixels (auto when omitted)"),
  width: z.number().int().optional().describe("Box width in pixels (auto when omitted)"),
  height: z
    .number()
    .int()
    .optional()
    .describe("Box height in pixels (auto when omitted)"),
  color: z.string().optional().describe('Font color as hex code, e.g. "#ffffff"'),
  outline_color: z
    .string()
    .optional()
    .describe('Font outline color as hex code, e.g. "#000000"'),
});

/** Annotations shared by every tool that creates a new meme on Imgflip. */
export const createsMeme = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
} as const;

/** Annotations shared by every read-only lookup tool. */
export const readsOnly = { readOnlyHint: true, openWorldHint: true } as const;

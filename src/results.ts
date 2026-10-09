import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

type ImageBlock = { type: "image"; data: string; mimeType: string };

/** Images larger than this are returned as URL only, not embedded. */
const MAX_EMBED_BYTES = 2 * 1024 * 1024;
const IMAGE_TIMEOUT_MS = 15_000;

export function ok(payload: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
  };
}

export function fail(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Imgflip request failed: ${message}` }],
    isError: true,
  };
}

/** Runs a tool body and turns any thrown error into an MCP error result. */
export async function guarded(
  body: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  try {
    return await body();
  } catch (error) {
    return fail(error);
  }
}

/**
 * Fetch a generated meme and return it as an inline MCP image block so
 * clients can render it directly. Returns null (URL-only fallback) for
 * oversized images or any download problem — embedding is best-effort
 * and must never fail the tool call.
 */
export async function fetchImageBlock(url: string): Promise<ImageBlock | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS) });
    if (!response.ok) return null;
    const mimeType = response.headers.get("content-type") ?? "";
    if (!mimeType.startsWith("image/")) return null;
    const declaredSize = Number(response.headers.get("content-length"));
    if (declaredSize > MAX_EMBED_BYTES) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_EMBED_BYTES) return null;
    return { type: "image", data: buffer.toString("base64"), mimeType };
  } catch {
    return null;
  }
}

/** Result payload + the generated image embedded inline when possible. */
export async function okWithImage(payload: { url: string }): Promise<CallToolResult> {
  const result = ok(payload);
  const image = await fetchImageBlock(payload.url);
  if (image) result.content.push(image);
  return result;
}

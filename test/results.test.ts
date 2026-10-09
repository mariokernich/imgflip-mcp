import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchImageBlock, guarded, ok, okWithImage } from "../src/results.js";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

function imageResponse(bytes: number, headers: Record<string, string> = {}): Response {
  return new Response(new Uint8Array(bytes), {
    headers: { "content-type": "image/jpeg", ...headers },
  });
}

describe("guarded", () => {
  it("passes successful results through", async () => {
    await expect(guarded(async () => ok({ a: 1 }))).resolves.toEqual(ok({ a: 1 }));
  });

  it("turns thrown errors into an MCP error result", async () => {
    const result = await guarded(async () => {
      throw new Error("boom");
    });
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      { type: "text", text: "Imgflip request failed: boom" },
    ]);
  });
});

describe("fetchImageBlock", () => {
  it("embeds small images as base64", async () => {
    fetchMock.mockResolvedValue(imageResponse(3));
    await expect(fetchImageBlock("https://i.imgflip.com/x.jpg")).resolves.toEqual({
      type: "image",
      data: "AAAA",
      mimeType: "image/jpeg",
    });
  });

  it("skips non-image responses", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>", { headers: { "content-type": "text/html" } }),
    );
    await expect(fetchImageBlock("u")).resolves.toBeNull();
  });

  it("skips images declared larger than 2 MB", async () => {
    fetchMock.mockResolvedValue(
      imageResponse(1, { "content-length": String(3 * 1024 * 1024) }),
    );
    await expect(fetchImageBlock("u")).resolves.toBeNull();
  });

  it("skips images that turn out larger than 2 MB", async () => {
    fetchMock.mockResolvedValue(imageResponse(2 * 1024 * 1024 + 1));
    await expect(fetchImageBlock("u")).resolves.toBeNull();
  });

  it("swallows network errors", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(fetchImageBlock("u")).resolves.toBeNull();
  });
});

describe("okWithImage", () => {
  it("falls back to the URL-only result when the image cannot be embedded", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    const payload = { url: "u", page_url: "p" };
    await expect(okWithImage(payload)).resolves.toEqual(ok(payload));
  });
});

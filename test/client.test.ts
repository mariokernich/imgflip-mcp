import { afterEach, describe, expect, it, vi } from "vitest";
import { ImgflipClient, ImgflipError } from "../src/client.js";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonResponse(payload: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: async () => payload,
  } as unknown as Response;
}

function lastRequestBody(): URLSearchParams {
  const init = fetchMock.mock.calls.at(-1)?.[1] as RequestInit;
  return init.body as URLSearchParams;
}

const client = () => new ImgflipClient("user", "secret");

afterEach(() => {
  fetchMock.mockReset();
});

describe("getMemes", () => {
  it("returns the meme list and needs no credentials", async () => {
    const memes = [
      { id: "1", name: "Drake", url: "u", width: 1, height: 1, box_count: 2 },
    ];
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: { memes } }));

    const anonymous = new ImgflipClient(undefined, undefined);
    await expect(anonymous.getMemes()).resolves.toEqual(memes);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.imgflip.com/get_memes");
  });
});

describe("captionImage", () => {
  it("sends credentials, texts and options form-urlencoded", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { url: "img", page_url: "page" } }),
    );

    const result = await client().captionImage({
      templateId: "42",
      text0: "top",
      text1: "bottom",
      font: "arial",
      maxFontSize: 40,
      noWatermark: true,
    });

    expect(result).toEqual({ url: "img", page_url: "page" });
    const body = lastRequestBody();
    expect(body.get("template_id")).toBe("42");
    expect(body.get("username")).toBe("user");
    expect(body.get("password")).toBe("secret");
    expect(body.get("text0")).toBe("top");
    expect(body.get("text1")).toBe("bottom");
    expect(body.get("font")).toBe("arial");
    expect(body.get("max_font_size")).toBe("40");
    expect(body.get("no_watermark")).toBe("1");
  });

  it("encodes boxes using the boxes[i][field] array syntax", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { url: "img", page_url: "page" } }),
    );

    await client().captionImage({
      templateId: "42",
      boxes: [
        { text: "first", color: "#ffffff" },
        { text: "second", x: 10, y: 20, width: 100, height: 50 },
      ],
    });

    const body = lastRequestBody();
    expect(body.get("boxes[0][text]")).toBe("first");
    expect(body.get("boxes[0][color]")).toBe("#ffffff");
    expect(body.get("boxes[1][text]")).toBe("second");
    expect(body.get("boxes[1][x]")).toBe("10");
    expect(body.get("boxes[1][height]")).toBe("50");
  });

  it("throws ImgflipError without calling the API when credentials are missing", async () => {
    const anonymous = new ImgflipClient(undefined, undefined);
    await expect(
      anonymous.captionImage({ templateId: "42", text0: "top" }),
    ).rejects.toThrow(ImgflipError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the Imgflip error_message on API-level failure", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, error_message: "Invalid template ID" }),
    );
    await expect(client().captionImage({ templateId: "0", text0: "x" })).rejects.toThrow(
      "Invalid template ID",
    );
  });

  it("throws on non-2xx HTTP responses", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false, 503));
    await expect(client().captionImage({ templateId: "42", text0: "x" })).rejects.toThrow(
      "HTTP 503",
    );
  });
});

describe("premium endpoints", () => {
  it("searchMemes passes query and optional include_nsfw", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: { memes: [] } }));

    await client().searchMemes("cat");
    expect(lastRequestBody().get("query")).toBe("cat");
    expect(lastRequestBody().get("include_nsfw")).toBeNull();

    await client().searchMemes("cat", true);
    expect(lastRequestBody().get("include_nsfw")).toBe("1");
  });

  it("aiMeme only sends the parameters that are set", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        data: { url: "u", page_url: "p", template_id: 1, texts: ["a"] },
      }),
    );

    await client().aiMeme({ model: "openai", prefixText: "when" });
    const body = lastRequestBody();
    expect(body.get("model")).toBe("openai");
    expect(body.get("prefix_text")).toBe("when");
    expect(body.get("template_id")).toBeNull();
    expect(body.get("no_watermark")).toBeNull();
  });

  it("wraps fetch timeouts in a readable ImgflipError", async () => {
    fetchMock.mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    await expect(client().automeme("text")).rejects.toThrow(/did not respond within/);
  });
});

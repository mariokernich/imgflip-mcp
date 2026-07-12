import type {
  AiMemeResult,
  CaptionResult,
  ImgflipResponse,
  MemeTemplate,
  TextBox,
} from "./types.js";

const API_BASE = "https://api.imgflip.com";
const REQUEST_TIMEOUT_MS = 30_000;

/** Error raised for any failure reported by or while reaching the Imgflip API. */
export class ImgflipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImgflipError";
  }
}

export interface CaptionImageOptions {
  templateId: string;
  text0?: string;
  text1?: string;
  boxes?: TextBox[];
  font?: "impact" | "arial";
  maxFontSize?: number;
  noWatermark?: boolean;
}

export interface AiMemeOptions {
  model?: "openai" | "classic";
  templateId?: string;
  prefixText?: string;
  noWatermark?: boolean;
}

/**
 * Thin client for the Imgflip REST API. All write endpoints are
 * form-urlencoded POST requests that require an Imgflip account.
 */
export class ImgflipClient {
  constructor(
    private readonly username: string | undefined,
    private readonly password: string | undefined,
  ) {}

  /** GET /get_memes — free, no credentials required. */
  async getMemes(): Promise<MemeTemplate[]> {
    const response = await this.request(`${API_BASE}/get_memes`, {});
    const data = await this.unwrap<{ memes: MemeTemplate[] }>(response);
    return data.memes;
  }

  /** POST /caption_image — free with any Imgflip account. */
  async captionImage(options: CaptionImageOptions): Promise<CaptionResult> {
    const params: Record<string, string> = {
      template_id: options.templateId,
      ...this.credentials(),
    };
    if (options.text0 !== undefined) params["text0"] = options.text0;
    if (options.text1 !== undefined) params["text1"] = options.text1;
    if (options.font !== undefined) params["font"] = options.font;
    if (options.maxFontSize !== undefined) {
      params["max_font_size"] = String(options.maxFontSize);
    }
    if (options.noWatermark) params["no_watermark"] = "1";
    return this.post<CaptionResult>("caption_image", params, options.boxes);
  }

  /** POST /search_memes — requires Imgflip API Premium. */
  async searchMemes(query: string, includeNsfw = false): Promise<MemeTemplate[]> {
    const params: Record<string, string> = {
      ...this.credentials(),
      query,
    };
    if (includeNsfw) params["include_nsfw"] = "1";
    const data = await this.post<{ memes: MemeTemplate[] }>("search_memes", params);
    return data.memes;
  }

  /** POST /get_meme — requires Imgflip API Premium. */
  async getMeme(templateId: string): Promise<MemeTemplate> {
    const params: Record<string, string> = {
      ...this.credentials(),
      template_id: templateId,
    };
    const data = await this.post<{ meme: MemeTemplate }>("get_meme", params);
    return data.meme;
  }

  /** POST /caption_gif — requires Imgflip API Premium; animated templates only. */
  async captionGif(
    templateId: string,
    boxes: TextBox[],
    noWatermark = false,
  ): Promise<CaptionResult> {
    const params: Record<string, string> = {
      ...this.credentials(),
      template_id: templateId,
    };
    if (noWatermark) params["no_watermark"] = "1";
    return this.post<CaptionResult>("caption_gif", params, boxes);
  }

  /** POST /automeme — requires Imgflip API Premium. */
  async automeme(text: string, noWatermark = false): Promise<CaptionResult> {
    const params: Record<string, string> = {
      ...this.credentials(),
      text,
    };
    if (noWatermark) params["no_watermark"] = "1";
    return this.post<CaptionResult>("automeme", params);
  }

  /** POST /ai_meme — requires Imgflip API Premium. */
  async aiMeme(options: AiMemeOptions = {}): Promise<AiMemeResult> {
    const params: Record<string, string> = { ...this.credentials() };
    if (options.model !== undefined) params["model"] = options.model;
    if (options.templateId !== undefined) params["template_id"] = options.templateId;
    if (options.prefixText !== undefined) params["prefix_text"] = options.prefixText;
    if (options.noWatermark) params["no_watermark"] = "1";
    return this.post<AiMemeResult>("ai_meme", params);
  }

  private credentials(): { username: string; password: string } {
    if (!this.username || !this.password) {
      throw new ImgflipError(
        "Imgflip credentials are not configured. Set the IMGFLIP_USERNAME and " +
          "IMGFLIP_PASSWORD environment variables (a free account from " +
          "https://imgflip.com/signup works for captioning).",
      );
    }
    return { username: this.username, password: this.password };
  }

  private async post<T>(
    endpoint: string,
    params: Record<string, string>,
    boxes?: TextBox[],
  ): Promise<T> {
    const body = new URLSearchParams(params);
    boxes?.forEach((box, index) => {
      for (const [key, value] of Object.entries(box)) {
        if (value !== undefined) {
          body.set(`boxes[${index}][${key}]`, String(value));
        }
      }
    });
    const response = await this.request(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return this.unwrap<T>(response);
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new ImgflipError(
          `Imgflip API did not respond within ${REQUEST_TIMEOUT_MS / 1000}s`,
        );
      }
      throw error;
    }
  }

  private async unwrap<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new ImgflipError(
        `Imgflip API returned HTTP ${response.status} ${response.statusText}`,
      );
    }
    const json = (await response.json()) as ImgflipResponse<T>;
    if (!json.success) {
      throw new ImgflipError(json.error_message);
    }
    return json.data;
  }
}

/**
 * Type definitions for the Imgflip REST API (https://imgflip.com/api).
 */

/** A meme template as returned by /get_memes, /search_memes and /get_meme. */
export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  /** Number of text boxes the template supports. */
  box_count: number;
  /** How many times the template was captioned recently (only on some endpoints). */
  captions?: number;
}

/** A single text box for /caption_image and /caption_gif. */
export interface TextBox {
  text: string;
  /** X coordinate of the box in pixels (auto-positioned when omitted). */
  x?: number;
  /** Y coordinate of the box in pixels (auto-positioned when omitted). */
  y?: number;
  /** Width of the box in pixels (auto-sized when omitted). */
  width?: number;
  /** Height of the box in pixels (auto-sized when omitted). */
  height?: number;
  /** Font color as a hex code, e.g. "#ffffff". */
  color?: string;
  /** Font outline color as a hex code, e.g. "#000000". */
  outline_color?: string;
}

/** Result of the caption/generation endpoints. */
export interface CaptionResult {
  /** Direct URL of the generated image (or .gif). */
  url: string;
  /** Imgflip page that shows the generated meme. */
  page_url: string;
}

/** Result of /ai_meme — includes which template and texts the AI chose. */
export interface AiMemeResult extends CaptionResult {
  template_id: number;
  texts: string[];
}

/** Generic Imgflip response envelope. */
export type ImgflipResponse<T> =
  | { success: true; data: T }
  | { success: false; error_message: string };

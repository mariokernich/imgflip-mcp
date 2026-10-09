/** Runtime configuration, read from environment variables. */
export interface Config {
  username: string | undefined;
  password: string | undefined;
  /**
   * Imgflip API Premium is optional. The premium-only tools (search_memes,
   * get_meme, caption_gif, automeme, ai_meme) are hidden unless explicitly
   * enabled, so free-tier users only see tools that will actually work.
   */
  premium: boolean;
}

const TRUTHY = ["1", "true", "yes"];

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    username: env["IMGFLIP_USERNAME"] || undefined,
    password: env["IMGFLIP_PASSWORD"] || undefined,
    premium: TRUTHY.includes((env["IMGFLIP_PREMIUM"] ?? "").trim().toLowerCase()),
  };
}

import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("reads the credentials", () => {
    expect(loadConfig({ IMGFLIP_USERNAME: "user", IMGFLIP_PASSWORD: "secret" })).toEqual({
      username: "user",
      password: "secret",
      premium: false,
    });
  });

  it("treats empty credentials as missing", () => {
    const config = loadConfig({ IMGFLIP_USERNAME: "", IMGFLIP_PASSWORD: "" });
    expect(config.username).toBeUndefined();
    expect(config.password).toBeUndefined();
  });

  it.each(["1", "true", "TRUE", "yes", " Yes "])("enables premium for %j", (value) => {
    expect(loadConfig({ IMGFLIP_PREMIUM: value }).premium).toBe(true);
  });

  it.each([undefined, "", "0", "false", "no", "premium"])(
    "keeps premium disabled for %j",
    (value) => {
      expect(loadConfig({ IMGFLIP_PREMIUM: value }).premium).toBe(false);
    },
  );
});

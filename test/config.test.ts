import { describe, expect, test } from "bun:test";

import { loadSettings, resolveSettings } from "../src/config.js";

const base = {
  server: "https://ntfy.example.com:8443",
  topic: "lab",
  token: "tk_test",
};

describe("resolveSettings", () => {
  test("applies defaults", () => {
    const result = resolveSettings(base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.holdMs).toBe(60_000);
    expect([...result.settings.milestones]).toEqual(["permission", "question", "fault"]);
    expect(result.settings.quiet).toBeUndefined();
  });

  test("substitutes an environment variable", () => {
    const result = resolveSettings(
      { ...base, token: "{env:NTFY_TOKEN}" },
      { NTFY_TOKEN: "tk_live" },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.token).toBe("tk_live");
  });

  test("reports a missing environment variable", () => {
    const result = resolveSettings({ ...base, token: "{env:NTFY_TOKEN}" }, {});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("NTFY_TOKEN");
  });

  test("rejects a topic with a slash", () => {
    const result = resolveSettings({ ...base, topic: "lab/extra" });
    expect(result.ok).toBe(false);
  });

  test("rejects a non-http server", () => {
    const result = resolveSettings({ ...base, server: "ftp://ntfy.example.com" });
    expect(result.ok).toBe(false);
  });

  test("rejects a negative hold", () => {
    const result = resolveSettings({ ...base, holdMs: -1 });
    expect(result.ok).toBe(false);
  });

  test("rejects an invalid quiet window", () => {
    const result = resolveSettings({
      ...base,
      quiet: { from: "25:00", to: "06:00", timezone: "UTC" },
    });
    expect(result.ok).toBe(false);
  });

  test("accepts quiet false", () => {
    const result = resolveSettings({ ...base, quiet: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.quiet).toBeUndefined();
  });

  test("accepts a custom app scheme for click", () => {
    const click = "reynard://open?url=https%3A%2F%2Fexample.com";
    const result = resolveSettings({ ...base, click });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.click).toBe(click);
  });

  test("accepts a quiet window", () => {
    const result = resolveSettings({
      ...base,
      quiet: { from: "22:30", to: "06:00", timezone: "Asia/Ho_Chi_Minh" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.settings.quiet?.timezone).toBe("Asia/Ho_Chi_Minh");
  });
});

describe("loadSettings", () => {
  test("reads a file", () => {
    const result = loadSettings({
      env: {},
      readFile: () => JSON.stringify(base),
    });
    expect(result.ok).toBe(true);
  });

  test("reports a missing file without crashing", () => {
    const result = loadSettings({
      env: {},
      readFile: () => {
        throw new Error("ENOENT");
      },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("cannot read");
  });

  test("reports invalid JSON", () => {
    const result = loadSettings({ env: {}, readFile: () => "{" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("not valid JSON");
  });
});

import { describe, expect, test } from "bun:test";

import { buildPush, projectName } from "../src/message.js";

describe("projectName", () => {
  test("uses the last path segment", () => {
    expect(projectName("/Users/me/dotfiles/")).toBe("dotfiles");
    expect(projectName("/Users/me/dotfiles")).toBe("dotfiles");
    expect(projectName("/")).toBe("project");
  });
});

describe("buildPush", () => {
  test("names the milestone and the session", () => {
    const push = buildPush("permission", { title: "Fix the build", directory: "/work/app" });
    expect(push.title).toBe("Permission · Fix the build");
    expect(push.message).toBe("app");
    expect(push.priority).toBe(4);
    expect(push.tags).toEqual(["lock"]);
  });

  test("falls back when the session has no title", () => {
    const push = buildPush("fault", { title: undefined, directory: "/work/app" });
    expect(push.title).toBe("Fault · Untitled");
  });

  test("keeps the click target", () => {
    const push = buildPush("question", { title: "Pick one", directory: "/w" }, "https://x.test/");
    expect(push.click).toBe("https://x.test/");
  });

  test("truncates a long title", () => {
    const push = buildPush("idle", { title: "a".repeat(300), directory: "/w" });
    expect(push.title.length).toBeLessThanOrEqual(180);
    expect(push.title.endsWith("…")).toBe(true);
  });

  test("sends idle at default priority", () => {
    const push = buildPush("idle", { title: "Done", directory: "/w" });
    expect(push.priority).toBe(3);
  });
});

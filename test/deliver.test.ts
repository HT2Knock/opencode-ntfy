import { describe, expect, test } from "bun:test";

import { Effect, Result } from "effect";

import { deliver, publishUrl, requestBody, type Push, type Target } from "../src/deliver.js";

let rejectedAttempts = 0;

const serverError = () => Promise.resolve(new Response("no", { status: 500 }));

const rejected = () => {
  rejectedAttempts += 1;
  return Promise.resolve(new Response("no", { status: 401 }));
};

const target: Target = {
  server: new URL("https://ntfy.example.com:8443"),
  topic: "lab",
  token: "tk_test",
};

const push: Push = {
  title: "Permission · Fix the build",
  message: "dotfiles",
  priority: 4,
  tags: ["lock"],
  click: "https://example.com/",
  delay: undefined,
};

describe("publishUrl", () => {
  test("keeps the origin and appends a slash", () => {
    expect(publishUrl(new URL("https://ntfy.example.com:8443"))).toBe(
      "https://ntfy.example.com:8443/",
    );
  });

  test("keeps a path prefix", () => {
    expect(publishUrl(new URL("https://example.com/ntfy"))).toBe("https://example.com/ntfy/");
  });
});

describe("requestBody", () => {
  test("omits undefined fields", () => {
    expect(requestBody("lab", push)).toEqual({
      topic: "lab",
      title: "Permission · Fix the build",
      message: "dotfiles",
      priority: 4,
      tags: ["lock"],
      click: "https://example.com/",
    });
  });
});

describe("deliver", () => {
  test("posts JSON with bearer auth", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl = (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return Promise.resolve(new Response("", { status: 200 }));
    };

    await Effect.runPromise(deliver(target, push, fetchImpl));

    expect(calls).toHaveLength(1);
    const call = calls[0];
    if (!call) throw new Error("no request was made");
    expect(call.url).toBe("https://ntfy.example.com:8443/");
    expect(call.init.method).toBe("POST");
    expect(JSON.parse(String(call.init.body))).toMatchObject({
      topic: "lab",
      title: "Permission · Fix the build",
      priority: 4,
    });
    expect((call.init.headers as Record<string, string>).Authorization).toBe("Bearer tk_test");
  });

  test("retries once after a network failure", async () => {
    let attempts = 0;
    const fetchImpl = () => {
      attempts += 1;
      if (attempts === 1) return Promise.reject(new Error("network down"));
      return Promise.resolve(new Response("", { status: 200 }));
    };

    await Effect.runPromise(deliver(target, push, fetchImpl));
    expect(attempts).toBe(2);
  });

  test("fails after a server error", async () => {
    const result = await Effect.runPromise(Effect.result(deliver(target, push, serverError)));
    expect(Result.isFailure(result)).toBe(true);
  });

  test("does not retry a rejected request more than once", async () => {
    rejectedAttempts = 0;
    await Effect.runPromise(Effect.result(deliver(target, push, rejected)));
    expect(rejectedAttempts).toBe(2);
  });
});

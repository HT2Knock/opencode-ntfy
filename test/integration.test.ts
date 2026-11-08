import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { Effect } from "effect";

import { resolveSettings } from "../src/config.js";
import type { Context } from "../src/context.js";
import { Gate } from "../src/gate.js";
import { createHandler } from "../src/handler.js";
import { Holds, type Timers } from "../src/hold.js";

type Received = { readonly path: string; readonly body: string };

let server: ReturnType<typeof Bun.serve>;
const received: Received[] = [];

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(request) {
      received.push({ path: new URL(request.url).pathname, body: await request.text() });
      return new Response("ok");
    },
  });
});

afterAll(() => {
  server.stop(true);
});

function fakeTimers(): Timers & { fireAll: () => void; pending: () => number } {
  let next = 1;
  const callbacks = new Map<number, () => void>();
  return {
    set: (callback) => {
      const id = next++;
      callbacks.set(id, callback);
      return id;
    },
    clear: (handle) => {
      callbacks.delete(handle as number);
    },
    fireAll: () => {
      const current = [...callbacks.values()];
      callbacks.clear();
      for (const callback of current) callback();
    },
    pending: () => callbacks.size,
  };
}

function fakeContext(): Context {
  const storage = new Map<string, unknown>();
  return {
    location: { directory: "/work/app" },
    storage: {
      get: (key: string) => Effect.succeed(storage.get(key) ?? null),
      set: (key: string, value: unknown) =>
        Effect.sync(() => {
          storage.set(key, value);
        }),
    },
    session: {
      get: () =>
        Effect.succeed({
          title: "Probe session",
          parentID: undefined,
          location: { directory: "/work/app" },
        }),
    },
  } as unknown as Context;
}

function waitFor(predicate: () => boolean, timeoutMs = 1_000): Promise<boolean> {
  const start = Date.now();
  const poll = async (): Promise<boolean> => {
    if (predicate()) return true;
    if (Date.now() - start >= timeoutMs) return false;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 10);
    });
    return poll();
  };
  return poll();
}

function settings(holdMs: number) {
  const result = resolveSettings({
    server: server.url.toString(),
    topic: "probe",
    token: "tk_probe",
    holdMs,
  });
  if (!result.ok) throw new Error(result.reason);
  return result.settings;
}

describe("handler with a real ntfy endpoint", () => {
  test("sends one push for an open permission and drops a duplicate event", async () => {
    received.length = 0;
    const timers = fakeTimers();
    const handler = createHandler(fakeContext(), settings(0), {
      gate: new Gate(),
      holds: new Holds(timers),
    });

    const event = {
      id: "evt-1",
      type: "permission.asked",
      data: { sessionID: "s1", id: "p1", action: "shell" },
    };

    await Effect.runPromise(handler(event));
    timers.fireAll();
    expect(await waitFor(() => received.length === 1)).toBe(true);

    await Effect.runPromise(handler(event));
    timers.fireAll();
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(received).toHaveLength(1);

    const body = JSON.parse(received[0]?.body ?? "{}");
    expect(body.topic).toBe("probe");
    expect(body.title).toBe("Permission · Probe session");
    expect(body.message).toBe("app");
    expect(received[0]?.path).toBe("/");
  });

  test("does not send when the permission is answered during the hold", async () => {
    received.length = 0;
    const timers = fakeTimers();
    const handler = createHandler(fakeContext(), settings(5_000), {
      gate: new Gate(),
      holds: new Holds(timers),
    });

    await Effect.runPromise(
      handler({
        id: "evt-2",
        type: "permission.asked",
        data: { sessionID: "s1", id: "p2", action: "shell" },
      }),
    );
    expect(timers.pending()).toBe(1);

    await Effect.runPromise(
      handler({
        id: "evt-3",
        type: "permission.replied",
        data: { sessionID: "s1", requestID: "p2" },
      }),
    );
    expect(timers.pending()).toBe(0);

    timers.fireAll();
    await new Promise((resolve) => {
      setTimeout(resolve, 80);
    });
    expect(received).toHaveLength(0);
  });

  test("drops an event from another directory", async () => {
    received.length = 0;
    const timers = fakeTimers();
    const handler = createHandler(fakeContext(), settings(0), {
      gate: new Gate(),
      holds: new Holds(timers),
    });

    await Effect.runPromise(
      handler({
        id: "evt-4",
        type: "permission.asked",
        data: { sessionID: "s1", id: "p3", action: "shell" },
        location: { directory: "/other/project" },
      }),
    );
    timers.fireAll();
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(received).toHaveLength(0);
  });
});

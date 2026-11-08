import { describe, expect, test } from "bun:test";

import { Holds, type Timers } from "../src/hold.js";

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

describe("Holds", () => {
  test("runs the action after the scheduled time", () => {
    const timers = fakeTimers();
    const holds = new Holds(timers);
    let fired = 0;
    holds.schedule("p1", 1_000, () => {
      fired += 1;
    });
    expect(fired).toBe(0);
    timers.fireAll();
    expect(fired).toBe(1);
    expect(holds.size).toBe(0);
  });

  test("cancels a held action", () => {
    const timers = fakeTimers();
    const holds = new Holds(timers);
    let fired = 0;
    holds.schedule("p1", 1_000, () => {
      fired += 1;
    });
    expect(holds.cancel("p1")).toBe(true);
    expect(holds.cancel("p1")).toBe(false);
    timers.fireAll();
    expect(fired).toBe(0);
  });

  test("replaces a held action with the same key", () => {
    const timers = fakeTimers();
    const holds = new Holds(timers);
    let first = 0;
    let second = 0;
    holds.schedule("p1", 1_000, () => {
      first += 1;
    });
    holds.schedule("p1", 1_000, () => {
      second += 1;
    });
    expect(timers.pending()).toBe(1);
    timers.fireAll();
    expect(first).toBe(0);
    expect(second).toBe(1);
  });

  test("clears every held action", () => {
    const timers = fakeTimers();
    const holds = new Holds(timers);
    holds.schedule("a", 1_000, () => {});
    holds.schedule("b", 1_000, () => {});
    holds.clear();
    expect(timers.pending()).toBe(0);
    expect(holds.size).toBe(0);
  });
});

import { describe, expect, test } from "bun:test";

import { Gate } from "../src/gate.js";

describe("Gate", () => {
  test("notifies once per permission request", () => {
    const gate = new Gate();
    expect(gate.onPermission("s1", "p1")).toBe("notify");
    expect(gate.onPermission("s1", "p1")).toBe("drop");
    expect(gate.onPermission("s1", "p2")).toBe("notify");
  });

  test("clears a permission when it is answered", () => {
    const gate = new Gate();
    gate.onPermission("s1", "p1");
    gate.clearPermission("s1", "p1");
    expect(gate.hasPermission("s1", "p1")).toBe(false);
    expect(gate.hasBlock("s1")).toBe(false);
  });

  test("sends the first question and drops a second open question", () => {
    const gate = new Gate();
    expect(gate.onQuestion("s1", "q1")).toBe("notify");
    expect(gate.onQuestion("s1", "q2")).toBe("drop");
    gate.clearQuestion("s1", "q1");
    expect(gate.onQuestion("s1", "q3")).toBe("notify");
  });

  test("does not schedule idle while a prompt is open", () => {
    const gate = new Gate();
    gate.onPermission("s1", "p1");
    expect(gate.onIdle("s1", true)).toBe("drop");
  });

  test("does not schedule idle after a fault until a new turn starts", () => {
    const gate = new Gate();
    expect(gate.onFault("s1", true)).toBe("notify");
    expect(gate.onIdle("s1", true)).toBe("drop");
    gate.onStarted("s1");
    expect(gate.onIdle("s1", true)).toBe("schedule");
  });

  test("drops child sessions", () => {
    const gate = new Gate();
    expect(gate.onFault("s1", false)).toBe("drop");
    expect(gate.onIdle("s1", false)).toBe("drop");
  });
});

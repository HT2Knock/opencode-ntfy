import { describe, expect, test } from "bun:test";

import { isQuiet, parseClock } from "../src/quiet.js";

const window = { from: "22:30", to: "06:00", timezone: "Asia/Ho_Chi_Minh" };

describe("parseClock", () => {
  test("accepts valid times", () => {
    expect(parseClock("00:00")).toBe(0);
    expect(parseClock("22:30")).toBe(1350);
    expect(parseClock("23:59")).toBe(1439);
  });

  test("rejects invalid times", () => {
    expect(parseClock("24:00")).toBeUndefined();
    expect(parseClock("7:00")).toBeUndefined();
    expect(parseClock("07:60")).toBeUndefined();
  });
});

describe("isQuiet", () => {
  test("is true at 23:00 local time", () => {
    expect(isQuiet(window, new Date("2026-11-08T16:00:00Z"))).toBe(true);
  });

  test("is true at 05:00 local time", () => {
    expect(isQuiet(window, new Date("2026-11-07T22:00:00Z"))).toBe(true);
  });

  test("is false at 11:00 local time", () => {
    expect(isQuiet(window, new Date("2026-11-08T04:00:00Z"))).toBe(false);
  });

  test("is false at the end of the window", () => {
    expect(isQuiet(window, new Date("2026-11-07T23:00:00Z"))).toBe(false);
  });

  test("handles a window inside one day", () => {
    const noon = { from: "12:00", to: "13:00", timezone: "Asia/Ho_Chi_Minh" };
    expect(isQuiet(noon, new Date("2026-11-08T05:30:00Z"))).toBe(true);
    expect(isQuiet(noon, new Date("2026-11-08T07:00:00Z"))).toBe(false);
  });

  test("treats an empty window as never quiet", () => {
    expect(isQuiet({ from: "09:00", to: "09:00", timezone: "UTC" }, new Date())).toBe(false);
  });
});

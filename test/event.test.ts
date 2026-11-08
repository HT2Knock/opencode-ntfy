import { describe, expect, test } from "bun:test";

import { classify } from "../src/event.js";

describe("classify", () => {
  test("reads a finished turn", () => {
    expect(classify({ type: "session.execution.succeeded", data: { sessionID: "s1" } })).toEqual({
      kind: "idle",
      sessionID: "s1",
    });
  });

  test("reads a failed turn", () => {
    expect(classify({ type: "session.execution.failed", data: { sessionID: "s1" } })).toEqual({
      kind: "fault",
      sessionID: "s1",
    });
  });

  test("reads a permission request", () => {
    expect(
      classify({ type: "permission.asked", data: { sessionID: "s1", id: "p1", action: "shell" } }),
    ).toEqual({ kind: "permission", sessionID: "s1", requestID: "p1" });
  });

  test("reads a question asked through the permission channel", () => {
    expect(
      classify({
        type: "permission.asked",
        data: { sessionID: "s1", id: "p1", action: "question" },
      }),
    ).toEqual({ kind: "question", sessionID: "s1", id: "p1" });
  });

  test("reads a form", () => {
    expect(
      classify({ type: "form.created", data: { form: { sessionID: "s1", id: "f1" } } }),
    ).toEqual({ kind: "question", sessionID: "s1", id: "f1" });
  });

  test("reads a permission reply", () => {
    expect(
      classify({ type: "permission.replied", data: { sessionID: "s1", requestID: "p1" } }),
    ).toEqual({ kind: "clear-permission", sessionID: "s1", requestID: "p1" });
  });

  test("reads a form reply", () => {
    expect(classify({ type: "form.replied", data: { sessionID: "s1", id: "f1" } })).toEqual({
      kind: "clear-question",
      sessionID: "s1",
      id: "f1",
    });
  });

  test("ignores unknown events", () => {
    expect(classify({ type: "session.created", data: {} })).toEqual({ kind: "ignore" });
  });

  test("ignores a permission without an id", () => {
    expect(classify({ type: "permission.asked", data: { sessionID: "s1" } })).toEqual({
      kind: "ignore",
    });
  });
});

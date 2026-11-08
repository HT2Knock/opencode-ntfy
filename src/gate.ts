import type { GateDecision } from "./domain.js";

export class Gate {
  readonly #faulted = new Set<string>();
  readonly #questions = new Map<string, Set<string>>();
  readonly #permissions = new Map<string, Set<string>>();

  onStarted(sessionID: string): void {
    this.#faulted.delete(sessionID);
  }

  onIdle(sessionID: string, root: boolean): GateDecision {
    if (!root) return "drop";
    if (this.#faulted.has(sessionID)) return "drop";
    if (this.hasBlock(sessionID)) return "drop";
    return "schedule";
  }

  onFault(sessionID: string, root: boolean): GateDecision {
    if (!root) return "drop";
    this.#faulted.add(sessionID);
    return "notify";
  }

  onPermission(sessionID: string, requestID: string): GateDecision {
    const open = this.#setFor(this.#permissions, sessionID);
    if (open.has(requestID)) return "drop";
    open.add(requestID);
    return "notify";
  }

  onQuestion(sessionID: string, id: string): GateDecision {
    const open = this.#setFor(this.#questions, sessionID);
    if (open.size > 0) return "drop";
    open.add(id);
    return "notify";
  }

  clearPermission(sessionID: string, requestID: string): void {
    this.#permissions.get(sessionID)?.delete(requestID);
  }

  clearQuestion(sessionID: string, id: string): void {
    this.#questions.get(sessionID)?.delete(id);
  }

  hasBlock(sessionID: string): boolean {
    return (
      (this.#permissions.get(sessionID)?.size ?? 0) > 0 ||
      (this.#questions.get(sessionID)?.size ?? 0) > 0
    );
  }

  hasPermission(sessionID: string, requestID: string): boolean {
    return this.#permissions.get(sessionID)?.has(requestID) ?? false;
  }

  hasQuestion(sessionID: string, id: string): boolean {
    return this.#questions.get(sessionID)?.has(id) ?? false;
  }

  #setFor(map: Map<string, Set<string>>, sessionID: string): Set<string> {
    const existing = map.get(sessionID);
    if (existing) return existing;
    const created = new Set<string>();
    map.set(sessionID, created);
    return created;
  }
}

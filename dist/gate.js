export class Gate {
    #faulted = new Set();
    #questions = new Map();
    #permissions = new Map();
    onStarted(sessionID) {
        this.#faulted.delete(sessionID);
    }
    onIdle(sessionID, root) {
        if (!root)
            return "drop";
        if (this.#faulted.has(sessionID))
            return "drop";
        if (this.hasBlock(sessionID))
            return "drop";
        return "schedule";
    }
    onFault(sessionID, root) {
        if (!root)
            return "drop";
        this.#faulted.add(sessionID);
        return "notify";
    }
    onPermission(sessionID, requestID) {
        const open = this.#setFor(this.#permissions, sessionID);
        if (open.has(requestID))
            return "drop";
        open.add(requestID);
        return "notify";
    }
    onQuestion(sessionID, id) {
        const open = this.#setFor(this.#questions, sessionID);
        if (open.size > 0)
            return "drop";
        open.add(id);
        return "notify";
    }
    clearPermission(sessionID, requestID) {
        this.#permissions.get(sessionID)?.delete(requestID);
    }
    clearQuestion(sessionID, id) {
        this.#questions.get(sessionID)?.delete(id);
    }
    hasBlock(sessionID) {
        return ((this.#permissions.get(sessionID)?.size ?? 0) > 0 ||
            (this.#questions.get(sessionID)?.size ?? 0) > 0);
    }
    hasPermission(sessionID, requestID) {
        return this.#permissions.get(sessionID)?.has(requestID) ?? false;
    }
    hasQuestion(sessionID, id) {
        return this.#questions.get(sessionID)?.has(id) ?? false;
    }
    #setFor(map, sessionID) {
        const existing = map.get(sessionID);
        if (existing)
            return existing;
        const created = new Set();
        map.set(sessionID, created);
        return created;
    }
}
//# sourceMappingURL=gate.js.map
export const systemTimers = {
    set: (callback, milliseconds) => setTimeout(callback, milliseconds),
    clear: (handle) => {
        clearTimeout(handle);
    },
};
export class Holds {
    #timers;
    #handles = new Map();
    constructor(timers = systemTimers) {
        this.#timers = timers;
    }
    get size() {
        return this.#handles.size;
    }
    schedule(key, milliseconds, action) {
        this.cancel(key);
        const handle = this.#timers.set(() => {
            this.#handles.delete(key);
            action();
        }, milliseconds);
        this.#handles.set(key, handle);
    }
    cancel(key) {
        const handle = this.#handles.get(key);
        if (handle === undefined)
            return false;
        this.#timers.clear(handle);
        this.#handles.delete(key);
        return true;
    }
    clear() {
        for (const handle of this.#handles.values())
            this.#timers.clear(handle);
        this.#handles.clear();
    }
}
//# sourceMappingURL=hold.js.map
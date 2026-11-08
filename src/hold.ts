export interface Timers {
  set(callback: () => void, milliseconds: number): unknown;
  clear(handle: unknown): void;
}

export const systemTimers: Timers = {
  set: (callback, milliseconds) => setTimeout(callback, milliseconds),
  clear: (handle) => {
    clearTimeout(handle as ReturnType<typeof setTimeout>);
  },
};

export class Holds {
  readonly #timers: Timers;
  readonly #handles = new Map<string, unknown>();

  constructor(timers: Timers = systemTimers) {
    this.#timers = timers;
  }

  get size(): number {
    return this.#handles.size;
  }

  schedule(key: string, milliseconds: number, action: () => void): void {
    this.cancel(key);
    const handle = this.#timers.set(() => {
      this.#handles.delete(key);
      action();
    }, milliseconds);
    this.#handles.set(key, handle);
  }

  cancel(key: string): boolean {
    const handle = this.#handles.get(key);
    if (handle === undefined) return false;
    this.#timers.clear(handle);
    this.#handles.delete(key);
    return true;
  }

  clear(): void {
    for (const handle of this.#handles.values()) this.#timers.clear(handle);
    this.#handles.clear();
  }
}

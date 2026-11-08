export interface Timers {
    set(callback: () => void, milliseconds: number): unknown;
    clear(handle: unknown): void;
}
export declare const systemTimers: Timers;
export declare class Holds {
    #private;
    constructor(timers?: Timers);
    get size(): number;
    schedule(key: string, milliseconds: number, action: () => void): void;
    cancel(key: string): boolean;
    clear(): void;
}

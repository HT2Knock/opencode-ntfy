export type QuietWindow = {
    readonly from: string;
    readonly to: string;
    readonly timezone: string;
};
export declare function parseClock(value: string): number | undefined;
export declare function validTimezone(timezone: string): boolean;
export declare function isQuiet(window: QuietWindow, at: Date): boolean;

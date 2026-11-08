import type { Milestone } from "./domain.js";
import { type QuietWindow } from "./quiet.js";
export type Settings = {
    readonly server: URL;
    readonly topic: string;
    readonly routineTopic: string | undefined;
    readonly token: string;
    readonly holdMs: number;
    readonly milestones: ReadonlySet<Milestone>;
    readonly quiet: QuietWindow | undefined;
    readonly click: string | undefined;
};
export type LoadResult = {
    readonly ok: true;
    readonly settings: Settings;
} | {
    readonly ok: false;
    readonly reason: string;
};
export declare function resolveSettings(input: unknown, env?: NodeJS.ProcessEnv): LoadResult;
export declare function configPath(env?: NodeJS.ProcessEnv): string;
export declare function loadSettings(deps?: {
    readonly env?: NodeJS.ProcessEnv;
    readonly readFile?: (path: string) => string;
}): LoadResult;

import type { Push } from "./deliver.js";
import type { Milestone } from "./domain.js";
export declare function projectName(directory: string): string;
export declare function buildPush(milestone: Milestone, session: {
    readonly title: string | undefined;
    readonly directory: string;
}, click?: string): Push;

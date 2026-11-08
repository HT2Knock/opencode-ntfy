import type { Decision, IncomingEvent } from "./domain.js";
export declare function eventID(event: IncomingEvent): string | undefined;
export declare function eventDirectory(event: IncomingEvent): string | undefined;
export declare function classify(event: IncomingEvent): Decision;

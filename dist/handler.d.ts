import { Effect } from "effect";
import type { Settings } from "./config.js";
import type { Context } from "./context.js";
import type { IncomingEvent } from "./domain.js";
import type { Gate } from "./gate.js";
import type { Holds } from "./hold.js";
export type HandlerState = {
    readonly gate: Gate;
    readonly holds: Holds;
};
export declare function createHandler(ctx: Context, settings: Settings, state: HandlerState): (event: IncomingEvent) => Effect.Effect<void>;

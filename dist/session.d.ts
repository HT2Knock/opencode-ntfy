import { Effect } from "effect";
import type { Context } from "./context.js";
import type { SessionFacts } from "./domain.js";
export declare function sessionFacts(ctx: Context, sessionID: string): Effect.Effect<SessionFacts | null>;

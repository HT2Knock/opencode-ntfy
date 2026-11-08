import { Effect } from "effect";
import type { Settings } from "./config.js";
import type { Context } from "./context.js";
export declare function registerTool(ctx: Context, settings: Settings): Effect.Effect<import("@opencode/plugin/effect/registration").Registration, never, import("effect/Scope").Scope>;

import { Effect } from "effect";
import type { Context } from "./context.js";
export declare function claim(ctx: Context, id: string): Effect.Effect<boolean>;

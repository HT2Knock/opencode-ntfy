import { Effect } from "effect";
const DEDUPE_TTL_MS = 48 * 60 * 60 * 1000;
const CLAIM_KEY = "ht2knock.ntfy.claimed";
const globals = globalThis;
const claimed = (globals[CLAIM_KEY] ??= new Set());
export function claim(ctx, id) {
    return Effect.gen(function* () {
        if (claimed.has(id))
            return false;
        claimed.add(id);
        const stored = yield* ctx.storage
            .get(`sent/${id}`)
            .pipe(Effect.catchCause(() => Effect.succeed(null)));
        if (typeof stored === "number" && Date.now() - stored < DEDUPE_TTL_MS)
            return false;
        yield* ctx.storage.set(`sent/${id}`, Date.now()).pipe(Effect.ignore);
        return true;
    });
}
//# sourceMappingURL=claim.js.map
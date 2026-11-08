import { Effect } from "effect";
export function sessionFacts(ctx, sessionID) {
    return ctx.session.get({ sessionID: sessionID }).pipe(Effect.map((session) => ({
        sessionID,
        title: session.title,
        directory: session.location.directory,
        root: session.parentID === undefined || session.parentID === "",
    })), Effect.catchCause(() => Effect.succeed(null)));
}
//# sourceMappingURL=session.js.map